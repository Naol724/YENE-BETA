const express = require('express');
const { 
  createInquiry, 
  getMyInquiries, 
  getReceivedInquiries, 
  updateInquiryStatus, 
  replyToInquiry 
} = require('../controllers/inquiryController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

router.post('/', authorize('RENTER'), createInquiry);
router.get('/my-inquiries', authorize('RENTER'), getMyInquiries);
router.get('/received', authorize('OWNER'), getReceivedInquiries);

router.patch('/:id', authorize('OWNER'), updateInquiryStatus);
router.post('/:id/reply', replyToInquiry);

module.exports = router;
