/**
 * 🔹 Security Headers Middleware
 * Adds security headers to prevent common attacks
 *
 * R5 [P0-7] CSP: environment-conditional.
 *  - production: script-src 'self' (unsafe-inline + unsafe-eval REMOVED;
 *    source sweep found zero eval/new-Function/inline-script/third-party
 *    scripts in the shipped frontend). style-src keeps 'unsafe-inline'
 *    with documented justification (40 React inline style attributes;
 *    replacing them is UI scope, not R5). connect-src drops the
 *    http://localhost:* dev exception in production.
 *  - non-production: previous policy preserved (Vite dev/HMR needs eval).
 */

function cspForEnv() {
  if (process.env.NODE_ENV === 'production') {
    return [
      "default-src 'self'",
      "script-src 'self'",
      // style-src 'unsafe-inline' retained: React inline style attributes
      // (40 sites) require it; removing it is UI refactoring, not R5.
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https: wss:",
      "media-src 'self'"
    ].join('; ');
  }
  return "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:* ws: wss:; media-src 'self';";
}

const securityHeaders = (req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection (for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Content Security Policy (environment-conditional; see cspForEnv)
  res.setHeader('Content-Security-Policy', cspForEnv());

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Feature Policy / Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  // Strict Transport Security (only for HTTPS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
};

module.exports = securityHeaders;
module.exports.cspForEnv = cspForEnv;
