# Secure File System - Backend

Node.js backend server for the Secure File System application.

## Features

- JWT-based authentication
- File encryption with AES-256-CBC
- MongoDB for data persistence
- Comprehensive logging with Winston
- Role-based access control
- Admin management APIs

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```
MONGODB_URI=mongodb://localhost:27017/secure-file-system
JWT_SECRET=your_jwt_secret_key_change_this_in_production
PORT=5000
NODE_ENV=development
ENCRYPTION_KEY=your_encryption_key_must_be_32_chars
ENCRYPTION_IV=your_iv_must_be_16_chars
```

## Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Custom middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # Express routes
│   ├── utils/           # Utility functions
│   └── server.js        # Main app file
├── uploads/             # Encrypted files storage
├── logs/                # Application logs
└── package.json
```

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

### File Endpoints

#### Upload File
```
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <binary>
description: string
```

#### Get Files
```
GET /api/files
Authorization: Bearer <token>
```

#### Download File
```
GET /api/files/:fileId/download
Authorization: Bearer <token>
```

### Admin Endpoints

#### Get All Users
```
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <admin_token>
```

#### Get Dashboard Stats
```
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

## Security Features

- Password hashing with bcryptjs
- JWT token validation
- File encryption with AES-256-CBC
- Access control middleware
- Activity logging
- Input validation

## Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **winston**: Logging
- **cors**: CORS middleware

## License

MIT
