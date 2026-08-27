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
  `);

  const matches = result.rows.map(row => ({
    match_id: `temp_${row.user_id}`,
    user: { id: row.user_id, name: row.username, avatar: row.avatar_icon },
    their_skills: [row.their_skills_you_need],
    your_skills_they_need: [row.your_skills_they_need],
    match_score: 0.95, // mock for now
    testimonials: Math.floor(Math.random() * 5)
  }));

  res.json({ success: true, data: matches });
});

/**
 * Complete an exchange with a review
 */
exports.completeExchange = asyncHandler(async (req, res) => {
  const { match_id } = req.params;
  const { quality_rating, testimonial } = req.body;
  const userId = req.user.id;

  // In a full implementation, we'd look up the match_id and update it.
  // For now we just mock success.
  res.json({ success: true, message: 'Exchange completed and reviewed!' });
});
