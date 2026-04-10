const jwt = require('jsonwebtoken');
const logger = require('./logger');

const generateToken = (userId, username, role) => {
  return jwt.sign(
    { userId, username, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed', { error: error.message });
    return null;
  }
};

const refreshToken = (userId, username, role) => {
  return generateToken(userId, username, role);
};

module.exports = {
  generateToken,
  verifyToken,
  refreshToken
};
