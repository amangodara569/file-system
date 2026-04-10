import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { adminAPI } from '../utils/api';
import '../styles/Admin.css';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, healthRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getSystemHealth()
      ]);
      setStats(statsRes.data.stats);
      setHealth(healthRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>🔐 Admin Dashboard</h1>
        <div className="admin-menu">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary">
            📁 My Files
          </button>
          <span>{user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <nav className="admin-nav">
        <button onClick={() => navigate('/admin/users')} className="nav-btn">👥 Users</button>
        <button onClick={() => navigate('/admin/logs')} className="nav-btn">📝 Logs</button>
      </nav>

      <main className="admin-main">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            <section className="stats-section">
              <h2>📊 System Statistics</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats?.totalUsers}</div>
                  <div className="stat-label">Total Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats?.activeUsers}</div>
                  <div className="stat-label">Active Users</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats?.totalFiles}</div>
                  <div className="stat-label">Total Files</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats?.recentLogs}</div>
                  <div className="stat-label">Actions (24h)</div>
                </div>
                <div className="stat-card alert">
                  <div className="stat-number">{stats?.failedAttempts}</div>
                  <div className="stat-label">Failed Attempts (24h)</div>
                </div>
              </div>
            </section>

            <section className="health-section">
              <h2>🩺 System Health</h2>
              <div className="health-info">
                <div className="health-status">
                  <span className="status-badge">Status: {health?.status}</span>
                  <p>Uptime: {health?.uptime?.human}</p>
                </div>
                <div className="memory-info">
                  <h3>Memory Usage</h3>
                  <p>Heap Used: {health?.memory?.heapUsed}</p>
                  <p>Heap Total: {health?.memory?.heapTotal}</p>
                  <p>RSS: {health?.memory?.rss}</p>
                </div>
              </div>
            </section>

            {stats?.mostActiveUsers && stats.mostActiveUsers.length > 0 && (
              <section className="activity-section">
                <h2>🔥 Most Active Users</h2>
                <table className="activity-table">
                  <thead>
                    <tr>
                      <th>Username</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.mostActiveUsers.map((item) => (
                      <tr key={item._id}>
                        <td>{item.user[0]?.username || 'Unknown'}</td>
                        <td>{item.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export const UserManagement = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers({ page, limit: 10 });
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDisableUser = async (userId) => {
    try {
      await adminAPI.disableUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to disable user');
    }
  };

  const handleEnableUser = async (userId) => {
    try {
      await adminAPI.enableUser(userId);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enable user');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminAPI.changeUserRole(userId, newRole);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change role');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>👥 User Management</h1>
        <div className="admin-menu">
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            📊 Dashboard
          </button>
          <span>{user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-main">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <p>Loading users...</p>
        ) : (
          <section>
            <h2>All Users</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className={!u.isActive ? 'disabled' : ''}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`status ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td>
                      <div className="action-buttons">
                        {u.isActive ? (
                          <button
                            onClick={() => handleDisableUser(u._id)}
                            className="btn-danger btn-small"
                          >
                            Disable
                          </button>
                        ) : (
                          <button
                            onClick={() => handleEnableUser(u._id)}
                            className="btn-success btn-small"
                          >
                            Enable
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/user-logs/${u._id}`)}
                          className="btn-secondary btn-small"
                        >
                          Logs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </main>
    </div>
  );
};

export const LogViewer = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchLogs();
  }, [page, filter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getLogs({
        page,
        limit: 20,
        action: filter || undefined
      });
      setLogs(response.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>📝 Activity Logs</h1>
        <div className="admin-menu">
          <button onClick={() => navigate('/admin')} className="btn-secondary">
            📊 Dashboard
          </button>
          <span>{user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <main className="admin-main">
        {error && <div className="error-message">{error}</div>}

        <section>
          <h2>System Logs</h2>
          <div className="filter-section">
            <select
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="UPLOAD_FILE">Upload File</option>
              <option value="DOWNLOAD_FILE">Download File</option>
              <option value="DELETE_FILE">Delete File</option>
              <option value="FILE_ACCESS_DENIED">Access Denied</option>
            </select>
          </div>

          {loading ? (
            <p>Loading logs...</p>
          ) : (
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>Status</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className={log.status === 'failure' ? 'failure' : ''}>
                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                    <td>{log.userId?.username || 'Unknown'}</td>
                    <td>{log.action}</td>
                    <td className="details">{log.details}</td>
                    <td>
                      <span className={`status-badge ${log.status}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.ipAddress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};
