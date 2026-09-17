const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class RateLimiter {
  constructor(windowMs = 60000, maxRequests = 120) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.requests = new Map();
  }

  middleware() {
    return (req, res, next) => {
      // Allow internal tests and health checks
      if (req.path === '/health' || req.path === '/admin/health') {
        return next();
      }

      const clientKey = req.headers['x-user-id'] || req.ip || 'client_demo';
      const now = Date.now();

      let clientRecord = this.requests.get(clientKey);
      if (!clientRecord) {
        clientRecord = { count: 0, resetTime: now + this.windowMs };
        this.requests.set(clientKey, clientRecord);
      }
      // Reset count if the 1-min window has expired
      if (now > clientRecord.resetTime) {
        clientRecord.count = 0;
        clientRecord.resetTime = now + this.windowMs;
      }

      clientRecord.count++;

      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - clientRecord.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(clientRecord.resetTime / 1000));

      if (clientRecord.count > this.maxRequests) {
        // Log rate limit event
        try {
          db.insert('security_logs', {
            id: uuidv4(),
            event_type: 'rate_limit_exceeded',
            user_id: clientKey,
            severity: 'medium',
            payload: { clientKey, path: req.originalUrl, count: clientRecord.count },
            action_taken: 'http_429_throttled',
            created_at: new Date().toISOString()
          });
        } catch (e) { }

        res.setHeader('Retry-After', 60);
        return res.status(429).json({
          error: 'Too Many Requests: Rate limit exceeded. Please wait 60 seconds before retrying.',
          retryAfterSeconds: 60
        });
      }

      next();
    };
  }

  reset() {
    this.requests.clear();
  }
}

const apiRateLimiter = new RateLimiter(60000, 150);

module.exports = { RateLimiter, apiRateLimiter };
