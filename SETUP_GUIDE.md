# Secure File System - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js v14 or higher
- MongoDB (local or Atlas)
- Git
- A code editor (VS Code recommended)

### Repository Clone

```bash
git clone https://github.com/amangodara569/file-system.git
cd file-system
```

## 📦 Installation

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your settings:
# MONGODB_URI - Your MongoDB connection string
# JWT_SECRET - A secure random string for JWT signing
# PORT - Server port (default: 5000)
# ENCRYPTION_KEY - 32-character encryption key
# ENCRYPTION_IV - 16-character initialization vector

# Start the server
npm start
# or for development with auto-reload:
npm run dev
```

**Backend will run on:** http://localhost:5000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start development server
npm start
# Application opens at http://localhost:3000
```

## 🔐 Initial Configuration

### Generate Encryption Keys

For production, generate secure keys:

```bash
# Generate 32-byte encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate 16-byte IV
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Update `.env` file with these values.

### MongoDB Setup

**Option 1: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod

# Connection string: mongodb://localhost:27017/secure-file-system
```

**Option 2: MongoDB Atlas (Cloud)**
```bash
# Create account at https://www.mongodb.com/cloud/atlas
# Create cluster and get connection string
# Update MONGODB_URI in .env
```

### Create Admin User

1. Register a normal user through the UI
2. Connect to MongoDB and update the user:

```javascript
use secure-file-system
db.users.updateOne(
  { username: "your-username" },
  { $set: { role: "admin" } }
)
```

## 🎯 Features Overview

### User Dashboard
1. **Upload Files** - Click "Choose File to Upload"
   - Files are automatically encrypted
   - Supports any file type
2. **My Files** - View all uploaded files
3. **Shared Files** - Access files shared with you
4. **File Operations**
   - ⬇️ Download - Decrypts and downloads
   - 👁️ View - See file details
   - 🔗 Share - Share with other users

### Admin Dashboard (Admin users only)
1. **Dashboard** - System statistics and health
2. **Users** - Manage user accounts
   - Disable/enable users
   - Change user roles
   - View user activity
3. **Logs** - View system activity

## 📋 Default Test Accounts

Create test accounts through registration, or use SQL:

```javascript
// Create test user
db.users.insertOne({
  username: "testuser",
  email: "test@example.com",
  password: "$2a$10$...", // bcrypt hash
  role: "user",
  isActive: true,
  createdAt: new Date()
})
```

## 🔒 Security Checkpoints

Before production deployment:

- [ ] Update JWT_SECRET to a strong random string
- [ ] Generate new ENCRYPTION_KEY and ENCRYPTION_IV
- [ ] Set NODE_ENV to "production"
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Use environment variables for all secrets
- [ ] Set up log rotation
- [ ] Configure firewall rules

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check MongoDB connection
# Verify .env variables
# Check port 5000 is available
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill process using port
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
# Verify REACT_APP_API_URL in frontend/.env
# Check CORS settings in backend
# Clear browser cache and hard refresh (Ctrl+Shift+R)
```

### File Upload Fails
```bash
# Check uploads directory exists: backend/uploads
# Verify encryption keys in .env
# Check disk space available
# Check file size doesn't exceed 50MB limit
```

### Login Issues
```bash
# Verify MongoDB connection
# Check user exists in database
# Verify password is correct
# Check JWT_SECRET matches
```

## 📁 File Structure

```
file-system/
├── backend/
│   ├── src/
│   │   ├── controllers/    # API logic
│   │   ├── middleware/     # Auth & permissions
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers
│   │   └── server.js       # Entry point
│   ├── uploads/            # Encrypted files
│   ├── logs/               # Application logs
│   └── package.json
├── frontend/
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS files
│   │   ├── utils/          # Helpers
│   │   ├── App.js          # Root component
│   │   └── index.js        # Entry point
│   └── package.json
├── .gitignore
└── README.md
```

## 📚 API Usage Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "newuser",
    "email": "user@example.com",
    "password": "securepass123",
    "confirmPassword": "securepass123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### Upload File
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "description=My PDF File"
```

### Get Files
```bash
curl -X GET http://localhost:5000/api/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Share File
```bash
curl -X POST http://localhost:5000/api/files/FILE_ID/share \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "TARGET_USER_ID",
    "permissions": ["read"],
    "expiresIn": 86400
  }'
```

## 🚀 Deployment

### Deploy Backend (Heroku)
```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

### Deploy Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment
# Set REACT_APP_API_URL to production backend URL
```

## 📞 Support

- GitHub Issues: https://github.com/amangodara569/file-system/issues
- Email: support@securefilesystem.com

## 📄 License

MIT License - See LICENSE file

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Happy Coding! 🚀**
