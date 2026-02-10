import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, Briefcase, GraduationCap,
  Award, Edit2, Camera, Save, X, Linkedin, Github,
  Globe, Star, CheckCircle, Plus, Trash2
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import api from '../utils/api';

const Profile = () => {
  const { user, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ text: '', type: '' });

  const buildFormData = () => ({
    name: user?.name || '',
    phone: user?.phone || '',
    locationCity: user?.location?.city || '',
    locationState: user?.location?.state || '',
    locationCountry: user?.location?.country || 'India',
    title: user?.profile?.title || '',
    bio: user?.profile?.bio || '',
    linkedin: user?.profile?.linkedin || '',
    github: user?.profile?.github || '',
    website: user?.profile?.website || '',
    skills: user?.skills?.length
      ? user.skills.map(s => ({ name: s.name, level: s.level, verified: s.verified }))
      : [{ name: '', level: 50, verified: false }],
    experience: user?.experience?.length
      ? user.experience.map(e => ({
          title: e.title || '', company: e.company || '', location: e.location || '',
          startDate: e.startDate ? e.startDate.slice(0, 10) : '', endDate: e.endDate ? e.endDate.slice(0, 10) : '',
          current: e.current || false, description: e.description || ''
        }))
      : [],
    education: user?.education?.length
      ? user.education.map(ed => ({ degree: ed.degree || '', institution: ed.institution || '', year: ed.year || '', gpa: ed.gpa || '' }))
      : [],
  });

  const [formData, setFormData] = useState(buildFormData());

  useEffect(() => {
    setFormData(buildFormData());
    // eslint-disable-next-line
  }, [user]);

  const displayName = user?.name || 'Your Name';
  const displayEmail = user?.email || 'email@example.com';
  const displayPhone = user?.phone || '';
  const displayLocation = [user?.location?.city, user?.location?.state, user?.location?.country].filter(Boolean).join(', ') || 'Location not set';
  const displayTitle = user?.profile?.title || 'Your Title';
  const displayBio = user?.profile?.bio || 'Tell us about yourself...';
  const displayAvatar = user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=2E073F&color=fff&size=150`;
  const displaySkills = user?.skills?.length ? user.skills : [];
  const displayExperience = user?.experience?.length ? user.experience : [];
  const displayEducation = user?.education?.length ? user.education : [];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setFormData(prev => {
      const arr = [...prev[arrayName]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [arrayName]: arr };
    });
  };

  const addArrayItem = (arrayName, template) => {
    setFormData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], template] }));
  };

  const removeArrayItem = (arrayName, index) => {
    setFormData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const profilePayload = {
        name: formData.name,
        phone: formData.phone,
        location: { city: formData.locationCity, state: formData.locationState, country: formData.locationCountry },
        profile: { title: formData.title, bio: formData.bio, linkedin: formData.linkedin, github: formData.github, website: formData.website },
        education: formData.education.filter(ed => ed.degree || ed.institution),
        experience: formData.experience.filter(exp => exp.title || exp.company),
      };

      const profileRes = await api.put('/users/profile', profilePayload);

      const validSkills = formData.skills.filter(s => s.name.trim());
      if (validSkills.length > 0) {
        await api.put('/users/skills', { skills: validSkills });
      }

      updateUser(profileRes.data.data);
      setIsEditing(false);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to save profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(buildFormData());
    setIsEditing(false);
    setMessage({ text: '', type: '' });
  };

  const inputStyle = {
    width: '100%', padding: '0.5rem 0.7rem', borderRadius: '8px',
    border: '1.5px solid #d8b4fe', outline: 'none', fontSize: '0.82rem',
    fontFamily: "'Inter', sans-serif", background: '#faf5ff', color: '#1f2937',
    boxSizing: 'border-box'
  };
  const textareaStyle = { ...inputStyle, minHeight: '70px', resize: 'vertical' };
  const labelStyle = { fontSize: '0.72rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.2rem', display: 'block' };

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
    headerActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    editBtn: { padding: '0.5rem 1rem', background: 'white', color: '#2E073F', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 3px 10px rgba(139,92,246,0.2)', fontSize: '0.8rem' },
    saveBtn: { padding: '0.5rem 1rem', background: '#10b981', color: 'white', borderRadius: '10px', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', boxShadow: '0 3px 10px rgba(16,185,129,0.3)', fontSize: '0.8rem' },
    socialLinks: { display: 'flex', gap: '0.5rem', marginTop: '0.65rem' },
    socialBtn: { width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' },
    tabs: { display: 'flex', gap: '0.35rem', marginBottom: '1rem', background: '#f5f3ff', padding: '0.35rem', borderRadius: '12px', width: 'fit-content' },
    tab: (active) => ({ padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: active ? 'white' : 'transparent', color: active ? '#2E073F' : '#6b7280', fontWeight: 600, cursor: 'pointer', boxShadow: active ? '0 3px 10px rgba(139,92,246,0.15)' : 'none', textTransform: 'capitalize', fontSize: '0.75rem' }),
    grid: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1rem' },
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
    eduItem: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: '#faf5ff', borderRadius: '10px', border: '1px solid #ede9fe', marginBottom: '0.5rem' },
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
    statLabel: { fontSize: '0.65rem', color: '#6b7280' },
    message: (type) => ({ padding: '0.6rem 1rem', borderRadius: '10px', marginBottom: '1rem', fontSize: '0.82rem', fontWeight: 500, background: type === 'success' ? '#d1fae5' : '#fee2e2', color: type === 'success' ? '#065f46' : '#991b1b', border: `1px solid ${type === 'success' ? '#6ee7b7' : '#fca5a5'}` }),
    formRow: { display: 'flex', gap: '0.75rem', marginBottom: '0.65rem', flexWrap: 'wrap' },
    formGroup: { flex: 1, minWidth: '180px' },
    deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center' },
    editableCard: { background: '#fefcff', border: '1.5px dashed #d8b4fe', borderRadius: '14px', padding: '1rem', marginBottom: '0.65rem' },
  };

  const verifiedCount = displaySkills.filter(s => s.verified).length;

  return (
    <div style={styles.container}>
      {message.text && (
        <motion.div style={styles.message(message.type)} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          {message.text}
        </motion.div>
      )}

      {/* Profile Header */}
      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={styles.headerPattern} />
        <div style={styles.headerContent}>
          <div style={styles.avatarContainer}>
            <img src={displayAvatar} alt={displayName} style={styles.avatar} />
            {isEditing && <div style={styles.avatarEdit}><Camera size={16} color="#2E073F" /></div>}
          </div>
          <div style={styles.headerInfo}>
            {isEditing ? (
              <>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>Name</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.name} onChange={e => handleChange('name', e.target.value)} placeholder="Full Name" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>Title</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.title} onChange={e => handleChange('title', e.target.value)} placeholder="e.g. Full Stack Developer" />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>Phone</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.phone} onChange={e => handleChange('phone', e.target.value)} placeholder="+91 ..." />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>City</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.locationCity} onChange={e => handleChange('locationCity', e.target.value)} placeholder="City" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>State</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.locationState} onChange={e => handleChange('locationState', e.target.value)} placeholder="State" />
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>LinkedIn</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.linkedin} onChange={e => handleChange('linkedin', e.target.value)} placeholder="linkedin.com/in/you" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>GitHub</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.github} onChange={e => handleChange('github', e.target.value)} placeholder="github.com/you" />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={{ ...labelStyle, color: '#e9d5ff' }}>Website</label>
                    <input style={{ ...inputStyle, background: 'rgba(255,255,255,0.15)', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }} value={formData.website} onChange={e => handleChange('website', e.target.value)} placeholder="yoursite.dev" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <h1 style={styles.name}>{displayName}</h1>
                <p style={styles.title}>{displayTitle}</p>
                <div style={styles.headerMeta}>
                  <div style={styles.metaItem}><Mail size={16} /> {displayEmail}</div>
                  <div style={styles.metaItem}><MapPin size={16} /> {displayLocation}</div>
                  {displayPhone && <div style={styles.metaItem}><Phone size={16} /> {displayPhone}</div>}
                </div>
                <div style={styles.socialLinks}>
                  <div style={styles.socialBtn}><Linkedin size={18} /></div>
                  <div style={styles.socialBtn}><Github size={18} /></div>
                  <div style={styles.socialBtn}><Globe size={18} /></div>
                </div>
              </>
            )}
          </div>
          <div style={styles.headerActions}>
            {isEditing ? (
              <>
                <button style={styles.saveBtn} onClick={handleSave} disabled={isSaving}>
                  <Save size={18} /> {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button style={styles.editBtn} onClick={handleCancel}>
                  <X size={18} /> Cancel
                </button>
              </>
            ) : (
              <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                <Edit2 size={18} /> Edit Profile
              </button>
            )}
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
        <div>
          {/* About Section */}
          {(activeTab === 'overview' || activeTab === 'skills') && (
            <motion.div style={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 style={styles.cardTitle}>About Me</h3>
              {isEditing ? (
                <textarea style={textareaStyle} value={formData.bio} onChange={e => handleChange('bio', e.target.value)} placeholder="Write a short bio..." />
              ) : (
                <p style={styles.bio}>{displayBio}</p>
              )}
            </motion.div>
          )}

          {/* Skills Section */}
          {(activeTab === 'overview' || activeTab === 'skills') && (
            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <h3 style={styles.cardTitle}>
                Skills
                {isEditing && (
                  <button style={styles.addBtn} onClick={() => addArrayItem('skills', { name: '', level: 50, verified: false })}>
                    <Plus size={16} />
                  </button>
                )}
              </h3>
              {isEditing ? (
                formData.skills.map((skill, idx) => (
                  <div key={idx} style={{ ...styles.editableCard, display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                    <div style={{ flex: 2 }}>
                      <label style={labelStyle}>Skill Name</label>
                      <input style={inputStyle} value={skill.name} onChange={e => handleArrayChange('skills', idx, 'name', e.target.value)} placeholder="e.g. React" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Level ({skill.level}%)</label>
                      <input type="range" min="0" max="100" value={skill.level} onChange={e => handleArrayChange('skills', idx, 'level', Number(e.target.value))} style={{ width: '100%', accentColor: '#2E073F' }} />
                    </div>
                    <button style={styles.deleteBtn} onClick={() => removeArrayItem('skills', idx)}><Trash2 size={16} /></button>
                  </div>
                ))
              ) : (
                displaySkills.length > 0 ? displaySkills.map((skill, idx) => (
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
                )) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>No skills added yet. Click "Edit Profile" to add your skills.</p>
                )
              )}
            </motion.div>
          )}

          {/* Experience Section */}
          {(activeTab === 'overview' || activeTab === 'experience') && (
            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 style={styles.cardTitle}>
                Experience
                {isEditing && (
                  <button style={styles.addBtn} onClick={() => addArrayItem('experience', { title: '', company: '', location: '', startDate: '', endDate: '', current: false, description: '' })}>
                    <Plus size={16} />
                  </button>
                )}
              </h3>
              {isEditing ? (
                formData.experience.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>No experience added. Click + to add.</p>
                ) : formData.experience.map((exp, idx) => (
                  <div key={idx} style={styles.editableCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#2E073F' }}>Experience #{idx + 1}</span>
                      <button style={styles.deleteBtn} onClick={() => removeArrayItem('experience', idx)}><Trash2 size={16} /></button>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Job Title</label>
                        <input style={inputStyle} value={exp.title} onChange={e => handleArrayChange('experience', idx, 'title', e.target.value)} placeholder="e.g. Software Engineer" />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Company</label>
                        <input style={inputStyle} value={exp.company} onChange={e => handleArrayChange('experience', idx, 'company', e.target.value)} placeholder="Company name" />
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Location</label>
                        <input style={inputStyle} value={exp.location} onChange={e => handleArrayChange('experience', idx, 'location', e.target.value)} placeholder="City, Country" />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Start Date</label>
                        <input type="date" style={inputStyle} value={exp.startDate} onChange={e => handleArrayChange('experience', idx, 'startDate', e.target.value)} />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>End Date</label>
                        <input type="date" style={inputStyle} value={exp.endDate} onChange={e => handleArrayChange('experience', idx, 'endDate', e.target.value)} disabled={exp.current} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '0.5rem' }}>
                      <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={exp.current} onChange={e => handleArrayChange('experience', idx, 'current', e.target.checked)} style={{ accentColor: '#2E073F' }} />
                        Currently working here
                      </label>
                    </div>
                    <div>
                      <label style={labelStyle}>Description</label>
                      <textarea style={textareaStyle} value={exp.description} onChange={e => handleArrayChange('experience', idx, 'description', e.target.value)} placeholder="Describe your role..." />
                    </div>
                  </div>
                ))
              ) : (
                displayExperience.length > 0 ? displayExperience.map((exp, idx) => (
                  <div key={idx} style={styles.expItem}>
                    <div style={styles.expDot} />
                    <div style={styles.expTitle}>{exp.title}</div>
                    <div style={styles.expCompany}>{exp.company}</div>
                    <div style={styles.expMeta}>{exp.location} {exp.startDate && `• ${new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - ${exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}`}</div>
                    <div style={styles.expDesc}>{exp.description}</div>
                  </div>
                )) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>No experience added yet. Click "Edit Profile" to add.</p>
                )
              )}
            </motion.div>
          )}

          {/* Education Section */}
          {(activeTab === 'overview' || activeTab === 'education') && (
            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <h3 style={styles.cardTitle}>
                Education
                {isEditing && (
                  <button style={styles.addBtn} onClick={() => addArrayItem('education', { degree: '', institution: '', year: '', gpa: '' })}>
                    <Plus size={16} />
                  </button>
                )}
              </h3>
              {isEditing ? (
                formData.education.length === 0 ? (
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>No education added. Click + to add.</p>
                ) : formData.education.map((edu, idx) => (
                  <div key={idx} style={styles.editableCard}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#2E073F' }}>Education #{idx + 1}</span>
                      <button style={styles.deleteBtn} onClick={() => removeArrayItem('education', idx)}><Trash2 size={16} /></button>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Degree</label>
                        <input style={inputStyle} value={edu.degree} onChange={e => handleArrayChange('education', idx, 'degree', e.target.value)} placeholder="e.g. B.Tech IT" />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Institution</label>
                        <input style={inputStyle} value={edu.institution} onChange={e => handleArrayChange('education', idx, 'institution', e.target.value)} placeholder="School/University" />
                      </div>
                    </div>
                    <div style={styles.formRow}>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>Year</label>
                        <input style={inputStyle} value={edu.year} onChange={e => handleArrayChange('education', idx, 'year', e.target.value)} placeholder="e.g. 2023 - 2027" />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={labelStyle}>GPA / Percentage</label>
                        <input style={inputStyle} value={edu.gpa} onChange={e => handleArrayChange('education', idx, 'gpa', e.target.value)} placeholder="e.g. 8.5 CGPA" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                displayEducation.length > 0 ? displayEducation.map((edu, idx) => (
                  <div key={idx} style={styles.eduItem}>
                    <div style={styles.eduIcon}><GraduationCap size={24} /></div>
                    <div style={styles.eduInfo}>
                      <div style={styles.eduDegree}>{edu.degree}</div>
                      <div style={styles.eduSchool}>{edu.institution}</div>
                      <div style={styles.eduMeta}>{edu.year} {edu.gpa && `• GPA: ${edu.gpa}`}</div>
                    </div>
                  </div>
                )) : (
                  <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic' }}>No education added yet. Click "Edit Profile" to add.</p>
                )
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          {/* Stats */}
          <motion.div style={styles.card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 style={styles.cardTitle}>Quick Stats</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{user?.skillReadinessScore?.score || 0}%</div>
                <div style={styles.statLabel}>Readiness Score</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{verifiedCount}</div>
                <div style={styles.statLabel}>Verified Skills</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{displaySkills.length}</div>
                <div style={styles.statLabel}>Total Skills</div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statValue}>{displayEducation.length}</div>
                <div style={styles.statLabel}>Education</div>
              </div>
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div style={styles.card} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h3 style={styles.cardTitle}>Account Info</h3>
            <div style={{ fontSize: '0.78rem', color: '#4b5563' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Role</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{user?.role || 'Student'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#6b7280' }}>Email</span>
                <span style={{ fontWeight: 500 }}>{user?.email || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span style={{ color: '#6b7280' }}>Joined</span>
                <span style={{ fontWeight: 500 }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
