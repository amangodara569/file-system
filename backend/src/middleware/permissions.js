const File = require('../models/File');
const Permission = require('../models/Permission');
const Log = require('../models/Log');
const logger = require('../utils/logger');

const checkFileAccess = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.userId;

    const file = await File.findById(fileId);
    if (!file) {
      logger.warn('File not found', { fileId, userId });
      return res.status(404).json({ message: 'File not found' });
    }

    // Check if user is owner
    if (file.owner.toString() === userId) {
      req.file = file;
      return next();
    }

    // Check if user has permission
    const permission = await Permission.findOne({
      file: fileId,
      grantedTo: userId,
      $or: [
        { 'permissions.canRead': true },
        { 'permissions.canWrite': true }
      ]
    });

    if (!permission) {
      await Log.create({
        userId,
        action: 'FILE_ACCESS_DENIED',
        fileId,
        status: 'failure',
        ipAddress: req.ip
      });

      logger.warn('File access denied', { fileId, userId });
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check expiration
    if (permission.expiresAt && permission.expiresAt < new Date()) {
      logger.warn('Permission expired', { fileId, userId });
      return res.status(403).json({ message: 'Permission expired' });
    }

    req.file = file;
    req.permission = permission;
    next();
  } catch (error) {
    logger.error('File access check error', { error: error.message });
    res.status(500).json({ message: 'Access check error' });
  }
};

const checkFileWrite = async (req, res, next) => {
  try {
    const { fileId } = req.params;
    const userId = req.user.userId;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Only owner can write
    if (file.owner.toString() !== userId) {
      const permission = await Permission.findOne({
        file: fileId,
        grantedTo: userId,
        'permissions.canWrite': true
      });

      if (!permission || (permission.expiresAt && permission.expiresAt < new Date())) {
        logger.warn('Write permission denied', { fileId, userId });
        return res.status(403).json({ message: 'Write permission denied' });
      }
    }

    req.file = file;
    next();
  } catch (error) {
    logger.error('Write permission check error', { error: error.message });
    res.status(500).json({ message: 'Permission check error' });
  }
};

module.exports = {
  checkFileAccess,
  checkFileWrite
};
