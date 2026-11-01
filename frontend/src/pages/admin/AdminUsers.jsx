import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  Plus, Trash2, Search, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeaderNav from '../../components/admin/AdminHeaderNav';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const AdminUsers = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    companyName: '',
    collegeName: ''
  });

  const fetchUsers = useCallback(async () => {
    try {
      const params = {};
      if (userRoleFilter !== 'all') params.role = userRoleFilter;
      if (userSearch) params.search = userSearch;
      const res = await api.get('/admin/users', { params });
      if (res.data?.success) {
        setUsers(res.data.data.users || []);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
    }
  }, [userRoleFilter, userSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
    toast.success('Users list updated');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        toast.success(`User role changed to ${newRole}`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action is permanent.')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data?.success) {
        toast.success('User deleted successfully');
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/users', newUserData);
      if (res.data?.success) {
        toast.success(`User created with role ${newUserData.role}`);
        setShowCreateModal(false);
        setNewUserData({ name: '', email: '', password: '', role: 'student', companyName: '', collegeName: '' });
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="page-responsive-container" style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <AdminHeaderNav
        activeKey="users"
        onRefresh={handleRefresh}
        refreshing={refreshing}
        subtitle="User Management: Search, filter, promote roles, create and maintain accounts across all stakeholders."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Controls Bar */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{
                padding: '0.65rem 1rem',
                borderRadius: '10px',
                border: '1px solid #cbd5e1',
                background: 'white',
                fontSize: '0.88rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="college_admin">College Admins</option>
              <option value="admin">Administrators</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#2E073F',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            <Plus size={16} /> Create User
          </button>
        </div>

        {/* Users Table */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '0.75rem' }}>Name & Email</th>
                <th style={{ padding: '0.75rem' }}>Current Role</th>
                <th style={{ padding: '0.75rem' }}>Affiliation / Org</th>
                <th style={{ padding: '0.75rem' }}>Registered Date</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      disabled={u._id === user?.id || u._id === user?._id}
                      style={{
                        padding: '0.35rem 0.65rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        background:
                          u.role === 'admin' ? '#fee2e2' :
                          u.role === 'college_admin' ? '#fef3c7' : '#ede9fe',
                        color:
                          u.role === 'admin' ? '#b91c1c' :
                          u.role === 'college_admin' ? '#b45309' : '#2E073F'
                      }}
                    >
                      <option value="student">Student</option>
                      <option value="college_admin">College Admin</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#475569', fontSize: '0.82rem' }}>
                    {u.role === 'college_admin' ? (u.college?.name || 'Institution') :
                     (u.education?.[0]?.institution || 'Individual Student')}
                  </td>
                  <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                    {u._id !== user?.id && u._id !== user?._id && (
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        title="Delete User"
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '0.45rem',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No users found matching current filters.
            </div>
          )}
        </div>
      </motion.div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Add Platform User</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Full Name</label>
                  <input type="text" required value={newUserData.name} onChange={e => setNewUserData({ ...newUserData, name: e.target.value })} placeholder="John Doe" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email Address</label>
                  <input type="email" required value={newUserData.email} onChange={e => setNewUserData({ ...newUserData, email: e.target.value })} placeholder="user@skillforge.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password</label>
                  <input type="password" required value={newUserData.password} onChange={e => setNewUserData({ ...newUserData, password: e.target.value })} placeholder="••••••••" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Role</label>
                  <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="student">Student</option>
                    <option value="college_admin">College Admin</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {newUserData.role === 'college_admin' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>College Name</label>
                    <input type="text" value={newUserData.collegeName} onChange={e => setNewUserData({ ...newUserData, collegeName: e.target.value })} placeholder="Sri Shakthi Institute of Engineering" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#2E073F', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save User</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
