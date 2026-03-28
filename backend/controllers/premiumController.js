const User = require('../models/User');
const House = require('../models/House');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');

// @desc    Simulate M-Pesa Payment & Upgrade
// @route   POST /api/premium/upgrade
// @access  Private (Owner)
exports.simulatePaymentAndUpgrade = async (req, res) => {
  try {
    const { phoneNumber, amount } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({ success: false, message: 'Please provide phone number and amount' });
    }

    const referenceId = crypto.randomBytes(8).toString('hex').toUpperCase();

    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      phoneNumber,
      referenceId,
      status: 'Completed'
    });

    const user = await User.findById(req.user.id);
    user.isPremium = true;
    user.premiumExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Payment simplified and account upgraded successfully.',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check limit
// @route   GET /api/premium/check-limit
// @access  Private (Owner)
exports.checkLimit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const houseCount = await House.countDocuments({ owner: user._id });

    // Premium user = unlimited. Free user = 1
    const isPremium = user.isPremium && user.premiumExpiresAt > Date.now();
    const canAddListing = isPremium || houseCount < 1;

    res.status(200).json({
      success: true,
      data: {
        isPremium,
        houseCount,
        limit: isPremium ? 'unlimited' : 1,
        canAddListing
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's transactions
// @route   GET /api/premium/transactions
// @access  Private
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
