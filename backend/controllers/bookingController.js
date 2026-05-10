const Booking = require('../models/Booking');
const House = require('../models/House');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Renter)
exports.createBooking = async (req, res) => {
  try {
    const {
      property,
      startDate,
      endDate,
      tenantInfo,
      specialRequests,
      agreeToTerms
    } = req.body;

    // Validate property exists and is active
    const house = await House.findById(property);
    if (!house) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (house.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Property is not available for booking' });
    }

    // Calculate total cost
    const start = new Date(startDate);
    const end = new Date(endDate);
    const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const totalCost = (months * house.pricing.pricePerMonth) + house.pricing.securityDeposit;

    // Create booking
    const booking = await Booking.create({
      property,
      owner: house.owner,
      tenant: req.user.id,
      startDate,
      endDate,
      totalCost,
      tenantInfo,
      specialRequests,
      agreeToTerms
    });

    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location pricing')
      .populate('owner', 'fullName email phone')
      .populate('tenant', 'fullName email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request submitted successfully',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Failed to create booking' 
    });
  }
};

// @desc    Get all bookings for a user
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    let query;
    
    if (req.user.role === 'OWNER') {
      query = { owner: req.user.id };
    } else if (req.user.role === 'RENTER') {
      query = { tenant: req.user.id };
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const bookings = await Booking.find(query)
      .populate('property', 'title images location pricing')
      .populate('owner', 'fullName email phone')
      .populate('tenant', 'fullName email phone')
      .populate('paymentTransaction', 'referenceId status amount')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location pricing')
      .populate('owner', 'fullName email phone')
      .populate('tenant', 'fullName email phone')
      .populate('paymentTransaction', 'referenceId status amount')
      .populate('notes.author', 'fullName');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    const userId = req.user.id.toString();
    const isOwner = booking.owner._id.toString() === userId;
    const isTenant = booking.tenant._id.toString() === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isTenant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status (approve/reject/cancel)
// @route   PATCH /api/bookings/:id/status
// @access  Private (Owner/Admin)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status, rejectionReason, cancellationReason } = req.body;
    
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    const userId = req.user.id.toString();
    const isOwner = booking.owner.toString() === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    // Validate status transitions
    if (booking.status === 'Cancelled' || booking.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Cannot update a completed or cancelled booking' });
    }

    if (status === 'Approved') {
      booking.status = 'Approved';
      booking.approvalDate = new Date();
    } else if (status === 'Rejected') {
      booking.status = 'Rejected';
      booking.rejectionReason = rejectionReason;
    } else if (status === 'Cancelled') {
      // Only tenant can cancel their own booking
      if (booking.tenant.toString() !== userId && !isAdmin) {
        return res.status(403).json({ success: false, message: 'Only tenant can cancel booking' });
      }
      booking.status = 'Cancelled';
      booking.cancellationReason = cancellationReason;
    } else if (status === 'Active') {
      if (booking.status !== 'Approved') {
        return res.status(400).json({ success: false, message: 'Booking must be approved first' });
      }
      booking.status = 'Active';
      booking.moveInDate = new Date();
    } else if (status === 'Completed') {
      if (booking.status !== 'Active') {
        return res.status(400).json({ success: false, message: 'Booking must be active first' });
      }
      booking.status = 'Completed';
      booking.moveOutDate = new Date();
    }

    await booking.save();

    // Populate updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location pricing')
      .populate('owner', 'fullName email phone')
      .populate('tenant', 'fullName email phone');

    res.status(200).json({
      success: true,
      message: `Booking ${status.toLowerCase()} successfully`,
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add note to booking
// @route   POST /api/bookings/:id/notes
// @access  Private
exports.addBookingNote = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message.trim()) {
      return res.status(400).json({ success: false, message: 'Note message is required' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check authorization
    const userId = req.user.id.toString();
    const isOwner = booking.owner.toString() === userId;
    const isTenant = booking.tenant.toString() === userId;
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isTenant && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized to add notes to this booking' });
    }

    booking.notes.push({
      author: req.user.id,
      message: message.trim(),
      createdAt: new Date()
    });

    await booking.save();

    // Populate updated booking
    const updatedBooking = await Booking.findById(booking._id)
      .populate('property', 'title images location pricing')
      .populate('owner', 'fullName email phone')
      .populate('tenant', 'fullName email phone')
      .populate('notes.author', 'fullName');

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      data: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin)
exports.getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    let query = {};
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('property', 'title images location pricing')
      .populate('owner', 'fullName email phone')
      .populate('tenant', 'fullName email phone')
      .populate('paymentTransaction', 'referenceId status amount')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    const total = await Booking.countDocuments(query);

    res.status(200).json({
      success: true,
      count: bookings.length,
      pagination: { total, page, limit },
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
