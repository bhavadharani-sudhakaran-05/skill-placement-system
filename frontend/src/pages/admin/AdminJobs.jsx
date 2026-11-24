import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  Plus, Trash2, Search, X, ToggleLeft, ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import AdminHeaderNav from '../../components/admin/AdminHeaderNav';
import api from '../../utils/api';

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [jobSearch, setJobSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
    toast.success('Job postings updated');
  };

  const handleToggleJobStatus = async (jobId) => {
    try {
      const res = await api.put(`/admin/jobs/${jobId}/status`);
      if (res.data?.success) {
        toast.success(`Job marked as ${res.data.data.status}`);
        fetchJobs();
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
        toast.success('Job opportunity posted to platform');
        setShowCreateModal(false);
        setNewJobData({
          title: '', companyName: '', companyWebsite: '', locationCity: 'Bangalore',
          type: 'full-time', mode: 'hybrid', description: '', requiredSkills: 'JavaScript, React, Node.js',
          salaryMin: 500000, salaryMax: 1000000
        });
        fetchJobs();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    }
  };

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = !jobSearch ||
      (j.title && j.title.toLowerCase().includes(jobSearch.toLowerCase())) ||
      (j.company?.name && j.company.name.toLowerCase().includes(jobSearch.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="page-responsive-container" style={{ padding: '1.5rem', minHeight: '100vh', background: '#f8fafc', color: '#1e293b' }}>
      <AdminHeaderNav
        activeKey="jobs"
        onRefresh={handleRefresh}
        refreshing={refreshing}
        subtitle="Job & Placement Portal: Manage platform job postings, applicant tracking, status moderation & corporate drives."
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
                placeholder="Search jobs by title or company..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
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

        {/* Jobs Table */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b' }}>
                <th style={{ padding: '0.75rem' }}>Opportunity Title</th>
                <th style={{ padding: '0.75rem' }}>Company & Location</th>
                <th style={{ padding: '0.75rem' }}>Type & Mode</th>
                <th style={{ padding: '0.75rem' }}>Applicants</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map(j => (
                <tr key={j._id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{j.title}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Posted by {j.postedBy?.name || 'Recruiter'}</div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{j.company?.name || 'Company'}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{j.location?.city || 'India'}</div>
                  </td>
                  <td style={{ padding: '0.75rem', color: '#475569' }}>
                    <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{j.type}</span> • {j.mode}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 700, color: '#0f172a' }}>
                    {(j.applicants || []).length} applicants
                  </td>
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
                      title="Toggle Job Status"
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

          {filteredJobs.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              No jobs found matching criteria.
            </div>
          )}
        </div>
      </motion.div>

      {/* Post Job Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '520px', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>Post Placement Job Opportunity</h3>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
              </div>
              <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Role Title</label>
                  <input type="text" required value={newJobData.title} onChange={e => setNewJobData({ ...newJobData, title: e.target.value })} placeholder="Software Engineer / React Developer" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Hiring Company</label>
                    <input type="text" required value={newJobData.companyName} onChange={e => setNewJobData({ ...newJobData, companyName: e.target.value })} placeholder="Google / TCS / Infosys" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>City Location</label>
                    <input type="text" value={newJobData.locationCity} onChange={e => setNewJobData({ ...newJobData, locationCity: e.target.value })} placeholder="Bangalore / Chennai" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Job Type</label>
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
                  <input type="text" value={newJobData.requiredSkills} onChange={e => setNewJobData({ ...newJobData, requiredSkills: e.target.value })} placeholder="JavaScript, React, Node.js, Python" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Job Description</label>
                  <textarea rows={3} required value={newJobData.description} onChange={e => setNewJobData({ ...newJobData, description: e.target.value })} placeholder="Job responsibilities, requirements, and benefits..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: 'white', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: '#2563eb', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Publish Job</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminJobs;
