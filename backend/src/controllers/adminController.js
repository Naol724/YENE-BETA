const User = require('../models/User');
const House = require('../models/House');
const Transaction = require('../models/Transaction');
const AuditLog = require('../models/AuditLog');
const Inquiry = require('../models/Inquiry');

const logAction = async (adminId, action, targetType, targetId, details, req) => {
    try {
        await AuditLog.create({
            adminId,
            action,
            targetType,
            targetId: targetId?.toString(),
            details,
            ipAddress: req?.ip,
            userAgent: req?.headers?.['user-agent'],
        });
    } catch (e) { console.error('Audit log error:', e.message); }
};

// GET /api/v1/admin/stats
exports.getStats = async (req, res, next) => {
    try {
        const [
            totalUsers, pendingApprovals, premiumUsers, verifiedUsers,
            totalListings, activeListings, premiumListings,
            totalRevenue, totalTransactions, recentUsers, recentListings
        ] = await Promise.all([
            User.countDocuments({ role: { $ne: 'admin' } }),
            User.countDocuments({ isApproved: false, role: { $in: ['owner', 'broker'] } }),
            User.countDocuments({ isPremium: true }),
            User.countDocuments({ isApproved: true, role: { $ne: 'admin' } }),
            House.countDocuments({ isActive: true }),
            House.countDocuments({ isActive: true, status: 'active' }),
            House.countDocuments({ isActive: true, isPremium: true }),
            Transaction.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
            Transaction.countDocuments(),
            User.find({ role: { $ne: 'admin' } }).sort('-createdAt').limit(5).select('name email role status isApproved createdAt'),
            House.find({ isActive: true }).sort('-createdAt').limit(5).populate('listedBy', 'name').select('title location price status isPremium'),
        ]);

        const ownerCount = await User.countDocuments({ role: 'owner' });
        const brokerCount = await User.countDocuments({ role: 'broker' });
        const renterCount = await User.countDocuments({ role: 'renter' });

        res.json({
            success: true,
            data: {
                totalUsers,
                pendingApprovals,
                premiumUsers,
                verifiedUsers,
                totalListings,
                activeListings,
                premiumListings,
                totalRevenue: totalRevenue[0]?.total || 0,
                totalTransactions,
                userBreakdown: { owners: ownerCount, brokers: brokerCount, renters: renterCount },
                listingBreakdown: { active: activeListings, premium: premiumListings },
                recentUsers,
                recentListings,
            }
        });
    } catch (err) { next(err); }
};

// GET /api/v1/admin/users
exports.getUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, role, status, search, approved } = req.query;
        const query = { role: { $ne: 'admin' } };
        if (role) query.role = role;
        if (status) query.status = status;
        if (approved !== undefined) query.isApproved = approved === 'true';
        if (search) query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];

        const skip = (Number(page) - 1) * Number(limit);
        const [users, total] = await Promise.all([
            User.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
            User.countDocuments(query)
        ]);
        res.json({ success: true, data: users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    } catch (err) { next(err); }
};

// GET /api/v1/admin/users/pending
exports.getPendingUsers = async (req, res, next) => {
    try {
        const users = await User.find({ isApproved: false, role: { $in: ['owner', 'broker'] } }).sort('createdAt');
        res.json({ success: true, data: users, count: users.length });
    } catch (err) { next(err); }
};

// PUT /api/v1/admin/users/:id/approve
exports.approveUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isApproved: true, status: 'active' }, { new: true });
        if (!user) return res.status(404).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
        await logAction(req.user._id, `Approved ${user.role} account: ${user.name}`, 'user', user._id, {}, req);
        res.json({ success: true, data: user, message: `${user.name} has been approved` });
    } catch (err) { next(err); }
};

// PUT /api/v1/admin/users/:id/suspend
exports.suspendUser = async (req, res, next) => {
    try {
        const { reason, duration } = req.body;
        const updates = { status: 'suspended', suspensionReason: reason };
        if (duration && duration !== 'permanent') updates.suspensionExpiry = new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000);

        const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!user) return res.status(404).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
        await logAction(req.user._id, `Suspended user: ${user.name} (${reason})`, 'user', user._id, { reason, duration }, req);
        res.json({ success: true, data: user, message: `${user.name} has been suspended` });
    } catch (err) { next(err); }
};

