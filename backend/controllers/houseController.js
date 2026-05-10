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

    // Only show active/available listings to guests/renters; owners see their own filters via query
    if (!req.user || req.user.role === 'RENTER') {
      query = query.where({ status: { $in: ['Active', 'Available'] } });
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
    // Validate user permissions
    if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Only owners and admins can create listings' 
      });
    }

    // Check if user has reached their listing limit (if not premium)
    if (req.user.role === 'OWNER' && !req.user.isPremium) {
      const listingCount = await House.countDocuments({ owner: req.user.id });
      const freeListingsLimit = 3; // Default free listings
      
      if (listingCount >= freeListingsLimit) {
        return res.status(403).json({ 
          success: false, 
          message: `You've reached your free listing limit of ${freeListingsLimit}. Upgrade to premium for unlimited listings.` 
        });
      }
    }

    // Validate required fields
    const requiredFields = ['title', 'propertyType', 'bedrooms', 'bathrooms', 'location', 'pricing', 'description'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }

    // Validate location structure
    if (!req.body.location.city || !req.body.location.area || !req.body.location.address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Complete location information is required (city, area, address)' 
      });
    }

    // Validate pricing structure
    if (!req.body.pricing.pricePerMonth || req.body.pricing.pricePerMonth <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid monthly price is required' 
      });
    }

    // Set owner and default values
    req.body.owner = req.user.id;
    req.body.status = req.body.status || 'Available';
    req.body.views = 0;

    // Ensure at least one image is provided
    if (!req.body.images || req.body.images.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one property image is required' 
      });
    }

    // Set first image as main if not specified
    if (req.body.images.length > 0) {
      const hasMainImage = req.body.images.some(img => img.isMain);
      if (!hasMainImage) {
        req.body.images[0].isMain = true;
      }
    }

    const house = await House.create(req.body);
    
    // Populate owner information for response
    const populatedHouse = await House.findById(house._id).populate({
      path: 'owner',
      select: 'fullName email phone isApproved'
    });

    res.status(201).json({ 
      success: true, 
      message: 'Property listing created successfully',
      data: populatedHouse 
    });
  } catch (error) {
    console.error('House creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate entry detected' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create property listing' 
    });
  }
};

// @desc    Update listing
// @route   PUT /api/houses/:id
// @access  Private (Owner/Admin)
exports.updateHouse = async (req, res) => {
  try {
    let house = await House.findById(req.params.id);

    if (!house) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Validate ownership or admin access
    const isOwner = house.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';
    
    if (!isOwner && !isAdmin) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to update this listing' 
      });
    }

    // Validate pricing if provided
    if (req.body.pricing && req.body.pricing.pricePerMonth) {
      if (req.body.pricing.pricePerMonth <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Price must be greater than 0' 
        });
      }
    }

    // Validate bedroom/bathroom counts if provided
    if (req.body.bedrooms !== undefined && (req.body.bedrooms < 0 || req.body.bedrooms > 20)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bedrooms must be between 0 and 20' 
      });
    }

    if (req.body.bathrooms !== undefined && (req.body.bathrooms < 0 || req.body.bathrooms > 20)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bathrooms must be between 0 and 20' 
      });
    }

    // Handle image updates
    if (req.body.images && req.body.images.length > 0) {
      const hasMainImage = req.body.images.some(img => img.isMain);
      if (!hasMainImage) {
        req.body.images[0].isMain = true;
      }
    }

    // Update the house
    const updatedHouse = await House.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate({
      path: 'owner',
      select: 'fullName email phone isApproved'
    });

    res.status(200).json({ 
      success: true, 
      message: 'Property updated successfully',
      data: updatedHouse 
    });
  } catch (error) {
    console.error('House update error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update property listing' 
    });
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
