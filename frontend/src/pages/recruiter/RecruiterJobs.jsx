import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Briefcase, Plus, Search, Users, Trash2, Edit3, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { API_BASE_URL } from '../../utils/api';
import RecruiterHeaderNav from '../../components/recruiter/RecruiterHeaderNav';

const RecruiterJobs = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    type: 'full-time',
    mode: 'hybrid',
    city: 'Bengaluru',
    state: 'Karnataka',
    minSalary: '800000',
    maxSalary: '1500000',
    salaryPeriod: 'yearly',
    minExp: '0',
    maxExp: '3',
    description: '',
    requirements: '',
    responsibilities: '',
    skills: ['React', 'JavaScript', 'Node.js']
  });

  const fetchJobs = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/recruiter/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setJobs(json.data || []);
      } else {
        toast.error(json.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading jobs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    if (location.search.includes('action=new')) {
      setShowModal(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setFormData({
      title: '',
      type: 'full-time',
      mode: 'hybrid',
      city: 'Bengaluru',
      state: 'Karnataka',
      minSalary: '800000',
      maxSalary: '1500000',
      salaryPeriod: 'yearly',
      minExp: '0',
      maxExp: '3',
      description: '',
      requirements: '',
      responsibilities: '',
      skills: ['React', 'Node.js']
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title || '',
      type: job.type || 'full-time',
      mode: job.mode || 'hybrid',
      city: job.location?.city || 'Bengaluru',
      state: job.location?.state || 'Karnataka',
      minSalary: job.salary?.min ? String(job.salary.min) : '',
      maxSalary: job.salary?.max ? String(job.salary.max) : '',
      salaryPeriod: job.salary?.period || 'yearly',
      minExp: job.experience?.min !== undefined ? String(job.experience.min) : '0',
      maxExp: job.experience?.max !== undefined ? String(job.experience.max) : '3',
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : (job.responsibilities || ''),
      skills: Array.isArray(job.skills) ? job.skills.map(s => s.name || s) : []
    });
    setShowModal(true);
  };

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
        setFormData({ ...formData, skills: [...formData.skills, skillInput.trim()] });
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please enter title and description');
      return;
    }

    const payload = {
      title: formData.title,
      type: formData.type,
      mode: formData.mode,
      location: {
        city: formData.city,
        state: formData.state,
        country: 'India',
        remote: formData.mode === 'remote'
      },
      salary: {
        min: Number(formData.minSalary) || 0,
        max: Number(formData.maxSalary) || 0,
        currency: 'INR',
        period: formData.salaryPeriod
      },
      experience: {
        min: Number(formData.minExp) || 0,
        max: Number(formData.maxExp) || 3
      },
      skills: formData.skills,
      description: formData.description,
      requirements: formData.requirements.split('\n').filter(Boolean),
      responsibilities: formData.responsibilities.split('\n').filter(Boolean)
    };

    try {
      const url = editingJob
        ? `${API_BASE_URL}/recruiter/jobs/${editingJob._id}`
        : `${API_BASE_URL}/recruiter/jobs`;
      const method = editingJob ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (json.success) {
        toast.success(editingJob ? 'Job updated successfully' : 'Job posted successfully');
        setShowModal(false);
        fetchJobs(true);
      } else {
        toast.error(json.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error saving job');
    }
  };

  const handleToggleStatus = async (job) => {
    const nextStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      const res = await fetch(`${API_BASE_URL}/recruiter/jobs/${job._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus, isActive: nextStatus === 'active' })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(`Job marked as ${nextStatus}`);
        setJobs(jobs.map(j => j._id === job._id ? { ...j, status: nextStatus, isActive: nextStatus === 'active' } : j));
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Failed to change job status');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job posting? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/recruiter/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        toast.success('Job deleted successfully');
        setJobs(jobs.filter(j => j._id !== jobId));
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Failed to delete job');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchSearch = job.title.toLowerCase().includes(search.toLowerCase()) ||
      (job.location?.city && job.location.city.toLowerCase().includes(search.toLowerCase())) ||
      (job.skills && job.skills.some(s => (s.name || s).toLowerCase().includes(search.toLowerCase())));
    const matchStatus = statusFilter === 'all' || job.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <RecruiterHeaderNav
        activeKey="my postings"
        onRefresh={() => fetchJobs(true)}
        refreshing={refreshing}
        onPostJob={handleOpenCreateModal}
      />

      {/* Control Strip */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '260px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            width: '100%',
            maxWidth: '420px'
          }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search postings by role, city, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: '100%',
                fontSize: '0.88rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', 'active', 'closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? '#4f46e5' : '#f8fafc',
                color: statusFilter === st ? 'white' : '#475569',
                border: statusFilter === st ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontSize: '0.82rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {st} ({jobs.filter(j => st === 'all' || j.status === st).length})
            </button>
          ))}

          <button
            onClick={handleOpenCreateModal}
            style={{
              background: '#0284c7',
              color: 'white',
              border: 'none',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              marginLeft: '0.5rem'
            }}
          >
            <Plus size={16} /> New Job
          </button>
        </div>
      </div>

      {/* Jobs Grid / Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>Loading job postings...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '3.5rem 2rem',
          textAlign: 'center'
        }}>
          <Briefcase size={44} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No job listings found</h3>
          <p style={{ margin: '0 0 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
            {search ? 'No openings match your current search criteria.' : 'Create your first job posting to attract qualified student talent.'}
          </p>
          <button
            onClick={handleOpenCreateModal}
            style={{
              background: '#4f46e5',
              color: 'white',
              border: 'none',
              padding: '0.65rem 1.3rem',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Create Job Posting
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredJobs.map((job) => (
            <div
              key={job._id}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.35rem 1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '1.25rem'
              }}
            >
              <div style={{ minWidth: '280px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {job.title}
                  </h3>
                  <span style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px',
                    background: job.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                    color: job.status === 'active' ? '#059669' : '#64748b',
                    border: job.status === 'active' ? '1px solid #a7f3d0' : '1px solid #cbd5e1'
                  }}>
                    ● {job.status === 'active' ? 'Active Requisition' : 'Closed'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontSize: '0.84rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{job.type}</span>
                  <span>•</span>
                  <span style={{ textTransform: 'capitalize' }}>{job.mode}</span>
                  <span>•</span>
                  <span>{job.location?.city || 'Bengaluru'}, {job.location?.state || 'India'}</span>
                  <span>•</span>
                  <span>
                    ₹{(job.salary?.min ? (job.salary.min / 100000).toFixed(1) : '6')}L - ₹{(job.salary?.max ? (job.salary.max / 100000).toFixed(1) : '12')}L / yr
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {(job.skills || []).map((sk, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '0.72rem',
                        background: '#f1f5f9',
                        color: '#334155',
                        padding: '0.15rem 0.55rem',
                        borderRadius: '6px',
                        fontWeight: 600
                      }}
                    >
                      {sk.name || sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons & Applicant Stats */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate(`/recruiter/applicants?jobId=${job._id}`)}
                  style={{
                    background: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}
                >
                  <Users size={15} />
                  <span>{job.applicantsCount || 0} Candidates</span>
                </button>

                <button
                  onClick={() => handleToggleStatus(job)}
                  title={job.status === 'active' ? 'Pause / Close Job' : 'Reactivate Job'}
                  style={{
                    background: '#f8fafc',
                    color: job.status === 'active' ? '#d97706' : '#16a34a',
                    border: '1px solid #cbd5e1',
                    padding: '0.6rem 0.9rem',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  {job.status === 'active' ? 'Close' : 'Activate'}
                </button>

                <button
                  onClick={() => handleOpenEditModal(job)}
                  title="Edit Job Details"
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    padding: '0.6rem',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <Edit3 size={15} />
                </button>

                <button
                  onClick={() => handleDeleteJob(job._id)}
                  title="Delete Job"
                  style={{
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    padding: '0.6rem',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Job Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 60
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                  {editingJob ? 'Edit Job Posting' : 'Post New Job Requisition'}
                </h2>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  {user?.company?.name || 'TechCorp Solutions'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Employment Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    >
                      <option value="full-time">Full-Time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                      <option value="part-time">Part-Time</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Workplace Mode
                    </label>
                    <select
                      value={formData.mode}
                      onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                    >
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Fully Remote</option>
                      <option value="onsite">On-Site / Office</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      City Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bengaluru, Chennai, Remote"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      State / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Karnataka"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '10px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.9rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* Salary & Experience */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Salary Range (₹ INR / Year)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        placeholder="Min (e.g. 600000)"
                        value={formData.minSalary}
                        onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                        style={{
                          width: '50%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Max (e.g. 1200000)"
                        value={formData.maxSalary}
                        onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                        style={{
                          width: '50%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Experience Range (Years)
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="number"
                        placeholder="Min Exp"
                        value={formData.minExp}
                        onChange={(e) => setFormData({ ...formData, minExp: e.target.value })}
                        style={{
                          width: '50%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Max Exp"
                        value={formData.maxExp}
                        onChange={(e) => setFormData({ ...formData, maxExp: e.target.value })}
                        style={{
                          width: '50%',
                          padding: '0.65rem 0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '0.85rem'
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Skills Multi-Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Required Technical Skills
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Type skill & press Add (e.g. React, Python, Docker)"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      style={{
                        background: '#0284c7',
                        color: 'white',
                        border: 'none',
                        padding: '0.65rem 1rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {formData.skills.map((sk) => (
                      <span
                        key={sk}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          padding: '0.25rem 0.65rem',
                          borderRadius: '20px',
                          fontSize: '0.78rem',
                          fontWeight: 600
                        }}
                      >
                        {sk}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#0369a1',
                            cursor: 'pointer',
                            padding: 0,
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Job Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Overview of the position, team goals, and mission..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Requirements (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. B.Tech Computer Science&#10;Proficiency in JavaScript"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                      Responsibilities (1 per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Build reusable UI components&#10;Write unit tests"
                      value={formData.responsibilities}
                      onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.85rem',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      padding: '0.75rem 1.4rem',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.6rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(79, 70, 229, 0.35)'
                    }}
                  >
                    {editingJob ? 'Save Changes' : 'Publish Job'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
