const House = require('../models/House');

// @desc    Get all houses (with filtering, sorting, pagination)
// @route   GET /api/houses
// @access  Public
exports.getHouses = async (req, res) => {
  try {
    let query;
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit', 'minPrice', 'maxPrice', 'amenities'];
    removeFields.forEach(param => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    query = House.find(JSON.parse(queryStr));

    // Price Range Filter
    if (req.query.minPrice || req.query.maxPrice) {
      query = query.where('pricing.pricePerMonth');
      if (req.query.minPrice) query.gte(req.query.minPrice);
      if (req.query.maxPrice) query.lte(req.query.maxPrice);
    }

    // Amenities Filter
    if (req.query.amenities) {
      const amenitiesArr = req.query.amenities.split(',');
      query = query.where('amenities').all(amenitiesArr);
    }

    // Only show active listings to guests/renters; owners see their own filters via query
    if (!req.user || req.user.role === 'RENTER') {
      query = query.where({ status: 'Active' });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt'); // Default newest
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const total = await House.countDocuments(query);
    query = query.skip(startIndex).limit(limit);

    // Populate Owner
    query = query.populate({
      path: 'owner',
      select: 'fullName email phone isApproved'
    });

    const houses = await query;

    res.status(200).json({
      success: true,
      count: houses.length,
      pagination: { total, page, limit },
      data: houses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single house details
// @route   GET /api/houses/:id
// @access  Public
exports.getHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id).populate({
      path: 'owner',
      select: 'fullName email phone isApproved'
    });

    if (!house) return res.status(404).json({ success: false, message: 'Property not found' });
    res.status(200).json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new listing
// @route   POST /api/houses
// @access  Private (Owner/Admin)
exports.createHouse = async (req, res) => {
  try {
    req.body.owner = req.user.id;
    const house = await House.create(req.body);
    res.status(201).json({ success: true, data: house });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update listing
// @route   PUT /api/houses/:id
// @access  Private (Owner/Admin)
exports.updateHouse = async (req, res) => {
  try {
    let house = await House.findById(req.params.id);

    if (!house) return res.status(404).json({ success: false, message: 'Property not found' });

    // Validate ownership
    if (house.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this listing' });
    }

    house = await House.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: house });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete listing
// @route   DELETE /api/houses/:id
// @access  Private (Owner/Admin)
exports.deleteHouse = async (req, res) => {
  try {
    const house = await House.findById(req.params.id);

    if (!house) return res.status(404).json({ success: false, message: 'Property not found' });

    // Validate ownership
    if (house.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this listing' });
    }

    await house.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment views
// @route   POST /api/houses/:id/view
// @access  Public
exports.incrementView = async (req, res) => {
  try {
    const house = await House.findByIdAndUpdate(req.params.id, {
      $inc: { views: 1 }
    }, { new: true });
    
    if(!house) return res.status(404).json({success:false, message: 'Property not found'});
    res.status(200).json({ success: true, data: house.views });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get owner's listings
// @route   GET /api/houses/my-listings
// @access  Private (Owner)
exports.getMyListings = async (req, res) => {
  try {
    const houses = await House.find({ owner: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: houses.length, data: houses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
