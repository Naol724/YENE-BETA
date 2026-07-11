const express = require('express');
const {
  register,
  login,
  getMe,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  refreshToken,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-verification', authLimiter, resendVerification);
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password/:resettoken', passwordResetLimiter, resetPassword);
router.post('/refresh-token', refreshToken);

module.exports = router;
