const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
    try {
        const { name, email, phone, password, role } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(409).json({ success: false, error: { code: 'USER_002', message: 'Email already exists' } });

        const user = await User.create({ name, email, phone, password, role: role || 'renter' });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, createdAt: user.createdAt },
                token,
            }
        });
    } catch (err) { next(err); }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Email and password required' } });

        const user = await User.findOne({ email }).select('+password');
        if (!user) return res.status(401).json({ success: false, error: { code: 'AUTH_001', message: 'Invalid credentials' } });

        if (user.status === 'suspended') return res.status(403).json({ success: false, error: { code: 'AUTH_003', message: 'Account suspended' } });

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
            if (user.failedLoginAttempts >= 5) user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
            await user.save();
            return res.status(401).json({ success: false, error: { code: 'AUTH_001', message: 'Invalid credentials' } });
        }

        user.failedLoginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.json({
            success: true,
            data: {
                user: { id: user._id, name: user.name, email: user.email, role: user.role, isApproved: user.isApproved, isPremium: user.isPremium, avatar: user.avatar },
                token
            }
        });
    } catch (err) { next(err); }
};

// GET /api/v1/auth/me
exports.getMe = async (req, res) => {
    res.json({ success: true, data: req.user });
};

// POST /api/v1/auth/forgot-password
exports.forgotPassword = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ success: false, error: { code: 'USER_001', message: 'No user found with that email' } });

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();

        res.json({ success: true, message: 'Password reset email sent (simulated)', resetToken });
    } catch (err) { next(err); }
};

// POST /api/v1/auth/reset-password
exports.resetPassword = async (req, res, next) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(req.params.token || req.body.token).digest('hex');
        const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
        if (!user) return res.status(400).json({ success: false, error: { code: 'AUTH_004', message: 'Invalid or expired reset token' } });

        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        const token = generateToken(user._id);
        res.json({ success: true, data: { token } });
    } catch (err) { next(err); }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
};
