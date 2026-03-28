const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

function isEmailConfigured() {
  return !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
}

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const normalizedRole =
      role === 'OWNER' || role === 'owner' ? 'OWNER' : 'RENTER';

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: normalizedRole,
      ...(normalizedRole === 'OWNER' ? { isApproved: true } : {}),
    });

    const plainOtp = user.generateOTP();
    await user.save();

    // Verification is printed to the API terminal only (no SMTP) until you enable email later.
    console.log('\n========== EMAIL VERIFICATION (server terminal) ==========');
    console.log('To:', user.email);
    console.log('Verification code:', plainOtp);
    console.log('Expires in 10 minutes. Use /verify-email in the app with this code.');
    console.log('===========================================================\n');

    res.status(201).json({
      success: true,
      message:
        'Registration successful. Check the terminal where the API is running for your verification code, then enter it under Verify email.',
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Email via OTP
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
    
    const user = await User.findOne({ 
      email, 
      otp: hashedOTP,
      otpExpire: { $gt: Date.now() }
    });

    if(!user) return res.status(400).json({success: false, message: 'Invalid or expired OTP'});

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch(error) {
    res.status(500).json({ success: false, message: error.message });
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
    const email = req.body.email;
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

