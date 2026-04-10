const express = require('express');
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);
router.patch('/users/:userId/disable', adminController.disableUser);
router.patch('/users/:userId/enable', adminController.enableUser);
router.patch('/users/:userId/role', adminController.changeUserRole);

// Logging & Monitoring
router.get('/logs', adminController.getLogs);
router.get('/logs/user/:userId', adminController.getUserLogs);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/dashboard/health', adminController.getSystemHealth);

module.exports = router;
