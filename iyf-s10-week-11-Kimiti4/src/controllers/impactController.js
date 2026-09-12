const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const UserRepository = require('../database/repositories/UserRepository');

/**
 * Track an impact event
 */
exports.trackImpact = asyncHandler(async (req, res) => {
  const { event_type, impact_value, reference_id, description } = req.body;
  const userId = req.user.id;

  const result = await query(`
    INSERT INTO impact_metrics (user_id, event_type, impact_value, reference_id, description)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `, [userId, event_type, impact_value || 1, reference_id, description]);

  res.status(201).json({
    success: true,
    data: result.rows[0]
  });
});

/**
 * Get user's impact dashboard
 *
 * R3 [P1-5]: PARTIAL-REAL. The per-event sums and the rank COUNT come from
 * authoritative DB rows. The previous fabricated conversions
 * (`exchange_value * 500 KES`, `time_saved * 2 hours`), hardcoded badge
 * thresholds, and the `people_helped` relabel are removed per the MOCK DATA
 * RULE. Only DB-derived, unitless values are returned.
 */
exports.getImpactDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const impactQuery = await query(`
    SELECT event_type, SUM(impact_value) as total
    FROM impact_metrics
    WHERE user_id = $1
    GROUP BY event_type
  `, [id]);

  let help_provided = 0;
  let exchange_completed = 0;
  let time_saved = 0;
  let total_impact = 0;

  impactQuery.rows.forEach(row => {
    const total = parseInt(row.total);
    total_impact += total;
    if (row.event_type === 'help_provided') help_provided += total;
    if (row.event_type === 'exchange_completed') exchange_completed += total;
    if (row.event_type === 'time_saved') time_saved += total;
  });

  const rankQuery = await query(`
    SELECT COUNT(DISTINCT user_id) + 1 AS rank
    FROM impact_metrics
    WHERE user_id != $1
  `, [id]);
  const rank = `#${rankQuery.rows[0].rank} in JamiiLink`;

  res.json({
    success: true,
    data: {
      monthly_impact: total_impact,
      impact_rank: rank,
      contribution_breakdown: {
        help_provided,
        exchange_completed,
        time_saved
      }
    }
  });
});
