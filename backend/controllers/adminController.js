const User = require('../models/User');
const House = require('../models/House');
const Transaction = require('../models/Transaction');

// @desc    Dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRenters = await User.countDocuments({ role: 'RENTER' });
    const totalOwners = await User.countDocuments({ role: 'OWNER' });
    
    const totalListings = await House.countDocuments();
    const activeListings = await House.countDocuments({ status: 'Active' });
    const pendingApprovals = await User.countDocuments({ role: 'OWNER', isApproved: false });

    // Aggregate Transactions
    const transactions = await Transaction.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);

    const totalRevenue = transactions.length > 0 ? transactions[0].totalRevenue : 0;
    const premiumSubscribers = await User.countDocuments({ isPremium: true });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalRenters,
        totalOwners,
        totalListings,
        activeListings,
        pendingApprovals,
        totalRevenue,
        premiumSubscribers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort('-createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending approvals
// @route   GET /api/admin/users/pending
// @access  Private (Admin)
exports.getPendingApprovals = async (req, res) => {
  try {
    const users = await User.find({ role: 'OWNER', isApproved: false }).sort('createdAt');
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject User
// @route   PUT /api/admin/users/:id/approve
// @access  Private (Admin)
exports.approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.isApproved = req.body.status !== undefined ? req.body.status : true;
    await user.save();

    res.status(200).json({ success: true, message: `User approval set to ${user.isApproved}`, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend User
// @route   PUT /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Assuming we use an 'isActive' or 'isApproved' logic. For simplicity, setting isApproved false
    user.isApproved = false;
    await user.save();
    
    res.status(200).json({ success: true, message: 'User suspended' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all houses (Admin View)
// @route   GET /api/admin/houses
// @access  Private (Admin)
exports.getAllHouses = async (req, res) => {
  try {
    const houses = await House.find().populate('owner', 'fullName email isApproved role').sort('-createdAt');
    res.status(200).json({ success: true, count: houses.length, data: houses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    List all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find().populate('user', 'fullName email role').sort('-createdAt');
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
