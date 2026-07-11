const express = require('express');
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  toggleUserPremium,
  getAllProperties,
  updatePropertyStatus,
  deleteProperty,
  getAllTransactions,
  grantPremiumFromTransaction,
  rejectPremiumTransaction,
  getAllInquiries,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard/stats', getDashboardStats);

router.get('/users', getAllUsers);
router.patch('/users/:id/approve', updateUserStatus);
router.patch('/users/:id/reject', updateUserStatus);
router.patch('/users/:id/toggle-premium', toggleUserPremium);

router.get('/properties', getAllProperties);
router.patch('/properties/:id/approve', updatePropertyStatus);
router.patch('/properties/:id/reject', updatePropertyStatus);
router.delete('/properties/:id', deleteProperty);

router.get('/transactions', getAllTransactions);
router.patch('/transactions/:id/grant-premium', grantPremiumFromTransaction);
router.patch('/transactions/:id/reject-premium', rejectPremiumTransaction);

router.get('/inquiries', getAllInquiries);

module.exports = router;
