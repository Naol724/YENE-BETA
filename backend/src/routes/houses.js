const express = require('express');
const router = express.Router();
const {
    getHouses, getHouse, createHouse, updateHouse, deleteHouse,
    getMyListings, searchHouses
} = require('../controllers/houseController');
const { protect, authorize, requireApproved } = require('../middleware/auth');

router.get('/search', searchHouses);
router.get('/my-listings', protect, authorize('owner', 'broker'), getMyListings);
router.get('/', getHouses);
router.get('/:id', getHouse);
router.post('/', protect, authorize('owner', 'broker'), requireApproved, createHouse);
router.put('/:id', protect, updateHouse);
router.delete('/:id', protect, deleteHouse);

module.exports = router;
