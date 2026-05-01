/**
 * 🔹 Task 20.1: Logger Middleware
 * Logs request details + response time (Daily Challenge Day 4)
 */
const logger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log to console
  console.log(`[${timestamp}] ${req.method} ${req.url} from ${req.ip}`);

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ ${res.statusCode} - ${duration}ms`);
  });

  next();
};

module.exports = logger;
