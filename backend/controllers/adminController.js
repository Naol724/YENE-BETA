const User = require('../models/User');
const House = require('../models/House');
const Inquiry = require('../models/Inquiry');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOwners = await User.countDocuments({ role: 'OWNER' });
    const totalRenters = await User.countDocuments({ role: 'RENTER' });
    const totalListings = await House.countDocuments();
    const activeListings = await House.countDocuments({ status: 'Active' });
    const totalInquiries = await Inquiry.countDocuments();
    const pendingInquiries = await Inquiry.countDocuments({ status: 'Pending' });

    const recentListings = await House.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('owner', 'fullName email');

    const recentInquiries = await Inquiry.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('property', 'title')
      .populate('renter', 'fullName email')
      .populate('owner', 'fullName email');

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalOwners,
          totalRenters,
          totalListings,
          activeListings,
          totalInquiries,
          pendingInquiries,
        },
        recentListings,
        recentInquiries,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

// @desc    Get all listings
// @route   GET /api/admin/listings
// @access  Private/Admin
exports.getAllListings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [{ title: { $regex: search, $options: 'i' } }];
    }

    const total = await House.countDocuments(query);
    const listings = await House.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: listings,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching listings' });
  }
};

// @desc    Approve or flag a listing
// @route   PATCH /api/admin/listings/:id
// @access  Private/Admin
exports.updateListingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Active', 'Paused', 'Flagged'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const listing = await House.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('owner', 'fullName email');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error updating listing' });
  }
};

// @desc    Get all inquiries
// @route   GET /api/admin/inquiries
// @access  Private/Admin
exports.getAllInquiries = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) query.status = status;

    const total = await Inquiry.countDocuments(query);
    const inquiries = await Inquiry.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('property', 'title')
      .populate('renter', 'fullName email')
      .populate('owner', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: inquiries,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error fetching inquiries' });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting user' });
  }
};

// @desc    Delete a listing (admin only)
// @route   DELETE /api/admin/listings/:id
// @access  Private/Admin
exports.deleteListing = async (req, res) => {
  try {
    const { id } = req.params;
    
    const listing = await House.findByIdAndDelete(id);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found' });
    }

    res.status(200).json({ success: true, message: 'Listing deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error deleting listing' });
  }
};

// @desc    Approve a user (mark as approved)
// @route   PATCH /api/admin/users/:id/approve
// @access  Private/Admin
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error approving user' });
  }
};
