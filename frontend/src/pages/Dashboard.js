import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { filesAPI } from '../utils/api';
import '../styles/Dashboard.css';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState({ ownFiles: [], sharedFiles: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await filesAPI.getFiles();
      setFiles(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    try {
      setUploading(true);
      setError(''); // Clear previous errors
      const file = e.target.files[0];
      if (!file) return;

      // Validate file size (500MB limit)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('File size exceeds 500MB limit');
        setUploading(false);
        return;
      }

      console.log('Uploading file:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', file.name);

      const response = await filesAPI.upload(formData);
      console.log('Upload successful:', response.data);
      
      await fetchFiles();
      e.target.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const response = await filesAPI.downloadFile(fileId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentChild.removeChild(link);
    } catch (err) {
      setError(err.response?.data?.message || 'Download failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🔐 Secure File System</h1>
          <div className="user-menu">
            <span>Welcome, {user?.username}!</span>
            {user?.role === 'admin' && (
              <button 
                className="btn-admin"
                onClick={() => navigate('/admin')}
              >
                📊 Admin Panel
              </button>
            )}
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="upload-section">
          <h2>📤 Upload New File</h2>
          <div className="upload-box">
            <input
              type="file"
              id="fileInput"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />
            <button
              className="btn-primary btn-large"
              onClick={() => document.getElementById('fileInput').click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : '+ Choose File to Upload'}
            </button>
            <p className="info-text">Files are encrypted automatically</p>
          </div>
        </section>

        {error && <div className="error-message">{error}</div>}

        <section className="files-section">
          <h2>📁 My Files ({files.ownFiles.length})</h2>
          {loading ? (
            <p>Loading files...</p>
          ) : files.ownFiles.length === 0 ? (
            <p className="no-files">No files uploaded yet</p>
          ) : (
            <div className="files-grid">
              {files.ownFiles.map((file) => (
                <div key={file._id} className="file-card">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <h3>{file.originalName}</h3>
                    <p>{(file.fileSize / 1024).toFixed(2)} KB</p>
                    <small>{new Date(file.uploadedAt).toLocaleDateString()}</small>
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn-small"
                      onClick={() => handleDownload(file._id, file.originalName)}
                    >
                      ⬇️
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => navigate(`/file/${file._id}`)}
                    >
                      👁️
                    </button>
                    <button
                      className="btn-small"
                      onClick={() => navigate(`/share/${file._id}`)}
                    >
                      🔗
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {files.sharedFiles.length > 0 && (
          <section className="files-section">
            <h2>📌 Shared with Me ({files.sharedFiles.length})</h2>
            <div className="files-grid">
              {files.sharedFiles.map((file) => (
                <div key={file._id} className="file-card shared">
                  <div className="file-icon">📄</div>
                  <div className="file-info">
                    <h3>{file.originalName}</h3>
                    <p>{(file.fileSize / 1024).toFixed(2)} KB</p>
                    <small>by {file.owner.username}</small>
                  </div>
                  <div className="file-actions">
                    <button
                      className="btn-small"
                      onClick={() => handleDownload(file._id, file.originalName)}
                    >
                      ⬇️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
