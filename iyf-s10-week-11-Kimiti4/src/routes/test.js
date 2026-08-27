/**
 * 🔹 Staging Test Routes (PostgreSQL)
 * ONLY enable in staging environment via NODE_ENV=staging
 */

const express = require('express');
const router = express.Router();
const { query } = require('../config/postgres');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const TEST_EMAIL = 'test@jamii.link';
const TEST_PASSWORD = 'TestPass123!';
const TEST_USERNAME = 'testuser';

router.post('/seed', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10);

    const result = await query(`
      INSERT INTO users (username, email, password, role, is_founder)
      VALUES ($1, $2, $3, 'user', false)
      ON CONFLICT (email) DO UPDATE SET
        email = EXCLUDED.email,
        password = EXCLUDED.password,
        role = EXCLUDED.role,
        is_founder = EXCLUDED.is_founder,
        updated_at = NOW()
      RETURNING id, email, username
    `, [TEST_USERNAME, TEST_EMAIL, hashedPassword]);

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({ id: user.id, token, email: user.email, username: user.username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/cleanup', async (req, res) => {
  try {
    const userResult = await query('SELECT id FROM users WHERE email = $1', [TEST_EMAIL]);
    const user = userResult.rows[0];

    if (user) {
      await query('DELETE FROM posts WHERE author_id = $1', [user.id]);
    }

    res.json({ cleaned: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
