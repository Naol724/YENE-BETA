const express = require('express');
const { 
  getHouses, 
  getHouse, 
  createHouse, 
  updateHouse, 
  deleteHouse, 
  incrementView,
  getMyListings 
} = require('../controllers/houseController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/my-listings', protect, authorize('OWNER', 'ADMIN'), getMyListings);
router.post('/:id/view', incrementView);

router.route('/')
  .get(getHouses)
  .post(protect, authorize('OWNER', 'ADMIN'), createHouse);

router.route('/:id')
  .get(getHouse)
  .put(protect, authorize('OWNER', 'ADMIN'), updateHouse)
  .delete(protect, authorize('OWNER', 'ADMIN'), deleteHouse);

module.exports = router;
