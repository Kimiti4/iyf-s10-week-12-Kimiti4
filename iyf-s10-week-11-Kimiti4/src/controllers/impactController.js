const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Canonical server-side impact catalog.
 * Clients may only emit these event types; impact_value is always
 * resolved here (never trusted from the request body).
 */
const IMPACT_CATALOG = Object.freeze({
  help_provided: {
    impact_value: 1,
    description: 'Help provided to a community member'
  },
  exchange_completed: {
    impact_value: 10,
    description: 'Completed a skill exchange'
  },
  time_saved: {
    impact_value: 1,
    description: 'Time saved for another community member'
  }
});

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function monthBounds(now = new Date()) {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return { start, end };
}

/**
 * POST /api/impact/track
 *
 * Server-validated persistence against IMPACT_CATALOG:
 *   - unknown / missing event_type          -> 400
 *   - impact_value diverging from catalog   -> 400
 *   - duplicate (user, event, reference_id) -> 409
 *   - valid                                 -> 201 with persisted row
 */
exports.trackImpact = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { event_type, impact_value, reference_id, description } = req.body || {};

  if (typeof event_type !== 'string' || !event_type.trim()) {
    return res.status(400).json({
      success: false,
      error: 'event_type is required',
      code: 'VALIDATION_ERROR'
    });
  }

  const catalogEntry = IMPACT_CATALOG[event_type];
  if (!catalogEntry) {
    return res.status(400).json({
      success: false,
      error: `Unknown event_type "${event_type}". Allowed: ${Object.keys(IMPACT_CATALOG).join(', ')}`,
      code: 'UNKNOWN_EVENT_TYPE'
    });
  }

  const serverValue = catalogEntry.impact_value;
  if (impact_value !== undefined && impact_value !== null && Number(impact_value) !== serverValue) {
    return res.status(400).json({
      success: false,
      error: `impact_value diverges from server catalog (expected ${serverValue})`,
      code: 'DIVERGENT_IMPACT_VALUE'
    });
  }

  if (reference_id !== undefined && reference_id !== null && reference_id !== '' && !UUID_RE.test(String(reference_id))) {
    return res.status(400).json({
      success: false,
      error: 'reference_id must be a UUID when provided',
      code: 'VALIDATION_ERROR'
    });
  }

  const ref = reference_id === undefined || reference_id === '' ? null : reference_id;
  const desc = (typeof description === 'string' && description.trim())
    ? description.trim().slice(0, 500)
    : catalogEntry.description;

  try {
    const result = await query(`
      INSERT INTO impact_metrics (user_id, event_type, impact_value, reference_id, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
      RETURNING id, user_id, event_type, impact_value, reference_id, description, created_at
    `, [userId, event_type, serverValue, ref, desc]);

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        error: 'Duplicate impact event for this reference',
        code: 'DUPLICATE_IMPACT_EVENT'
      });
    }

    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    if (err && err.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'Duplicate impact event for this reference',
        code: 'DUPLICATE_IMPACT_EVENT'
      });
    }
    throw err;
  }
});

/**
 * GET /api/impact/:id/dashboard
 *
 * R3 [P1-5]: raw-only dashboard — unitless sums from impact_metrics within
 * the current calendar month. No KES/hours conversions, no hardcoded badges,
 * no fabricated conversions. Period metadata is explicit so clients can see
 * the boundary.
 */
exports.getImpactDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { start, end } = monthBounds();

  const impactQuery = await query(`
    SELECT event_type, SUM(impact_value) as total
    FROM impact_metrics
    WHERE user_id = $1
      AND created_at >= $2
      AND created_at < $3
    GROUP BY event_type
  `, [id, start, end]);

  let help_provided = 0;
  let exchange_completed = 0;
  let time_saved = 0;
  let total_impact = 0;

  impactQuery.rows.forEach(row => {
    const total = parseInt(row.total, 10);
    total_impact += total;
    if (row.event_type === 'help_provided') help_provided += total;
    if (row.event_type === 'exchange_completed') exchange_completed += total;
    if (row.event_type === 'time_saved') time_saved += total;
  });

  const rankQuery = await query(`
    SELECT COUNT(DISTINCT user_id) + 1 AS rank
    FROM impact_metrics
    WHERE user_id != $1
      AND created_at >= $2
      AND created_at < $3
  `, [id, start, end]);
  const rank = `#${rankQuery.rows[0].rank} in JamiiLink`;

  res.json({
    success: true,
    data: {
      monthly_impact: total_impact,
      impact_rank: rank,
      period: {
        type: 'calendar_month',
        start: start.toISOString(),
        end: end.toISOString()
      },
      contribution_breakdown: {
        help_provided,
        exchange_completed,
        time_saved
      },
      catalog: Object.keys(IMPACT_CATALOG)
    }
  });
});
