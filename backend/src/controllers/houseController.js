const House = require('../models/House');
const User = require('../models/User');

// GET /api/v1/houses
exports.getHouses = async (req, res, next) => {
    try {
        const { page = 1, limit = 20, location, minPrice, maxPrice, bedrooms, type, sort = '-createdAt', isPremium, status } = req.query;
        const query = { isActive: true, status: status || 'active' };

        if (location) query.location = { $regex: location, $options: 'i' };
        if (minPrice || maxPrice) query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
        if (bedrooms) query.bedrooms = Number(bedrooms);
        if (type) query.type = type;
        if (isPremium !== undefined) query.isPremium = isPremium === 'true';

        const skip = (Number(page) - 1) * Number(limit);
        const [houses, total] = await Promise.all([
            House.find(query).populate('listedBy', 'name email phone avatar role').sort(sort).skip(skip).limit(Number(limit)),
            House.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: {
                houses,
                pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
            }
        });
    } catch (err) { next(err); }
};

// GET /api/v1/houses/search
exports.searchHouses = async (req, res, next) => {
    try {
        const { q, page = 1, limit = 20 } = req.query;
        if (!q) return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'Search query required' } });

        const query = { isActive: true, $text: { $search: q } };
        const skip = (Number(page) - 1) * Number(limit);
        const houses = await House.find(query, { score: { $meta: 'textScore' } })
            .populate('listedBy', 'name email phone avatar')
            .sort({ score: { $meta: 'textScore' } })
            .skip(skip).limit(Number(limit));

        res.json({ success: true, data: { houses, count: houses.length } });
    } catch (err) { next(err); }
};

// GET /api/v1/houses/:id
exports.getHouse = async (req, res, next) => {
    try {
        const house = await House.findById(req.params.id).populate('listedBy', 'name email phone avatar role isPremium');
        if (!house || !house.isActive) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });

        house.views += 1;
        await house.save();
        res.json({ success: true, data: house });
    } catch (err) { next(err); }
};

// POST /api/v1/houses
exports.createHouse = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        const existingCount = await House.countDocuments({ listedBy: req.user._id, isActive: true });

        if (existingCount >= 1 && !user.isPremium) {
            return res.status(403).json({ success: false, error: { code: 'HOUSE_002', message: 'Premium subscription required for additional listings' } });
        }

        const house = await House.create({ ...req.body, listedBy: req.user._id });
        res.status(201).json({ success: true, data: house });
    } catch (err) { next(err); }
};

// PUT /api/v1/houses/:id
exports.updateHouse = async (req, res, next) => {
    try {
        let house = await House.findById(req.params.id);
        if (!house || !house.isActive) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });

        if (house.listedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: { code: 'AUTH_003', message: 'Not authorized to edit this listing' } });
        }

        const disallowed = ['listedBy', 'views', 'inquiryCount'];
        disallowed.forEach(f => delete req.body[f]);
        house = await House.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: house });
    } catch (err) { next(err); }
};

// DELETE /api/v1/houses/:id
exports.deleteHouse = async (req, res, next) => {
    try {
        const house = await House.findById(req.params.id);
        if (!house) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });

        if (house.listedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: { code: 'AUTH_003', message: 'Not authorized' } });
        }

        house.isActive = false;
        house.status = 'deleted';
        await house.save();
        res.json({ success: true, message: 'Listing deleted' });
    } catch (err) { next(err); }
};

// GET /api/v1/houses/my-listings
exports.getMyListings = async (req, res, next) => {
    try {
        const houses = await House.find({ listedBy: req.user._id, isActive: true }).sort('-createdAt');
        res.json({ success: true, data: houses, count: houses.length });
    } catch (err) { next(err); }
};
