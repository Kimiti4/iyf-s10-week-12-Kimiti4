const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const supabase = require('../config/database');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

function signToken(userId) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}

router.post(
  '/register',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('name').trim().notEmpty().withMessage('Name is required'),
  ]),
  async (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existing) {
        return res.status(409).json({ error: 'Email already in use', code: 'AUTH_EMAIL_EXISTS' });
      }

      const password_hash = await bcrypt.hash(password, 10);

      const { data: user, error } = await supabase
        .from('users')
        .insert({ email, name, password_hash })
        .select('id, email, name, avatar_url, created_at')
        .single();

      if (error) throw error;

      const token = signToken(user.id);
      res.status(201).json({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  validate([
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ]),
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials', code: 'AUTH_INVALID_CREDENTIALS' });
      }

      const token = signToken(user.id);
      const { password_hash, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', auth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
