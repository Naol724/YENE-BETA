const Transaction = require('../models/Transaction');
const User = require('../models/User');
const House = require('../models/House');

// GET /api/v1/premium/check-limit
exports.checkLimit = async (req, res, next) => {
    try {
        const count = await House.countDocuments({ listedBy: req.user._id, isActive: true });
        const user = await User.findById(req.user._id);
        res.json({
            success: true,
            data: {
                canAddFree: count === 0,
                usedFree: Math.min(count, 1),
                totalListings: count,
                isPremium: user.isPremium,
                requiresPremium: count >= 1 && !user.isPremium,
                premiumExpiry: user.premiumExpiry,
            }
        });
    } catch (err) { next(err); }
};

// POST /api/v1/payment/simulate
exports.simulatePayment = async (req, res, next) => {
    try {
        const { phoneNumber, amount, type } = req.body;
        if (!phoneNumber || !amount || !type) {
            return res.status(400).json({ success: false, error: { code: 'VALIDATION_001', message: 'phoneNumber, amount and type are required' } });
        }

        // Simulate M-Pesa — always succeeds in MVP
        await new Promise(r => setTimeout(r, 1000)); // simulate delay

        const transaction = await Transaction.create({
            userId: req.user._id,
            amount: Number(amount),
            type,
            status: 'completed',
            paymentMethod: 'mpesa',
            mpesaPhone: phoneNumber,
            receiptNumber: `MPESA${Date.now()}`,
        });

        res.status(201).json({ success: true, data: transaction, message: 'Payment simulated successfully' });
    } catch (err) { next(err); }
};

// POST /api/v1/premium/upgrade
exports.upgradePremium = async (req, res, next) => {
    try {
        const { transactionId } = req.body;
        const transaction = await Transaction.findById(transactionId);
        if (!transaction || transaction.status !== 'completed') {
            return res.status(400).json({ success: false, error: { code: 'PAYMENT_001', message: 'Valid completed transaction required' } });
        }
        if (transaction.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, error: { message: 'Transaction does not belong to you' } });
        }

        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await User.findByIdAndUpdate(req.user._id, { isPremium: true, premiumExpiry: expiry });
        res.json({ success: true, message: 'Premium activated!', data: { premiumExpiry: expiry } });
    } catch (err) { next(err); }
};

// GET /api/v1/transactions
exports.getMyTransactions = async (req, res, next) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        const [txns, total] = await Promise.all([
            Transaction.find({ userId: req.user._id }).sort('-createdAt').skip(skip).limit(Number(limit)),
            Transaction.countDocuments({ userId: req.user._id })
        ]);
        res.json({ success: true, data: txns, pagination: { page: Number(page), limit: Number(limit), total } });
    } catch (err) { next(err); }
};
