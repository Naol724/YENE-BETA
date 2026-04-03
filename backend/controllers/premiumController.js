const User = require('../models/User');
const House = require('../models/House');
const Transaction = require('../models/Transaction');
const crypto = require('crypto');
const mpesa = require('../services/mpesaService');

const PREMIUM_AMOUNT = Number(process.env.PREMIUM_AMOUNT) || 500;
const PREMIUM_DAYS = Number(process.env.PREMIUM_DAYS) || 30;

// @desc    Simulated payment (dev when M-Pesa env not set)
async function runSimulatedUpgrade(req, res) {
  const { phoneNumber, amount } = req.body;

  if (!phoneNumber || amount == null) {
    return res.status(400).json({ success: false, message: 'Please provide phone number and amount' });
  }

  const referenceId = crypto.randomBytes(8).toString('hex').toUpperCase();

  const transaction = await Transaction.create({
    user: req.user.id,
    amount,
    phoneNumber,
    referenceId,
    status: 'Completed',
    paymentMethod: 'Simulated',
  });

  const user = await User.findById(req.user.id);
  user.isPremium = true;
  user.premiumExpiresAt = new Date(Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000);
  await user.save();

  return res.status(200).json({
    success: true,
    mode: 'simulated',
    message: 'Payment simulated and account upgraded successfully.',
    data: transaction,
  });
}

// @desc    Start premium payment — real STK when configured, else simulation
// @route   POST /api/premium/upgrade
// @access  Private (Owner)
exports.initiatePremiumPayment = async (req, res) => {
  try {
    if (!mpesa.isMpesaConfigured()) {
      return runSimulatedUpgrade(req, res);
    }

    const phoneInput = req.body.phoneNumber;
    const amount = req.body.amount != null ? Number(req.body.amount) : PREMIUM_AMOUNT;

    if (!phoneInput) {
      return res.status(400).json({ success: false, message: 'Please provide phone number' });
    }
    if (Number.isNaN(amount) || amount < 1) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const referenceId = crypto.randomBytes(8).toString('hex').toUpperCase();
    const merchantRequestId = `YeneBet-${referenceId}-${crypto.randomUUID()}`;

    const transaction = await Transaction.create({
      user: req.user.id,
      amount,
      phoneNumber: mpesa.normalizePhone(phoneInput),
      referenceId,
      status: 'Pending',
      merchantRequestId,
      paymentMethod: 'M-Pesa',
    });

    let stk;
    try {
      stk = await mpesa.stkPush({
        amount,
        phoneNumber: phoneInput,
        merchantRequestId,
        accountReference: referenceId,
        transactionDesc: 'Premium',
      });
    } catch (err) {
      transaction.status = 'Failed';
      transaction.mpesaResultDesc = err.message;
      await transaction.save();
      return res.status(502).json({
        success: false,
        message: err.message || 'M-Pesa STK request failed',
      });
    }

    const ok =
      stk.responseCode === 0 ||
      stk.responseCode === '0' ||
      String(stk.responseCode || '').toLowerCase() === 'success';

    if (!ok) {
      transaction.status = 'Failed';
      transaction.mpesaResultDesc = stk.customerMessage || String(stk.responseCode);
      await transaction.save();
      return res.status(400).json({
        success: false,
        message: stk.customerMessage || 'M-Pesa did not accept the STK request',
        data: { responseCode: stk.responseCode },
      });
    }

    if (stk.merchantRequestId) transaction.merchantRequestId = stk.merchantRequestId;
    if (stk.checkoutRequestId) transaction.checkoutRequestId = stk.checkoutRequestId;
    await transaction.save();

    return res.status(200).json({
      success: true,
      mode: 'mpesa',
      message:
        stk.customerMessage ||
        'Request sent. Approve the payment on your phone. Premium activates when M-Pesa confirms.',
      data: {
        referenceId: transaction.referenceId,
        merchantRequestId: transaction.merchantRequestId,
        checkoutRequestId: transaction.checkoutRequestId,
        status: transaction.status,
        amount: transaction.amount,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc M-Pesa STK callback (server-to-server). Must match MPESA_CALLBACK_URL.
 * @route POST /api/premium/mpesa/callback
 */
exports.mpesaStkCallback = async (req, res) => {
  try {
    const body = req.body;
    const stk = body.Body?.stkCallback || body.stkCallback || body;
    const merchantRequestId = stk.MerchantRequestID || stk.merchantRequestId;
    const resultCode = stk.ResultCode ?? stk.resultCode;
    const resultDesc = stk.ResultDesc || stk.resultDesc || '';

    if (!merchantRequestId) {
      console.warn('[M-Pesa callback] missing MerchantRequestID', JSON.stringify(body).slice(0, 500));
    } else {
      const tx = await Transaction.findOne({ merchantRequestId });
      if (tx && tx.status === 'Pending') {
        const ok = resultCode === 0 || resultCode === '0';
        if (ok) {
          tx.status = 'Completed';
          tx.mpesaResultDesc = resultDesc || 'Completed';
          await tx.save();
          const user = await User.findById(tx.user);
          if (user) {
            user.isPremium = true;
            user.premiumExpiresAt = new Date(Date.now() + PREMIUM_DAYS * 24 * 60 * 60 * 1000);
            await user.save();
          }
        } else {
          tx.status = 'Failed';
          tx.mpesaResultDesc = resultDesc || String(resultCode);
          await tx.save();
        }
      }
    }
  } catch (e) {
    console.error('[M-Pesa callback]', e);
  }

  res.status(200).json({ ResultCode: 0, ResultDesc: 'Callback received' });
};

// @desc    Check limit
// @route   GET /api/premium/check-limit
// @access  Private (Owner)
exports.checkLimit = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const houseCount = await House.countDocuments({ owner: user._id });

    const isPremium = user.isPremium && user.premiumExpiresAt > new Date();
    const canAddListing = isPremium || houseCount < 1;
    const freeListingsRemaining = isPremium ? null : Math.max(0, 1 - houseCount);

    res.status(200).json({
      success: true,
      data: {
        isPremium,
        houseCount,
        limit: isPremium ? 'unlimited' : 1,
        canAddListing,
        premiumExpiresAt: user.premiumExpiresAt || null,
        freeListingsRemaining,
      },
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
