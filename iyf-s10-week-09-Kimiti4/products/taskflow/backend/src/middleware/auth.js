const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');
const supabase = require('../config/database');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided', code: 'AUTH_NO_TOKEN' });
  }

  try {
    const token = header.split(' ')[1];
    const payload = jwt.verify(token, jwtSecret);

    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, avatar_url')
      .eq('id', payload.sub)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'User not found', code: 'AUTH_USER_NOT_FOUND' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'AUTH_TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Invalid token', code: 'AUTH_INVALID_TOKEN' });
  }
}

module.exports = auth;
