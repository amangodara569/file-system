# Secure File System

A comprehensive file management system with encryption, authentication, access control, and admin dashboard.

## 🚀 Features

### 🔐 Security
- **JWT Authentication**: Secure token-based authentication
- **Password Encryption**: Bcrypt hashing for passwords
- **File Encryption**: AES-256-CBC encryption for all uploaded files
- **Access Control**: Fine-grained permission system
- **Audit Logging**: Complete activity logging system

### 👤 User Management
- User registration and login
- Profile management
- Password change functionality
- Role-based access (User/Admin)

### 📁 File Management
- Secure file upload with automatic encryption
- File download with decryption
- File sharing with time-limited permissions
- Access revocation
- File descriptions and metadata

### 🔗 Permissions & Sharing
- Share files with specific users
- Granular permissions (read, write, delete, share)
- Time-limited permissions (expiring access)
- Permission revocation anytime

### 📊 Admin Dashboard
- User management interface
- System statistics and analytics
- Activity logs and audit trail
- System health monitoring
- Failed access attempt tracking
- Most active users report

### 📝 Comprehensive Logging
- Login/Logout tracking
- File operations logging
- Permission changes logging
- Access denial logging
- IP address tracking
- User agent information
- Automatic log cleanup (30-day retention)

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** for database
- **JWT** for authentication
- **Bcryptjs** for password hashing
- **Winston** for logging
- **Multer** for file uploads
- **AES-256-CBC** for encryption

### Frontend
- **React 18** with React Router
- **Axios** for API calls
- **CSS3** for styling
- **Context API** for state management

## 📋 Prerequisites

- Node.js (v14+)
- MongoDB (running locally or Atlas)
- npm or yarn

## 🚀 Installation & Setup

### Backend Setup

```bash
cd backend
npm install

# Configure .env file
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

**Environment Variables (.env):**
```
MONGODB_URI=mongodb://localhost:27017/secure-file-system
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
ENCRYPTION_KEY=your_encryption_key_must_be_32_chars
ENCRYPTION_IV=your_iv_must_be_16_chars
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
```

## 🏃 Running the Application

### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

### Start Frontend Development Server
```bash
cd frontend
npm start
# Application opens at http://localhost:3000
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/change-password` - Change password

### Files
- `POST /api/files/upload` - Upload file
- `GET /api/files` - Get all files
- `GET /api/files/:fileId` - Get file details
- `GET /api/files/:fileId/download` - Download file
- `DELETE /api/files/:fileId` - Delete file
- `POST /api/files/:fileId/share` - Share file
- `DELETE /api/files/:fileId/revoke/:userId` - Revoke access

### Admin
- `GET /api/admin/users` - List all users
- `GET /api/admin/users/:userId` - Get user details
- `PATCH /api/admin/users/:userId/disable` - Disable user
- `PATCH /api/admin/users/:userId/enable` - Enable user
- `PATCH /api/admin/users/:userId/role` - Change user role
- `GET /api/admin/logs` - Get system logs
- `GET /api/admin/logs/user/:userId` - Get user logs
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/dashboard/health` - Get system health

## 🔒 Security Features

### Password Security
- Passwords hashed with bcryptjs (salt rounds: 10)
- Minimum 6 characters required
- Raw passwords never stored

### File Encryption
- AES-256-CBC encryption algorithm
- 32-byte encryption key
- 16-byte initialization vector
- Encrypted files stored with .enc extension
- Automatic decryption on download

### Access Control
- Role-based authorization (User/Admin)
- JWT token validation
- Middleware-based permission checking
- File-level access permissions
- User status verification (active/inactive)

### Audit Trail
- All actions logged with timestamp
- User identification
- IP address tracking
- User agent logging
- Success/failure status
- 30-day log retention

## 📊 Database Schema

### User Collection
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  role: String (user/admin),
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date
}
```

### File Collection
```javascript
{
  filename: String,
  originalName: String,
  owner: ObjectId (User),
  fileSize: Number,
  mimeType: String,
  encryptedPath: String,
  isEncrypted: Boolean,
  sharedWith: [{
    user: ObjectId,
    permissions: [String]
  }],
  uploadedAt: Date
}
```

### Permission Collection
```javascript
{
  file: ObjectId,
  grantedBy: ObjectId,
  grantedTo: ObjectId,
  permissions: {
    canRead: Boolean,
    canWrite: Boolean,
    canDelete: Boolean,
    canShare: Boolean
  },
  expiresAt: Date
}
```

### Log Collection
```javascript
{
  userId: ObjectId,
  action: String,
  fileId: ObjectId,
  details: String,
  ipAddress: String,
  status: String (success/failure),
  createdAt: Date
}
```

## 🎨 User Interface

### Authentication Pages
- Responsive login page with email/password
- Registration page with password confirmation
- Remember me functionality
- Form validation

### Dashboard
- File upload dropzone
- Own files gallery
- Shared files section
- Quick download/view/share buttons
- File details and metadata

### Admin Panel
- System statistics dashboard
- User management interface
- Real-time logging viewer
- System health monitoring
- Activity filters

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👨‍💻 Author

Aman Godara

## 📞 Support

For support, email support@securefilesystem.com or create an issue in the repository.

## 🐛 Error Handling

The system includes comprehensive error handling:
- Validation errors with specific messages
- Authentication failures logged
- File operation errors with recovery suggestions
- Database connection errors with retry logic
- Encryption/decryption failure handling

## 🔐 Best Practices Implemented

- Passwords never logged or exposed in responses
- Tokens validated on every protected route
- File access checked at multiple levels
- CORS configured for security
- Input validation on all endpoints
- SQL injection prevention (using MongoDB with parameterized queries)
- CSRF protection ready
- XSS prevention with React
- Rate limiting recommended for production
- HTTPS enforced in production environment

---

**Built with ❤️ for secure file management**
