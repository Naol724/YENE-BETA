const User = require('../models/User');

// GET /api/v1/users/me
exports.getMe = async (req, res) => {
    res.json({ success: true, data: req.user });
};

// PUT /api/v1/users/me
exports.updateMe = async (req, res, next) => {
    try {
        const allowed = ['name', 'phone', 'location', 'bio', 'avatar'];
        const updates = {};
        allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
};

// GET /api/v1/users/:id  (public profile)
exports.getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('name avatar role createdAt location');
        if (!user) return res.status(404).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
};

// POST /api/v1/users/me/avatar (simulated - just returns the provided URL)
exports.uploadAvatar = async (req, res, next) => {
    try {
        const avatarUrl = req.body.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(req.user.name);
        await User.findByIdAndUpdate(req.user._id, { avatar: avatarUrl });
        res.json({ success: true, data: { avatar: avatarUrl } });
    } catch (err) { next(err); }
};
