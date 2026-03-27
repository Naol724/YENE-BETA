const Inquiry = require('../models/Inquiry');
const House = require('../models/House');

// POST /api/v1/inquiries
exports.createInquiry = async (req, res, next) => {
    try {
        const { houseId, message, contactPhone } = req.body;
        const house = await House.findById(houseId);
        if (!house || !house.isActive) return res.status(404).json({ success: false, error: { code: 'HOUSE_001', message: 'Listing not found' } });

        const existingCount = await Inquiry.countDocuments({ houseId, userId: req.user._id });
        if (existingCount >= 3) return res.status(429).json({ success: false, error: { message: 'Max 3 inquiries per listing reached' } });

        const inquiry = await Inquiry.create({ houseId, userId: req.user._id, message, contactPhone });
        house.inquiryCount += 1;
        await house.save();

        res.status(201).json({ success: true, data: inquiry });
    } catch (err) { next(err); }
};

// GET /api/v1/inquiries/my-inquiries
exports.getMyInquiries = async (req, res, next) => {
    try {
        const inquiries = await Inquiry.find({ userId: req.user._id })
            .populate('houseId', 'title location price images status listedBy')
            .sort('-createdAt');
        res.json({ success: true, data: inquiries, count: inquiries.length });
    } catch (err) { next(err); }
};

// GET /api/v1/inquiries/received  (owner/broker)
exports.getReceivedInquiries = async (req, res, next) => {
    try {
        const myHouses = await House.find({ listedBy: req.user._id }).select('_id');
        const houseIds = myHouses.map(h => h._id);
        const inquiries = await Inquiry.find({ houseId: { $in: houseIds } })
            .populate('houseId', 'title location price')
            .populate('userId', 'name email phone avatar')
            .sort('-createdAt');
        res.json({ success: true, data: inquiries, count: inquiries.length });
    } catch (err) { next(err); }
};

// PATCH /api/v1/inquiries/:id
exports.updateInquiry = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id).populate('houseId');
        if (!inquiry) return res.status(404).json({ success: false, error: { message: 'Inquiry not found' } });
        if (inquiry.houseId.listedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Not authorized' } });
        }
        inquiry.status = req.body.status || inquiry.status;
        await inquiry.save();
        res.json({ success: true, data: inquiry });
    } catch (err) { next(err); }
};

// POST /api/v1/inquiries/:id/reply
exports.replyToInquiry = async (req, res, next) => {
    try {
        const inquiry = await Inquiry.findById(req.params.id);
        if (!inquiry) return res.status(404).json({ success: false, error: { message: 'Inquiry not found' } });

        inquiry.replies.push({ userId: req.user._id, message: req.body.message });
        inquiry.status = 'responded';
        await inquiry.save();
        res.json({ success: true, data: inquiry });
    } catch (err) { next(err); }
};
