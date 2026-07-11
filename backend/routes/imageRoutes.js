const express = require('express');
const {
  uploadPropertyImages,
  uploadPropertyImage,
  deletePropertyImage,
  getPropertyImage
} = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiters');

const router = express.Router();

// Serve a single uploaded file (public) — must be before auth middleware
router.get('/properties/:filename', getPropertyImage);

// Protected routes for image management
router.post(
  '/property-images',
  protect,
  authorize('OWNER', 'ADMIN'),
  uploadLimiter,
  uploadPropertyImages
);

router.post(
  '/property-image',
  protect,
  authorize('OWNER', 'ADMIN'),
  uploadLimiter,
  uploadPropertyImage
);

router.delete(
  '/property-image/:filename',
  protect,
  authorize('OWNER', 'ADMIN'),
  deletePropertyImage
);

module.exports = router;
