const express = require('express');
const router = express.Router();
const {
    getStats, getUsers, getPendingUsers, approveUser, suspendUser, deleteUser,
    getHouses, deleteHouse, flagHouse,
    getTransactions, getAuditLogs, bulkApproveUsers,
    getUserAnalytics, broadcastNotification
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const admin = [protect, authorize('admin')];

router.get('/stats', ...admin, getStats);
router.get('/users', ...admin, getUsers);
router.get('/users/pending', ...admin, getPendingUsers);
router.put('/users/:id/approve', ...admin, approveUser);
router.put('/users/:id/suspend', ...admin, suspendUser);
router.delete('/users/:id', ...admin, deleteUser);
router.post('/users/bulk-approve', ...admin, bulkApproveUsers);

router.get('/houses', ...admin, getHouses);
router.delete('/houses/:id', ...admin, deleteHouse);
router.put('/houses/:id/flag', ...admin, flagHouse);

router.get('/transactions', ...admin, getTransactions);
router.get('/audit-logs', ...admin, getAuditLogs);
router.get('/analytics/users', ...admin, getUserAnalytics);
router.post('/notifications/broadcast', ...admin, broadcastNotification);

module.exports = router;
