const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({ success: false, error: { code: 'AUTH_004', message: 'Not authorized, no token' } });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
        }
        if (user.status === 'suspended') {
            return res.status(403).json({ success: false, error: { code: 'AUTH_003', message: 'Account suspended' } });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ success: false, error: { code: 'AUTH_004', message: 'Token invalid or expired' } });
    }
};

// Role-based access control
const authorize = (...roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            error: { code: 'AUTH_003', message: `Role '${req.user.role}' is not authorized for this action` }
        });
    }
    next();
};

// Check if owner/broker is approved
const requireApproved = (req, res, next) => {
    if ((req.user.role === 'owner' || req.user.role === 'broker') && !req.user.isApproved) {
        return res.status(403).json({
            success: false,
            error: { code: 'AUTH_002', message: 'Account pending admin approval' }
        });
    }
    next();
};

module.exports = { protect, authorize, requireApproved };
