const User = require('../models/User');
const House = require('../models/House');
const Inquiry = require('../models/Inquiry');
const Transaction = require('../models/Transaction');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProperties = await House.countDocuments();
    const totalInquiries = await Inquiry.countDocuments();
    
    // Calculate total revenue from completed transactions
    const completedTransactions = await Transaction.find({ status: 'Completed' });
    const totalRevenue = completedTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    // Count active users (users who logged in or created inquiries in last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
        { 'updatedAt': { $gte: thirtyDaysAgo } }
      ]
    });
    
    // Count pending approvals (owners waiting for approval)
    const pendingApprovals = await User.countDocuments({
      role: 'OWNER',
      isApproved: false
    });
    
    // Get recent activity
    const recentInquiries = await Inquiry.find()
      .populate('renter', 'fullName')
      .populate('property', 'title')
      .sort('-createdAt')
      .limit(10);
    
    const recentActivity = recentInquiries.map(inquiry => ({
      type: 'inquiry',
      description: `New inquiry for ${inquiry.property.title}`,
      timestamp: inquiry.createdAt,
      user: inquiry.renter.fullName
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
        recentActivity
      }
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
      data: users
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
      data: user
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
      user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    } else {
      user.premiumExpiresAt = null;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Premium status ${user.isPremium ? 'granted' : 'revoked'}`,
      data: user
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
    
    const properties = await House.find()
      .populate('owner', 'fullName email')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);
    
    const total = await House.countDocuments();
    
    res.status(200).json({
      success: true,
      count: properties.length,
      pagination: { total, page, limit },
      data: properties
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property status
// @route   PATCH /api/admin/properties/:id/approve
// @route   PATCH /api/admin/properties/:id/reject
// @access  Private (Admin)
exports.updatePropertyStatus = async (req, res) => {
  try {
    const property = await House.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    
    const action = req.route.path.includes('approve') ? 'Active' : 'Flagged';
    property.status = action;
    
    await property.save();
    
    res.status(200).json({
      success: true,
      message: `Property ${action}`,
      data: property
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
      data: {}
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
    
    const transactions = await Transaction.find()
      .populate('user', 'fullName email')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);
    
    const total = await Transaction.countDocuments();
    
    res.status(200).json({
      success: true,
      count: transactions.length,
      pagination: { total, page, limit },
      data: transactions
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
      data: inquiries
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
