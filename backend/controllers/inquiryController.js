const Inquiry = require('../models/Inquiry');
const House = require('../models/House');

// @desc    Send an inquiry
// @route   POST /api/inquiries
// @access  Private (Renter)
exports.createInquiry = async (req, res) => {
  try {
    req.body.renter = req.user.id;
    
    // Check if property exists
    const house = await House.findById(req.body.property);
    if (!house) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }
    req.body.owner = house.owner;

    // Check rate limit: Max 3 inquiries per property per renter
    const count = await Inquiry.countDocuments({ renter: req.user.id, property: req.body.property });
    if (count >= 3) {
      return res.status(400).json({ success: false, message: 'Maximum inquiries for this property reached.' });
    }

    const inquiry = await Inquiry.create(req.body);
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Renter's inquiries
// @route   GET /api/inquiries/my-inquiries
// @access  Private (Renter)
exports.getMyInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find({ renter: req.user.id })
      .populate('property', 'title images pricing location')
      .populate('owner', 'fullName phone email avatar')
      .sort('-createdAt');
      
    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single inquiry (owner, renter, or admin)
// @route   GET /api/inquiries/:id
// @access  Private
exports.getInquiryById = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id)
      .populate('property', 'title images pricing location status')
      .populate('renter', 'fullName phone email')
      .populate('owner', 'fullName phone email')
      .populate({
        path: 'replies.sender',
        select: 'fullName email role',
      });

    if (!inquiry) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    const uid = req.user.id.toString();
    const ownerId = inquiry.owner?._id ? inquiry.owner._id.toString() : inquiry.owner.toString();
    const renterId = inquiry.renter?._id ? inquiry.renter._id.toString() : inquiry.renter.toString();
    const isOwner = ownerId === uid;
    const isRenter = renterId === uid;
    if (!isOwner && !isRenter && req.user.role !== 'ADMIN') {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Owner's received inquiries
// @route   GET /api/inquiries/received
// @access  Private (Owner)
exports.getReceivedInquiries = async (req, res) => {
  try {
    let query = { owner: req.user.id };
    if (req.user.role === 'ADMIN') {
      query = {};
    }

    const inquiries = await Inquiry.find(query)
      .populate('property', 'title images pricing status')
      .populate('renter', 'fullName phone email')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: inquiries.length, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update status (Read, Responded)
// @route   PATCH /api/inquiries/:id
// @access  Private (Owner)
exports.updateInquiryStatus = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

    if (inquiry.owner.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    inquiry.status = req.body.status || 'Read';
    await inquiry.save();

    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Send reply to inquiry
// @route   POST /api/inquiries/:id/reply
// @access  Private
exports.replyToInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });

    // Validate participants
    if (inquiry.owner.toString() !== req.user.id && inquiry.renter.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const replyArgs = {
      sender: req.user.id,
      message: req.body.message
    };

    inquiry.replies.push(replyArgs);

    // Auto update status if owner replies
    if (req.user.id === inquiry.owner.toString()) {
      inquiry.status = 'Responded';
    } else {
      inquiry.status = 'Pending';
    }

    await inquiry.save();

    res.status(200).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
