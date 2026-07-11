const User = require('../models/User');
const House = require('../models/House');
const Inquiry = require('../models/Inquiry');
const Transaction = require('../models/Transaction');

const PREMIUM_DAYS = Number(process.env.PREMIUM_DAYS) || 30;

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await House.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();

    const paidTransactions = await Transaction.find({
      status: { $in: ['AwaitingApproval', 'Completed'] },
    });
    const totalRevenue = paidTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { updatedAt: { $gte: thirtyDaysAgo } },
      ],
    });

    const pendingApprovals = await User.countDocuments({
      role: 'OWNER',
      isApproved: false,
    });

    const pendingListings = await House.countDocuments({ status: 'Pending' });
    const pendingPremiumPayments = await Transaction.countDocuments({ status: 'AwaitingApproval' });

    const recentInquiries = await Inquiry.find()
      .populate('renter', 'fullName')
      .populate('property', 'title')
      .sort('-createdAt')
      .limit(10);

    const recentActivity = recentInquiries.map((inquiry) => ({
      type: 'inquiry',
      description: `New inquiry for ${inquiry.property?.title || 'a property'}`,
      timestamp: inquiry.createdAt,
      user: inquiry.renter?.fullName || 'Unknown',
    }));

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalInquiries,
        totalRevenue,
        activeUsers,
        pendingApprovals,
        pendingListings,
        pendingPremiumPayments,
        recentActivity,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await User.countDocuments();

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: { total, page, limit },
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject user
// @route   PATCH /api/admin/users/:id/approve
// @route   PATCH /api/admin/users/:id/reject
// @access  Private (Admin)
exports.updateUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const action = req.route.path.includes('approve') ? 'approve' : 'reject';

    if (action === 'approve') {
      user.isApproved = true;
    } else {
      user.isApproved = false;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${action}d successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user premium status
// @route   PATCH /api/admin/users/:id/toggle-premium
// @access  Private (Admin)
exports.toggleUserPremium = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isPremium = !user.isPremium;
    if (user.isPremium) {
      user.premiumExpiresAt = new Date(Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000);
    } else {
      user.premiumExpiresAt = null;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: `Premium status ${user.isPremium ? 'granted' : 'revoked'}`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all properties
// @route   GET /api/admin/properties
// @access  Private (Admin)
exports.getAllProperties = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const statusFilter = req.query.status;

    const filter = {};
    if (statusFilter) filter.status = statusFilter;

    const properties = await House.find(filter)
      .populate('owner', 'fullName email')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await House.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: properties.length,
      pagination: { total, page, limit },
      data: properties,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property status (approve → Active, reject → Rejected)
// @route   PATCH /api/admin/properties/:id/approve
// @route   PATCH /api/admin/properties/:id/reject
// @access  Private (Admin)
exports.updatePropertyStatus = async (req, res) => {
  try {
    const property = await House.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const isApprove = req.route.path.includes('approve');
    property.status = isApprove ? 'Active' : 'Rejected';

    await property.save();

    res.status(200).json({
      success: true,
      message: isApprove
        ? 'Property approved and published'
        : 'Property rejected — owner must fix details and resubmit',
      data: property,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/admin/properties/:id
// @access  Private (Admin)
exports.deleteProperty = async (req, res) => {
  try {
    const property = await House.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
      data: {},
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all transactions
// @route   GET /api/admin/transactions
// @access  Private (Admin)
exports.getAllTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const statusFilter = req.query.status;

    const filter = {};
    if (statusFilter) filter.status = statusFilter;

    const transactions = await Transaction.find(filter)
      .populate('user', 'fullName email phone isPremium')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: { total, page, limit },
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment and grant premium
// @route   PATCH /api/admin/transactions/:id/grant-premium
// @access  Private (Admin)
exports.grantPremiumFromTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id).populate('user');
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (tx.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Premium was already granted for this payment',
      });
    }

    if (tx.status !== 'AwaitingApproval') {
      return res.status(400).json({
        success: false,
        message: `Cannot grant premium for a transaction with status "${tx.status}". Payment must be verified first.`,
      });
    }

    const user = await User.findById(tx.user._id || tx.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isPremium = true;
    user.premiumExpiresAt = new Date(Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000);
    await user.save();

    tx.status = 'Completed';
    tx.reviewedBy = req.user.id;
    tx.reviewedAt = new Date();
    tx.reviewNote = req.body.note || 'Payment verified — premium granted';
    await tx.save();

    res.status(200).json({
      success: true,
      message: `Premium granted to ${user.fullName}`,
      data: {
        transaction: tx,
        user: { _id: user._id, isPremium: user.isPremium, premiumExpiresAt: user.premiumExpiresAt },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reject a paid premium subscription request
// @route   PATCH /api/admin/transactions/:id/reject-premium
// @access  Private (Admin)
exports.rejectPremiumTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (tx.status !== 'AwaitingApproval') {
      return res.status(400).json({
        success: false,
        message: `Only payments awaiting approval can be rejected (current: ${tx.status})`,
      });
    }

    tx.status = 'Rejected';
    tx.reviewedBy = req.user.id;
    tx.reviewedAt = new Date();
    tx.reviewNote = req.body.note || 'Payment rejected by admin';
    await tx.save();

    res.status(200).json({
      success: true,
      message: 'Premium payment request rejected',
      data: tx,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all inquiries
// @route   GET /api/admin/inquiries
// @access  Private (Admin)
exports.getAllInquiries = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const inquiries = await Inquiry.find()
      .populate('property', 'title images location')
      .populate('renter', 'fullName email phone')
      .populate('owner', 'fullName email phone')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Inquiry.countDocuments();

    res.status(200).json({
      success: true,
      count: inquiries.length,
      pagination: { total, page, limit },
      data: inquiries,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
