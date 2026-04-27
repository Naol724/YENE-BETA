const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getAllListings,
  updateListingStatus,
  getAllInquiries,
  deleteUser,
  deleteListing,
  approveUser,
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

// Dashboard stats
router.get('/stats', getDashboardStats);

// User management
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/approve', approveUser);

// Listing management
router.get('/listings', getAllListings);
router.patch('/listings/:id', updateListingStatus);
router.delete('/listings/:id', deleteListing);

// Inquiry management
router.get('/inquiries', getAllInquiries);

module.exports = router;
