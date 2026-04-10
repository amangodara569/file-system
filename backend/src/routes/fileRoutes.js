const express = require('express');
const fileController = require('../controllers/fileController');
const { authMiddleware } = require('../middleware/auth');
const { checkFileAccess, checkFileWrite } = require('../middleware/permissions');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// All routes require authentication
router.use(authMiddleware);

// File operations
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.get('/:fileId', checkFileAccess, fileController.getFileDetails);
router.get('/:fileId/download', checkFileAccess, fileController.downloadFile);
router.delete('/:fileId', checkFileWrite, fileController.deleteFile);

// Share operations
router.post('/:fileId/share', checkFileWrite, fileController.shareFile);
router.delete('/:fileId/revoke/:userId', checkFileWrite, fileController.revokeAccess);

module.exports = router;
