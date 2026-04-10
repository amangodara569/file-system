const User = require('../models/User');
const File = require('../models/File');
const Log = require('../models/Log');
const logger = require('../utils/logger');

// User Management
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, isActive } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-password');

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    logger.error('Get users error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const filesCount = await File.countDocuments({ owner: userId });
    const logsCount = await Log.countDocuments({ userId });

    res.json({
      user,
      stats: {
        filesCount,
        logsCount,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    logger.error('Get user details error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve user details' });
  }
};

exports.disableUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await Log.create({
      userId: req.user.userId,
      action: 'DELETE_USER',
      details: `Disabled user ${user.username}`,
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('User disabled', { adminId: req.user.userId, userId });

    res.json({ message: 'User disabled successfully', user });
  } catch (error) {
    logger.error('Disable user error', { error: error.message });
    res.status(500).json({ message: 'Failed to disable user' });
  }
};

exports.enableUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('User enabled', { adminId: req.user.userId, userId });

    res.json({ message: 'User enabled successfully', user });
  } catch (error) {
    logger.error('Enable user error', { error: error.message });
    res.status(500).json({ message: 'Failed to enable user' });
  }
};

exports.changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    logger.info('User role changed', { adminId: req.user.userId, userId, newRole: role });

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    logger.error('Change user role error', { error: error.message });
    res.status(500).json({ message: 'Failed to change user role' });
  }
};

// Logging & Monitoring
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId, status } = req.query;
    const filter = {};

    if (action) filter.action = action;
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    const logs = await Log.find(filter)
      .populate('userId', 'username email')
      .populate('fileId', 'originalName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Log.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    logger.error('Get logs error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve logs' });
  }
};

exports.getUserLogs = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const logs = await Log.find({ userId })
      .populate('userId', 'username email')
      .populate('fileId', 'originalName')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Log.countDocuments({ userId });

    res.json({
      logs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page
      }
    });
  } catch (error) {
    logger.error('Get user logs error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve user logs' });
  }
};

// Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalLogs = await Log.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Get logs from last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = await Log.countDocuments({ createdAt: { $gte: last24Hours } });

    // Get failed access attempts
    const failedAttempts = await Log.countDocuments({
      status: 'failure',
      createdAt: { $gte: last24Hours }
    });

    // Most active users
    const mostActiveUsers = await Log.aggregate([
      { $match: { createdAt: { $gte: last24Hours } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } }
    ]);

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalFiles,
        totalLogs,
        recentLogs,
        failedAttempts,
        mostActiveUsers
      }
    });
  } catch (error) {
    logger.error('Get dashboard stats error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve dashboard stats' });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const uptimeSeconds = process.uptime();
    const memoryUsage = process.memoryUsage();

    res.json({
      status: 'healthy',
      uptime: {
        seconds: uptimeSeconds,
        human: formatUptime(uptimeSeconds)
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB'
      },
      timestamp: new Date()
    });
  } catch (error) {
    logger.error('Get system health error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve system health' });
  }
};

function formatUptime(seconds) {
  const days = Math.floor(seconds / (24 * 3600));
  const hours = Math.floor((seconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  return `${days}d ${hours}h ${minutes}m`;
}
