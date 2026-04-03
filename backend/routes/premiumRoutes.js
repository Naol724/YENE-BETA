const express = require('express');
const {
  initiatePremiumPayment,
  mpesaStkCallback,
  checkLimit,
  getTransactions,
} = require('../controllers/premiumController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public — Safaricom server calls this (no JWT)
router.post('/mpesa/callback', mpesaStkCallback);

router.use(protect);

router.post('/upgrade', authorize('OWNER'), initiatePremiumPayment);
router.get('/check-limit', authorize('OWNER'), checkLimit);
router.get('/transactions', getTransactions);

module.exports = router;
