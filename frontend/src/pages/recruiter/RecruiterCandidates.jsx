import React, { useState, useEffect } from 'react';
import {
  Search, Send, GraduationCap, User, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { API_BASE_URL } from '../../utils/api';
import RecruiterHeaderNav from '../../components/recruiter/RecruiterHeaderNav';

const RecruiterCandidates = () => {
  const { token } = useAuthStore();
  const [candidates, setCandidates] = useState([]);
  const [jobsList, setJobsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [minScore, setMinScore] = useState('');

  // Invite Modal
  const [inviteCandidate, setInviteCandidate] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  const fetchCandidates = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      let url = `${API_BASE_URL}/recruiter/candidates`;
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSkill) params.append('skill', selectedSkill);
      if (minScore) params.append('minScore', minScore);

      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setCandidates(json.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate talent pool');
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
        const activeOnly = (json.data || []).filter(j => j.status === 'active');
        setJobsList(activeOnly);
        if (activeOnly.length > 0) {
          setSelectedJobId(activeOnly[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchJobs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, minScore]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCandidates();
  };

  const handleOpenInvite = (candidate) => {
    setInviteCandidate(candidate);
    setInviteMessage(`Hi ${candidate.name}, we reviewed your SkillForge profile and high readiness score and would love for you to apply to our team!`);
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!selectedJobId) {
      toast.error('Please select an active job');
      return;
    }

    setSendingInvite(true);
    try {
      const res = await fetch(`${API_BASE_URL}/recruiter/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          candidateId: inviteCandidate.id || inviteCandidate._id,
          jobId: selectedJobId,
          message: inviteMessage
        })
      });
      const json = await res.json();
      if (json.success) {
        toast.success(json.message);
        setInviteCandidate(null);
      } else {
        toast.error(json.message);
      }
    } catch (err) {
      toast.error('Failed to send interview invitation');
    } finally {
      setSendingInvite(false);
    }
  };

  const popularSkills = ['React', 'JavaScript', 'Python', 'Node.js', 'MongoDB', 'Docker', 'Machine Learning'];

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <RecruiterHeaderNav
        activeKey="talent pool"
        onRefresh={() => fetchCandidates(true)}
        refreshing={refreshing}
      />

      {/* Discovery Header Banner */}
      <div style={{
        background: 'white',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '280px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '0.6rem 0.85rem'
            }}>
              <Search size={16} color="#64748b" />
              <input
                type="text"
                placeholder="Search candidates by student name, college, or skill..."
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

          {/* Readiness Score Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b' }}>Min Score:</span>
            {[
              { label: 'All', val: '' },
              { label: '70%+', val: '70' },
              { label: '80%+', val: '80' },
              { label: '90%+', val: '90' }
            ].map(sc => (
              <button
                key={sc.label}
                onClick={() => setMinScore(sc.val)}
                style={{
                  background: minScore === sc.val ? '#0284c7' : '#f8fafc',
                  color: minScore === sc.val ? 'white' : '#475569',
                  border: minScore === sc.val ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {sc.label}
              </button>
            ))}
          </div>
        </div>

        {/* Skill Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            Skill Filter:
          </span>
          <button
            onClick={() => setSelectedSkill('')}
            style={{
              background: selectedSkill === '' ? '#4f46e5' : '#f1f5f9',
              color: selectedSkill === '' ? 'white' : '#475569',
              border: 'none',
              padding: '0.35rem 0.75rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            All Skills
          </button>
          {popularSkills.map(sk => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(sk === selectedSkill ? '' : sk)}
              style={{
                background: selectedSkill === sk ? '#4f46e5' : '#f1f5f9',
                color: selectedSkill === sk ? 'white' : '#475569',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* Candidates Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b' }}>Scanning student talent directory...</p>
        </div>
      ) : candidates.length === 0 ? (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          padding: '3.5rem 2rem',
          textAlign: 'center'
        }}>
          <User size={44} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
          <h3 style={{ margin: '0 0 0.5rem', color: '#0f172a' }}>No students match your criteria</h3>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
            Try broadening your skill filter or minimum score requirement.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 300px), 1fr))',
          gap: '1.25rem'
        }}>
          {candidates.map((cand) => (
            <div
              key={cand.id || cand._id}
              style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.4rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                {/* Header with avatar & readiness badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 10px rgba(59, 130, 246, 0.25)'
                    }}>
                      {cand.name.charAt(0)}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                        {cand.name}
                      </h4>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {cand.degree} ({cand.graduationYear})
                      </span>
                    </div>
                  </div>

                  <div style={{
                    background: '#ecfdf5',
                    color: '#059669',
                    border: '1px solid #a7f3d0',
                    borderRadius: '10px',
                    padding: '0.35rem 0.65rem',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800 }}>
                      {cand.skillReadinessScore}%
                    </div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>
                      Readiness
                    </div>
                  </div>
                </div>

                {/* College Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', color: '#475569', marginBottom: '0.85rem' }}>
                  <GraduationCap size={15} color="#64748b" />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cand.institution}
                  </span>
                </div>

                {/* Skills tags */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                    Verified Skills
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    {(cand.skills || []).map((sk, sIdx) => (
                      <span
                        key={sIdx}
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          background: '#f1f5f9',
                          color: '#334155',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px'
                        }}
                      >
                        {sk.name || sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleOpenInvite(cand)}
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                  color: 'white',
                  border: 'none',
                  padding: '0.65rem 1rem',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
                  marginTop: '0.5rem'
                }}
              >
                <Send size={14} />
                <span>Invite to Apply</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {inviteCandidate && (
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
            maxWidth: '540px',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                  Send Job Opportunity
                </h3>
                <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#64748b' }}>
                  Inviting <strong>{inviteCandidate.name}</strong> ({inviteCandidate.institution})
                </p>
              </div>
              <button
                onClick={() => setInviteCandidate(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendInvite}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Select Position to Invite For *
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      background: 'white',
                      boxSizing: 'border-box'
                    }}
                  >
                    {jobsList.length === 0 ? (
                      <option value="">No active jobs available</option>
                    ) : (
                      jobsList.map(j => (
                        <option key={j._id} value={j._id}>
                          {j.title} ({j.location?.city || 'Remote'} • {j.type})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.35rem' }}>
                    Personal Note to Candidate
                  </label>
                  <textarea
                    rows={4}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
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

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setInviteCandidate(null)}
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      border: 'none',
                      padding: '0.7rem 1.3rem',
                      borderRadius: '10px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite || jobsList.length === 0}
                    style={{
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: 'white',
                      border: 'none',
                      padding: '0.7rem 1.5rem',
                      borderRadius: '10px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(2, 132, 199, 0.35)'
                    }}
                  >
                    {sendingInvite ? 'Sending...' : 'Send Invitation'}
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

export default RecruiterCandidates;
