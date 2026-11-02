const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbErrorMessage } = require('../utils/dbErrorMessage');
const sendEmail = require('../utils/sendEmail');

function isEmailConfigured() {
  return !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

/** jsonwebtoken rejects empty/undefined expiresIn — use sane defaults for Render when env is missing. */
function jwtExpiresIn(envValue, fallback) {
  const v = envValue == null ? '' : String(envValue).trim();
  return v || fallback;
}

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: jwtExpiresIn(process.env.JWT_EXPIRE, '7d'),
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  return jwt.sign({ id }, secret, {
    expiresIn: jwtExpiresIn(process.env.JWT_REFRESH_EXPIRE, '30d'),
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, phone, password, role } = req.body;
    const email =
      req.body.email == null
        ? ''
        : String(req.body.email).trim().toLowerCase();

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const normalizedRole =
      role === 'OWNER' || role === 'owner' ? 'OWNER' : 'RENTER';

    // Without SMTP, auto-verify so signup/login work locally (OTP email cannot be delivered).
    const emailConfigured = isEmailConfigured();

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: normalizedRole,
      isEmailVerified: !emailConfigured,
      ...(normalizedRole === 'OWNER' ? { isApproved: true } : {}),
    });

    let emailSent = false;
    let registerMessage =
      'Registration successful. We sent a verification code to your email.';

    if (emailConfigured) {
      const plainOtp = user.generateOTP();
      await user.save();
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your YENE BET verification code',
          message: `Hi ${user.fullName},\n\nYour verification code is: ${plainOtp}\n\nIt expires in 10 minutes.\n\nIf you did not sign up for YENE BET, you can ignore this email.`,
        });
        emailSent = true;
      } catch (err) {
        console.error('Verification email could not be sent:', err.message || err);
        console.log('\n========== EMAIL VERIFICATION (fallback — API terminal) ==========');
        console.log('To:', user.email);
        console.log('Verification code:', plainOtp);
        console.log('Expires in 10 minutes.');
        console.log('====================================================================\n');
        registerMessage =
          'Registration successful. The verification email could not be sent — check the API terminal for your code, or fix SMTP settings in backend/.env.';
      }
      if (emailSent) {
        registerMessage =
          'Registration successful. We sent a verification code to your email.';
      }
    } else {
      registerMessage =
        'Registration successful. You can sign in now. (Email verification is skipped until EMAIL_USER and EMAIL_PASS are set in backend/.env.)';
      console.log(
        `[auth] Registered ${user.email} as verified (SMTP not configured). Set EMAIL_* to require email OTP.`
      );
    }

    res.status(201).json({
      success: true,
      message: registerMessage,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
      const first = Object.values(error.errors || {})[0];
      const msg =
        first && first.message ? first.message : error.message;
      return res.status(400).json({ success: false, message: msg });
    }
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { password } = req.body;
    const email =
      req.body.email == null
        ? ''
        : String(req.body.email).trim().toLowerCase();

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Email verification gate (admins skipped). If SMTP is not configured, auto-verify so login works.
    if (!user.isEmailVerified && user.role !== 'ADMIN') {
      if (!isEmailConfigured()) {
        user.isEmailVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });
        console.log(`[auth] Auto-verified ${user.email} on login (SMTP not configured).`);
      } else {
        return res.status(403).json({
          success: false,
          code: 'EMAIL_NOT_VERIFIED',
          message:
            'Please verify your email before logging in. Check your inbox for the code, or use Resend code on the verify page.',
        });
      }
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      refreshToken: generateRefreshToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// @desc    Verify Email via OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const email =
      req.body.email == null
        ? ''
        : String(req.body.email).trim().toLowerCase();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required' });
    }

    const hashedOTP = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');

    const user = await User.findOne({
      email,
      otp: hashedOTP,
      otpExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// @desc    Resend verification email (or auto-verify when SMTP is not configured)
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const email =
      req.body.email == null
        ? ''
        : String(req.body.email).trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists for that email, a verification code was sent.',
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        message: 'This email is already verified. You can sign in.',
      });
    }

    if (!isEmailConfigured()) {
      user.isEmailVerified = true;
      user.otp = undefined;
      user.otpExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({
        success: true,
        alreadyVerified: true,
        emailDelivery: false,
        message:
          'Email delivery is not configured on the server, so your account was verified automatically. You can sign in now.',
      });
    }

    const plainOtp = user.generateOTP();
    await user.save();

    try {
      await sendEmail({
        email: user.email,
        subject: 'Your YENE BET verification code',
        message: `Hi ${user.fullName},\n\nYour verification code is: ${plainOtp}\n\nIt expires in 10 minutes.\n\nIf you did not sign up for YENE BET, you can ignore this email.`,
      });
      return res.status(200).json({
        success: true,
        emailDelivery: true,
        message: 'A new verification code was sent to your email.',
      });
    } catch (err) {
      console.error('Resend verification email failed:', err.message || err);
      console.log('\n========== EMAIL VERIFICATION (fallback — API terminal) ==========');
      console.log('To:', user.email);
      console.log('Verification code:', plainOtp);
      console.log('Expires in 10 minutes.');
      console.log('====================================================================\n');
      return res.status(200).json({
        success: true,
        emailDelivery: false,
        message:
          'Could not send email. Check EMAIL_USER / EMAIL_PASS in backend/.env, or use the code printed in the API terminal.',
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  const generic = {
    success: true,
    message:
      'If an account exists for that email, you will receive password reset instructions shortly.',
  };
  try {
    const email =
      req.body.email == null
        ? ''
        : String(req.body.email).trim().toLowerCase();
    if (!email) {
      return res.status(200).json(generic);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json(generic);
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const base = (process.env.FRONTEND_URL || '').replace(/\/$/, '');
    const resetUrl = base ? `${base}/reset-password/${resetToken}` : `/reset-password/${resetToken}`;

    if (isEmailConfigured()) {
      try {
        await sendEmail({
          email: user.email,
          subject: 'Password reset',
          message: `You requested a password reset. Open this link to choose a new password (valid 10 minutes):\n${resetUrl}`,
        });
      } catch (err) {
        console.error('Password reset email could not be sent:', err);
      }
    } else {
      console.log('[dev] Password reset token for', user.email, ':', resetToken);
      console.log('[dev] Open:', resetUrl);
    }

    return res.status(200).json(generic);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ success: false, message: 'Invalid token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      message: 'Password reset successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch(error) {
    console.error(error);
    res.status(500).json({ success: false, message: dbErrorMessage(error) });
  }
};


// @desc    Refresh access token
// @route   POST /api/auth/refresh-token
// @access  Public
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token is required' 
      });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }

    // Find user
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Generate new tokens
    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: dbErrorMessage(error) 
    });
  }
};