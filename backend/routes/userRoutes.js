const express = require('express');
const { updateProfile, uploadAvatar, getUser, getUserListings } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.put('/me', protect, updateProfile);
router.post('/me/avatar', protect, uploadAvatar);
router.get('/:id', getUser);
router.get('/:id/listings', getUserListings);

module.exports = router;
