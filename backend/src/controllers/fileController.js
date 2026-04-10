const File = require('../models/File');
const Permission = require('../models/Permission');
const Log = require('../models/Log');
const fs = require('fs');
const path = require('path');
const { encryptFile, decryptFile } = require('../utils/encryption');
const logger = require('../utils/logger');

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { description } = req.body;
    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptionIV = process.env.ENCRYPTION_IV;

    // Validate encryption keys exist
    if (!encryptionKey || !encryptionIV) {
      logger.error('Encryption keys not configured', { userId: req.user.userId });
      return res.status(500).json({ message: 'Server encryption not configured' });
    }

    // Create encrypted filename
    const encryptedFilename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.enc`;
    const encryptedPath = path.join(__dirname, '../../uploads', encryptedFilename);

    // Ensure uploads directory exists
    const uploadsDir = path.dirname(encryptedPath);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    logger.info('Starting file encryption', { 
      userId: req.user.userId, 
      filename: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype
    });

    // Encrypt the file
    await encryptFile(req.file.path, encryptedPath, encryptionKey, encryptionIV);

    logger.info('File encrypted successfully', { 
      userId: req.user.userId, 
      filename: req.file.originalname
    });

    // Create file record
    const fileDoc = new File({
      filename: encryptedFilename,
      originalName: req.file.originalname,
      owner: req.user.userId,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      encryptedPath,
      isEncrypted: true,
      description: description || ''
    });

    await fileDoc.save();

    logger.info('File record saved to database', { 
      userId: req.user.userId, 
      fileId: fileDoc._id,
      filename: req.file.originalname
    });

    // Clean up temporary file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    // Create log entry
    await Log.create({
      userId: req.user.userId,
      action: 'UPLOAD_FILE',
      fileId: fileDoc._id,
      details: `Uploaded ${req.file.originalname} (${(req.file.size / 1024).toFixed(2)}KB)`,
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('File uploaded successfully', { userId: req.user.userId, fileId: fileDoc._id, filename: req.file.originalname });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: fileDoc
    });
  } catch (error) {
    logger.error('File upload error', { 
      error: error.message, 
      userId: req.user.userId,
      filename: req.file?.originalname,
      stack: error.stack
    });

    // Clean up temporary file
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        logger.error('Failed to clean up temp file', { error: err.message });
      }
    }

    res.status(500).json({ 
      message: 'File upload failed',
      error: error.message 
    });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Check access (middleware should handle this, but double check)
    if (file.owner.toString() !== req.user.userId) {
      const permission = await Permission.findOne({
        file: fileId,
        grantedTo: req.user.userId,
        'permissions.canRead': true
      });

      if (!permission || (permission.expiresAt && permission.expiresAt < new Date())) {
        await Log.create({
          userId: req.user.userId,
          action: 'FILE_ACCESS_DENIED',
          fileId,
          status: 'failure',
          ipAddress: req.ip
        });
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const encryptionKey = process.env.ENCRYPTION_KEY;
    const encryptionIV = process.env.ENCRYPTION_IV;

    // Decrypt and send file
    const tempPath = path.join(__dirname, `../../temp/${Date.now()}_decrypted`);
    const tempDir = path.join(__dirname, '../../temp');

    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    await decryptFile(file.encryptedPath, tempPath, encryptionKey, encryptionIV);

    // Create log entry
    await Log.create({
      userId: req.user.userId,
      action: 'DOWNLOAD_FILE',
      fileId,
      details: `Downloaded ${file.originalName}`,
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('File downloaded', { userId: req.user.userId, fileId });

    res.download(tempPath, file.originalName, () => {
      // Clean up temp file
      fs.unlinkSync(tempPath);
    });
  } catch (error) {
    logger.error('File download error', { error: error.message });
    res.status(500).json({ message: 'File download failed' });
  }
};

exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only owner can delete file' });
    }

    // Delete encrypted file
    if (fs.existsSync(file.encryptedPath)) {
      fs.unlinkSync(file.encryptedPath);
    }

    // Delete permissions
    await Permission.deleteMany({ file: fileId });

    // Delete file record
    await File.findByIdAndDelete(fileId);

    // Create log entry
    await Log.create({
      userId: req.user.userId,
      action: 'DELETE_FILE',
      fileId,
      details: `Deleted ${file.originalName}`,
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('File deleted', { userId: req.user.userId, fileId });

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    logger.error('File delete error', { error: error.message });
    res.status(500).json({ message: 'File deletion failed' });
  }
};

exports.getFiles = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's own files
    const ownFiles = await File.find({ owner: userId }).populate('owner', 'username email');

    // Get shared files
    const sharedFiles = await File.find({
      'sharedWith.user': userId
    }).populate('owner', 'username email');

    res.json({
      ownFiles,
      sharedFiles
    });
  } catch (error) {
    logger.error('Get files error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve files' });
  }
};

exports.getFileDetails = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId)
      .populate('owner', 'username email')
      .populate('sharedWith.user', 'username email');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    logger.error('Get file details error', { error: error.message });
    res.status(500).json({ message: 'Failed to retrieve file details' });
  }
};

exports.shareFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { userId: sharedWithUserId, permissions: permissionsArray, expiresIn } = req.body;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only owner can share file' });
    }

    // Create or update permission
    let expiresAt = null;
    if (expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    const permission = await Permission.findOneAndUpdate(
      { file: fileId, grantedTo: sharedWithUserId },
      {
        grantedBy: req.user.userId,
        permissions: {
          canRead: permissionsArray.includes('read') || false,
          canWrite: permissionsArray.includes('write') || false,
          canDelete: permissionsArray.includes('delete') || false,
          canShare: permissionsArray.includes('share') || false
        },
        expiresAt
      },
      { upsert: true, new: true }
    );

    // Add to sharedWith array if not already there
    if (!file.sharedWith.find(s => s.user.toString() === sharedWithUserId)) {
      file.sharedWith.push({
        user: sharedWithUserId,
        permissions: permissionsArray
      });
      await file.save();
    }

    // Create log entry
    await Log.create({
      userId: req.user.userId,
      action: 'SHARE_FILE',
      fileId,
      details: `Shared with user ${sharedWithUserId}`,
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('File shared', { userId: req.user.userId, fileId, sharedWithUserId });

    res.json({
      message: 'File shared successfully',
      permission
    });
  } catch (error) {
    logger.error('File share error', { error: error.message });
    res.status(500).json({ message: 'File share failed' });
  }
};

exports.revokeAccess = async (req, res) => {
  try {
    const { fileId, userId: targetUserId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    if (file.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only owner can revoke access' });
    }

    await Permission.deleteOne({ file: fileId, grantedTo: targetUserId });

    file.sharedWith = file.sharedWith.filter(s => s.user.toString() !== targetUserId);
    await file.save();

    await Log.create({
      userId: req.user.userId,
      action: 'CHANGE_PERMISSION',
      fileId,
      details: `Revoked access for user ${targetUserId}`,
      status: 'success',
      ipAddress: req.ip
    });

    logger.info('Access revoked', { userId: req.user.userId, fileId, targetUserId });

    res.json({ message: 'Access revoked successfully' });
  } catch (error) {
    logger.error('Revoke access error', { error: error.message });
    res.status(500).json({ message: 'Failed to revoke access' });
  }
};
