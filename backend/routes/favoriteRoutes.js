const express = require('express');
const { getFavorites, addFavorite, removeFavorite } = require('../controllers/favoriteController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('RENTER'));

router.route('/')
  .get(getFavorites);

router.route('/:houseId')
  .post(addFavorite)
  .delete(removeFavorite);

module.exports = router;
