const User = require('../models/User');
const Log = require('../models/Log');
const { generateToken } = require('../utils/auth');
const logger = require('../utils/logger');

exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ username, email, password, role: 'user' });
    await user.save();

    logger.info('User registered', { userId: user._id, username });

    const token = generateToken(user._id, user.username, user.role);
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Registration error', { error: error.message });
    res.status(500).json({ message: 'Registration failed' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed - user not found', { email, ip: req.ip });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      logger.warn('Login failed - invalid password', { userId: user._id, ip: req.ip });
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      logger.warn('Login failed - user inactive', { userId: user._id, ip: req.ip });
      return res.status(401).json({ message: 'User account is inactive' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create log entry
    await Log.create({
      userId: user._id,
      action: 'LOGIN',
      status: 'success',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    logger.info('User logged in', { userId: user._id, username: user.username });

    const token = generateToken(user._id, user.username, user.role);
    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.status(500).json({ message: 'Login failed' });
  }
};

exports.logout = async (req, res) => {
  try {
    await Log.create({
      userId: req.user.userId,
      action: 'LOGOUT',
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('User logged out', { userId: req.user.userId });
    res.json({ message: 'Logout successful' });
  } catch (error) {
    logger.error('Logout error', { error: error.message });
    res.status(500).json({ message: 'Logout failed' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: user.toJSON() });
  } catch (error) {
    logger.error('Get profile error', { error: error.message });
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    await Log.create({
      userId: user._id,
      action: 'UPDATE_PROFILE',
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('User profile updated', { userId: user._id });
    res.json({ message: 'Profile updated successfully', user: user.toJSON() });
  } catch (error) {
    logger.error('Update profile error', { error: error.message });
    res.status(500).json({ message: 'Failed to update profile' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    logger.info('User changed password', { userId: user._id });
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error', { error: error.message });
    res.status(500).json({ message: 'Failed to change password' });
  }
};
