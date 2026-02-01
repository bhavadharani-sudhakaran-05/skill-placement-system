import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Brain, Target, TrendingUp, Briefcase, BookOpen, Award,
  ChevronRight, Zap, FileText, Clock, Bell, Sparkles, GraduationCap,
  Calendar, Trophy, Activity, ArrowUpRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAssessmentStore from '../store/assessmentStore';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { subscribe, getStats, fetchAssessments, lastUpdated } = useAssessmentStore();
  const [readinessScore, setReadinessScore] = useState(0);
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [jobMatchCount, setJobMatchCount] = useState(0);
  const [completedAssessments, setCompletedAssessments] = useState(0);
  const [activeCourses, setActiveCourses] = useState(0);
  const [badgesEarned, setBadgesEarned] = useState(0);
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentStats, setAssessmentStats] = useState({ completedCount: 0, averageScore: 0, badgesCount: 0 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Update assessment stats when store updates
  const updateAssessmentStats = useCallback(() => {
    const stats = getStats();
    setAssessmentStats(stats);
    setCompletedAssessments(stats.completedCount);
    setBadgesEarned(stats.badgesCount);
    // Update readiness score based on assessment average
    if (stats.averageScore > 0) {
      setReadinessScore(prev => Math.max(prev, stats.averageScore));
    }
    // Add live update for new assessment
    if (stats.recentAssessments && stats.recentAssessments.length > 0) {
      const latest = stats.recentAssessments[0];
      setLiveUpdates(prev => {
        const newUpdate = {
          id: Date.now(),
          type: 'assessment',
          message: `Completed "${latest.title}" with ${latest.score}% score!`,
          time: 'Just now',
          icon: '🎉'
        };
        return [newUpdate, ...prev.slice(0, 3)];
      });
    }
  }, [getStats]);
  
  // Subscribe to real-time assessment updates
  useEffect(() => {
    // Initial fetch
    fetchAssessments().then(() => {
      updateAssessmentStats();
    });
    
    // Subscribe to updates
    const unsubscribe = subscribe(updateAssessmentStats);
    
    return () => {
      unsubscribe();
    };
  }, [subscribe, fetchAssessments, updateAssessmentStats]);
  
  // Re-fetch stats when lastUpdated changes (real-time update trigger)
  useEffect(() => {
    if (lastUpdated) {
      updateAssessmentStats();
    }
  }, [lastUpdated, updateAssessmentStats]);

  // Fetch real user data from API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Fetch current user profile with skills
        const userRes = await api.get('/auth/me');
        const userData = userRes.data.data;
        
        // Calculate real readiness score based on verified skills
        const skills = userData.skills || [];
        const verifiedSkills = skills.filter(s => s.verified);
        const totalLevel = skills.reduce((sum, s) => sum + (s.level || 0), 0);
        const maxLevel = skills.length * 100;
        const calculatedScore = maxLevel > 0 ? Math.round((totalLevel / maxLevel) * 100) : 0;
        
        // Use the higher of calculated score or assessment average
        const stats = getStats();
        setReadinessScore(Math.max(calculatedScore, stats.averageScore));
        setUserSkills(skills);
        setBadgesEarned(Math.max(verifiedSkills.length, stats.badgesCount));
        setCompletedAssessments(stats.completedCount);
        
        // Fetch learning path progress
        try {
          const pathRes = await api.get('/learning-path/my');
          const activePath = pathRes.data.data;
          if (activePath) {
            const inProgress = activePath.courses?.filter(c => c.status === 'in-progress').length || 0;
            setActiveCourses(inProgress);
          }
        } catch {
          setActiveCourses(0);
        }
        
        // Fetch job recommendations count
        try {
          const jobsRes = await api.get('/jobs?limit=100');
          setJobMatchCount(jobsRes.data.data?.length || 0);
        } catch {
          setJobMatchCount(0);
        }
        
        // Set live updates based on actual activity
        const updates = [];
        if (stats.completedCount > 0) {
          updates.push({ id: 1, type: 'success', message: `${stats.completedCount} assessments completed with ${stats.averageScore}% avg score!`, time: 'Updated', icon: '🎯' });
        } else if (calculatedScore === 0) {
          updates.push({ id: 1, type: 'info', message: 'Complete assessments to increase your skill score!', time: 'Now', icon: '📊' });
        }
        if (skills.length > 0) {
          updates.push({ id: 2, type: 'skill', message: `${skills.length} skills detected from your resume`, time: 'From resume', icon: '📝' });
        }
        if (stats.badgesCount > 0) {
          updates.push({ id: 3, type: 'badge', message: `${stats.badgesCount} skill badges earned!`, time: 'Achievement', icon: '🏆' });
        } else {
          updates.push({ id: 3, type: 'assessment', message: 'Take skill assessments to verify your expertise', time: 'Recommended', icon: '✅' });
        }
        updates.push({ id: 4, type: 'course', message: 'Start learning to improve your placement readiness', time: 'Get started', icon: '📚' });
        setLiveUpdates(updates);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [getStats]);

  const quickStats = [
    { icon: Target, label: 'Skill Score', value: loading ? '...' : `${readinessScore}%`, trend: readinessScore > 0 ? 'Calculated' : 'Take assessments', color: '#7c3aed' },
    { icon: Briefcase, label: 'Job Matches', value: loading ? '...' : jobMatchCount.toString(), trend: 'Available', color: '#8b5cf6' },
    { icon: BookOpen, label: 'Assessments Done', value: loading ? '...' : completedAssessments.toString(), trend: completedAssessments > 0 ? `${assessmentStats.averageScore}% avg` : 'Take tests', color: '#a78bfa' },
    { icon: Award, label: 'Badges Earned', value: loading ? '...' : badgesEarned.toString(), trend: 'From assessments', color: '#c4b5fd' }
  ];

  // Skill gaps - based on resume skills that need improvement
  const skillGaps = userSkills.length > 0 ? userSkills.slice(0, 4).map(s => ({
    skill: s.skillId?.name || 'Skill',
    current: s.level || 0,
    required: 80,
    priority: s.level < 50 ? 'high' : s.level < 70 ? 'medium' : 'low',
    icon: s.level < 50 ? '🔴' : s.level < 70 ? '🟡' : '🟢'
  })) : [
    { skill: 'Complete assessments to see skill gaps', current: 0, required: 80, priority: 'high', icon: '📊' }
  ];

  const recommendedJobs = [
    { title: 'Software Engineer', company: 'Google', location: 'Bangalore', match: 92, salary: '25-35 LPA', logo: 'G', color: '#4285f4', skills: ['JavaScript', 'React', 'Node.js'], applyUrl: 'https://careers.google.com' },
    { title: 'Full Stack Developer', company: 'Microsoft', location: 'Hyderabad', match: 88, salary: '20-30 LPA', logo: 'M', color: '#00a4ef', skills: ['TypeScript', 'Azure', 'Python'], applyUrl: 'https://careers.microsoft.com' },
    { title: 'Frontend Developer', company: 'Amazon', location: 'Chennai', match: 85, salary: '18-28 LPA', logo: 'A', color: '#ff9900', skills: ['React', 'Redux', 'CSS'], applyUrl: 'https://amazon.jobs' }
  ];

  // Courses with 0 progress - real progress only after user completes
  const courses = [
    { title: 'System Design Masterclass', provider: 'Udemy', progress: 0, image: '🎯', color: '#7c3aed' },
    { title: 'Advanced Data Structures', provider: 'Coursera', progress: 0, image: '📊', color: '#8b5cf6' },
    { title: 'Cloud Architecture on AWS', provider: 'AWS', progress: 0, image: '☁️', color: '#a78bfa' }
  ];

  // Achievements - all unearned initially, earned through assessments
  const achievements = [
    { title: 'Quick Learner', icon: '🚀', earned: completedAssessments >= 1 },
    { title: 'Code Master', icon: '💻', earned: completedAssessments >= 3 },
    { title: 'Problem Solver', icon: '🧩', earned: readinessScore >= 50 },
    { title: 'Team Player', icon: '🤝', earned: false },
    { title: 'Innovator', icon: '💡', earned: readinessScore >= 80 }
  ];

  const upcomingEvents = [
    { title: 'React Assessment', date: 'Today, 3:00 PM', type: 'assessment' },
    { title: 'Mock Interview', date: 'Tomorrow, 10:00 AM', type: 'interview' },
    { title: 'AWS Certification', date: 'Feb 5, 2:00 PM', type: 'certification' }
  ];

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundDecor: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 0
    },
    decorCircle: (size, top, left, opacity) => ({
      position: 'absolute',
      width: size,
      height: size,
      borderRadius: '50%',
      background: `linear-gradient(135deg, rgba(139, 92, 246, ${opacity}), rgba(124, 58, 237, ${opacity}))`,
      top,
      left,
      filter: 'blur(60px)'
    }),
    content: {
      position: 'relative',
      zIndex: 1,
      padding: '1.5rem 2rem',
      maxWidth: '1500px',
      margin: '0 auto'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
      gap: '1rem'
    },
    welcomeSection: { flex: 1 },
    greeting: {
      fontSize: '2rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem'
    },
    subGreeting: {
      color: '#6b7280',
      fontSize: '0.95rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    timeCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '1rem 1.5rem',
      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
      border: '1px solid rgba(139, 92, 246, 0.1)',
      textAlign: 'right'
    },
    timeDisplay: {
      fontFamily: "'Space Grotesk', monospace",
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#7c3aed',
      marginBottom: '0.25rem'
    },
    dateDisplay: { fontSize: '0.85rem', color: '#6b7280' },
    tickerBar: {
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6, #a78bfa)',
      borderRadius: '12px',
      padding: '0.75rem 1.25rem',
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      color: 'white',
      overflow: 'hidden'
    },
    tickerIcon: {
      background: 'rgba(255,255,255,0.2)',
      borderRadius: '8px',
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    tickerContent: {
      display: 'flex',
      gap: '3rem',
      animation: 'scroll 25s linear infinite',
      whiteSpace: 'nowrap'
    },
    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '300px 1fr 260px',
      gap: '1.5rem',
      marginBottom: '1.5rem'
    },
    scoreCard: {
      background: 'white',
      borderRadius: '24px',
      padding: '1.5rem',
      boxShadow: '0 8px 30px rgba(139, 92, 246, 0.12)',
      border: '1px solid rgba(139, 92, 246, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    scoreTitle: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '1.25rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    progressWrapper: { width: '160px', height: '160px', marginBottom: '1rem' },
    scoreLabel: { color: '#7c3aed', fontWeight: 700, fontSize: '1.1rem', marginTop: '0.5rem' },
    scoreSubLabel: { color: '#9ca3af', fontSize: '0.85rem', marginTop: '0.25rem' },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem'
    },
    statCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '1.25rem',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.08)',
      border: '1px solid rgba(139, 92, 246, 0.06)',
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    },
    statIcon: (color) => ({
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${color}15, ${color}25)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: color,
      marginBottom: '0.75rem'
    }),
    statValue: { fontSize: '1.75rem', fontWeight: 800, color: '#1f2937', marginBottom: '0.25rem' },
    statLabel: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' },
    statTrend: { fontSize: '0.75rem', color: '#7c3aed', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' },
    sideSection: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    miniCard: {
      background: 'white',
      borderRadius: '16px',
      padding: '1rem',
      boxShadow: '0 4px 15px rgba(139, 92, 246, 0.08)',
      border: '1px solid rgba(139, 92, 246, 0.06)'
    },
    miniCardTitle: {
      fontSize: '0.9rem',
      fontWeight: 600,
      color: '#374151',
      marginBottom: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },
    achievementGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' },
    achievementItem: (earned) => ({
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '1.25rem',
      background: earned ? 'linear-gradient(135deg, #7c3aed15, #8b5cf625)' : '#f3f4f6',
      opacity: earned ? 1 : 0.5,
      cursor: 'pointer'
    }),
    eventItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.6rem 0',
      borderBottom: '1px solid #f3f4f6'
    },
    eventDot: (type) => ({
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      background: type === 'assessment' ? '#7c3aed' : type === 'interview' ? '#8b5cf6' : '#a78bfa'
    }),
    eventInfo: { flex: 1 },
    eventTitle: { fontSize: '0.85rem', fontWeight: 500, color: '#374151' },
    eventDate: { fontSize: '0.75rem', color: '#9ca3af' },
    twoColumn: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' },
    section: {
      background: 'white',
      borderRadius: '20px',
      padding: '1.25rem',
      boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)',
      border: '1px solid rgba(139, 92, 246, 0.06)'
    },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    sectionTitle: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    viewAll: { color: '#7c3aed', fontSize: '0.85rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' },
    skillItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid #f5f3ff' },
    skillIcon: { fontSize: '1.5rem', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ff', borderRadius: '10px' },
    skillInfo: { flex: 1 },
    skillName: { fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    priorityBadge: (priority) => ({
      fontSize: '0.65rem',
      fontWeight: 600,
      padding: '0.2rem 0.5rem',
      borderRadius: '10px',
      background: priority === 'high' ? '#fef2f2' : '#fefce8',
      color: priority === 'high' ? '#dc2626' : '#ca8a04'
    }),
    skillBar: { height: '8px', background: '#ede9fe', borderRadius: '4px', overflow: 'hidden' },
    skillProgress: (width, priority) => ({
      height: '100%',
      width: `${width}%`,
      background: priority === 'high' ? 'linear-gradient(90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
      borderRadius: '4px',
      transition: 'width 1s ease-out'
    }),
    skillMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.35rem' },
    jobCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem',
      background: '#faf5ff',
      borderRadius: '12px',
      marginBottom: '0.75rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      border: '1px solid transparent',
      textDecoration: 'none'
    },
    jobLogo: (color) => ({
      width: '44px',
      height: '44px',
      borderRadius: '12px',
      background: `linear-gradient(135deg, ${color}, ${color}cc)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 800,
      fontSize: '1.1rem'
    }),
    jobInfo: { flex: 1 },
    jobTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.2rem' },
    jobCompany: { fontSize: '0.8rem', color: '#6b7280' },
    jobMatch: (match) => ({
      padding: '0.35rem 0.75rem',
      borderRadius: '20px',
      fontSize: '0.8rem',
      fontWeight: 700,
      background: match >= 90 ? 'linear-gradient(135deg, #7c3aed, #8b5cf6)' : match >= 80 ? 'linear-gradient(135deg, #a78bfa, #c4b5fd)' : '#ede9fe',
      color: match >= 80 ? 'white' : '#7c3aed'
    }),
    courseCard: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.85rem',
      background: '#faf5ff',
      borderRadius: '12px',
      marginBottom: '0.75rem'
    },
    courseIcon: {
      fontSize: '1.75rem',
      width: '48px',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(139, 92, 246, 0.1)'
    },
    courseInfo: { flex: 1 },
    courseTitle: { fontSize: '0.9rem', fontWeight: 600, color: '#1f2937', marginBottom: '0.2rem' },
    courseProvider: { fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.5rem' },
    courseProgress: { height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden' },
    courseBar: (progress) => ({ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #7c3aed, #8b5cf6)', borderRadius: '3px' }),
    coursePercent: { fontSize: '0.95rem', fontWeight: 700, color: '#7c3aed', minWidth: '40px', textAlign: 'right' },
    ctaButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      width: '100%',
      padding: '0.85rem',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
      color: 'white',
      fontWeight: 600,
      fontSize: '0.9rem',
      border: 'none',
      cursor: 'pointer',
      marginTop: '0.75rem',
      textDecoration: 'none'
    }
  };

  return (
    <div style={styles.container}>
      {/* Background Decorations */}
      <div style={styles.backgroundDecor}>
        <div style={styles.decorCircle('400px', '-100px', '-100px', 0.15)} />
        <div style={styles.decorCircle('300px', '60%', '80%', 0.1)} />
        <div style={styles.decorCircle('200px', '80%', '10%', 0.12)} />
      </div>

      <div style={styles.content}>
        {/* Header */}
        <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={styles.welcomeSection}>
            <h1 style={styles.greeting}>
              <Sparkles size={28} color="#8b5cf6" />
              Welcome back, {user?.name?.split(' ')[0] || 'User'}!
            </h1>
            <p style={styles.subGreeting}>
              <Activity size={16} color="#2d1951" />
              Your career journey is progressing excellently!
            </p>
          </div>
          <div style={styles.timeCard}>
            <div style={styles.timeDisplay}>
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={styles.dateDisplay}>
              {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </motion.div>

        {/* Live Updates Ticker */}
        <motion.div style={styles.tickerBar} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div style={styles.tickerIcon}><Bell size={18} /></div>
          <div style={styles.tickerContent}>
            {liveUpdates.map(update => (
              <span key={update.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{update.icon}</span>
                <span>{update.message}</span>
                <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>• {update.time}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Main Grid */}
        <div style={styles.mainGrid}>
          {/* Left - Score Card */}
          <motion.div style={styles.scoreCard} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <div style={styles.scoreTitle}><Target size={18} color="#7c3aed" /> Skill Readiness Score</div>
            <div style={styles.progressWrapper}>
              <CircularProgressbar
                value={readinessScore}
                text={`${readinessScore}%`}
                styles={buildStyles({ textSize: '20px', pathColor: '#7c3aed', textColor: '#1f2937', trailColor: '#ede9fe', pathTransitionDuration: 1.5 })}
              />
            </div>
            <div style={styles.scoreLabel}>Excellent Performance!</div>
            <div style={styles.scoreSubLabel}>Top 15% of Software Engineers</div>
            <Link to="/assessments" style={styles.ctaButton}><Zap size={16} /> Take Assessment</Link>
          </motion.div>

          {/* Middle - Stats Grid */}
          <div style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <motion.div key={stat.label} style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + index * 0.1 }} whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(139, 92, 246, 0.15)' }}>
                <div style={styles.statIcon(stat.color)}><stat.icon size={22} /></div>
                <div style={styles.statValue}>{stat.value}</div>
                <div style={styles.statLabel}>{stat.label}</div>
                <div style={styles.statTrend}><TrendingUp size={12} /> {stat.trend}</div>
              </motion.div>
            ))}
          </div>

          {/* Right - Side Section */}
          <motion.div style={styles.sideSection} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <div style={styles.miniCard}>
              <div style={styles.miniCardTitle}><Trophy size={16} color="#7c3aed" /> Achievements</div>
              <div style={styles.achievementGrid}>
                {achievements.map((ach, i) => (
                  <motion.div key={i} style={styles.achievementItem(ach.earned)} whileHover={{ scale: 1.1 }} title={ach.title}>{ach.icon}</motion.div>
                ))}
              </div>
            </div>
            <div style={styles.miniCard}>
              <div style={styles.miniCardTitle}><Calendar size={16} color="#7c3aed" /> Upcoming</div>
              {upcomingEvents.map((event, i) => (
                <div key={i} style={styles.eventItem}>
                  <div style={styles.eventDot(event.type)} />
                  <div style={styles.eventInfo}>
                    <div style={styles.eventTitle}>{event.title}</div>
                    <div style={styles.eventDate}>{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.miniCard}>
              <div style={styles.miniCardTitle}><Zap size={16} color="#7c3aed" /> Quick Actions</div>
              <Link to="/resume-analyzer" style={{ ...styles.ctaButton, background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', marginTop: 0, marginBottom: '0.5rem' }}><FileText size={14} /> Analyze Resume</Link>
              <Link to="/learning-path" style={{ ...styles.ctaButton, background: '#ede9fe', color: '#7c3aed', marginTop: 0 }}><GraduationCap size={14} /> Learning Path</Link>
            </div>
          </motion.div>
        </div>

        {/* Two Column Section */}
        <div style={styles.twoColumn}>
          {/* Skill Gap Analysis */}
          <motion.div style={styles.section} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}><Brain size={20} color="#7c3aed" /> AI Skill Gap Analysis</div>
              <Link to="/learning-path" style={styles.viewAll}>View All <ChevronRight size={16} /></Link>
            </div>
            {skillGaps.map((skill, index) => (
              <div key={skill.skill} style={styles.skillItem}>
                <div style={styles.skillIcon}>{skill.icon}</div>
                <div style={styles.skillInfo}>
                  <div style={styles.skillName}>{skill.skill} <span style={styles.priorityBadge(skill.priority)}>{skill.priority === 'high' ? 'Priority' : 'Medium'}</span></div>
                  <div style={styles.skillBar}>
                    <motion.div style={styles.skillProgress(skill.current, skill.priority)} initial={{ width: 0 }} animate={{ width: `${skill.current}%` }} transition={{ duration: 1, delay: 0.6 + index * 0.1 }} />
                  </div>
                  <div style={styles.skillMeta}><span>{skill.current}% current</span><span>Need {skill.required - skill.current}% more</span></div>
                </div>
              </div>
            ))}
            <Link to="/courses" style={styles.ctaButton}><Sparkles size={16} /> Get Personalized Courses</Link>
          </motion.div>

          {/* Recommended Jobs */}
          <motion.div style={styles.section} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitle}><Briefcase size={20} color="#7c3aed" /> Top Job Matches</div>
              <Link to="/jobs" style={styles.viewAll}>View All <ChevronRight size={16} /></Link>
            </div>
            {recommendedJobs.map((job) => (
              <motion.a key={job.title} href={job.applyUrl} target="_blank" rel="noopener noreferrer" style={styles.jobCard} whileHover={{ borderColor: '#8b5cf6', transform: 'translateX(5px)' }}>
                <div style={styles.jobLogo(job.color)}>{job.logo}</div>
                <div style={styles.jobInfo}>
                  <div style={styles.jobTitle}>{job.title}</div>
                  <div style={styles.jobCompany}>{job.company} • {job.location} • {job.salary}</div>
                </div>
                <div style={styles.jobMatch(job.match)}>{job.match}%</div>
              </motion.a>
            ))}
            <Link to="/jobs" style={styles.ctaButton}><ArrowUpRight size={16} /> Explore All Jobs</Link>
          </motion.div>
        </div>

        {/* Courses Section */}
        <motion.div style={{ ...styles.section, marginTop: '1.5rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitle}><BookOpen size={20} color="#7c3aed" /> Continue Learning</div>
            <Link to="/courses" style={styles.viewAll}>All Courses <ChevronRight size={16} /></Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            {courses.map((course, index) => (
              <motion.div key={course.title} style={styles.courseCard} whileHover={{ transform: 'translateY(-3px)', boxShadow: '0 6px 20px rgba(139, 92, 246, 0.15)' }}>
                <div style={styles.courseIcon}>{course.image}</div>
                <div style={styles.courseInfo}>
                  <div style={styles.courseTitle}>{course.title}</div>
                  <div style={styles.courseProvider}>{course.provider}</div>
                  <div style={styles.courseProgress}>
                    <motion.div style={styles.courseBar(course.progress)} initial={{ width: 0 }} animate={{ width: `${course.progress}%` }} transition={{ duration: 1, delay: 0.7 + index * 0.1 }} />
                  </div>
                </div>
                <div style={styles.coursePercent}>{course.progress}%</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes scroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }`}</style>
    </div>
  );
};

export default Dashboard;
