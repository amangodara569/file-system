const { verifyToken } = require('../utils/auth');
const logger = require('../utils/logger');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      logger.warn('No token provided', { ip: req.ip });
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      logger.warn('Invalid token', { ip: req.ip });
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { error: error.message });
    res.status(500).json({ message: 'Authentication error' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    logger.warn('Unauthorized admin access attempt', { userId: req.user?.userId, ip: req.ip });
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const optionalAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    logger.error('Optional auth middleware error', { error: error.message });
    next();
  }
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  optionalAuthMiddleware
};
