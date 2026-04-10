import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data)
};

// Files API
export const filesAPI = {
  upload: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getFiles: () => api.get('/files'),
  getFileDetails: (fileId) => api.get(`/files/${fileId}`),
  downloadFile: (fileId) => api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),
  shareFile: (fileId, data) => api.post(`/files/${fileId}/share`, data),
  revokeAccess: (fileId, userId) => api.delete(`/files/${fileId}/revoke/${userId}`)
};

// Admin API
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (userId) => api.get(`/admin/users/${userId}`),
  disableUser: (userId) => api.patch(`/admin/users/${userId}/disable`),
  enableUser: (userId) => api.patch(`/admin/users/${userId}/enable`),
  changeUserRole: (userId, role) => api.patch(`/admin/users/${userId}/role`, { role }),
  getLogs: (params) => api.get('/admin/logs', { params }),
  getUserLogs: (userId, params) => api.get(`/admin/logs/user/${userId}`, { params }),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getSystemHealth: () => api.get('/admin/dashboard/health')
};

export default api;
