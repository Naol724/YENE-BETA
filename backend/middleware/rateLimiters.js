const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/** Stricter cap on auth endpoints (login, register, password reset, verify-email). */
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many attempts from this IP, please try again later.',
  },
});

/** Baseline limit for all /api traffic. */
const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
});

module.exports = { authLimiter, apiLimiter };
