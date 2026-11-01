import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../lib/motion';
import {
  Shield, Users, Briefcase, BookOpen, Plus, Trash2, Search,
  RefreshCw, Building2, GraduationCap,
  Sparkles, ToggleLeft, ToggleRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Admin = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Overview Data
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalRecruiters: 0,
    totalCollegeAdmins: 0,
    totalAdmins: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalCourses: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);

  // Users Tab State
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    companyName: '',
    collegeName: ''
  });

  // Jobs Tab State
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: '',
    companyName: '',
    companyWebsite: '',
    locationCity: 'Bangalore',
    type: 'full-time',
    mode: 'hybrid',
    description: '',
    requiredSkills: 'JavaScript, React, Node.js',
    salaryMin: 500000,
    salaryMax: 1000000
  });

  // Courses Tab State
  const [courses, setCourses] = useState([]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseData, setNewCourseData] = useState({
    title: '',
    description: '',
    category: 'Web Development',
    provider: 'SkillForge Academy',
    level: 'beginner',
    duration: 20
  });

  // Fetch overview data
  const fetchOverview = useCallback(async () => {
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.success) {
        setStats(res.data.data.stats || {});
        setRecentUsers(res.data.data.recentUsers || []);
      }
    } catch (err) {
      console.error('Fetch overview error:', err);
    }
  }, []);

  // Fetch users
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

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get('/admin/jobs');
      if (res.data?.success) {
        setJobs(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch jobs error:', err);
    }
  }, []);

  // Fetch courses
  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get('/admin/courses');
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch courses error:', err);
    }
  }, []);

  // Load all initial data
  const loadData = useCallback(async () => {
    await Promise.all([
      fetchOverview(),
      fetchUsers(),
      fetchJobs(),
      fetchCourses()
    ]);
  }, [fetchOverview, fetchUsers, fetchJobs, fetchCourses]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success('Admin data synchronized');
  };

  // User Actions
  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      if (res.data?.success) {
        toast.success(`User role changed to ${newRole}`);
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data?.success) {
        toast.success('User deleted successfully');
        fetchUsers();
        fetchOverview();
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
        setShowCreateUserModal(false);
        setNewUserData({ name: '', email: '', password: '', role: 'student', companyName: '', collegeName: '' });
        fetchUsers();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create user');
    }
  };

  // Job Actions
  const handleToggleJobStatus = async (jobId) => {
    try {
      const res = await api.put(`/admin/jobs/${jobId}/status`);
      if (res.data?.success) {
        toast.success(`Job marked as ${res.data.data.status}`);
        fetchJobs();
        fetchOverview();
      }
    } catch (err) {
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      const res = await api.delete(`/admin/jobs/${jobId}`);
      if (res.data?.success) {
        toast.success('Job deleted successfully');
        fetchJobs();
        fetchOverview();
      }
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/jobs', newJobData);
      if (res.data?.success) {
        toast.success('Job posted successfully to platform');
        setShowCreateJobModal(false);
        setNewJobData({
          title: '', companyName: '', companyWebsite: '', locationCity: 'Bangalore',
          type: 'full-time', mode: 'hybrid', description: '', requiredSkills: 'JavaScript, React, Node.js',
          salaryMin: 500000, salaryMax: 1000000
        });
        fetchJobs();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    }
  };

  // Course Actions
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/courses', newCourseData);
      if (res.data?.success) {
        toast.success('Course created successfully');
        setShowCreateCourseModal(false);
        setNewCourseData({
          title: '', description: '', category: 'Web Development',
          provider: 'SkillForge Academy', level: 'beginner', duration: 20
        });
        fetchCourses();
        fetchOverview();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      const res = await api.delete(`/admin/courses/${courseId}`);
      if (res.data?.success) {
        toast.success('Course deleted');
        fetchCourses();
        fetchOverview();
      }
    } catch (err) {
      toast.error('Failed to delete course');
    }
  };

  const filteredJobs = jobs.filter(j =>
    !jobSearch ||
    (j.title && j.title.toLowerCase().includes(jobSearch.toLowerCase())) ||
    (j.company?.name && j.company.name.toLowerCase().includes(jobSearch.toLowerCase()))
  );

  return (
    <div className="page-responsive-container" style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #2E073F 0%, #4c1d95 100%)',
        borderRadius: '20px',
        padding: '2rem',
        color: 'white',
        marginBottom: '2rem',
        boxShadow: '0 10px 25px -5px rgba(46, 7, 63, 0.3)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Shield size={16} color="#fbbf24" /> Platform Control Center
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
            Administrator Module
          </h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem', maxWidth: '600px' }}>
            Manage platform users, job opportunities, course catalog, and institutional stakeholders across SkillForge.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'white',
              color: '#2E073F',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            Sync Platform
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '2rem',
        overflowX: 'auto',
        paddingBottom: '0.25rem'
      }}>
        {[
          { id: 'overview', label: 'Platform Overview', icon: Sparkles },
          { id: 'users', label: `Users (${stats.totalUsers || 0})`, icon: Users },
          { id: 'jobs', label: `Jobs (${stats.totalJobs || 0})`, icon: Briefcase },
          { id: 'courses', label: `Courses (${stats.totalCourses || 0})`, icon: BookOpen }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.5rem',
                background: isActive ? 'white' : 'transparent',
                border: 'none',
                borderBottom: isActive ? '3px solid #2E073F' : '3px solid transparent',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#2E073F' : '#64748b',
                cursor: 'pointer',
                borderRadius: '8px 8px 0 0',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Key Metric Cards */}
          <div className="responsive-grid-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Total Users</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E073F' }}>
                  <Users size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '0.78rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 500 }}>
                {stats.totalStudents} Students • {stats.totalRecruiters} Recruiters
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Active Jobs</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                  <Briefcase size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b' }}>{stats.activeJobs}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                Out of {stats.totalJobs} total listings
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Institutions</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <GraduationCap size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b' }}>{stats.totalCollegeAdmins}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                College placement cells active
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Learning Catalog</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <BookOpen size={20} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#1e293b' }}>{stats.totalCourses}</div>
              <div style={{ fontSize: '0.78rem', color: '#059669', marginTop: '0.35rem', fontWeight: 500 }}>
                Active curriculum courses
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Platform Activity */}
          <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Quick Actions Card */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                Quick Administrative Actions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#2E073F',
                    fontSize: '0.88rem'
                  }}
                >
                  <Plus size={16} /> Add New User
                </button>
                <button
                  onClick={() => setShowCreateJobModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#2563eb',
                    fontSize: '0.88rem'
                  }}
                >
                  <Plus size={16} /> Post Job as Admin
                </button>
                <button
                  onClick={() => setShowCreateCourseModal(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1rem',
                    background: '#f8fafc',
                    border: '1.5px dashed #cbd5e1',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    color: '#059669',
                    fontSize: '0.88rem'
                  }}
                >
                  <Plus size={16} /> Add Catalog Course
                </button>
              </div>
            </div>

            {/* Platform Role Distribution */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
                Stakeholder Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { label: 'Students', count: stats.totalStudents, color: '#2E073F', icon: GraduationCap },
                  { label: 'Recruiters / Corporate', count: stats.totalRecruiters, color: '#2563eb', icon: Building2 },
                  { label: 'College Placement Admins', count: stats.totalCollegeAdmins, color: '#d97706', icon: Shield },
                  { label: 'System Administrators', count: stats.totalAdmins, color: '#dc2626', icon: Shield }
                ].map((item, idx) => {
                  const pct = stats.totalUsers > 0 ? Math.round((item.count / stats.totalUsers) * 100) : 0;
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem', fontWeight: 600 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <item.icon size={14} color={item.color} /> {item.label}
                        </span>
                        <span>{item.count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '6px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recently Registered Users */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Recent User Registrations
              </h3>
              <button
                onClick={() => setActiveTab('users')}
                style={{ background: 'none', border: 'none', color: '#2E073F', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}
              >
                View All Users →
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1.5px solid #f1f5f9', color: '#64748b' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>User</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>Registered</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{u.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.6rem',
                          borderRadius: '50px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background:
                            u.role === 'admin' ? '#fee2e2' :
                            u.role === 'recruiter' ? '#dbeafe' :
                            u.role === 'college_admin' ? '#fef3c7' : '#ede9fe',
                          color:
                            u.role === 'admin' ? '#b91c1c' :
                            u.role === 'recruiter' ? '#1d4ed8' :
                            u.role === 'college_admin' ? '#b45309' : '#2E073F'
                        }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', color: '#64748b' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>
                        <button
                          onClick={() => { setActiveTab('users'); setUserSearch(u.email); }}
                          style={{ background: '#f1f5f9', border: 'none', padding: '0.4rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
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
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none'
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
                <option value="recruiter">Recruiters</option>
                <option value="college_admin">College Admins</option>
                <option value="admin">Administrators</option>
              </select>
            </div>

            <button
              onClick={() => setShowCreateUserModal(true)}
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

          {/* User Table */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Name & Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                  <th style={{ padding: '0.75rem' }}>Affiliation / Org</th>
                  <th style={{ padding: '0.75rem' }}>Joined</th>
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
                          padding: '0.3rem 0.6rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          background:
                            u.role === 'admin' ? '#fee2e2' :
                            u.role === 'recruiter' ? '#dbeafe' :
                            u.role === 'college_admin' ? '#fef3c7' : '#ede9fe',
                          color:
                            u.role === 'admin' ? '#b91c1c' :
                            u.role === 'recruiter' ? '#1d4ed8' :
                            u.role === 'college_admin' ? '#b45309' : '#2E073F'
                        }}
                      >
                        <option value="student">Student</option>
                        <option value="recruiter">Recruiter</option>
                        <option value="college_admin">College Admin</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                    <td style={{ padding: '0.75rem', color: '#475569', fontSize: '0.82rem' }}>
                      {u.role === 'recruiter' ? (u.company?.name || 'Recruiter') :
                       u.role === 'college_admin' ? (u.college?.name || 'Institution') :
                       (u.education?.[0]?.institution || 'Individual')}
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
          </div>
        </motion.div>
      )}

      {/* TAB 3: JOBS MANAGEMENT */}
      {activeTab === 'jobs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
              <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search jobs by title or company..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.5rem',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem'
                }}
              />
            </div>

            <button
              onClick={() => setShowCreateJobModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Post Job as Admin
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                  <th style={{ padding: '0.75rem' }}>Job Title</th>
                  <th style={{ padding: '0.75rem' }}>Company</th>
                  <th style={{ padding: '0.75rem' }}>Type & Mode</th>
                  <th style={{ padding: '0.75rem' }}>Applicants</th>
                  <th style={{ padding: '0.75rem' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.map(j => (
                  <tr key={j._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>{j.title}</td>
                    <td style={{ padding: '0.75rem', color: '#475569' }}>{j.company?.name || 'Company'}</td>
                    <td style={{ padding: '0.75rem', color: '#64748b' }}>
                      <span style={{ textTransform: 'capitalize' }}>{j.type}</span> • {j.mode}
                    </td>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{(j.applicants || []).length} applicants</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem',
                        borderRadius: '50px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: j.status === 'active' ? '#d1fae5' : '#f1f5f9',
                        color: j.status === 'active' ? '#065f46' : '#64748b'
                      }}>
                        {j.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleJobStatus(j._id)}
                        title="Toggle Status"
                        style={{
                          background: '#f1f5f9',
                          border: 'none',
                          padding: '0.45rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          marginRight: '0.5rem'
                        }}
                      >
                        {j.status === 'active' ? <ToggleRight size={18} color="#059669" /> : <ToggleLeft size={18} color="#94a3b8" />}
                      </button>
                      <button
                        onClick={() => handleDeleteJob(j._id)}
                        title="Delete Job"
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 4: COURSES MANAGEMENT */}
      {activeTab === 'courses' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            marginBottom: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Curriculum & Skill Courses</h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>Manage educational learning modules</p>
            </div>
            <button
              onClick={() => setShowCreateCourseModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#059669',
                color: 'white',
                border: 'none',
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer'
              }}
            >
              <Plus size={16} /> Add Course
            </button>
          </div>

          <div className="responsive-grid-3" style={{ gap: '1.25rem' }}>
            {courses.map(c => (
              <div key={c._id} style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '0.2rem 0.5rem', borderRadius: '6px' }}>
                      {c.category}
                    </span>
                    <button
                      onClick={() => handleDeleteCourse(c._id)}
                      style={{ background: '#fee2e2', border: 'none', padding: '0.35rem', borderRadius: '6px', color: '#dc2626', cursor: 'pointer' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{c.title}</h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.82rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {c.description}
                  </p>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                  <span>{c.level || 'All Levels'}</span>
                  <span>{c.duration?.totalHours || 20} Hours</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* CREATE USER MODAL */}
      <AnimatePresence>
        {showCreateUserModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Add Platform User</h3>
                <button onClick={() => setShowCreateUserModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
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
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Assigned Role</label>
                  <select value={newUserData.role} onChange={e => setNewUserData({ ...newUserData, role: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                    <option value="student">Student</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="college_admin">College Admin</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                {newUserData.role === 'recruiter' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Company Name</label>
                    <input type="text" value={newUserData.companyName} onChange={e => setNewUserData({ ...newUserData, companyName: e.target.value })} placeholder="TechCorp Solutions" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                )}
                {newUserData.role === 'college_admin' && (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>College / Institute Name</label>
                    <input type="text" value={newUserData.collegeName} onChange={e => setNewUserData({ ...newUserData, collegeName: e.target.value })} placeholder="Apex Institute of Technology" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateUserModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#2E073F', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Save User</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE JOB MODAL */}
      <AnimatePresence>
        {showCreateJobModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Post Job as Admin</h3>
                <button onClick={() => setShowCreateJobModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Job Title</label>
                  <input type="text" required value={newJobData.title} onChange={e => setNewJobData({ ...newJobData, title: e.target.value })} placeholder="Full Stack Developer" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Company</label>
                    <input type="text" required value={newJobData.companyName} onChange={e => setNewJobData({ ...newJobData, companyName: e.target.value })} placeholder="Google / Microsoft" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Location City</label>
                    <input type="text" value={newJobData.locationCity} onChange={e => setNewJobData({ ...newJobData, locationCity: e.target.value })} placeholder="Bangalore" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Employment Type</label>
                    <select value={newJobData.type} onChange={e => setNewJobData({ ...newJobData, type: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                      <option value="full-time">Full Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Work Mode</label>
                    <select value={newJobData.mode} onChange={e => setNewJobData({ ...newJobData, mode: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                      <option value="onsite">Onsite</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Required Skills (comma-separated)</label>
                  <input type="text" value={newJobData.requiredSkills} onChange={e => setNewJobData({ ...newJobData, requiredSkills: e.target.value })} placeholder="React, Node.js, MongoDB" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Job Description</label>
                  <textarea rows={3} required value={newJobData.description} onChange={e => setNewJobData({ ...newJobData, description: e.target.value })} placeholder="Key responsibilities and qualifications..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateJobModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Post Opportunity</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE COURSE MODAL */}
      <AnimatePresence>
        {showCreateCourseModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Add Catalog Course</h3>
                <button onClick={() => setShowCreateCourseModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Course Title</label>
                  <input type="text" required value={newCourseData.title} onChange={e => setNewCourseData({ ...newCourseData, title: e.target.value })} placeholder="Full Stack Web Development" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Category</label>
                  <input type="text" required value={newCourseData.category} onChange={e => setNewCourseData({ ...newCourseData, category: e.target.value })} placeholder="Web Development" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Description</label>
                  <textarea rows={3} required value={newCourseData.description} onChange={e => setNewCourseData({ ...newCourseData, description: e.target.value })} placeholder="Course curriculum overview..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateCourseModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#059669', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Publish Course</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Admin;
