const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getFavorites);
router.post('/:houseId', protect, addFavorite);
router.delete('/:houseId', protect, removeFavorite);

module.exports = router;
