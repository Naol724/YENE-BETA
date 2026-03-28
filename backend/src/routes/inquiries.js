const express = require('express');
const router = express.Router();
const { createInquiry, getMyInquiries, getReceivedInquiries, updateInquiry, replyToInquiry } = require('../controllers/inquiryController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, createInquiry);
router.get('/my-inquiries', protect, getMyInquiries);
router.get('/received', protect, authorize('owner', 'broker'), getReceivedInquiries);
router.patch('/:id', protect, updateInquiry);
router.post('/:id/reply', protect, replyToInquiry);

module.exports = router;
