const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'LOGOUT',
        'UPLOAD_FILE',
        'DELETE_FILE',
        'DOWNLOAD_FILE',
        'SHARE_FILE',
        'CHANGE_PERMISSION',
        'CREATE_USER',
        'DELETE_USER',
        'UPDATE_PROFILE',
        'FILE_ACCESS_DENIED'
      ],
      required: true
    },
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      default: null
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: ''
    },
    userAgent: {
      type: String,
      default: ''
    },
    status: {
      type: String,
      enum: ['success', 'failure'],
      default: 'success'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 days TTL
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Log', LogSchema);
