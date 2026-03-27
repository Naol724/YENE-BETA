const Favorite = require('../models/Favorite');
const House = require('../models/House');

// POST /api/v1/favorites/:houseId
exports.addFavorite = async (req, res, next) => {
    try {
        const house = await House.findById(req.params.houseId);
        if (!house) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });

        const count = await Favorite.countDocuments({ userId: req.user._id });
        if (count >= 100) return res.status(400).json({ success: false, error: { message: 'Max 100 favorites reached' } });

        const fav = await Favorite.create({ userId: req.user._id, houseId: req.params.houseId });
        res.status(201).json({ success: true, data: fav });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ success: false, error: { message: 'Already in favorites' } });
        next(err);
    }
};

// DELETE /api/v1/favorites/:houseId
exports.removeFavorite = async (req, res, next) => {
    try {
        await Favorite.findOneAndDelete({ userId: req.user._id, houseId: req.params.houseId });
        res.json({ success: true, message: 'Removed from favorites' });
    } catch (err) { next(err); }
};

// GET /api/v1/favorites
exports.getFavorites = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [favs, total] = await Promise.all([
            Favorite.find({ userId: req.user._id }).populate({ path: 'houseId', populate: { path: 'listedBy', select: 'name avatar' } }).sort('-createdAt').skip(skip).limit(Number(limit)),
            Favorite.countDocuments({ userId: req.user._id })
        ]);
        res.json({ success: true, data: favs, pagination: { page: Number(page), limit: Number(limit), total } });
    } catch (err) { next(err); }
};
