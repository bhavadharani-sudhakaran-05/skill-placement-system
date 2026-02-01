import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin, Building2, Clock, DollarSign, Users, Bookmark, BookmarkCheck,
  Share2, ArrowLeft, CheckCircle, XCircle, ExternalLink, Star,
  Briefcase, GraduationCap, Calendar, Send, TrendingUp
} from 'lucide-react';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Demo job data
  const job = {
    id: 1,
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Inc.',
    logo: 'https://logo.clearbit.com/google.com',
    location: 'San Francisco, CA',
    type: 'Full-time',
    remote: 'Hybrid',
    salary: '$150,000 - $180,000',
    experience: '5+ years',
    posted: '2 days ago',
    applicants: 47,
    matchScore: 92,
    description: `We are looking for a Senior Full Stack Developer to join our dynamic team. You will be responsible for developing and maintaining high-quality web applications that serve millions of users worldwide.

As a senior member of the engineering team, you'll have the opportunity to mentor junior developers, contribute to architectural decisions, and work on cutting-edge technologies.`,
    responsibilities: [
      'Design and implement scalable web applications using React and Node.js',
      'Collaborate with cross-functional teams to define and ship new features',
      'Write clean, maintainable, and well-documented code',
      'Mentor junior developers and conduct code reviews',
      'Participate in architectural decisions and system design',
      'Optimize applications for maximum speed and scalability'
    ],
    requirements: [
      '5+ years of experience in full-stack development',
      'Strong proficiency in JavaScript, React, and Node.js',
      'Experience with databases (MongoDB, PostgreSQL)',
      'Familiarity with cloud services (AWS, GCP, or Azure)',
      'Excellent problem-solving and communication skills',
      'Bachelor\'s degree in Computer Science or related field'
    ],
    benefits: [
      'Competitive salary and equity package',
      'Health, dental, and vision insurance',
      'Flexible work schedule and remote options',
      '401(k) with company matching',
      'Professional development budget',
      'Free lunch and snacks'
    ],
    requiredSkills: [
      { name: 'JavaScript', required: true, userHas: true },
      { name: 'React', required: true, userHas: true },
      { name: 'Node.js', required: true, userHas: true },
      { name: 'MongoDB', required: true, userHas: true },
      { name: 'AWS', required: false, userHas: false },
      { name: 'TypeScript', required: false, userHas: true },
      { name: 'Docker', required: false, userHas: false }
    ],
    companyInfo: {
      size: '500-1000 employees',
      industry: 'Technology',
      founded: 2015,
      website: 'techcorp.com',
      rating: 4.5,
      reviews: 234
    }
  };

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      setIsApplying(false);
      alert('Application submitted successfully!');
    }, 1500);
  };

  const styles = {
    container: { padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    backButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.95rem', fontWeight: 500, border: 'none', background: 'none' },
    grid: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' },
    mainContent: {},
    sidebar: {},
    header: { background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', marginBottom: '1.5rem', border: '1px solid #ede9fe' },
    headerTop: { display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem' },
    logo: { width: '80px', height: '80px', borderRadius: '16px', objectFit: 'cover', background: '#f5f3ff' },
    headerInfo: { flex: 1 },
    title: { fontSize: '1.75rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' },
    company: { fontSize: '1.1rem', color: '#7c3aed', fontWeight: 600, marginBottom: '1rem' },
    metaGrid: { display: 'flex', flexWrap: 'wrap', gap: '1rem' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#6b7280', fontSize: '0.9rem' },
    matchBadge: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    headerActions: { display: 'flex', gap: '0.75rem' },
    iconBtn: { width: '48px', height: '48px', borderRadius: '12px', border: '2px solid #ede9fe', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' },
    iconBtnActive: { width: '48px', height: '48px', borderRadius: '12px', border: '2px solid #7c3aed', background: '#f5f3ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' },
    tags: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    tag: { padding: '0.5rem 1rem', background: '#f5f3ff', borderRadius: '8px', fontSize: '0.85rem', color: '#374151', fontWeight: 500 },
    tagRemote: { padding: '0.5rem 1rem', background: '#ede9fe', borderRadius: '8px', fontSize: '0.85rem', color: '#7c3aed', fontWeight: 500 },
    card: { background: 'white', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', marginBottom: '1.5rem', border: '1px solid #ede9fe' },
    cardTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    description: { color: '#4b5563', lineHeight: 1.8, whiteSpace: 'pre-line' },
    list: { listStyle: 'none', padding: 0, margin: 0 },
    listItem: { display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem', color: '#4b5563', lineHeight: 1.6 },
    listIcon: { marginTop: '4px', color: '#10b981', flexShrink: 0 },
    skillsGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' },
    skillTag: (has, required) => ({ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 500, background: has ? '#d1fae5' : required ? '#fee2e2' : '#f5f3ff', color: has ? '#065f46' : required ? '#991b1b' : '#6b7280' }),
    applyCard: { background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', borderRadius: '20px', padding: '1.75rem', color: 'white', marginBottom: '1.5rem', boxShadow: '0 8px 25px rgba(139,92,246,0.3)' },
    applyTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' },
    applySubtitle: { opacity: 0.9, marginBottom: '1.5rem', fontSize: '0.95rem' },
    applyButton: { width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'white', color: '#7c3aed', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(255,255,255,0.2)' },
    applyStats: { display: 'flex', justifyContent: 'space-between', marginTop: '1rem' },
    applyStat: { textAlign: 'center' },
    applyStatValue: { fontSize: '1.25rem', fontWeight: 700 },
    applyStatLabel: { fontSize: '0.8rem', opacity: 0.8 },
    companyCard: { background: 'white', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', border: '1px solid #ede9fe' },
    companyHeader: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' },
    companyLogo: { width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' },
    companyName: { fontWeight: 700, color: '#1f2937' },
    companyRating: { display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#f59e0b', fontSize: '0.9rem' },
    companyGrid: { display: 'grid', gap: '0.75rem' },
    companyItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#faf5ff', borderRadius: '10px', fontSize: '0.9rem', color: '#4b5563' },
    companyItemLabel: { flex: 1, fontWeight: 500, color: '#1f2937' },
    viewCompany: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem', padding: '0.75rem', background: '#f5f3ff', borderRadius: '10px', color: '#7c3aed', fontWeight: 600, cursor: 'pointer' }
  };

  return (
    <div style={styles.container}>
      <button style={styles.backButton} onClick={() => navigate('/jobs')}>
        <ArrowLeft size={18} /> Back to Jobs
      </button>

      <div style={styles.grid}>
        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Job Header */}
          <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={styles.headerTop}>
              <img src={job.logo} alt={job.company} style={styles.logo} />
              <div style={styles.headerInfo}>
                <h1 style={styles.title}>{job.title}</h1>
                <p style={styles.company}>{job.company}</p>
                <div style={styles.metaGrid}>
                  <div style={styles.metaItem}><MapPin size={16} /> {job.location}</div>
                  <div style={styles.metaItem}><Briefcase size={16} /> {job.type}</div>
                  <div style={styles.metaItem}><Clock size={16} /> {job.experience}</div>
                  <div style={styles.metaItem}><DollarSign size={16} /> {job.salary}</div>
                </div>
              </div>
              <div style={styles.matchBadge}><TrendingUp size={20} /> {job.matchScore}% Match</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={styles.tags}>
                <span style={styles.tag}>{job.type}</span>
                <span style={styles.tagRemote}>{job.remote}</span>
                <span style={styles.tag}>Posted {job.posted}</span>
              </div>
              <div style={styles.headerActions}>
                <button style={isSaved ? styles.iconBtnActive : styles.iconBtn} onClick={() => setIsSaved(!isSaved)}>
                  {isSaved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
                <button style={styles.iconBtn}><Share2 size={20} /></button>
              </div>
            </div>
          </motion.div>

          {/* Description */}
          <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={styles.cardTitle}>About this Role</h3>
            <p style={styles.description}>{job.description}</p>
          </motion.div>

          {/* Responsibilities */}
          <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h3 style={styles.cardTitle}><Briefcase size={20} color="#7c3aed" /> Responsibilities</h3>
            <ul style={styles.list}>
              {job.responsibilities.map((item, idx) => (
                <li key={idx} style={styles.listItem}>
                  <CheckCircle size={18} style={styles.listIcon} /> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Requirements */}
          <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <h3 style={styles.cardTitle}><GraduationCap size={20} color="#7c3aed" /> Requirements</h3>
            <ul style={styles.list}>
              {job.requirements.map((item, idx) => (
                <li key={idx} style={styles.listItem}>
                  <CheckCircle size={18} style={styles.listIcon} /> {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Skills Match */}
          <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h3 style={styles.cardTitle}>Skills Match Analysis</h3>
            <div style={styles.skillsGrid}>
              {job.requiredSkills.map(skill => (
                <div key={skill.name} style={styles.skillTag(skill.userHas, skill.required)}>
                  {skill.userHas ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {skill.name}
                  {skill.required && <span style={{ fontSize: '0.75rem' }}>*</span>}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Benefits */}
          <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h3 style={styles.cardTitle}>🎁 Benefits & Perks</h3>
            <ul style={styles.list}>
              {job.benefits.map((item, idx) => (
                <li key={idx} style={styles.listItem}>
                  <CheckCircle size={18} style={styles.listIcon} /> {item}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Apply Card */}
          <motion.div style={styles.applyCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 style={styles.applyTitle}>Ready to Apply?</h3>
            <p style={styles.applySubtitle}>Your profile matches {job.matchScore}% of requirements</p>
            <button style={styles.applyButton} onClick={handleApply} disabled={isApplying}>
              {isApplying ? 'Submitting...' : <><Send size={18} /> Apply Now</>}
            </button>
            <div style={styles.applyStats}>
              <div style={styles.applyStat}>
                <div style={styles.applyStatValue}>{job.applicants}</div>
                <div style={styles.applyStatLabel}>Applicants</div>
              </div>
              <div style={styles.applyStat}>
                <div style={styles.applyStatValue}>3-5</div>
                <div style={styles.applyStatLabel}>Days to respond</div>
              </div>
            </div>
          </motion.div>

          {/* Company Card */}
          <motion.div style={styles.companyCard} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <div style={styles.companyHeader}>
              <img src={job.logo} alt={job.company} style={styles.companyLogo} />
              <div>
                <div style={styles.companyName}>{job.company}</div>
                <div style={styles.companyRating}><Star size={14} fill="#f59e0b" /> {job.companyInfo.rating} ({job.companyInfo.reviews} reviews)</div>
              </div>
            </div>
            <div style={styles.companyGrid}>
              <div style={styles.companyItem}><Building2 size={18} color="#7c3aed" /> <span style={styles.companyItemLabel}>Industry</span> {job.companyInfo.industry}</div>
              <div style={styles.companyItem}><Users size={18} color="#7c3aed" /> <span style={styles.companyItemLabel}>Company Size</span> {job.companyInfo.size}</div>
              <div style={styles.companyItem}><Calendar size={18} color="#7c3aed" /> <span style={styles.companyItemLabel}>Founded</span> {job.companyInfo.founded}</div>
            </div>
            <div style={styles.viewCompany}><ExternalLink size={16} /> View Company Profile</div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
