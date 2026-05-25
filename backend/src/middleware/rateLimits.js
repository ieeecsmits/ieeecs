const rateLimit = require('express-rate-limit');

const baseOptions = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
};

const apiLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  ...baseOptions,
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

const writeLimiter = rateLimit({
  ...baseOptions,
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many submissions, please try again later' },
});

module.exports = { apiLimiter, authLimiter, writeLimiter };
