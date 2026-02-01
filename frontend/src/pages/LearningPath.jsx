import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Route, Target, CheckCircle, Clock, BookOpen, Award, ChevronRight,
  Play, Lock, TrendingUp, Zap, Star, ArrowRight, AlertCircle, Gift,
  Trophy, Sparkles, ChevronDown, ExternalLink, X, ArrowLeft, Download
} from 'lucide-react';

const LearningPath = () => {
  const [selectedPath, setSelectedPath] = useState('software-engineer');
  const [showMilestoneDetails, setShowMilestoneDetails] = useState(null); // Full page view
  const [showCertificates, setShowCertificates] = useState(false);

  const paths = [
    { id: 'software-engineer', title: 'Software Engineer', progress: 68, totalSkills: 12, completedSkills: 8, icon: '💻', estimatedTime: '3 months', jobsAvailable: 234 },
    { id: 'frontend-dev', title: 'Frontend Developer', progress: 45, totalSkills: 10, completedSkills: 4, icon: '🎨', estimatedTime: '2 months', jobsAvailable: 189 },
    { id: 'data-scientist', title: 'Data Scientist', progress: 25, totalSkills: 15, completedSkills: 3, icon: '📊', estimatedTime: '4 months', jobsAvailable: 156 }
  ];

  const milestones = [
    { id: 1, title: 'Foundation', status: 'completed', skills: ['HTML/CSS', 'JavaScript Basics', 'Git'], progress: 100, reward: '🏆 Foundation Badge', courses: 3, hours: 15, certificate: 'Web Fundamentals' },
    { id: 2, title: 'Core Development', status: 'completed', skills: ['React.js', 'Node.js', 'Databases'], progress: 100, reward: '🏆 Full Stack Badge', courses: 4, hours: 25, certificate: 'Full Stack Developer' },
    { id: 3, title: 'Advanced Concepts', status: 'in-progress', skills: ['System Design', 'Data Structures', 'Algorithms'], progress: 65, reward: '🏆 Problem Solver Badge', courses: 5, hours: 30, certificate: null },
    { id: 4, title: 'Specialization', status: 'locked', skills: ['Cloud Architecture', 'Microservices', 'DevOps'], progress: 0, reward: '🏆 Cloud Expert Badge', courses: 4, hours: 20, certificate: null },
    { id: 5, title: 'Expert Level', status: 'locked', skills: ['Leadership', 'Architecture Patterns', 'Optimization'], progress: 0, reward: '🏆 Expert Badge', courses: 3, hours: 15, certificate: null }
  ];

  const skillGaps = [
    { skill: 'System Design', current: 40, required: 80, priority: 'high' },
    { skill: 'Data Structures', current: 55, required: 75, priority: 'medium' },
    { skill: 'Cloud Computing', current: 20, required: 60, priority: 'low' }
  ];

  const recommendations = [
    { id: 1, title: 'Complete System Design Course', type: 'course', impact: '+15% match', icon: '📚', action: 'Start' },
    { id: 2, title: 'Practice LeetCode Daily', type: 'practice', impact: '+10% match', icon: '💪', action: 'Practice' },
    { id: 3, title: 'AWS Certification', type: 'certificate', impact: '+20% match', icon: '🎓', action: 'Enroll' }
  ];

  const earnedCertificates = [
    { id: 1, name: 'Web Fundamentals', issuer: 'SkillForge', date: '15 Nov 2024', image: '🎓', skills: ['HTML/CSS', 'JavaScript Basics', 'Git'], hours: 15, grade: 'A' },
    { id: 2, name: 'Full Stack Developer', issuer: 'SkillForge', date: '28 Nov 2024', image: '🏅', skills: ['React.js', 'Node.js', 'Databases'], hours: 25, grade: 'A+' }
  ];

  // Download Certificate as PDF with real content
  const downloadCertificate = (cert) => {
    // Create downloadable HTML file
    const certificateHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cert.name} - Certificate</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Open+Sans:wght@400;600&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 40px; }
    .certificate { width: 800px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%); padding: 40px; text-align: center; color: white; }
    .logo { font-size: 24px; margin-bottom: 10px; }
    .header h1 { font-family: 'Playfair Display', serif; font-size: 36px; letter-spacing: 3px; margin-bottom: 5px; }
    .header p { opacity: 0.9; font-size: 14px; letter-spacing: 2px; }
    .body { padding: 50px; text-align: center; }
    .presented { color: #6b7280; font-size: 14px; margin-bottom: 10px; }
    .name { font-family: 'Playfair Display', serif; font-size: 42px; color: #111827; border-bottom: 3px solid #10b981; display: inline-block; padding-bottom: 10px; margin-bottom: 30px; }
    .course-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #10b981; border-radius: 15px; padding: 25px; margin: 30px 0; }
    .course-title { font-size: 24px; font-weight: 700; color: #059669; margin-bottom: 10px; }
    .course-desc { color: #047857; font-size: 14px; }
    .skills { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 25px 0; }
    .skill { background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #6d28d9; padding: 8px 20px; border-radius: 25px; font-weight: 600; font-size: 13px; }
    .footer { display: flex; justify-content: space-between; align-items: flex-end; padding: 30px 50px; background: #f9fafb; }
    .signature { text-align: center; }
    .sig-line { width: 150px; height: 2px; background: #374151; margin: 0 auto 8px; }
    .sig-name { font-weight: 600; color: #374151; font-size: 14px; }
    .sig-title { color: #6b7280; font-size: 12px; }
    .seal { width: 90px; height: 90px; border: 4px solid #f59e0b; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .seal-text { font-size: 10px; color: #92400e; font-weight: 700; }
    .seal-grade { font-size: 28px; color: #d97706; font-weight: 700; }
    .date-box { text-align: center; }
    .date-label { font-size: 11px; color: #6b7280; margin-bottom: 5px; }
    .date-value { font-size: 16px; font-weight: 600; color: #111827; }
    .cert-id { font-size: 11px; color: #9ca3af; margin-top: 8px; }
    .print-btn { display: block; margin: 20px auto; padding: 15px 40px; background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; }
    .print-btn:hover { transform: scale(1.05); }
    @media print { .print-btn { display: none; } body { background: white; padding: 0; } .certificate { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div class="logo">🎓 SkillForge Academy</div>
      <h1>CERTIFICATE</h1>
      <p>OF COMPLETION</p>
    </div>
    <div class="body">
      <p class="presented">This is to certify that</p>
      <div class="name">Student Name</div>
      <p style="color: #6b7280; margin-bottom: 20px;">has successfully completed the course</p>
      <div class="course-box">
        <div class="course-title">${cert.name}</div>
        <div class="course-desc">Completed ${cert.hours} hours of comprehensive training with excellence</div>
      </div>
      <p style="color: #6b7280; margin-bottom: 10px;">Skills Acquired:</p>
      <div class="skills">
        ${cert.skills.map(s => `<span class="skill">${s}</span>`).join('')}
      </div>
    </div>
    <div class="footer">
      <div class="signature">
        <div class="sig-line"></div>
        <div class="sig-name">Dr. Sarah Johnson</div>
        <div class="sig-title">Director of Education</div>
      </div>
      <div class="seal">
        <div class="seal-text">GRADE</div>
        <div class="seal-grade">${cert.grade}</div>
        <div class="seal-text">CERTIFIED</div>
      </div>
      <div class="date-box">
        <div class="date-label">Date of Completion</div>
        <div class="date-value">${cert.date}</div>
        <div class="cert-id">Certificate ID: SF-${cert.id}${Date.now().toString().slice(-6)}</div>
      </div>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">📄 Print / Save as PDF</button>
</body>
</html>`;
    
    // Create blob and download
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.name.replace(/\s+/g, '_')}_Certificate.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Also open in new window for immediate viewing
    window.open(url, '_blank');
  };

  const currentCourses = [
    { title: 'System Design Fundamentals', progress: 75, timeLeft: '4 hours', provider: 'Educative', image: '🖥️' },
    { title: 'Advanced Data Structures', progress: 45, timeLeft: '8 hours', provider: 'LeetCode', image: '📊' },
    { title: 'Cloud Computing Basics', progress: 20, timeLeft: '12 hours', provider: 'AWS', image: '☁️' }
  ];

  const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: '2rem' },
    title: { fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', fontSize: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '2rem' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    pathCard: (selected) => ({
      background: selected ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)' : 'white',
      borderRadius: '16px', padding: '1.25rem', cursor: 'pointer', transition: 'all 0.3s',
      border: selected ? 'none' : '1px solid #ede9fe', boxShadow: selected ? '0 8px 25px rgba(139,92,246,0.3)' : '0 2px 10px rgba(139,92,246,0.08)'
    }),
    pathHeader: { display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' },
    pathIcon: { fontSize: '1.5rem' },
    pathTitle: (selected) => ({ fontSize: '1.1rem', fontWeight: 600, color: selected ? 'white' : '#1f2937' }),
    pathStats: (selected) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: selected ? 'rgba(255,255,255,0.9)' : '#6b7280', fontSize: '0.85rem', marginBottom: '0.5rem' }),
    pathMeta: (selected) => ({ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: selected ? 'rgba(255,255,255,0.8)' : '#9ca3af' }),
    pathProgress: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    progressMini: (selected) => ({ width: '60px', height: '6px', background: selected ? 'rgba(255,255,255,0.3)' : '#ede9fe', borderRadius: '3px', overflow: 'hidden' }),
    progressMiniFill: (selected, progress) => ({ width: `${progress}%`, height: '100%', background: selected ? 'white' : '#7c3aed', borderRadius: '3px' }),
    // Skill Gap Section
    skillGapCard: { background: 'white', borderRadius: '16px', padding: '1.25rem', marginTop: '1rem', boxShadow: '0 2px 10px rgba(139,92,246,0.08)', border: '1px solid #ede9fe' },
    skillGapTitle: { fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    skillGapItem: { marginBottom: '1rem' },
    skillGapHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' },
    skillName: { fontWeight: 500, color: '#374151', fontSize: '0.85rem' },
    skillPriority: (priority) => ({ padding: '0.15rem 0.5rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 600, background: priority === 'high' ? '#fee2e2' : priority === 'medium' ? '#fef3c7' : '#d1fae5', color: priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#059669' }),
    skillGapBar: { height: '8px', background: '#ede9fe', borderRadius: '4px', overflow: 'hidden', position: 'relative' },
    skillGapFill: (current) => ({ position: 'absolute', height: '100%', width: `${current}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '4px' }),
    skillGapTarget: (required) => ({ position: 'absolute', height: '100%', width: '3px', left: `${required}%`, background: '#10b981' }),
    // Recommendations
    recsCard: { background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '16px', padding: '1.25rem', marginTop: '1rem', border: '2px solid #c4b5fd' },
    recsTitle: { fontSize: '1rem', fontWeight: 700, color: '#5b21b6', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    recItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'white', borderRadius: '10px', marginBottom: '0.5rem' },
    recIcon: { fontSize: '1.25rem' },
    recInfo: { flex: 1 },
    recTitle: { fontWeight: 600, fontSize: '0.85rem', color: '#1f2937' },
    recImpact: { fontSize: '0.75rem', color: '#10b981', fontWeight: 500 },
    recBtn: { padding: '0.4rem 0.75rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' },
    // Main Content
    mainContent: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
    progressCard: { background: 'white', borderRadius: '20px', padding: '2rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', display: 'flex', gap: '2rem', alignItems: 'center', border: '1px solid #ede9fe' },
    progressCircle: { width: '140px', height: '140px', flexShrink: 0 },
    progressInfo: { flex: 1 },
    progressTitle: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem' },
    progressSubtitle: { color: '#6b7280', marginBottom: '1rem' },
    statsRow: { display: 'flex', gap: '1.5rem' },
    statBox: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
    statIcon: (color) => ({ width: '40px', height: '40px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statInfo: {},
    statValue: { fontWeight: 700, color: '#1f2937', fontSize: '1.25rem' },
    statLabel: { color: '#6b7280', fontSize: '0.75rem' },
    certsBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', marginTop: '1rem', boxShadow: '0 4px 15px rgba(139,92,246,0.3)' },
    section: { background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(139,92,246,0.08)', border: '1px solid #ede9fe' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    sectionTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    timeline: { position: 'relative', paddingLeft: '2rem' },
    timelineLine: { position: 'absolute', left: '11px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(180deg, #10b981, #7c3aed, #ede9fe)' },
    milestone: { position: 'relative', marginBottom: '1.5rem' },
    milestoneIcon: (status) => ({
      position: 'absolute', left: '-2rem', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: status === 'completed' ? '#10b981' : status === 'in-progress' ? '#7c3aed' : '#ede9fe',
      color: status === 'locked' ? '#a78bfa' : 'white', zIndex: 1
    }),
    milestoneContent: (status) => ({
      background: status === 'in-progress' ? 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.08) 100%)' : status === 'completed' ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.08) 100%)' : '#faf5ff',
      borderRadius: '12px', padding: '1rem', border: status === 'in-progress' ? '2px solid #7c3aed' : status === 'completed' ? '2px solid #10b981' : '1px solid #ede9fe', cursor: 'pointer', transition: 'all 0.2s'
    }),
    milestoneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
    milestoneTitle: { fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    milestoneMeta: { display: 'flex', gap: '1rem', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' },
    milestoneBadge: (status) => ({
      padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.7rem', fontWeight: 600,
      background: status === 'completed' ? '#d1fae5' : status === 'in-progress' ? '#f5f3ff' : '#faf5ff',
      color: status === 'completed' ? '#059669' : status === 'in-progress' ? '#7c3aed' : '#a78bfa'
    }),
    skillsList: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
    skillChip: (status) => ({
      padding: '0.25rem 0.625rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500,
      background: status === 'completed' ? '#d1fae5' : status === 'in-progress' ? '#f5f3ff' : '#faf5ff',
      color: status === 'completed' ? '#059669' : status === 'in-progress' ? '#7c3aed' : '#a78bfa'
    }),
    rewardText: { display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 500, marginTop: '0.5rem' },
    coursesList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    courseItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#faf5ff', borderRadius: '12px', border: '1px solid #ede9fe' },
    courseIcon: { width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem' },
    courseInfo: { flex: 1 },
    courseTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.25rem' },
    courseMeta: { display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#6b7280' },
    courseProgress: { width: '100px' },
    progressBar: { height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.25rem' },
    progressFill: (progress) => ({ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #7c3aed 0%, #8b5cf6 100%)', borderRadius: '3px' }),
    progressText: { fontSize: '0.75rem', color: '#7c3aed', fontWeight: 600, textAlign: 'right' },
    continueBtn: { padding: '0.5rem 1rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' },
    // Certificate Modal
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    certModal: { background: 'white', borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '500px' },
    certModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    certModalTitle: { fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    closeBtn: { background: '#f5f3ff', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', color: '#7c3aed' },
    certCard: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '12px', border: '2px solid #10b981', marginBottom: '1rem' },
    certIcon: { fontSize: '2.5rem' },
    certInfo: { flex: 1 },
    certName: { fontWeight: 700, color: '#1f2937' },
    certIssuer: { fontSize: '0.85rem', color: '#6b7280' },
    certDate: { fontSize: '0.75rem', color: '#9ca3af' },
    downloadBtn: { padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '0 4px 12px rgba(139,92,246,0.25)' },
    // Milestone Details Full Page
    milestoneFullPage: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(135deg, #faf5ff 0%, #f5f3ff 100%)', zIndex: 1000, overflowY: 'auto' },
    milestonePageContent: { maxWidth: '900px', margin: '0 auto', padding: '2rem' },
    milestoneModal: { background: 'white', borderRadius: '20px', padding: '1.5rem', width: '100%', maxWidth: '550px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' },
    milestoneModalHeader: (status) => ({
      background: status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' : status === 'in-progress' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#a78bfa',
      borderRadius: '12px', padding: '1.5rem', color: 'white', marginBottom: '1.5rem', textAlign: 'center'
    }),
    milestoneModalTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' },
    milestoneModalMeta: { display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: 0.9, fontSize: '0.9rem' },
    skillsSection: { marginBottom: '1.5rem' },
    skillsSectionTitle: { fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    skillDetailItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#faf5ff', borderRadius: '10px', marginBottom: '0.5rem' },
    skillDetailIcon: (completed) => ({
      width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: completed ? '#10b981' : 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white'
    }),
    skillDetailInfo: { flex: 1 },
    skillDetailName: { fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' },
    skillDetailDesc: { fontSize: '0.8rem', color: '#6b7280' },
    resourcesSection: { marginBottom: '1.5rem' },
    resourceItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', border: '1px solid #ede9fe', borderRadius: '10px', marginBottom: '0.5rem', cursor: 'pointer' },
    resourceIcon: { fontSize: '1.5rem' },
    resourceInfo: { flex: 1 },
    resourceTitle: { fontWeight: 600, color: '#1f2937', fontSize: '0.9rem' },
    resourceType: { fontSize: '0.75rem', color: '#6b7280' },
    startBtn: (status) => ({
      width: '100%', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: status === 'locked' ? 'not-allowed' : 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
      background: status === 'completed' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : status === 'in-progress' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#ede9fe',
      color: status === 'locked' ? '#a78bfa' : 'white', boxShadow: status !== 'locked' ? '0 4px 15px rgba(139,92,246,0.3)' : 'none'
    })
  };

  // Skill details for milestones
  const milestoneSkillDetails = {
    'HTML/CSS': { desc: 'Structure and style web pages', completed: true },
    'JavaScript Basics': { desc: 'Programming fundamentals', completed: true },
    'Git': { desc: 'Version control system', completed: true },
    'React.js': { desc: 'Frontend framework', completed: true },
    'Node.js': { desc: 'Backend JavaScript runtime', completed: true },
    'Databases': { desc: 'SQL and NoSQL databases', completed: true },
    'System Design': { desc: 'Scalable system architecture', completed: false },
    'Data Structures': { desc: 'Arrays, trees, graphs', completed: true },
    'Algorithms': { desc: 'Sorting, searching, DP', completed: false },
    'Cloud Architecture': { desc: 'AWS, Azure services', completed: false },
    'Microservices': { desc: 'Distributed systems', completed: false },
    'DevOps': { desc: 'CI/CD, Docker, K8s', completed: false },
    'Leadership': { desc: 'Team management', completed: false },
    'Architecture Patterns': { desc: 'Design patterns', completed: false },
    'Optimization': { desc: 'Performance tuning', completed: false }
  };

  const milestoneResources = [
    { id: 1, title: 'Video Lectures', type: 'video', icon: '🎬', count: 12 },
    { id: 2, title: 'Practice Problems', type: 'practice', icon: '💻', count: 25 },
    { id: 3, title: 'Study Materials', type: 'pdf', icon: '📄', count: 5 },
    { id: 4, title: 'Quiz & Assessment', type: 'quiz', icon: '✅', count: 3 }
  ];

  const currentPath = paths.find(p => p.id === selectedPath);

  return (
    <div style={styles.container}>
      <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={styles.title}>Adaptive Learning Path</h1>
        <p style={styles.subtitle}>Personalized roadmap tailored to your career goals</p>
      </motion.div>

      <div style={styles.grid}>
        {/* Sidebar - Path Selection */}
        <div style={styles.sidebar}>
          {paths.map((path, index) => (
            <motion.div key={path.id} style={styles.pathCard(selectedPath === path.id)} onClick={() => setSelectedPath(path.id)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }}>
              <div style={styles.pathHeader}>
                <span style={styles.pathIcon}>{path.icon}</span>
                <h3 style={styles.pathTitle(selectedPath === path.id)}>{path.title}</h3>
              </div>
              <div style={styles.pathStats(selectedPath === path.id)}>
                <span>{path.completedSkills}/{path.totalSkills} skills</span>
                <div style={styles.pathProgress}>
                  <div style={styles.progressMini(selectedPath === path.id)}>
                    <div style={styles.progressMiniFill(selectedPath === path.id, path.progress)} />
                  </div>
                  <span>{path.progress}%</span>
                </div>
              </div>
              <div style={styles.pathMeta(selectedPath === path.id)}>
                <span>⏱ {path.estimatedTime}</span>
                <span>💼 {path.jobsAvailable} jobs</span>
              </div>
            </motion.div>
          ))}

          {/* Skill Gap Analysis */}
          <motion.div style={styles.skillGapCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={styles.skillGapTitle}>
              <AlertCircle size={18} color="#f59e0b" /> Skill Gap Analysis
            </div>
            {skillGaps.map((gap, index) => (
              <div key={gap.skill} style={styles.skillGapItem}>
                <div style={styles.skillGapHeader}>
                  <span style={styles.skillName}>{gap.skill}</span>
                  <span style={styles.skillPriority(gap.priority)}>{gap.priority}</span>
                </div>
                <div style={styles.skillGapBar}>
                  <div style={styles.skillGapFill(gap.current)} />
                  <div style={styles.skillGapTarget(gap.required)} title={`Required: ${gap.required}%`} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  <span>Current: {gap.current}%</span>
                  <span>Target: {gap.required}%</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* AI Recommendations */}
          <motion.div style={styles.recsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={styles.recsTitle}>
              <Sparkles size={18} /> AI Recommendations
            </div>
            {recommendations.map((rec) => (
              <div key={rec.id} style={styles.recItem}>
                <span style={styles.recIcon}>{rec.icon}</span>
                <div style={styles.recInfo}>
                  <div style={styles.recTitle}>{rec.title}</div>
                  <div style={styles.recImpact}>{rec.impact}</div>
                </div>
                <button style={styles.recBtn}>{rec.action}</button>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Progress Overview */}
          <motion.div style={styles.progressCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={styles.progressCircle}>
              <CircularProgressbar value={currentPath?.progress || 0} text={`${currentPath?.progress || 0}%`}
                styles={buildStyles({ textSize: '22px', pathColor: '#7c3aed', textColor: '#111827', trailColor: '#ede9fe' })} />
            </div>
            <div style={styles.progressInfo}>
              <h2 style={styles.progressTitle}>{currentPath?.icon} {currentPath?.title} Path</h2>
              <p style={styles.progressSubtitle}>You're making great progress! Keep going to unlock new opportunities.</p>
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <div style={styles.statIcon('#10b981')}><CheckCircle size={20} /></div>
                  <div style={styles.statInfo}><div style={styles.statValue}>{currentPath?.completedSkills}</div><div style={styles.statLabel}>Completed</div></div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statIcon('#7c3aed')}><Target size={20} /></div>
                  <div style={styles.statInfo}><div style={styles.statValue}>{(currentPath?.totalSkills || 0) - (currentPath?.completedSkills || 0)}</div><div style={styles.statLabel}>Remaining</div></div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statIcon('#f59e0b')}><Trophy size={20} /></div>
                  <div style={styles.statInfo}><div style={styles.statValue}>{earnedCertificates.length}</div><div style={styles.statLabel}>Certificates</div></div>
                </div>
              </div>
              <button style={styles.certsBtn} onClick={() => setShowCertificates(true)}>
                <Award size={18} /> View My Certificates
              </button>
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}><Route size={22} color="#7c3aed" /> Learning Milestones</h3>
            </div>
            <div style={styles.timeline}>
              <div style={styles.timelineLine} />
              {milestones.map((milestone, index) => (
                <motion.div key={milestone.id} style={styles.milestone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                  <div style={styles.milestoneIcon(milestone.status)}>
                    {milestone.status === 'completed' ? <CheckCircle size={14} /> : milestone.status === 'in-progress' ? <Play size={12} /> : <Lock size={12} />}
                  </div>
                  <motion.div style={styles.milestoneContent(milestone.status)} whileHover={{ scale: 1.01 }} onClick={() => setShowMilestoneDetails(milestone)}>
                    <div style={styles.milestoneHeader}>
                      <span style={styles.milestoneTitle}>{milestone.title} <ChevronRight size={16} color="#9ca3af" /></span>
                      <span style={styles.milestoneBadge(milestone.status)}>{milestone.status === 'in-progress' ? `${milestone.progress}% complete` : milestone.status}</span>
                    </div>
                    <div style={styles.milestoneMeta}>
                      <span>📚 {milestone.courses} courses</span>
                      <span>⏱ {milestone.hours} hours</span>
                    </div>
                    <div style={styles.skillsList}>
                      {milestone.skills.map(skill => <span key={skill} style={styles.skillChip(milestone.status)}>{skill}</span>)}
                    </div>
                    <div style={styles.rewardText}>
                      <Gift size={14} /> Reward: {milestone.reward}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Current Courses */}
          <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}><BookOpen size={22} color="#7c3aed" /> Continue Learning</h3>
            </div>
            <div style={styles.coursesList}>
              {currentCourses.map((course) => (
                <motion.div key={course.title} style={styles.courseItem} whileHover={{ scale: 1.01 }}>
                  <div style={styles.courseIcon}>{course.image}</div>
                  <div style={styles.courseInfo}>
                    <div style={styles.courseTitle}>{course.title}</div>
                    <div style={styles.courseMeta}>
                      <span>{course.provider}</span>
                      <span>•</span>
                      <span>{course.timeLeft} left</span>
                    </div>
                  </div>
                  <div style={styles.courseProgress}>
                    <div style={styles.progressBar}><div style={styles.progressFill(course.progress)} /></div>
                    <div style={styles.progressText}>{course.progress}%</div>
                  </div>
                  <button style={styles.continueBtn}><Play size={14} /> Resume</button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Certificates Modal */}
      <AnimatePresence>
        {showCertificates && (
          <motion.div style={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCertificates(false)}>
            <motion.div style={styles.certModal} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={(e) => e.stopPropagation()}>
              <div style={styles.certModalHeader}>
                <h2 style={styles.certModalTitle}><Award size={24} color="#10b981" /> My Certificates</h2>
                <button style={styles.closeBtn} onClick={() => setShowCertificates(false)}><X size={20} /></button>
              </div>
              {earnedCertificates.map(cert => (
                <div key={cert.id} style={styles.certCard}>
                  <span style={styles.certIcon}>{cert.image}</span>
                  <div style={styles.certInfo}>
                    <div style={styles.certName}>{cert.name}</div>
                    <div style={styles.certIssuer}>{cert.issuer}</div>
                    <div style={styles.certDate}>Earned on {cert.date}</div>
                  </div>
                  <button style={styles.downloadBtn} onClick={() => downloadCertificate(cert)}><ExternalLink size={14} /> View</button>
                </div>
              ))}
              {earnedCertificates.length === 0 && (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Complete milestones to earn certificates!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Milestone Details Full Page View */}
      <AnimatePresence>
        {showMilestoneDetails && (
          <motion.div 
            style={styles.milestoneFullPage} 
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Full Page Header */}
            <div style={{ 
              background: showMilestoneDetails.status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                         showMilestoneDetails.status === 'in-progress' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#6b7280',
              padding: '1.5rem 2rem', color: 'white', position: 'sticky', top: 0, zIndex: 10
            }}>
              <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button 
                  onClick={() => setShowMilestoneDetails(null)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.2)', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '10px', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                >
                  <ArrowRight size={18} style={{ transform: 'rotate(180deg)' }} /> Back to Path
                </button>
                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                    {showMilestoneDetails.status === 'completed' ? '✅' : showMilestoneDetails.status === 'in-progress' ? '🚀' : '🔒'} {showMilestoneDetails.title}
                  </h1>
                  <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', opacity: 0.9 }}>
                    <span>📚 {showMilestoneDetails.courses} Courses</span>
                    <span>⏱ {showMilestoneDetails.hours} Hours</span>
                    <span>🏆 {showMilestoneDetails.reward.split(' ')[1]}</span>
                  </div>
                </div>
                <div style={{ width: '120px' }} />
              </div>
            </div>

            <div style={styles.milestonePageContent}>
              {/* Progress bar for in-progress */}
              {showMilestoneDetails.status === 'in-progress' && (
                <motion.div 
                  style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: '1.1rem' }}>Overall Progress</span>
                    <span style={{ fontWeight: 700, color: '#7c3aed', fontSize: '1.25rem' }}>{showMilestoneDetails.progress}%</span>
                  </div>
                  <div style={{ height: '16px', background: '#e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                    <motion.div 
                      style={{ height: '100%', background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)', borderRadius: '8px' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${showMilestoneDetails.progress}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Two Column Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Skills Section */}
                <motion.div 
                  style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={22} color="#7c3aed" /> Skills to Master
                  </h3>
                  {showMilestoneDetails.skills.map((skill, idx) => {
                    const detail = milestoneSkillDetails[skill] || { desc: 'Learn this skill', completed: false };
                    return (
                      <motion.div 
                        key={skill} 
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: detail.completed ? '#f0fdf4' : '#f9fafb', borderRadius: '12px', marginBottom: '0.75rem', border: detail.completed ? '2px solid #10b981' : '1px solid #e5e7eb' }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                      >
                        <div style={{ width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: detail.completed ? '#10b981' : '#7c3aed', color: 'white' }}>
                          {detail.completed ? <CheckCircle size={24} /> : <Target size={24} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#111827', fontSize: '1rem', marginBottom: '0.25rem' }}>{skill}</div>
                          <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{detail.desc}</div>
                        </div>
                        <span style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: detail.completed ? '#d1fae5' : '#ede9fe', color: detail.completed ? '#059669' : '#6d28d9' }}>
                          {detail.completed ? '✓ Mastered' : 'Learning'}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* Resources Section */}
                <motion.div 
                  style={{ background: 'white', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={22} color="#7c3aed" /> Learning Resources
                  </h3>
                  {milestoneResources.map((resource, idx) => (
                    <motion.div 
                      key={resource.id} 
                      style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem', border: '2px solid #e5e7eb', borderRadius: '12px', marginBottom: '0.75rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.1 }}
                      whileHover={{ borderColor: '#7c3aed', background: '#faf5ff' }}
                    >
                      <span style={{ fontSize: '2.5rem' }}>{resource.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#111827', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{resource.title}</div>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>{resource.count} items available</div>
                      </div>
                      <div style={{ padding: '0.75rem 1.25rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', borderRadius: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Start →
                      </div>
                    </motion.div>
                  ))}

                  {/* Reward Section */}
                  <motion.div 
                    style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '12px', border: '2px solid #fbbf24' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '2.5rem' }}>🏆</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#92400e', fontSize: '1.1rem' }}>Milestone Reward</div>
                        <div style={{ color: '#b45309' }}>{showMilestoneDetails.reward}</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Action Button */}
              <motion.button 
                style={{ 
                  width: '100%', marginTop: '2rem', padding: '1.25rem', border: 'none', borderRadius: '14px', 
                  fontWeight: 700, cursor: showMilestoneDetails.status === 'locked' ? 'not-allowed' : 'pointer', 
                  fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  background: showMilestoneDetails.status === 'completed' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                             showMilestoneDetails.status === 'in-progress' ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : '#ede9fe',
                  color: showMilestoneDetails.status === 'locked' ? '#9ca3af' : 'white',
                  boxShadow: showMilestoneDetails.status !== 'locked' ? '0 10px 30px rgba(124, 58, 237, 0.3)' : 'none'
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={showMilestoneDetails.status !== 'locked' ? { scale: 1.02 } : {}}
                onClick={() => setShowMilestoneDetails(null)}
              >
                {showMilestoneDetails.status === 'completed' ? (
                  <><CheckCircle size={22} /> Review Completed Milestone</>
                ) : showMilestoneDetails.status === 'in-progress' ? (
                  <><Play size={22} /> Continue Learning</>
                ) : (
                  <><Lock size={22} /> Complete Previous Milestone to Unlock</>
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPath;
