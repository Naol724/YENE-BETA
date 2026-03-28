const Favorite = require('../models/Favorite');
const House = require('../models/House');

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private (Renter)
exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate('house');
    res.status(200).json({ success: true, count: favorites.length, data: favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add favorite
// @route   POST /api/favorites/:houseId
// @access  Private (Renter)
exports.addFavorite = async (req, res) => {
  try {
    const house = await House.findById(req.params.houseId);
    if (!house) return res.status(404).json({ success: false, message: 'Property not found' });

    const favorite = await Favorite.create({
      user: req.user.id,
      house: req.params.houseId
    });

    res.status(201).json({ success: true, data: favorite });
  } catch (error) {
    // If uniqueness validation fails, it means already favorited
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Property already in favorites' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove favorite
// @route   DELETE /api/favorites/:houseId
// @access  Private (Renter)
exports.removeFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user.id,
      house: req.params.houseId
    });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Property not found in favorites' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
