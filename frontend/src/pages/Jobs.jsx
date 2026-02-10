import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, MapPin, Building2, Clock, DollarSign, Users,
  Bookmark, ExternalLink, TrendingUp, Briefcase, ChevronDown, ChevronUp, Star,
  AlertCircle, Loader, Upload, CheckCircle, ListChecks, ShieldCheck, Gift
} from 'lucide-react';
import api from '../utils/api';
import useCourseStore from '../store/courseStore';

// Course ID to skills mapping (matches Courses.jsx tags)
const courseSkillsMap = {
  1: ['DSA', 'Problem Solving', 'Coding'],
  2: ['ML', 'Python', 'TensorFlow', 'Machine Learning'],
  3: ['React', 'JavaScript', 'Frontend'],
  4: ['AWS', 'Cloud', 'DevOps'],
  5: ['Python', 'Data Science', 'Analytics', 'Data Analysis'],
  6: ['MongoDB', 'NoSQL', 'Database'],
  7: ['Node.js', 'Express', 'Backend', 'API'],
  8: ['Docker', 'Kubernetes', 'Containers', 'DevOps'],
  9: ['TensorFlow', 'Deep Learning', 'Neural Networks', 'AI'],
  10: ['CI/CD', 'Jenkins', 'GitHub Actions', 'DevOps'],
  11: ['NLP', 'Transformers', 'BERT', 'GPT', 'AI'],
  12: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'Full Stack'],
  13: ['Python', 'Machine Learning', 'Deep Learning', 'AI', 'Data Science'],
  14: ['Git', 'Docker', 'AWS', 'CI/CD', 'DevOps'],
  15: ['SQL', 'MySQL', 'PostgreSQL', 'Database']
};

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSkills, setUserSkills] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [expandedJob, setExpandedJob] = useState(null);
  const { courseProgress } = useCourseStore();

  // Get skills learned from completed courses
  const getLearnedSkills = () => {
    const learned = new Set();
    Object.entries(courseProgress).forEach(([courseId, data]) => {
      if (data.progress >= 100 || data.status === 'completed') {
        const skills = courseSkillsMap[parseInt(courseId)] || [];
        skills.forEach(s => learned.add(s));
      }
    });
    return Array.from(learned);
  };

  useEffect(() => {
    fetchJobs();
  }, [courseProgress]);

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const learnedSkills = getLearnedSkills();
      const params = learnedSkills.length > 0 ? `?learnedSkills=${encodeURIComponent(JSON.stringify(learnedSkills))}` : '';
      const response = await api.get(`/jobs/matched${params}`);
      if (response.data.success) {
        const rawJobs = response.data.data || [];
        setUserSkills(response.data.userSkills || []);
        setHasResume(response.data.hasResume || false);

        const mappedJobs = rawJobs.map((job, index) => ({
          id: job._id,
          title: job.title,
          company: job.company?.name || 'Unknown',
          companyWebsite: job.company?.website || '',
          location: job.location ? `${job.location.city || ''}${job.location.state ? ', ' + job.location.state : ''}${job.location.country ? ', ' + job.location.country : ''}`.replace(/^, /, '') : 'India',
          type: job.type || 'full-time',
          mode: job.mode || 'hybrid',
          experience: job.experience ? `${job.experience.min || 0}-${job.experience.max || '?'} years` : 'Not specified',
          salary: job.salary ? `₹${(job.salary.min / 100000).toFixed(1)}-${(job.salary.max / 100000).toFixed(1)} LPA` : 'Not disclosed',
          match: job.matchScore || 0,
          matchingSkills: job.matchingSkills || [],
          missingSkills: job.missingSkills || [],
          skills: (job.skills || []).map(s => s.name || s),
          applicants: job.applicants?.length || 0,
          posted: getTimeAgo(job.createdAt),
          featured: (job.matchScore || 0) >= 80,
          description: job.description || '',
          applyUrl: job.company?.website || '#',
          color: getCompanyColor(index),
          remote: job.location?.remote || job.mode === 'remote',
          responsibilities: job.responsibilities || [],
          requirements: job.requirements || [],
          benefits: job.benefits || []
        }));

        setJobs(mappedJobs);
      }
    } catch (err) {
      try {
        const publicResponse = await api.get('/jobs');
        if (publicResponse.data.success) {
          const rawJobs = publicResponse.data.data || [];
          const mappedJobs = rawJobs.map((job, index) => ({
            id: job._id,
            title: job.title,
            company: job.company?.name || 'Unknown',
            companyWebsite: job.company?.website || '',
            location: job.location ? `${job.location.city || ''}${job.location.state ? ', ' + job.location.state : ''}` : 'India',
            type: job.type || 'full-time',
            mode: job.mode || 'hybrid',
            experience: job.experience ? `${job.experience.min || 0}-${job.experience.max || '?'} years` : 'Not specified',
            salary: job.salary ? `₹${(job.salary.min / 100000).toFixed(1)}-${(job.salary.max / 100000).toFixed(1)} LPA` : 'Not disclosed',
            match: 0,
            matchingSkills: [],
            missingSkills: [],
            skills: (job.skills || []).map(s => s.name || s),
            applicants: job.applicants?.length || 0,
            posted: getTimeAgo(job.createdAt),
            featured: false,
            description: job.description || '',
            applyUrl: job.company?.website || '#',
            color: getCompanyColor(index),
            remote: job.location?.remote || job.mode === 'remote',
            responsibilities: job.responsibilities || [],
            requirements: job.requirements || [],
            benefits: job.benefits || []
          }));
          setJobs(mappedJobs);
        }
      } catch (pubErr) {
        setError('Failed to load jobs. Please try again.');
        console.error('Jobs fetch error:', pubErr);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Recently';
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
  };

  const getCompanyColor = (index) => {
    const colors = ['#0052cc', '#007cc3', '#5a287d', '#c4161c', '#0073b1', '#0f4c81', '#0033a0', '#0070ad', '#a100ff', '#dc4b3e'];
    return colors[index % colors.length];
  };

  const filters = ['all', 'best match', 'featured', 'remote', 'recent'];

  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query ||
      job.title.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.skills.some(s => s.toLowerCase().includes(query)) ||
      job.location.toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (selectedFilter === 'featured') return job.match >= 80;
    if (selectedFilter === 'best match') return job.match >= 50;
    if (selectedFilter === 'remote') return job.remote;
    if (selectedFilter === 'recent') {
      return job.posted.includes('day') || job.posted === 'Today';
    }
    return true;
  });

  const sectionStyle = {
    marginTop: '0.65rem',
    padding: '0.65rem 0.75rem',
    background: '#faf8ff',
    borderRadius: '10px',
    border: '1px solid #ede9fe'
  };
  const sectionTitle = {
    fontSize: '0.72rem',
    fontWeight: 700,
    color: '#2E073F',
    marginBottom: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  };
  const listItem = {
    fontSize: '0.72rem',
    color: '#4b5563',
    lineHeight: 1.65,
    paddingLeft: '0.65rem',
    position: 'relative'
  };
  const bulletDot = {
    position: 'absolute',
    left: 0,
    top: '0.45em',
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    background: '#2E073F'
  };

  const styles = {
    container: { padding: '1rem', maxWidth: '900px', margin: '0 auto', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' },
    header: { marginBottom: '1rem' },
    title: { fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #2E073F, #2E073F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' },
    subtitle: { color: '#6b7280', fontSize: '0.8rem' },
    statsRow: { display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#2E073F', fontWeight: 500, fontSize: '0.8rem' },
    searchSection: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
    searchWrapper: { flex: 1, minWidth: '240px', position: 'relative' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#2E073F' },
    searchInput: { width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '10px', border: '1.5px solid #ede9fe', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', background: 'white' },
    filterButton: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #ede9fe', background: 'white', cursor: 'pointer', fontWeight: 500, color: '#2E073F', fontSize: '0.8rem' },
    filtersRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
    filterChip: (active) => ({ padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem', transition: 'all 0.2s', background: active ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : '#f5f3ff', color: active ? 'white' : '#2E073F' }),
    jobsList: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' },
    jobCard: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 12px rgba(139, 92, 246, 0.06)', border: '1px solid #ede9fe', transition: 'all 0.3s' },
    jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' },
    jobTitleRow: { display: 'flex', alignItems: 'flex-start', gap: '0.65rem', flex: 1, minWidth: 0 },
    companyLogo: (color) => ({ width: '40px', height: '40px', borderRadius: '10px', background: `linear-gradient(135deg, ${color || '#2E073F'} 0%, ${color || '#2E073F'}cc 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }),
    jobTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.15rem' },
    companyInfo: { display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#6b7280', fontSize: '0.72rem', flexWrap: 'wrap' },
    companyItem: { display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' },
    matchBadge: (match) => ({ padding: '0.3rem 0.65rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.7rem', background: match >= 90 ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : match >= 80 ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' : match >= 70 ? 'linear-gradient(135deg, #c4b5fd 0%, #ddd6fe 100%)' : '#f5f3ff', color: match >= 70 ? 'white' : '#2E073F', whiteSpace: 'nowrap' }),
    featuredBadge: { padding: '0.25rem 0.6rem', borderRadius: '15px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#78350f', fontWeight: 600, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem', whiteSpace: 'nowrap' },
    badgesRow: { display: 'flex', gap: '0.35rem', alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' },
    description: { color: '#4b5563', marginBottom: '0.65rem', lineHeight: 1.6, fontSize: '0.78rem' },
    skillsRow: { display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
    skillTag: { padding: '0.25rem 0.6rem', background: '#f5f3ff', color: '#2E073F', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 500, whiteSpace: 'nowrap' },
    metaRow: { display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.72rem', whiteSpace: 'nowrap' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid #f5f3ff', marginTop: '0.25rem' },
    matchText: { fontWeight: 600, fontSize: '0.75rem' },
    applyButton: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontSize: '0.75rem', transition: 'all 0.2s', boxShadow: '0 3px 10px rgba(139, 92, 246, 0.25)', whiteSpace: 'nowrap' },
    viewDetailsBtn: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem 0.7rem', borderRadius: '8px', border: '1.5px solid #ede9fe', background: 'transparent', cursor: 'pointer', fontWeight: 500, color: '#2E073F', fontSize: '0.72rem', transition: 'all 0.2s' },
    postedText: { color: '#9ca3af', fontSize: '0.68rem' }
  };

  if (loading) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '3rem 1rem' }}>
        <Loader size={36} color="#2E073F" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <h3 style={{ color: '#1f2937', fontWeight: 600 }}>Loading jobs...</h3>
        <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Calculating match scores based on your resume skills</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.title}>Job Recommendations</h1>
        <p style={styles.subtitle}>
          {hasResume
            ? 'Matched based on your resume skills'
            : 'Upload your resume in Resume Analyzer for personalized match scores'}
        </p>
        <div style={styles.statsRow}>
          <TrendingUp size={14} />
          <span>{filteredJobs.length} jobs {hasResume ? 'matched with your profile' : 'available'}</span>
          {userSkills.length > 0 && (
            <span style={{ marginLeft: '0.5rem', color: '#6b7280', fontSize: '0.75rem' }}>
              • {userSkills.length} skills detected
            </span>
          )}
        </div>
      </motion.div>

      {/* Resume skills banner */}
      {hasResume && userSkills.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <CheckCircle size={16} color="#10b981" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669' }}>Your Skills:</span>
          {userSkills.slice(0, 10).map(s => (
            <span key={s} style={{ padding: '0.15rem 0.5rem', background: '#d1fae5', borderRadius: '10px', fontSize: '0.68rem', color: '#047857' }}>{s}</span>
          ))}
          {userSkills.length > 10 && <span style={{ fontSize: '0.68rem', color: '#6b7280' }}>+{userSkills.length - 10} more</span>}
        </motion.div>
      )}

      {!hasResume && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '0.65rem 0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={16} color="#d97706" />
          <span style={{ fontSize: '0.75rem', color: '#92400e' }}>Upload your resume in the <Link to="/resume-analyzer" style={{ color: '#2E073F', fontWeight: 600 }}>Resume Analyzer</Link> to get personalized match scores.</span>
        </motion.div>
      )}

      {error && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '10px', padding: '0.65rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Search and Filter */}
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input type="text" placeholder="Search jobs, companies, or skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
        </div>
        <button style={styles.filterButton} onClick={fetchJobs}>
          <Filter size={14} /> Refresh
        </button>
      </div>

      {/* Filter Chips */}
      <div style={styles.filtersRow}>
        {filters.map(filter => (
          <motion.button key={filter} style={styles.filterChip(selectedFilter === filter)} onClick={() => setSelectedFilter(filter)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          <Briefcase size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
          <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>No jobs found</p>
          <p style={{ fontSize: '0.75rem' }}>Try adjusting your search or filters</p>
        </div>
      ) : (
        <div style={styles.jobsList}>
          {filteredJobs.map((job, index) => {
            const isExpanded = expandedJob === job.id;
            return (
            <motion.div key={job.id} style={styles.jobCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}>
              {/* Header row */}
              <div style={styles.jobHeader}>
                <div style={styles.jobTitleRow}>
                  <div style={styles.companyLogo(job.color)}>{job.company.charAt(0)}</div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={styles.jobTitle}>{job.title}</h3>
                    <div style={styles.companyInfo}>
                      <span style={styles.companyItem}><Building2 size={12} /> {job.company}</span>
                      <span style={styles.companyItem}><MapPin size={12} /> {job.location}</span>
                    </div>
                  </div>
                </div>
                <div style={styles.badgesRow}>
                  {job.match > 0 && <span style={styles.matchBadge(job.match)}>{job.match}%</span>}
                  {job.featured && <span style={styles.featuredBadge}><Star size={10} /> Top Match</span>}
                </div>
              </div>

              {/* Meta Row */}
              <div style={styles.metaRow}>
                <span style={styles.metaItem}><Briefcase size={12} /> {job.type}</span>
                <span style={styles.metaItem}><Clock size={12} /> {job.experience}</span>
                <span style={styles.metaItem}><DollarSign size={12} /> {job.salary}</span>
                <span style={styles.metaItem}><MapPin size={12} /> {job.mode}</span>
                {job.applicants > 0 && <span style={styles.metaItem}><Users size={12} /> {job.applicants} applied</span>}
              </div>

              {/* Description */}
              <p style={{ ...styles.description, ...(isExpanded ? {} : { overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }) }}>{job.description}</p>

              {/* Skills */}
              <div style={styles.skillsRow}>
                {job.skills.map(skill => {
                  const isMatching = job.matchingSkills?.some(ms => ms.toLowerCase() === skill.toLowerCase());
                  return (
                    <span key={skill} style={{
                      ...styles.skillTag,
                      background: isMatching ? '#d1fae5' : '#f5f3ff',
                      color: isMatching ? '#059669' : '#2E073F',
                      border: isMatching ? '1px solid #a7f3d0' : '1px solid transparent'
                    }}>
                      {isMatching && <CheckCircle size={10} style={{ marginRight: '2px' }} />}
                      {skill}
                    </span>
                  );
                })}
              </div>

              {/* Missing skills */}
              {job.missingSkills && job.missingSkills.length > 0 && (
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 500 }}>Missing:</span>
                  {job.missingSkills.slice(0, 3).map(s => (
                    <span key={s} style={{ padding: '0.1rem 0.4rem', background: '#fee2e2', borderRadius: '10px', fontSize: '0.63rem', color: '#dc2626' }}>{s}</span>
                  ))}
                  {job.missingSkills.length > 3 && <span style={{ fontSize: '0.63rem', color: '#9ca3af' }}>+{job.missingSkills.length - 3}</span>}
                </div>
              )}

              {/* Expandable Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {/* Requirements */}
                    {job.requirements.length > 0 && (
                      <div style={sectionStyle}>
                        <div style={sectionTitle}><ShieldCheck size={14} /> Requirements</div>
                        {job.requirements.map((r, i) => (
                          <div key={i} style={listItem}>
                            <span style={bulletDot} />
                            {r}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Responsibilities */}
                    {job.responsibilities.length > 0 && (
                      <div style={sectionStyle}>
                        <div style={sectionTitle}><ListChecks size={14} /> Responsibilities</div>
                        {job.responsibilities.map((r, i) => (
                          <div key={i} style={listItem}>
                            <span style={bulletDot} />
                            {r}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Benefits */}
                    {job.benefits.length > 0 && (
                      <div style={sectionStyle}>
                        <div style={sectionTitle}><Gift size={14} /> Benefits</div>
                        {job.benefits.map((b, i) => (
                          <div key={i} style={listItem}>
                            <span style={{ ...bulletDot, background: '#10b981' }} />
                            {b}
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer */}
              <div style={styles.cardFooter}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {job.match > 0 && (
                    <div style={{ ...styles.matchText, color: job.match >= 75 ? '#10b981' : job.match >= 50 ? '#2E073F' : '#f59e0b' }}>
                      {job.match}% Match
                    </div>
                  )}
                  <span style={styles.postedText}>{job.posted}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button style={styles.viewDetailsBtn} onClick={() => setExpandedJob(isExpanded ? null : job.id)}>
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {isExpanded ? 'Less' : 'Details'}
                  </button>
                  <a href={job.applyUrl && job.applyUrl !== '#' ? job.applyUrl : `https://www.google.com/search?q=${encodeURIComponent(job.company + ' careers')}`} target="_blank" rel="noopener noreferrer" style={styles.applyButton}>
                    Apply <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;
