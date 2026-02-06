import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, Filter, MapPin, Building2, Clock, DollarSign, Users,
  Bookmark, ExternalLink, TrendingUp, Briefcase, ChevronDown, Star
} from 'lucide-react';

const Jobs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const jobs = [
    { id: 1, title: 'Software Engineer', company: 'TCS', location: 'Chennai, India', type: 'Full-time', experience: '0-2 years', salary: '4-7 LPA', match: 92, skills: ['Java', 'SQL', 'Spring Boot', 'REST APIs'], applicants: 1234, posted: '1 day ago', featured: true, description: 'Join TCS Digital as a Software Engineer to work on enterprise solutions for Fortune 500 clients. Great learning opportunities and global exposure.', applyUrl: 'https://ibegin.tcs.com/iBegin/', color: '#0052cc' },
    { id: 2, title: 'Associate Software Engineer', company: 'Infosys', location: 'Bangalore, India', type: 'Full-time', experience: '0-1 years', salary: '3.6-5 LPA', match: 88, skills: ['Python', 'JavaScript', 'MySQL', 'Agile'], applicants: 2156, posted: '2 days ago', featured: true, description: 'Infosys is hiring freshers for its Mysore DC. Training provided. Work on cutting-edge projects across banking, retail, and healthcare domains.', applyUrl: 'https://www.infosys.com/careers.html', color: '#007cc3' },
    { id: 3, title: 'Full Stack Developer', company: 'Wipro', location: 'Hyderabad, India', type: 'Full-time', experience: '1-3 years', salary: '5-9 LPA', match: 85, skills: ['React', 'Node.js', 'MongoDB', 'AWS'], applicants: 876, posted: '3 days ago', featured: false, description: 'Build scalable web applications for Wipro\'s digital transformation projects. Collaborative team environment with flexible work options.', applyUrl: 'https://careers.wipro.com/', color: '#5a287d' },
    { id: 4, title: 'Backend Developer', company: 'Tech Mahindra', location: 'Pune, India', type: 'Full-time', experience: '2-4 years', salary: '8-14 LPA', match: 78, skills: ['Java', 'Spring Boot', 'Microservices', 'Docker'], applicants: 543, posted: '4 days ago', featured: false, description: 'Design and develop microservices architecture for telecom and enterprise clients. Experience with cloud-native development is a plus.', applyUrl: 'https://careers.techmahindra.com/', color: '#c4161c' },
    { id: 5, title: 'Data Analyst', company: 'HCL Technologies', location: 'Noida, India', type: 'Full-time', experience: '1-3 years', salary: '6-10 LPA', match: 72, skills: ['Python', 'SQL', 'Power BI', 'Excel'], applicants: 765, posted: '5 days ago', featured: false, description: 'Analyze large datasets to derive business insights. Work with cross-functional teams to improve decision-making processes.', applyUrl: 'https://www.hcltech.com/careers', color: '#0073b1' },
    { id: 6, title: 'DevOps Engineer', company: 'LTIMindtree', location: 'Mumbai, India', type: 'Full-time', experience: '2-5 years', salary: '10-18 LPA', match: 68, skills: ['AWS', 'Kubernetes', 'Jenkins', 'Terraform'], applicants: 432, posted: '1 week ago', featured: false, description: 'Build CI/CD pipelines and manage cloud infrastructure for enterprise clients. Remote-friendly with hybrid work options.', applyUrl: 'https://www.ltimindtree.com/careers/', color: '#0f4c81' },
    { id: 7, title: 'Cloud Engineer', company: 'Cognizant', location: 'Chennai, India', type: 'Full-time', experience: '2-4 years', salary: '8-15 LPA', match: 82, skills: ['Azure', 'Python', 'Docker', 'Linux'], applicants: 654, posted: '3 days ago', featured: true, description: 'Help enterprises migrate to cloud. Work on Azure/AWS infrastructure projects with global teams.', applyUrl: 'https://careers.cognizant.com/', color: '#0033a0' },
    { id: 8, title: 'React Developer', company: 'Capgemini', location: 'Bangalore, India', type: 'Full-time', experience: '1-3 years', salary: '7-12 LPA', match: 90, skills: ['React', 'TypeScript', 'Redux', 'REST APIs'], applicants: 567, posted: '2 days ago', featured: false, description: 'Build modern web applications using React ecosystem. Agile environment with focus on code quality and best practices.', applyUrl: 'https://www.capgemini.com/in-en/careers/', color: '#0070ad' },
    { id: 9, title: 'Machine Learning Engineer', company: 'Accenture', location: 'Gurugram, India', type: 'Full-time', experience: '2-4 years', salary: '12-20 LPA', match: 75, skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps'], applicants: 398, posted: '4 days ago', featured: true, description: 'Develop and deploy ML models for enterprise AI solutions. Work on cutting-edge NLP and computer vision projects.', applyUrl: 'https://www.accenture.com/in-en/careers', color: '#a100ff' },
    { id: 10, title: 'Quality Assurance Engineer', company: 'Zoho', location: 'Chennai, India', type: 'Full-time', experience: '1-3 years', salary: '6-10 LPA', match: 80, skills: ['Selenium', 'Java', 'API Testing', 'Agile'], applicants: 321, posted: '6 days ago', featured: false, description: 'Ensure quality of Zoho\'s suite of products. Work in a product company with direct impact on millions of users.', applyUrl: 'https://www.zoho.com/careers.html', color: '#dc4b3e' }
  ];

  const filters = ['all', 'featured', 'high match', 'remote', 'recent'];

  const styles = {
    container: { padding: '1rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' },
    header: { marginBottom: '1rem' },
    title: { fontSize: '1.25rem', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' },
    subtitle: { color: '#6b7280', fontSize: '0.8rem' },
    statsRow: { display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.5rem', color: '#7c3aed', fontWeight: 500, fontSize: '0.8rem' },
    searchSection: { display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' },
    searchWrapper: { flex: 1, minWidth: '240px', position: 'relative' },
    searchIcon: { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' },
    searchInput: { width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', borderRadius: '10px', border: '1.5px solid #ede9fe', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', background: 'white' },
    filterButton: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.6rem 1rem', borderRadius: '10px', border: '1.5px solid #ede9fe', background: 'white', cursor: 'pointer', fontWeight: 500, color: '#7c3aed', fontSize: '0.8rem' },
    filtersRow: { display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' },
    filterChip: (active) => ({ padding: '0.35rem 0.85rem', borderRadius: '20px', border: 'none', cursor: 'pointer', fontWeight: 500, fontSize: '0.75rem', transition: 'all 0.2s', background: active ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : '#f5f3ff', color: active ? 'white' : '#7c3aed' }),
    jobsGrid: { display: 'grid', gap: '0.85rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' },
    jobCard: { background: 'white', borderRadius: '14px', padding: '0.85rem', boxShadow: '0 2px 12px rgba(139, 92, 246, 0.06)', border: '1px solid #ede9fe', transition: 'all 0.3s' },
    jobHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem' },
    jobTitleRow: { display: 'flex', alignItems: 'flex-start', gap: '0.65rem' },
    companyLogo: (color) => ({ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${color || '#7c3aed'} 0%, ${color || '#8b5cf6'}cc 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem' }),
    jobTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.15rem' },
    companyInfo: { display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#6b7280', fontSize: '0.75rem' },
    companyItem: { display: 'flex', alignItems: 'center', gap: '0.2rem' },
    matchBadge: (match) => ({ padding: '0.3rem 0.65rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.7rem', background: match >= 90 ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : match >= 80 ? 'linear-gradient(135deg, #a78bfa 0%, #c4b5fd 100%)' : match >= 70 ? 'linear-gradient(135deg, #c4b5fd 0%, #ddd6fe 100%)' : '#f5f3ff', color: match >= 70 ? 'white' : '#7c3aed' }),
    featuredBadge: { padding: '0.25rem 0.6rem', borderRadius: '15px', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', color: '#78350f', fontWeight: 600, fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' },
    badgesRow: { display: 'flex', gap: '0.35rem', alignItems: 'center' },
    bookmarkBtn: { padding: '0.35rem', borderRadius: '8px', border: 'none', background: '#f5f3ff', cursor: 'pointer', color: '#8b5cf6' },
    description: { color: '#6b7280', marginBottom: '0.65rem', lineHeight: 1.5, fontSize: '0.75rem' },
    skillsRow: { display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
    skillTag: { padding: '0.25rem 0.6rem', background: '#f5f3ff', color: '#7c3aed', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 500 },
    metaRow: { display: 'flex', gap: '0.65rem', flexWrap: 'wrap', marginBottom: '0.75rem' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#6b7280', fontSize: '0.72rem' },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.65rem', borderTop: '1px solid #f5f3ff' },
    matchText: { fontWeight: 600, fontSize: '0.75rem' },
    applyButton: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.85rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', textDecoration: 'none', fontSize: '0.72rem', transition: 'all 0.2s', boxShadow: '0 3px 10px rgba(139, 92, 246, 0.25)' },
    postedText: { color: '#9ca3af', fontSize: '0.68rem' }
  };

  const filteredJobs = jobs.filter(job => {
    if (selectedFilter === 'featured') return job.featured;
    if (selectedFilter === 'high match') return job.match >= 85;
    if (selectedFilter === 'remote') return job.location.toLowerCase().includes('remote');
    return true;
  });

  return (
    <div style={styles.container}>
      {/* Header */}
      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.title}>Job Recommendations</h1>
        <p style={styles.subtitle}>AI-powered matches based on your skills and preferences</p>
        <div style={styles.statsRow}>
          <TrendingUp size={14} />
          <span>{filteredJobs.length} jobs match your profile</span>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input type="text" placeholder="Search jobs, companies, or skills..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={styles.searchInput} />
        </div>
        <button style={styles.filterButton}>
          <Filter size={14} /> Filters <ChevronDown size={12} />
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
      <div style={styles.jobsGrid}>
        {filteredJobs.map((job, index) => (
          <motion.div key={job.id} style={styles.jobCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ boxShadow: '0 8px 30px rgba(0,0,0,0.1)', transform: 'translateY(-3px)' }}>
            <div style={styles.jobHeader}>
              <div style={styles.jobTitleRow}>
                <div style={styles.companyLogo(job.color)}>{job.company.charAt(0)}</div>
                <div>
                  <h3 style={styles.jobTitle}>{job.title}</h3>
                  <div style={styles.companyInfo}>
                    <span style={styles.companyItem}><Building2 size={12} /> {job.company}</span>
                    <span style={styles.companyItem}><MapPin size={12} /> {job.location}</span>
                  </div>
                </div>
              </div>
              <div style={styles.badgesRow}>
                {job.featured && <span style={styles.featuredBadge}><Star size={10} /> Featured</span>}
                <span style={styles.matchBadge(job.match)}>{job.match}%</span>
                <button style={styles.bookmarkBtn}><Bookmark size={14} /></button>
              </div>
            </div>

            <p style={styles.description}>{job.description}</p>

            <div style={styles.skillsRow}>
              {job.skills.map(skill => <span key={skill} style={styles.skillTag}>{skill}</span>)}
            </div>

            <div style={styles.metaRow}>
              <span style={styles.metaItem}><Briefcase size={12} /> {job.type}</span>
              <span style={styles.metaItem}><Clock size={12} /> {job.experience}</span>
              <span style={styles.metaItem}><DollarSign size={12} /> ₹{job.salary}</span>
              <span style={styles.metaItem}><Users size={12} /> {job.applicants}</span>
            </div>

            <div style={styles.cardFooter}>
              <div>
                <div style={{ ...styles.matchText, color: job.match >= 85 ? '#10b981' : job.match >= 70 ? '#7c3aed' : '#f59e0b' }}>{job.match}% Match</div>
                <span style={styles.postedText}>{job.posted}</span>
              </div>
              <a href={job.applyUrl} target="_blank" rel="noopener noreferrer" style={styles.applyButton}>
                Apply <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
