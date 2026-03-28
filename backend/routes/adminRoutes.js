const express = require('express');
const { 
  getStats, 
  getUsers, 
  getPendingApprovals, 
  approveUser, 
  suspendUser, 
  deleteUser, 
  getAllHouses,
  getAllTransactions
} = require('../controllers/adminController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All Admin routes require authentication and Admin token
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/stats', getStats);
router.get('/users/pending', getPendingApprovals);
router.get('/users', getUsers);
router.put('/users/:id/approve', approveUser);
router.put('/users/:id/suspend', suspendUser);
router.delete('/users/:id', deleteUser);
router.get('/houses', getAllHouses);
router.get('/transactions', getAllTransactions);

module.exports = router;
