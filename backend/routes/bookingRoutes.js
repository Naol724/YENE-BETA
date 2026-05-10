const express = require('express');
const {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  addBookingNote,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public and protected routes
router.post('/', protect, authorize('RENTER'), createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.post('/:id/notes', protect, addBookingNote);

// Admin only
router.get('/', protect, authorize('ADMIN'), getAllBookings);

module.exports = router;
