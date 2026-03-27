const express = require('express');
const router = express.Router();
const { getMe, updateMe, getUserById, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/me/avatar', protect, uploadAvatar);
router.get('/:id', getUserById);

module.exports = router;
