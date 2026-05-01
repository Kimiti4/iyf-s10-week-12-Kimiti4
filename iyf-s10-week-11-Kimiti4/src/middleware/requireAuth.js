/**
 * 🔹 Task 20.1: Simulated Auth Middleware
 * For demo: accepts any Bearer token
 */
const requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      hint: 'Add header: Authorization: Bearer demo-token'
    });
  }

  // Demo: attach fake user
  req.user = {
    id: `demo-${auth.slice(7, 15)}`,
    name: 'Demo User',
    role: 'member'
  };

  next();
};

module.exports = requireAuth;