// DELETE /api/v1/admin/users/:id
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, error: { code: 'USER_001', message: 'User not found' } });
        await logAction(req.user._id, `Deleted user: ${user.name} (${user.email})`, 'user', user._id, {}, req);
        res.json({ success: true, message: 'User deleted permanently' });
    } catch (err) { next(err); }
};

// GET /api/v1/admin/houses
exports.getHouses = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, isPremium, search } = req.query;
        const query = {};
        if (status) query.status = status;
        if (isPremium !== undefined) query.isPremium = isPremium === 'true';
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } }
        ];

        const skip = (Number(page) - 1) * Number(limit);
        const [houses, total] = await Promise.all([
            House.find(query).populate('listedBy', 'name email role').sort('-createdAt').skip(skip).limit(Number(limit)),
            House.countDocuments(query)
        ]);
        res.json({ success: true, data: houses, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    } catch (err) { next(err); }
};

// DELETE /api/v1/admin/houses/:id
exports.deleteHouse = async (req, res, next) => {
    try {
        const house = await House.findByIdAndUpdate(req.params.id, { isActive: false, status: 'deleted' }, { new: true });
        if (!house) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });
        await logAction(req.user._id, `Deleted listing: ${house.title}`, 'listing', house._id, {}, req);
        res.json({ success: true, message: 'Listing deleted' });
    } catch (err) { next(err); }
};

// PUT /api/v1/admin/houses/:id/flag
exports.flagHouse = async (req, res, next) => {
    try {
        const house = await House.findByIdAndUpdate(req.params.id, { isFlagged: true, flagReason: req.body.reason, status: 'suspended' }, { new: true });
        if (!house) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });
        await logAction(req.user._id, `Flagged listing: ${house.title}`, 'listing', house._id, { reason: req.body.reason }, req);
        res.json({ success: true, data: house });
    } catch (err) { next(err); }
};

// GET /api/v1/admin/transactions
exports.getTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, userId } = req.query;
        const query = {};
        if (status) query.status = status;
        if (userId) query.userId = userId;

        const skip = (Number(page) - 1) * Number(limit);
        const [txns, total] = await Promise.all([
            Transaction.find(query).populate('userId', 'name email phone role').sort('-createdAt').skip(skip).limit(Number(limit)),
            Transaction.countDocuments(query)
        ]);
        res.json({ success: true, data: txns, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    } catch (err) { next(err); }
};

// GET /api/v1/admin/audit-logs
exports.getAuditLogs = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, targetType, adminId } = req.query;
        const query = {};
        if (targetType) query.targetType = targetType;
        if (adminId) query.adminId = adminId;

        const skip = (Number(page) - 1) * Number(limit);
        const [logs, total] = await Promise.all([
            AuditLog.find(query).populate('adminId', 'name email').sort('-createdAt').skip(skip).limit(Number(limit)),
            AuditLog.countDocuments(query)
        ]);
        res.json({ success: true, data: logs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
    } catch (err) { next(err); }
};

// POST /api/v1/admin/users/bulk-approve
exports.bulkApproveUsers = async (req, res, next) => {
    try {
        const { ids } = req.body;
        await User.updateMany({ _id: { $in: ids } }, { isApproved: true, status: 'active' });
        await logAction(req.user._id, `Bulk approved ${ids.length} users`, 'user', null, { ids }, req);
        res.json({ success: true, message: `${ids.length} users approved` });
    } catch (err) { next(err); }
};

// GET /api/v1/admin/analytics/users
exports.getUserAnalytics = async (req, res, next) => {
    try {
        const last30days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [byRole, newUsers, premiumByRole] = await Promise.all([
            User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
            User.countDocuments({ createdAt: { $gte: last30days } }),
            User.aggregate([{ $match: { isPremium: true } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
        ]);
        res.json({ success: true, data: { byRole, newUsers, premiumByRole } });
    } catch (err) { next(err); }
};

// POST /api/v1/admin/notifications/broadcast
exports.broadcastNotification = async (req, res, next) => {
    try {
        const { target, subject, body, type } = req.body;
        await logAction(req.user._id, `Broadcast notification: "${subject}" to ${target}`, 'system', null, { target, type }, req);
        res.json({ success: true, message: `Notification broadcast to ${target} (simulated)` });
    } catch (err) { next(err); }
};
