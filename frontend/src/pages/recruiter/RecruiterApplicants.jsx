import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, Search, X, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { API_BASE_URL } from '../../utils/api';
import RecruiterHeaderNav from '../../components/recruiter/RecruiterHeaderNav';

const RecruiterApplicants = () => {
  const location = useLocation();
  const { token } = useAuthStore();

  const [applicants, setApplicants] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [selectedJob, setSelectedJob] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  // Active review modal
  const [activeApplicant, setActiveApplicant] = useState(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchApplicants = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      let url = `${API_BASE_URL}/recruiter/applicants`;
      const params = new URLSearchParams();
      if (selectedJob && selectedJob !== 'all') params.append('jobId', selectedJob);
      if (selectedStatus && selectedStatus !== 'all') params.append('status', selectedStatus);
      if (search) params.append('search', search);

      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setApplicants(json.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate applications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/recruiter/jobs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setJobsList(json.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchJobs();
    const queryParams = new URLSearchParams(location.search);
    const jId = queryParams.get('jobId');
    if (jId) setSelectedJob(jId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  useEffect(() => {
    fetchApplicants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplicants();
  };

  const handleOpenReview = (applicant) => {
    setActiveApplicant(applicant);
    setFeedbackNote(applicant.feedback || '');
  };

  const handleUpdateStatus = async (newStatus) => {
    if (!activeApplicant) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/recruiter/applicants/${activeApplicant.jobId}/${activeApplicant._id}/status`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ status: newStatus, feedback: feedbackNote })
        }
      );
      const json = await res.json();
      if (json.success) {
        toast.success(`Candidate marked as ${newStatus}`);
        setApplicants(applicants.map(a => a._id === activeApplicant._id ? { ...a, status: newStatus, feedback: feedbackNote } : a));
        setActiveApplicant(null);
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'shortlisted':
        return { text: 'Shortlisted', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'interview':
        return { text: 'Interviewing', bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
      case 'hired':
        return { text: 'Offer / Hired', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'rejected':
        return { text: 'Archived', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      default:
        return { text: 'Pending Review', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <RecruiterHeaderNav
        activeKey="applicant pipeline"
        onRefresh={() => fetchApplicants(true)}
        refreshing={refreshing}
      />

      {/* Filter and Search Bar */}
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
        {/* Search */}
        <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem'
          }}>
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search candidate by name, university, or skill..."
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
        </form>

        {/* Dropdowns */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Job select */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: 'white',
              fontSize: '0.85rem',
              color: '#334155'
            }}
          >
            <option value="all">All Job Postings</option>
            {jobsList.map(j => (
              <option key={j._id} value={j._id}>{j.title}</option>
            ))}
          </select>

          {/* Status buttons */}
          {['all', 'pending', 'shortlisted', 'interview', 'hired', 'rejected'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              style={{
                background: selectedStatus === st ? '#4f46e5' : '#f8fafc',
                color: selectedStatus === st ? 'white' : '#475569',
                border: selectedStatus === st ? '1px solid #4f46e5' : '1px solid #e2e8f0',
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                cursor: 'pointer'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>Loading applicant pipeline...</p>
        </div>
      ) : applicants.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '3.5rem 2rem',
          textAlign: 'center'
        }}>
          <Users size={44} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No candidate applications found</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            {selectedStatus !== 'all' || selectedJob !== 'all' || search
              ? 'Try resetting your status or job filter.'
              : 'As students apply for your published jobs, their applications and AI match scores will show up here.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {applicants.map((app) => {
            const badge = getStatusBadge(app.status);
            return (
              <div
                key={app._id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  padding: '1.25rem 1.5rem',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem'
                }}
              >
                <div style={{ minWidth: '280px', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                      {app.student.name}
                    </h3>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px'
                    }}>
                      ⚡ {app.matchScore}% Match
                    </span>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 600,
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.border}`,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px'
                    }}>
                      {badge.text}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#64748b', fontSize: '0.84rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: '#334155' }}>Applied for: {app.jobTitle}</span>
                    <span>•</span>
                    <span>{app.student.institution}</span>
                    <span>•</span>
                    <span>{app.student.degree} ({app.student.year})</span>
                    <span>•</span>
                    <span>ATS Readiness: {app.student.readinessScore}%</span>
                  </div>

                  {/* Skills badges */}
                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                    {(app.student.skills || []).slice(0, 5).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.72rem',
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontWeight: 500
                        }}
                      >
                        {sk}
                      </span>
                    ))}
                    {(app.student.skills || []).length > 5 && (
                      <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center' }}>
                        +{app.student.skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Quick Action Button */}
                <div>
                  <button
                    onClick={() => handleOpenReview(app)}
                    style={{
                      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.65rem 1.25rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      boxShadow: '0 4px 10px rgba(79, 70, 229, 0.25)'
                    }}
                  >
                    <span>Evaluate Candidate</span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Candidate Evaluation Modal */}
      {activeApplicant && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
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
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                    {activeApplicant.student.name}
                  </h2>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '20px'
                  }}>
                    {activeApplicant.matchScore}% Job Match
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Application for <strong>{activeApplicant.jobTitle}</strong>
                </div>
              </div>

              <button
                onClick={() => setActiveApplicant(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Candidate Details Grid */}
            <div style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.25rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '0.75rem',
              fontSize: '0.85rem'
            }}>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Email Address</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{activeApplicant.student.email}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>University / College</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{activeApplicant.student.institution}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>Degree & Graduation</span>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{activeApplicant.student.degree} ({activeApplicant.student.year})</span>
              </div>
              <div>
                <span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem', fontWeight: 600 }}>ATS / Readiness Score</span>
                <span style={{ fontWeight: 700, color: '#059669' }}>{activeApplicant.student.readinessScore}% Verified</span>
              </div>
            </div>

            {/* Skills & Match Breakdown */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.92rem', fontWeight: 700, color: '#334155' }}>
                Candidate Technical Skills
              </h4>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(activeApplicant.student.skills || []).map((sk, sIdx) => (
                  <span
                    key={sIdx}
                    style={{
                      fontSize: '0.78rem',
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '0.2rem 0.65rem',
                      borderRadius: '6px',
                      fontWeight: 600
                    }}
                  >
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter Feedback / Notes */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                Recruiter Notes & Feedback
              </label>
              <textarea
                rows={3}
                placeholder="Add evaluation comments, interview feedback, or screening observations..."
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
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

            {/* Status Update Actions */}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.65rem' }}>
                Update Application Pipeline Stage:
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('shortlisted')}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '0.65rem 0.85rem',
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  ✓ Shortlist
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('interview')}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '0.65rem 0.85rem',
                    background: '#e0f2fe',
                    color: '#0284c7',
                    border: '1px solid #bae6fd',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  📅 Interview
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('hired')}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '0.65rem 0.85rem',
                    background: '#f5f3ff',
                    color: '#7c3aed',
                    border: '1px solid #ddd6fe',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  🎉 Offer / Hire
                </button>

                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus('rejected')}
                  style={{
                    flex: 1,
                    minWidth: '130px',
                    padding: '0.65rem 0.85rem',
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  ✕ Reject / Archive
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterApplicants;
