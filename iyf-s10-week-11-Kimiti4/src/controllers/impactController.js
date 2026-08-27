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
 */
exports.getImpactDashboard = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Monthly impact calculation (mock logic for now using simple sums)
  const impactQuery = await query(`
    SELECT event_type, SUM(impact_value) as total
    FROM impact_metrics
    WHERE user_id = $1
    GROUP BY event_type
  `, [id]);

  let help_provided = 0;
  let exchange_value = 0;
  let time_saved = 0;
  let total_impact = 0;

  impactQuery.rows.forEach(row => {
    const total = parseInt(row.total);
    total_impact += total;
    if (row.event_type === 'help_provided') help_provided += total;
    if (row.event_type === 'exchange_completed') exchange_value += total;
    if (row.event_type === 'time_saved') time_saved += total;
  });

  // Calculate Rank (mock)
  const rankQuery = await query(`
    SELECT COUNT(DISTINCT user_id) + 1 AS rank
    FROM impact_metrics
    WHERE user_id != $1
  `, [id]);
  const rank = `#${rankQuery.rows[0].rank} in JamiiLink`;

  // Get Badges
  const badges = [];
  if (total_impact > 10) badges.push('Bronze Helper');
  if (total_impact > 50) badges.push('Silver Catalyst');
  if (total_impact > 100) badges.push('Gold Pillar');

  res.json({
    success: true,
    data: {
      monthly_impact: total_impact,
      impact_rank: rank,
      badges,
      contribution_breakdown: {
        help_provided,
        exchange_value: `${exchange_value * 500} KES`, // Mock value conversion
        time_saved: `${time_saved * 2} hours`,
        people_helped: help_provided
      }
    }
  });
});
