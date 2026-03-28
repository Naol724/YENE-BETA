const express = require('express');
const { 
  simulatePaymentAndUpgrade, 
  checkLimit, 
  getTransactions 
} = require('../controllers/premiumController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/upgrade', authorize('OWNER'), simulatePaymentAndUpgrade);
router.get('/check-limit', authorize('OWNER'), checkLimit);
router.get('/transactions', getTransactions);

module.exports = router;
