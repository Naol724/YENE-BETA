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
  getAllInquiries
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/approve', updateUserStatus);
router.patch('/users/:id/reject', updateUserStatus);
router.patch('/users/:id/toggle-premium', toggleUserPremium);

// Properties
router.get('/properties', getAllProperties);
router.patch('/properties/:id/approve', updatePropertyStatus);
router.patch('/properties/:id/reject', updatePropertyStatus);
router.delete('/properties/:id', deleteProperty);

// Transactions
router.get('/transactions', getAllTransactions);

// Inquiries
router.get('/inquiries', getAllInquiries);

module.exports = router;
