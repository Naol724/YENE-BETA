const express = require('express');
const router = express.Router();
const { simulatePayment, upgradePremium, checkLimit, getMyTransactions } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

// Premium & payment routes
router.get('/premium/check-limit', protect, authorize('owner', 'broker'), checkLimit);
router.post('/premium/upgrade', protect, authorize('owner', 'broker'), upgradePremium);
router.post('/payment/simulate', protect, simulatePayment);
router.get('/transactions', protect, getMyTransactions);

module.exports = router;
