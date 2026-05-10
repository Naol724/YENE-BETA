const express = require('express');
const {
  uploadPropertyImages,
  uploadPropertyImage,
  deletePropertyImage,
  getPropertyImage
} = require('../controllers/imageController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protected routes for image management
router.use(protect);
router.use(authorize('OWNER', 'ADMIN'));

// Upload multiple property images
router.post('/property-images', uploadPropertyImages);

// Upload single property image
router.post('/property-image', uploadPropertyImage);

// Delete property image
router.delete('/property-image/:filename', deletePropertyImage);

// Public route for serving images (no auth required)
router.get('/properties/:filename', getPropertyImage);

module.exports = router;
