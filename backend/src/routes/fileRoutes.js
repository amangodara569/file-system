const express = require('express');
const fileController = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/auth');
const { checkFileAccess, checkFileWrite } = require('../middleware/permissions');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + Math.random().toString(36).substr(2, 9) + path.extname(file.originalname));
  }
});

// File filter to accept all common file types
const fileFilter = (req, file, cb) => {
  // Accept all file types - encryption handles security
  cb(null, true);
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// All routes require authentication
router.use(authMiddleware);

// Multer error handler middleware
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 500MB limit' });
      }
      if (err.code === 'LIMIT_PART_COUNT') {
        return res.status(400).json({ message: 'Too many parts' });
      }
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    }
    next();
  });
}, fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/:fileId', checkFileAccess, fileController.getFileDetails);
router.get('/:fileId/download', checkFileAccess, fileController.downloadFile);
router.delete('/:fileId', checkFileWrite, fileController.deleteFile);

// Share operations
router.post('/:fileId/share', checkFileWrite, fileController.shareFile);
router.delete('/:fileId/revoke/:userId', checkFileWrite, fileController.revokeAccess);

module.exports = router;
