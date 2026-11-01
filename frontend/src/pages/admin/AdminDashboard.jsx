import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../../lib/motion';
import {
  Users, Briefcase, BookOpen, GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminHeaderNav from '../../components/admin/AdminHeaderNav';
import api from '../../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalCollegeAdmins: 0,
    totalAdmins: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalCourses: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await api.get('/admin/overview');
      if (res.data?.success) {
        setStats(res.data.data.stats || {});
        setRecentUsers(res.data.data.recentUsers || []);
        setRecentJobs(res.data.data.recentJobs || []);
      }
    } catch (err) {
      console.error('Fetch admin overview error:', err);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverview();
    setRefreshing(false);
    toast.success('Admin dashboard refreshed');
  };

  return (
    <div className="page-responsive-container" style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <AdminHeaderNav
        activeKey="dashboard"
        onRefresh={handleRefresh}
        refreshing={refreshing}
        subtitle="Platform Executive Overview: Real-time user metrics, placement engagement, and operational stats."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {/* KPI Cards */}
        <div className="responsive-grid-4" style={{ gap: '1.25rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Total Platform Users</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E073F' }}>
                <Users size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalUsers}</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.35rem', fontWeight: 600 }}>
              {stats.totalStudents} Students • {stats.totalCollegeAdmins} Institutional Cells
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Active Placement Jobs</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E073F' }}>
                <Briefcase size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.activeJobs}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Out of {stats.totalJobs} total postings
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Connected Colleges</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                <GraduationCap size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalCollegeAdmins}</div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem' }}>
              Placement cells active
            </div>
          </div>

          <div style={{ background: 'white', borderRadius: '16px', padding: '1.35rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Learning Catalog</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                <BookOpen size={20} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{stats.totalCourses}</div>
            <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '0.35rem', fontWeight: 600 }}>
              Curriculum courses live
            </div>
          </div>
        </div>

        {/* Quick Launchpad & Distribution Grid */}
        <div className="responsive-grid-2" style={{ gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Quick Module Navigation */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
              Admin Module Pages
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              <button
                onClick={() => navigate('/admin/users')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #ede9fe',
                  background: '#faf5ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 700, color: '#2E073F', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  User Management →
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Manage {stats.totalUsers} accounts, roles & access
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/jobs')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #ede9fe',
                  background: '#faf5ff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 700, color: '#2E073F', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  Jobs & Placements →
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  {stats.totalJobs} job listings & applications
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/colleges')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #fef3c7',
                  background: '#fffbeb',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 700, color: '#b45309', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  Colleges & Cells →
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Institutional performance & cells
                </div>
              </button>

              <button
                onClick={() => navigate('/admin/settings')}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ fontWeight: 700, color: '#334155', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                  System Diagnostics →
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Health checks, AI status & seed data
                </div>
              </button>
            </div>
          </div>

          {/* Stakeholder Breakdown */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#0f172a' }}>
              System Stakeholder Distribution
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {[
                { label: 'Students', count: stats.totalStudents, color: '#2E073F' },
                { label: 'College Placement Officers', count: stats.totalCollegeAdmins, color: '#d97706' },
                { label: 'System Administrators', count: stats.totalAdmins, color: '#dc2626' }
              ].map((item, idx) => {
                const pct = stats.totalUsers > 0 ? Math.round((item.count / stats.totalUsers) * 100) : 0;
                return (
                  <div key={idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem', fontWeight: 600 }}>
                      <span style={{ color: '#334155' }}>{item.label}</span>
                      <span>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: item.color, borderRadius: '4px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Platform Registrations & Jobs */}
        <div className="responsive-grid-2" style={{ gap: '1.5rem' }}>
          {/* Recent Registrations */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Recent User Registrations
              </h3>
              <Link to="/admin/users" style={{ color: '#2E073F', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                All Users →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentUsers.slice(0, 5).map(u => (
                <div key={u._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: '#f8fafc', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{u.name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.55rem',
                    borderRadius: '50px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background:
                      u.role === 'admin' ? '#fee2e2' :
                      u.role === 'college_admin' ? '#fef3c7' : '#ede9fe',
                    color:
                      u.role === 'admin' ? '#b91c1c' :
                      u.role === 'college_admin' ? '#b45309' : '#2E073F'
                  }}>
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Jobs Posted */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>
                Recent Job Postings
              </h3>
              <Link to="/admin/jobs" style={{ color: '#2E073F', textDecoration: 'none', fontWeight: 600, fontSize: '0.82rem' }}>
                All Jobs →
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentJobs.slice(0, 5).map(j => (
                <div key={j._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.65rem', background: '#f8fafc', borderRadius: '10px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#1e293b' }}>{j.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{j.company} • {j.type}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      padding: '0.2rem 0.55rem',
                      borderRadius: '50px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      background: j.status === 'active' ? '#d1fae5' : '#f1f5f9',
                      color: j.status === 'active' ? '#065f46' : '#64748b'
                    }}>
                      {j.status}
                    </span>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      {j.applicantsCount} applicants
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
