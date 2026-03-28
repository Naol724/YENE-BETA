const express = require('express');
const {
  getCurrentUser,
  updateProfile,
  uploadAvatar,
  getUser,
  getUserListings,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me', protect, getCurrentUser);
router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, uploadAvatar);
router.get('/:id', getUser);
router.get('/:id/listings', getUserListings);

module.exports = router;
