const { query } = require('../config/postgres');
const asyncHandler = require('../utils/asyncHandler');
const UserRepository = require('../database/repositories/UserRepository');

/**
 * Save user skill profile
 */
exports.saveProfile = asyncHandler(async (req, res) => {
  const { offering = [], seeking = [] } = req.body;
  const userId = req.user.id;

  // Clear existing skills
  await query(`DELETE FROM user_skills WHERE user_id = $1`, [userId]);

  // Insert offering
  for (const skill of offering) {
    await query(`
      INSERT INTO user_skills (user_id, skill_name, proficiency, is_offering, is_seeking, description)
      VALUES ($1, $2, $3, true, false, $4)
    `, [userId, skill.skill, skill.proficiency || 3, skill.description || '']);
  }

  // Insert seeking
  for (const skill of seeking) {
    await query(`
      INSERT INTO user_skills (user_id, skill_name, proficiency, is_offering, is_seeking, description)
      VALUES ($1, $2, $3, false, true, $4)
    `, [userId, skill.skill, skill.proficiency || 1, skill.description || '']);
  }

  res.json({ success: true, message: 'Skill profile updated' });
});

/**
 * Get user skill profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await query(`
    SELECT skill_name, proficiency, is_offering, is_seeking, description
    FROM user_skills
    WHERE user_id = $1
  `, [userId]);

  const offering = result.rows.filter(r => r.is_offering).map(r => ({
    skill: r.skill_name, proficiency: r.proficiency, description: r.description
  }));
  const seeking = result.rows.filter(r => r.is_seeking).map(r => ({
    skill: r.skill_name, proficiency: r.proficiency, description: r.description
  }));

  res.json({ success: true, data: { offering, seeking } });
});

/**
 * Get smart matches (Simple exact string match algorithm)
 */
exports.getMatches = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Find users who are offering what I am seeking, AND seeking what I am offering
  // R3 note: this query was never executed while the router was unmounted;
  // the params array was missing. Fixed as part of mounting (P1-8).
  const result = await query(`
    SELECT 
      u.id as user_id, u.username, u.avatar_icon,
      o1.skill_name as your_skills_they_need,
      s1.skill_name as their_skills_you_need
    FROM user_skills s1
    JOIN user_skills o1 ON o1.user_id = $1 AND o1.is_offering = true
    JOIN users u ON u.id = s1.user_id
    WHERE s1.is_offering = true
      AND s1.user_id != $1
      AND LOWER(s1.skill_name) IN (
        SELECT LOWER(skill_name) FROM user_skills WHERE user_id = $1 AND is_seeking = true
      )
      AND o1.user_id = $1
      AND LOWER(o1.skill_name) IN (
        SELECT LOWER(skill_name) FROM user_skills WHERE user_id = s1.user_id AND is_seeking = true
      )
    LIMIT 10
  `, [userId]);

  const matches = result.rows.map(row => ({
    user: { id: row.user_id, name: row.username, avatar: row.avatar_icon },
    their_skills: [row.their_skills_you_need],
    your_skills_they_need: [row.your_skills_they_need]
  }));

  res.json({ success: true, data: matches });
});

/**
 * Complete an exchange with a review
 *
 * P5-6: real persistence now that skill_matches is landed.
 *   - invalid/nonexistent match      -> 404
 *   - non-participant                -> 403
 *   - already completed              -> 409
 *   - quality_rating outside 1..5    -> 400
 *   - valid completion               -> 200, marks status='completed',
 *     stores quality_rating, and credits BOTH participants via
 *     impact_metrics (reference_id = match_id, deduped by UQ index).
 */
exports.completeExchange = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { match_id } = req.params;
  const { quality_rating } = req.body || {};

  // R4 adversarial: malformed (non-UUID) identifiers must be 404, never 500.
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(match_id)) {
    return res.status(404).json({
      success: false,
      error: 'Match not found',
      code: 'NOT_FOUND'
    });
  }

  const rating = Number(quality_rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({
      success: false,
      error: 'quality_rating must be an integer between 1 and 5',
      code: 'VALIDATION_ERROR'
    });
  }

  const matchResult = await query(`
    SELECT id, user1_id, user2_id, skill1, skill2, status
    FROM skill_matches
    WHERE id = $1
  `, [match_id]);

  if (matchResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Match not found',
      code: 'NOT_FOUND'
    });
  }

  const match = matchResult.rows[0];

  if (match.user1_id !== userId && match.user2_id !== userId) {
    return res.status(403).json({
      success: false,
      error: 'You are not a participant in this match',
      code: 'FORBIDDEN'
    });
  }

  if (match.status === 'completed') {
    return res.status(409).json({
      success: false,
      error: 'Exchange already completed',
      code: 'ALREADY_COMPLETED'
    });
  }

  await query(`
    UPDATE skill_matches
    SET status = 'completed', quality_rating = $2, completed_at = NOW()
    WHERE id = $1
  `, [match_id, rating]);

  // Dual impact credit: both participants earn the same exchange event,
  // keyed by match_id so the UQ index (user_id, event_type, reference_id)
  // prevents double-crediting on repeated calls.
  for (const participantId of [match.user1_id, match.user2_id]) {
    await query(`
      INSERT INTO impact_metrics (user_id, event_type, impact_value, reference_id, description)
      VALUES ($1, 'exchange_completed', 10, $2, 'Completed a skill exchange')
      ON CONFLICT DO NOTHING
    `, [participantId, match_id]);
  }

  res.json({
    success: true,
    data: {
      match_id: match.id,
      status: 'completed',
      quality_rating: rating,
      your_skill: match.user1_id === userId ? match.skill1 : match.skill2,
      their_skill: match.user1_id === userId ? match.skill2 : match.skill1,
      completed_at: new Date().toISOString()
    }
  });
});
