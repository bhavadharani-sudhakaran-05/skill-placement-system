import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase, Users, CheckCircle2, UserCheck, ArrowRight,
  TrendingUp, Sparkles, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { API_BASE_URL } from '../../utils/api';
import RecruiterHeaderNav from '../../components/recruiter/RecruiterHeaderNav';

const RecruiterDashboard = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await fetch(`${API_BASE_URL}/recruiter/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      } else {
        toast.error(json.message || 'Failed to load recruiter data');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network error loading recruiter dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const metrics = data?.metrics || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplicants: 0,
    pendingReview: 0,
    shortlisted: 0,
    interviewing: 0,
    hired: 0
  };

  const statCards = [
    {
      title: 'Active Openings',
      value: metrics.activeJobs,
      sub: `${metrics.totalJobs} total listings`,
      icon: Briefcase,
      color: '#4f46e5',
      bg: '#eef2ff'
    },
    {
      title: 'Total Applicants',
      value: metrics.totalApplicants,
      sub: `${metrics.pendingReview} awaiting review`,
      icon: Users,
      color: '#0284c7',
      bg: '#e0f2fe'
    },
    {
      title: 'In Interview / Shortlist',
      value: (metrics.shortlisted || 0) + (metrics.interviewing || 0),
      sub: 'Top matched talent',
      icon: UserCheck,
      color: '#059669',
      bg: '#ecfdf5'
    },
    {
      title: 'Hired Candidates',
      value: metrics.hired,
      sub: 'Offers accepted',
      icon: CheckCircle2,
      color: '#7c3aed',
      bg: '#f5f3ff'
    }
  ];

  const getStatusBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'shortlisted':
        return { text: 'Shortlisted', bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
      case 'interview':
        return { text: 'Interview', bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
      case 'hired':
        return { text: 'Hired', bg: '#f5f3ff', color: '#7c3aed', border: '#ddd6fe' };
      case 'rejected':
        return { text: 'Archived', bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      default:
        return { text: 'Pending Review', bg: '#fffbeb', color: '#d97706', border: '#fde68a' };
    }
  };

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <RecruiterHeaderNav
        activeKey="dashboard"
        onRefresh={() => fetchDashboard(true)}
        refreshing={refreshing}
        onPostJob={() => navigate('/recruiter/jobs?action=new')}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Loading recruiter intelligence...</p>
        </div>
      ) : (
        <>
          {/* KPI Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
            gap: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    padding: '1.35rem 1.5rem',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    background: card.bg,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={26} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {card.title}
                    </div>
                    <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', margin: '0.2rem 0' }}>
                      {card.value}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      {card.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hiring Funnel Strip */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Candidate Pipeline Funnel
                </h3>
              </div>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Total {metrics.totalApplicants} applications across active requisitions
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              {[
                { stage: 'Applied / In Review', count: metrics.pendingReview, color: '#f59e0b', bg: '#fef3c7' },
                { stage: 'Shortlisted', count: metrics.shortlisted, color: '#10b981', bg: '#d1fae5' },
                { stage: 'Interview Stage', count: metrics.interviewing, color: '#0284c7', bg: '#e0f2fe' },
                { stage: 'Hired & Placed', count: metrics.hired, color: '#8b5cf6', bg: '#ede9fe' }
              ].map((step, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    background: step.bg,
                    borderRadius: '12px',
                    padding: '0.85rem 1rem',
                    textAlign: 'center',
                    border: `1px solid ${step.color}25`
                  }}
                >
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: step.color }}>
                    {step.count}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginTop: '0.15rem' }}>
                    {step.stage}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main 2-Column Split */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '1.5rem' }}>
            
            {/* Left: Recent Applicants Feed */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '1.5rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    Recent Candidate Applications
                  </h3>
                  <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Latest student applicants sorted by submission time
                  </p>
                </div>
                <button
                  onClick={() => navigate('/recruiter/applicants')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  View All <ArrowRight size={14} />
                </button>
              </div>

              {(!data?.recentApplicants || data.recentApplicants.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '2.5rem 0', color: '#94a3b8' }}>
                  <Users size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>No student applicants yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {data.recentApplicants.map((app) => {
                    const badge = getStatusBadge(app.status);
                    return (
                      <div
                        key={app.applicantId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1rem',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #f1f5f9',
                          gap: '0.75rem'
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                              {app.student.name}
                            </span>
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: '#eff6ff',
                              color: '#2563eb',
                              padding: '0.15rem 0.5rem',
                              borderRadius: '20px'
                            }}>
                              {app.matchScore}% Match
                            </span>
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {app.jobTitle} • {app.student.institution}
                          </div>
                          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            {(app.student.topSkills || []).slice(0, 3).map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                style={{
                                  fontSize: '0.7rem',
                                  background: '#e2e8f0',
                                  color: '#334155',
                                  padding: '0.1rem 0.45rem',
                                  borderRadius: '4px'
                                }}
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem' }}>
                          <span style={{
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '50px',
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`
                          }}>
                            {badge.text}
                          </span>
                          <button
                            onClick={() => navigate(`/recruiter/applicants?jobId=${app.jobId}`)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4f46e5',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.2rem'
                            }}
                          >
                            Review <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: Active Postings & Talent Pool Quick Launch */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Active Jobs */}
              <div style={{
                background: 'white',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>
                    My Job Postings
                  </h3>
                  <button
                    onClick={() => navigate('/recruiter/jobs')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    Manage <ArrowRight size={14} />
                  </button>
                </div>

                {(!data?.recentJobs || data.recentJobs.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0', color: '#94a3b8' }}>
                    <Briefcase size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>No job listings created yet.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {data.recentJobs.map((job) => (
                      <div
                        key={job.id}
                        style={{
                          padding: '0.85rem 1rem',
                          background: '#f8fafc',
                          borderRadius: '12px',
                          border: '1px solid #f1f5f9',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#0f172a' }}>
                            {job.title}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.15rem' }}>
                            <span style={{ textTransform: 'capitalize' }}>{job.type}</span> • {job.mode} • {job.location}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            display: 'inline-block',
                            background: '#e0f2fe',
                            color: '#0369a1',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.25rem 0.6rem',
                            borderRadius: '20px',
                            marginBottom: '0.2rem'
                          }}>
                            {job.applicantsCount} Applicants
                          </span>
                          <div style={{ fontSize: '0.72rem', color: job.status === 'active' ? '#16a34a' : '#94a3b8', fontWeight: 600 }}>
                            ● {job.status === 'active' ? 'Active' : 'Closed'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Talent Pool Discovery Card */}
              <div style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                color: 'white',
                boxShadow: '0 4px 15px rgba(15, 23, 42, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Sparkles size={18} color="#38bdf8" />
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Direct Campus Search
                  </span>
                </div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: 800 }}>
                  Search Verified Student Talent
                </h4>
                <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                  Filter candidates by skills (React, Python, Node, AI), ATS readiness scores, and college. Send direct job interview invitations.
                </p>
                <button
                  onClick={() => navigate('/recruiter/candidates')}
                  style={{
                    background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '0.65rem 1.2rem',
                    borderRadius: '10px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  Explore Talent Pool <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RecruiterDashboard;

