import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Award, Edit2, Camera, Save, X, Linkedin, Github,
  Globe, Star, CheckCircle, Plus, Trash2
} from 'lucide-react';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const profile = {
    name: 'Bhavadharani S',
    title: 'Aspiring Full Stack Developer',
    email: 'bhava05dhanu05@gmail.com',
    phone: '+91 6383632556',
    location: 'Tamil Nadu, India',
    bio: 'Passionate Full Stack Developer Intern with hands-on experience in building real-world applications. Skilled in Java, Spring Boot, MySQL, and modern web technologies. National Level Runner Up in CBIT Hacktoberfest Hackathon 2025, Finalist at Smart India Hackathon 2025, and Top Contributor at ByteWars Hackathon.',
    avatar: 'https://ui-avatars.com/api/?name=Bhavadharani+S&background=2E073F&color=fff&size=150',
    linkedin: 'linkedin.com/in/bhavadharani',
    github: 'github.com/bhavadharani',
    portfolio: 'bhavadharani.dev'
  };

  const skills = [
    { name: 'Java', level: 85, verified: true },
    { name: 'JavaScript', level: 80, verified: true },
    { name: 'SQL', level: 82, verified: true },
    { name: 'HTML/CSS', level: 88, verified: true },
    { name: 'Spring Boot', level: 75, verified: true },
    { name: 'React', level: 70, verified: false },
    { name: 'MySQL', level: 80, verified: true },
    { name: 'MongoDB', level: 65, verified: false },
    { name: 'Git & GitHub', level: 78, verified: true },
    { name: 'REST APIs', level: 75, verified: true }
  ];

  const experience = [
    { id: 1, title: 'Full Stack Developer Intern', company: 'UdiCrafts India Pvt. Ltd.', location: 'India', period: 'September 2025 - Present', description: 'Gaining hands-on experience in Full Stack Development through practical tasks and real-world applications, focusing on strengthening programming skills, teamwork, and professional software development practices.' }
  ];

  const education = [
    { id: 1, degree: 'B.Tech Information Technology', school: 'Sri Shakthi Institute of Engineering & Technology', year: '2023 - 2027', gpa: '8.49 CGPA' },
    { id: 2, degree: 'Class XII', school: 'Sri Aravindar Balar Matric Higher Secondary School', year: '2021 - 2022', gpa: '85%' }
  ];

  const certifications = [
    { id: 1, name: 'Full-Stack Web Development', issuer: 'Udemy', date: '2024', badge: '🏆' },
    { id: 2, name: 'National Level Runner Up - Hackathon', issuer: 'CBIT Hacktoberfest 2025', date: '2025', badge: '🥈' },
    { id: 3, name: 'Smart India Hackathon Finalist', issuer: 'Government of India', date: '2025', badge: '🚀' },
    { id: 4, name: 'Java OOP Certification', issuer: 'LinkedIn Learning', date: '2024', badge: '☕' },
    { id: 5, name: 'Figma Essential Training', issuer: 'LinkedIn Learning', date: '2024', badge: '🎨' }
  ];

  const tabs = ['overview', 'skills', 'experience', 'education'];

  const styles = {
    container: { padding: '1rem', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 50%, #a78bfa 100%)', borderRadius: '18px', padding: '1.25rem', marginBottom: '1rem', position: 'relative', overflow: 'hidden', boxShadow: '0 6px 25px rgba(139,92,246,0.25)' },
    headerPattern: { position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)', borderRadius: '50%', transform: 'translate(50%, -50%)' },
    headerContent: { display: 'flex', gap: '1.25rem', alignItems: 'center', position: 'relative', zIndex: 1, flexWrap: 'wrap' },
    avatarContainer: { position: 'relative' },
    avatar: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', boxShadow: '0 6px 20px rgba(139,92,246,0.3)' },
    avatarEdit: { position: 'absolute', bottom: '4px', right: '4px', background: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(139,92,246,0.2)' },
    headerInfo: { flex: 1, color: 'white' },
    name: { fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.15rem' },
    title: { fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.65rem' },
    headerMeta: { display: 'flex', gap: '1rem', flexWrap: 'wrap' },
    metaItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', opacity: 0.9 },
    headerActions: { display: 'flex', gap: '0.5rem' },
    editBtn: { padding: '0.5rem 1rem', background: 'white', color: '#2E073F', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 3px 10px rgba(139,92,246,0.2)', fontSize: '0.8rem' },
    socialLinks: { display: 'flex', gap: '0.5rem', marginTop: '0.65rem' },
    socialBtn: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' },
    tabs: { display: 'flex', gap: '0.35rem', marginBottom: '1rem', background: '#f5f3ff', padding: '0.35rem', borderRadius: '12px', width: 'fit-content' },
    tab: (active) => ({ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: active ? 'white' : 'transparent', color: active ? '#2E073F' : '#6b7280', fontWeight: 600, cursor: 'pointer', boxShadow: active ? '0 3px 10px rgba(139,92,246,0.15)' : 'none', textTransform: 'capitalize', fontSize: '0.75rem' }),
    grid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' },
    mainContent: {},
    sidebar: {},
    card: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139,92,246,0.08)', marginBottom: '1rem', border: '1px solid #ede9fe' },
    cardTitle: { fontSize: '0.95rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    addBtn: { width: '26px', height: '26px', borderRadius: '6px', background: '#f5f3ff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2E073F' },
    bio: { color: '#4b5563', lineHeight: 1.6, fontSize: '0.8rem' },
    skillItem: { marginBottom: '0.75rem' },
    skillHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
    skillName: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500, color: '#374151', fontSize: '0.8rem' },
    skillVerified: { color: '#10b981' },
    skillLevel: { fontSize: '0.72rem', color: '#2E073F', fontWeight: 600 },
    skillBar: { height: '6px', background: '#f5f3ff', borderRadius: '3px', overflow: 'hidden' },
    skillProgress: (level) => ({ height: '100%', width: `${level}%`, background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', borderRadius: '3px' }),
    expItem: { borderLeft: '2px solid #2E073F', paddingLeft: '1rem', marginBottom: '1rem', position: 'relative' },
    expDot: { position: 'absolute', left: '-5px', top: '0', width: '10px', height: '10px', borderRadius: '50%', background: 'linear-gradient(135deg, #2E073F, #2E073F)' },
    expTitle: { fontSize: '0.85rem', fontWeight: 600, color: '#1f2937' },
    expCompany: { color: '#2E073F', fontWeight: 500, fontSize: '0.8rem' },
    expMeta: { fontSize: '0.7rem', color: '#6b7280', marginBottom: '0.35rem' },
    expDesc: { fontSize: '0.75rem', color: '#4b5563' },
    eduItem: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: '#faf5ff', borderRadius: '10px', border: '1px solid #ede9fe' },
    eduIcon: { width: '38px', height: '38px', borderRadius: '10px', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 3px 10px rgba(139,92,246,0.25)' },
    eduInfo: { flex: 1 },
    eduDegree: { fontWeight: 600, color: '#1f2937', fontSize: '0.85rem' },
    eduSchool: { color: '#2E073F', fontSize: '0.75rem' },
    eduMeta: { fontSize: '0.7rem', color: '#6b7280' },
    certItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#faf5ff', borderRadius: '10px', marginBottom: '0.5rem', border: '1px solid #ede9fe' },
    certBadge: { fontSize: '1.1rem' },
    certInfo: { flex: 1 },
    certName: { fontWeight: 600, color: '#1f2937', fontSize: '0.8rem' },
    certIssuer: { fontSize: '0.7rem', color: '#6b7280' },
    certDate: { fontSize: '0.65rem', color: '#a78bfa', fontWeight: 500 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.65rem' },
    statBox: { textAlign: 'center', padding: '0.65rem', background: 'linear-gradient(135deg, #faf5ff, #f5f3ff)', borderRadius: '10px', border: '1px solid #ede9fe' },
    statValue: { fontSize: '1.1rem', fontWeight: 700, color: '#2E073F' },
    statLabel: { fontSize: '0.65rem', color: '#6b7280' }
  };

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={styles.headerPattern} />
        <div style={styles.headerContent}>
          <div style={styles.avatarContainer}>
            <img src={profile.avatar} alt={profile.name} style={styles.avatar} />
            <div style={styles.avatarEdit}><Camera size={16} color="#2E073F" /></div>
          </div>
          <div style={styles.headerInfo}>
            <h1 style={styles.name}>{profile.name}</h1>
            <p style={styles.title}>{profile.title}</p>
            <div style={styles.headerMeta}>
              <div style={styles.metaItem}><Mail size={16} /> {profile.email}</div>
              <div style={styles.metaItem}><MapPin size={16} /> {profile.location}</div>
              <div style={styles.metaItem}><Phone size={16} /> {profile.phone}</div>
            </div>
            <div style={styles.socialLinks}>
              <div style={styles.socialBtn}><Linkedin size={18} /></div>
              <div style={styles.socialBtn}><Github size={18} /></div>
              <div style={styles.socialBtn}><Globe size={18} /></div>
            </div>
          </div>
          <div style={styles.headerActions}>
            <button style={styles.editBtn} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <><X size={18} /> Cancel</> : <><Edit2 size={18} /> Edit Profile</>}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(tab => (
          <button key={tab} style={styles.tab(activeTab === tab)} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>

      {/* Content Grid */}
      <div style={styles.grid}>
        <div style={styles.mainContent}>
          {/* About Section */}
          {(activeTab === 'overview' || activeTab === 'skills') && (
            <motion.div style={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={styles.cardTitle}>About Me</h3>
              <p style={styles.bio}>{profile.bio}</p>
            </motion.div>
          )}

          {/* Skills Section */}
          {(activeTab === 'overview' || activeTab === 'skills') && (
            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 style={styles.cardTitle}>Skills <button style={styles.addBtn}><Plus size={16} /></button></h3>
              {skills.map((skill, idx) => (
                <div key={skill.name} style={styles.skillItem}>
                  <div style={styles.skillHeader}>
                    <span style={styles.skillName}>
                      {skill.name}
                      {skill.verified && <CheckCircle size={14} style={styles.skillVerified} />}
                    </span>
                    <span style={styles.skillLevel}>{skill.level}%</span>
                  </div>
                  <div style={styles.skillBar}>
                    <motion.div style={styles.skillProgress(skill.level)} initial={{ width: 0 }} animate={{ width: `${skill.level}%` }} transition={{ delay: idx * 0.1 }} />
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Experience Section */}
          {(activeTab === 'overview' || activeTab === 'experience') && (
            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 style={styles.cardTitle}>Experience <button style={styles.addBtn}><Plus size={16} /></button></h3>
              {experience.map(exp => (
                <div key={exp.id} style={styles.expItem}>
                  <div style={styles.expDot} />
                  <div style={styles.expTitle}>{exp.title}</div>
                  <div style={styles.expCompany}>{exp.company}</div>
                  <div style={styles.expMeta}>{exp.location} • {exp.period}</div>
                  <div style={styles.expDesc}>{exp.description}</div>
                </div>
              ))}
            </motion.div>
          )}

          {/* Education Section */}
          {(activeTab === 'overview' || activeTab === 'education') && (
            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 style={styles.cardTitle}>Education <button style={styles.addBtn}><Plus size={16} /></button></h3>
              {education.map(edu => (
                <div key={edu.id} style={styles.eduItem}>
                  <div style={styles.eduIcon}><GraduationCap size={24} /></div>
                  <div style={styles.eduInfo}>
                    <div style={styles.eduDegree}>{edu.degree}</div>
                    <div style={styles.eduSchool}>{edu.school}</div>
                    <div style={styles.eduMeta}>Graduated {edu.year} • GPA: {edu.gpa}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div style={styles.sidebar}>
          {/* Stats */}
          <motion.div style={styles.card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 style={styles.cardTitle}>Quick Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}><div style={styles.statValue}>78%</div><div style={styles.statLabel}>Readiness Score</div></div>
              <div style={styles.statBox}><div style={styles.statValue}>8</div><div style={styles.statLabel}>Verified Skills</div></div>
              <div style={styles.statBox}><div style={styles.statValue}>12</div><div style={styles.statLabel}>Courses Done</div></div>
              <div style={styles.statBox}><div style={styles.statValue}>3</div><div style={styles.statLabel}>Certifications</div></div>
            </div>
          </motion.div>

          {/* Certifications */}
          <motion.div style={styles.card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={styles.cardTitle}>Certifications <Star size={18} color="#f59e0b" /></h3>
            {certifications.map(cert => (
              <div key={cert.id} style={styles.certItem}>
                <span style={styles.certBadge}>{cert.badge}</span>
                <div style={styles.certInfo}>
                  <div style={styles.certName}>{cert.name}</div>
                  <div style={styles.certIssuer}>{cert.issuer}</div>
                </div>
                <span style={styles.certDate}>{cert.date}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
