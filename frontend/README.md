# Secure File System - Frontend

React-based frontend for the Secure File System application.

## Features

- User authentication (login/register)
- File management dashboard
- File upload with encryption
- File sharing interface
- Admin panel with system statistics
- User management interface
- Activity logs viewer
- Responsive design

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the frontend directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Running the Application

```bash
# Development mode
npm start

# Build for production
npm run build
```

The application will open at `http://localhost:3000`

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/      # Reusable components
│   ├── pages/           # Page components
│   ├── styles/          # CSS files
│   ├── utils/           # Utility functions
│   ├── App.js           # Main app component
│   └── index.js         # Entry point
└── package.json
```

## Pages

### Authentication
- **Login** (`/login`) - User login
- **Register** (`/register`) - User registration

### User Dashboard
- **Dashboard** (`/dashboard`) - Main file management interface
- File upload
- Own files gallery
- Shared files section
- File operations (download, share, delete)

### Admin Panel
- **Admin Dashboard** (`/admin`) - System statistics and overview
- **User Management** (`/admin/users`) - User list and control
- **Activity Logs** (`/admin/logs`) - System activity logs
- System health monitoring

## Authentication Flow

1. User registers or logs in via auth pages
2. Server returns JWT token
3. Token stored in localStorage
4. Token sent in Authorization header for API requests
5. Token automatically refreshed if needed
6. Redirect to login if token invalid or expired

## Features

### File Management
- Upload files (auto-encrypted on server)
- View file list with metadata
- Download files (auto-decrypted)
- Delete files (owner only)
- Share files with other users
- Set permissions (read, write, delete, share)
- Set expiration dates for shared access
- Revoke access anytime

### User Management (Admin)
- View all users
- Disable/enable user accounts
- Change user roles
- View user activity logs
- Monitor system statistics
- Check system health

### Security
- Secure token storage
- Automatic logout on token expiration
- Protected routes with authentication
- Permission-based access control
- Activity logging on frontend

## Components & Utilities

### Pages
- `Auth.js` - Login and Register pages
- `Dashboard.js` - Main dashboard
- `Admin.js` - Admin pages (Dashboard, Users, Logs)

### Utilities
- `api.js` - Axios API client with interceptors
- `AuthContext.js` - Authentication context and hooks

### Styling
- `index.css` - Global styles
- `Auth.css` - Authentication pages styles
- `Dashboard.css` - Dashboard styles
- `Admin.css` - Admin panel styles
- `App.css` - App styles

## Key Features Used

### React Features
- Functional components with hooks
- Context API for state management
- React Router for navigation
- Axios for API calls

### Responsive Design
- Mobile-first approach
- Flexbox and Grid layouts
- Media queries for responsiveness

### Error Handling
- Try-catch blocks
- User-friendly error messages
- API error interceptors
- Form validation

## Development

### Adding New Pages
1. Create new component in `src/pages/`
2. Add route in `App.js`
3. Create styles in `src/styles/`

### Adding New API Calls
1. Add method to appropriate API object in `utils/api.js`
2. Use in components via `useAuth()` or import API directly

### Authentication Flow
- Use `useAuth()` hook to access auth context
- Check `isAuthenticated` and `isAdmin` flags
- Redirect unauthorized users to login

## Building for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## Environment

- Node.js 14+
- npm or yarn
- Modern browser with ES6 support

## License

MIT

## Support

For issues or questions, please refer to the main README.md in the root directory.
