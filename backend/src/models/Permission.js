const mongoose = require('mongoose');

const PermissionSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true
    },
    grantedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    grantedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permissions: {
      canRead: {
        type: Boolean,
        default: true
      },
      canWrite: {
        type: Boolean,
        default: false
      },
      canDelete: {
        type: Boolean,
        default: false
      },
      canShare: {
        type: Boolean,
        default: false
      }
    },
    expiresAt: {
      type: Date,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Permission', PermissionSchema);
