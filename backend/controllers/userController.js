const User = require('../models/User');
const House = require('../models/House');

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, {
      fullName, phone
    }, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload avatar (Mock)
// @route   POST /api/users/me/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  res.status(200).json({ success: true, message: 'Avatar upload mock implementation' });
};

// @desc    Get public user info
// @route   GET /api/users/:id
// @access  Public
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('fullName email phone role isApproved');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user listings (public)
// @route   GET /api/users/:id/listings
// @access  Public
exports.getUserListings = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.params.id, status: 'Active' });
    res.status(200).json({ success: true, count: houses.length, data: houses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
