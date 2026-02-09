import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Brain, Target, TrendingUp, Briefcase, BookOpen, Award,
  ChevronRight, Zap, FileText, Bell, Sparkles, GraduationCap,
  Calendar, Trophy, Activity, ArrowUpRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAssessmentStore from '../store/assessmentStore';
import useCourseStore from '../store/courseStore';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { subscribe, getStats, fetchAssessments, lastUpdated } = useAssessmentStore();
  const { getCourseProgress } = useCourseStore();
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
  
  const updateAssessmentStats = useCallback(() => {
    const stats = getStats();
    setAssessmentStats(stats);
    setCompletedAssessments(stats.completedCount);
    setBadgesEarned(stats.badgesCount);
    if (stats.averageScore > 0) {
      setReadinessScore(prev => Math.max(prev, stats.averageScore));
    }
    if (stats.recentAssessments && stats.recentAssessments.length > 0) {
      const latest = stats.recentAssessments[0];
      setLiveUpdates(prev => {
        const newUpdate = {
          id: `assessment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'assessment',
          message: `Completed "${latest.title}" with ${latest.score}% score!`,
          time: 'Just now',
          icon: '🎉'
        };
        return [newUpdate, ...prev.slice(0, 3)];
      });
    }
  }, [getStats]);
  
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const userRes = await api.get('/auth/me');
      const userData = userRes.data.data;
      
      const skills = userData.skills || [];
      const totalLevel = skills.reduce((sum, s) => sum + (s.level || 0), 0);
      const maxLevel = skills.length * 100;
      const calculatedScore = maxLevel > 0 ? Math.round((totalLevel / maxLevel) * 100) : 0;
      
      const backendScore = userData.metrics?.skillReadinessScore || 0;
      const backendBadges = userData.badges || [];
      const assessmentHistory = userData.assessmentHistory || [];
      const completedFromBackend = assessmentHistory.filter(a => a.status === 'completed');
      
      const stats = getStats();
      const finalScore = Math.max(calculatedScore, backendScore, stats.averageScore);
      const finalBadgesCount = Math.max(backendBadges.length, stats.badgesCount);
      const finalAssessmentCount = Math.max(completedFromBackend.length, stats.completedCount);
      
      setReadinessScore(finalScore);
      setUserSkills(skills);
      setBadgesEarned(finalBadgesCount);
      setCompletedAssessments(finalAssessmentCount);
      
      try {
        const pathRes = await api.get('/learning-path/my');
        const activePath = pathRes.data.data;
        if (activePath) {
          const inProgress = activePath.courses?.filter(c => c.status === 'in-progress').length || 0;
          setActiveCourses(inProgress);
        }
      } catch { setActiveCourses(0); }
      
      try {
        const jobsRes = await api.get('/jobs?limit=100');
        setJobMatchCount(jobsRes.data.data?.length || 0);
      } catch { setJobMatchCount(0); }
      
      const updates = [];
      if (finalAssessmentCount > 0) {
        const avgScore = stats.averageScore > 0 ? stats.averageScore : backendScore;
        updates.push({ id: 'update-1', type: 'success', message: `${finalAssessmentCount} assessments completed with ${avgScore}% avg score!`, time: 'Updated', icon: '🎯' });
      } else {
        updates.push({ id: 'update-1', type: 'info', message: 'Complete assessments to increase your skill score!', time: 'Now', icon: '📊' });
      }
      if (skills.length > 0) updates.push({ id: 'update-2', type: 'skill', message: `${skills.length} skills detected`, time: 'Resume', icon: '📝' });
      if (finalBadgesCount > 0) updates.push({ id: 'update-3', type: 'badge', message: `${finalBadgesCount} badges earned!`, time: 'Achievement', icon: '🏆' });
      else updates.push({ id: 'update-3', type: 'assessment', message: 'Take assessments to verify expertise', time: 'Recommended', icon: '✅' });
      setLiveUpdates(updates);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, [getStats]);
  
  useEffect(() => {
    fetchAssessments().then(() => updateAssessmentStats());
    const unsubscribe = subscribe(updateAssessmentStats);
    return () => unsubscribe();
  }, [subscribe, fetchAssessments, updateAssessmentStats]);
  
  useEffect(() => {
    if (lastUpdated) {
      updateAssessmentStats();
      fetchUserData();
    }
  }, [lastUpdated, updateAssessmentStats, fetchUserData]);
  
  useEffect(() => { fetchUserData(); }, [fetchUserData]);

  // Course completion badges (calculate first for use in quickStats)
  const dsaProgress = getCourseProgress(1);
  const mernProgress = getCourseProgress(12);
  const mlProgress = getCourseProgress(2);
  const reactProgress = getCourseProgress(3);
  const awsProgress = getCourseProgress(4);
  const pythonProgress = getCourseProgress(5);
  const devopsProgress = getCourseProgress(14);

  const courseBadges = [
    { name: 'DSA Master', icon: '📊', course: 'Data Structures & Algorithms', earned: dsaProgress.progress === 100, color: '#2E073F' },
    { name: 'MERN Expert', icon: '💻', course: 'MERN Stack Developer', earned: mernProgress.progress === 100, color: '#10b981' },
    { name: 'ML Pioneer', icon: '🤖', course: 'Machine Learning A-Z', earned: mlProgress.progress === 100, color: '#8b5cf6' },
    { name: 'React Pro', icon: '⚛️', course: 'Complete React Developer', earned: reactProgress.progress === 100, color: '#06b6d4' },
    { name: 'Cloud Architect', icon: '☁️', course: 'AWS Solutions Architect', earned: awsProgress.progress === 100, color: '#f59e0b' },
    { name: 'Python Guru', icon: '🐍', course: 'Python for Data Science', earned: pythonProgress.progress === 100, color: '#3b82f6' },
    { name: 'DevOps Engineer', icon: '🚀', course: 'DevOps Engineer', earned: devopsProgress.progress === 100, color: '#ec4899' }
  ];

  const earnedCourseBadges = courseBadges.filter(b => b.earned).length;

  const quickStats = [
    { icon: Target, label: 'Skill Score', value: loading ? '...' : `${readinessScore}%`, trend: readinessScore > 0 ? 'Calculated' : 'Take tests', color: '#2E073F' },
    { icon: Briefcase, label: 'Job Matches', value: loading ? '...' : jobMatchCount.toString(), trend: 'Available', color: '#2E073F' },
    { icon: BookOpen, label: 'Assessments', value: loading ? '...' : completedAssessments.toString(), trend: completedAssessments > 0 ? `${assessmentStats.averageScore}% avg` : 'Take tests', color: '#a78bfa' },
    { icon: Award, label: 'Badges', value: loading ? '...' : (badgesEarned + earnedCourseBadges).toString(), trend: 'Earned', color: '#f59e0b' }
  ];

  const skillGaps = userSkills.length > 0 ? userSkills.slice(0, 3).map(s => ({
    skill: s.name || 'Skill', current: s.level || 0, required: 80,
    priority: s.level < 50 ? 'high' : 'medium', icon: s.level < 50 ? '🔴' : '🟡'
  })) : [{ skill: 'Complete assessments', current: 0, required: 80, priority: 'high', icon: '📊' }];

  const recommendedJobs = [
    { title: 'Software Engineer', company: 'Google', location: 'Bangalore', match: 92, salary: '25-35 LPA', logo: 'G', color: '#4285f4' },
    { title: 'Full Stack Developer', company: 'Microsoft', location: 'Hyderabad', match: 88, salary: '20-30 LPA', logo: 'M', color: '#00a4ef' },
    { title: 'Frontend Developer', company: 'Amazon', location: 'Chennai', match: 85, salary: '18-28 LPA', logo: 'A', color: '#ff9900' }
  ];

  const courses = [
    { title: 'System Design Masterclass', provider: 'Udemy', progress: 0, image: '🎯' },
    { title: 'Advanced Data Structures', provider: 'Coursera', progress: 0, image: '📊' },
    { title: 'Cloud Architecture', provider: 'AWS', progress: 0, image: '☁️' }
  ];

  const achievements = [
    { title: 'Quick Learner', icon: '🚀', earned: completedAssessments >= 1 },
    { title: 'Code Master', icon: '💻', earned: completedAssessments >= 3 },
    { title: 'Problem Solver', icon: '🧩', earned: readinessScore >= 50 },
    { title: 'Team Player', icon: '🤝', earned: false },
    { title: 'Innovator', icon: '💡', earned: readinessScore >= 80 }
  ];

  const upcomingEvents = [
    { title: 'React Assessment', date: 'Today, 3PM', type: 'assessment' },
    { title: 'Mock Interview', date: 'Tomorrow', type: 'interview' }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.greeting}><Sparkles size={18} /> Welcome, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p style={styles.subGreeting}><Activity size={12} /> Your career journey is progressing excellently!</p>
          </div>
          <div style={styles.timeCard}>
            <span style={styles.time}>{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
            <span style={styles.date}>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Ticker */}
        <div style={styles.ticker}>
          <Bell size={12} />
          <div style={styles.tickerScroll}>
            {liveUpdates.map(u => <span key={u.id} style={styles.tickerItem}>{u.icon} {u.message} • {u.time}</span>)}
          </div>
        </div>

        {/* Main Layout */}
        <div style={styles.mainGrid}>
          {/* Left Column */}
          <div style={styles.leftCol}>
            {/* Score Card */}
            <div style={styles.scoreCard}>
              <span style={styles.scoreTitle}><Target size={14} /> Skill Score</span>
              <div style={styles.scoreCircle}>
                <CircularProgressbar value={readinessScore} text={`${readinessScore}%`}
                  styles={buildStyles({ textSize: '22px', pathColor: '#2E073F', textColor: '#1f2937', trailColor: '#ede9fe' })} />
              </div>
              <span style={styles.scoreLabel}>{readinessScore >= 70 ? 'Excellent!' : readinessScore >= 40 ? 'Good Progress' : 'Keep Learning'}</span>
              <Link to="/assessments" style={styles.btn}><Zap size={12} /> Take Assessment</Link>
            </div>

            {/* Quick Actions */}
            <div style={styles.card}>
              <span style={styles.cardTitle}><Zap size={12} /> Quick Actions</span>
              <Link to="/resume-analyzer" style={styles.btnSecondary}><FileText size={12} /> Analyze Resume</Link>
              <Link to="/learning-path" style={styles.btnOutline}><GraduationCap size={12} /> Learning Path</Link>
            </div>

            {/* Achievements */}
            <div style={styles.card}>
              <span style={styles.cardTitle}><Trophy size={12} /> Achievements</span>
              <div style={styles.achieveGrid}>
                {achievements.map((a, i) => (
                  <div key={i} style={{...styles.achieveItem, opacity: a.earned ? 1 : 0.4}} title={a.title}>{a.icon}</div>
                ))}
              </div>
            </div>

            {/* Course Badges */}
            <div style={styles.card}>
              <span style={styles.cardTitle}><Award size={12} /> Course Badges ({earnedCourseBadges}/{courseBadges.length})</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.5rem' }}>
                {courseBadges.map((badge, i) => (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.4rem 0.5rem', borderRadius: '8px', 
                    background: badge.earned ? `${badge.color}15` : '#f5f5f5',
                    border: badge.earned ? `2px solid ${badge.color}` : '2px solid #e5e5e5',
                    opacity: badge.earned ? 1 : 0.5
                  }}>
                    <span style={{ fontSize: '1rem' }}>{badge.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.7rem', color: badge.earned ? badge.color : '#6b7280' }}>{badge.name}</div>
                      <div style={{ fontSize: '0.6rem', color: '#9ca3af' }}>{badge.earned ? '✓ Earned' : badge.course}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center Column */}
          <div style={styles.centerCol}>
            {/* Stats Row */}
            <div style={styles.statsRow}>
              {quickStats.map((stat, i) => (
                <motion.div key={i} style={styles.statCard} whileHover={{ y: -2 }}>
                  <div style={{...styles.statIcon, background: `${stat.color}15`, color: stat.color}}><stat.icon size={16} /></div>
                  <div style={styles.statInfo}>
                    <span style={styles.statValue}>{stat.value}</span>
                    <span style={styles.statLabel}>{stat.label}</span>
                  </div>
                  <span style={styles.statTrend}><TrendingUp size={10} /> {stat.trend}</span>
                </motion.div>
              ))}
            </div>

            {/* Two Column Grid */}
            <div style={styles.twoCol}>
              {/* Skill Gap */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardTitle}><Brain size={14} /> Skill Gap Analysis</span>
                  <Link to="/learning-path" style={styles.link}>View All <ChevronRight size={12} /></Link>
                </div>
                {skillGaps.map((s, i) => (
                  <div key={i} style={styles.skillItem}>
                    <span style={styles.skillIcon}>{s.icon}</span>
                    <div style={styles.skillInfo}>
                      <div style={styles.skillHeader}>
                        <span style={styles.skillName}>{s.skill}</span>
                        <span style={{...styles.badge, background: s.priority === 'high' ? '#fee2e2' : '#fef3c7', color: s.priority === 'high' ? '#dc2626' : '#d97706'}}>{s.priority}</span>
                      </div>
                      <div style={styles.progressBar}><div style={{...styles.progressFill, width: `${s.current}%`, background: s.priority === 'high' ? '#ef4444' : '#f59e0b'}} /></div>
                      <div style={styles.skillMeta}><span>{s.current}%</span><span>Need {s.required}%</span></div>
                    </div>
                  </div>
                ))}
                <Link to="/courses" style={styles.btn}><Sparkles size={12} /> Get Courses</Link>
              </div>

              {/* Jobs */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.cardTitle}><Briefcase size={14} /> Top Job Matches</span>
                  <Link to="/jobs" style={styles.link}>View All <ChevronRight size={12} /></Link>
                </div>
                {recommendedJobs.map((job, i) => (
                  <div key={i} style={styles.jobItem}>
                    <div style={{...styles.jobLogo, background: job.color}}>{job.logo}</div>
                    <div style={styles.jobInfo}>
                      <span style={styles.jobTitle}>{job.title}</span>
                      <span style={styles.jobMeta}>{job.company} • {job.location}</span>
                    </div>
                    <span style={styles.jobMatch}>{job.match}%</span>
                  </div>
                ))}
                <Link to="/jobs" style={styles.btn}><ArrowUpRight size={12} /> Explore Jobs</Link>
              </div>
            </div>

            {/* Courses */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}><BookOpen size={14} /> Continue Learning</span>
                <Link to="/courses" style={styles.link}>All Courses <ChevronRight size={12} /></Link>
              </div>
              <div style={styles.courseGrid}>
                {courses.map((c, i) => (
                  <div key={i} style={styles.courseItem}>
                    <span style={styles.courseIcon}>{c.image}</span>
                    <div style={styles.courseInfo}>
                      <span style={styles.courseTitle}>{c.title}</span>
                      <span style={styles.courseMeta}>{c.provider}</span>
                    </div>
                    <span style={styles.courseProgress}>{c.progress}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightCol}>
            {/* Upcoming */}
            <div style={styles.card}>
              <span style={styles.cardTitle}><Calendar size={12} /> Upcoming</span>
              {upcomingEvents.map((e, i) => (
                <div key={i} style={styles.eventItem}>
                  <div style={{...styles.eventDot, background: e.type === 'assessment' ? '#2E073F' : '#2E073F'}} />
                  <div>
                    <div style={styles.eventTitle}>{e.title}</div>
                    <div style={styles.eventDate}>{e.date}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div style={styles.card}>
              <span style={styles.cardTitle}><Activity size={12} /> Activity</span>
              <div style={styles.activityList}>
                <div style={styles.activityItem}>📊 {completedAssessments} Assessments</div>
                <div style={styles.activityItem}>🎯 {readinessScore}% Skill Score</div>
                <div style={styles.activityItem}>🏆 {badgesEarned} Badges</div>
                <div style={styles.activityItem}>💼 {jobMatchCount} Job Matches</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #faf5ff 100%)', fontFamily: "'Inter', sans-serif" },
  content: { padding: '1rem 1.5rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
  greeting: { fontSize: '1.3rem', fontWeight: 700, color: '#2E073F', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' },
  subGreeting: { fontSize: '0.8rem', color: '#6b7280', margin: '0.25rem 0 0', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  timeCard: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'white', padding: '0.5rem 0.75rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(139,92,246,0.1)', border: '1px solid #ede9fe' },
  time: { fontSize: '0.95rem', fontWeight: 700, color: '#2E073F' },
  date: { fontSize: '0.65rem', color: '#9ca3af' },
  ticker: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', borderRadius: '8px', padding: '0.4rem 0.75rem', marginBottom: '0.75rem', color: 'white', fontSize: '0.7rem', overflow: 'hidden' },
  tickerScroll: { display: 'flex', gap: '2rem', whiteSpace: 'nowrap', overflow: 'hidden', flex: 1 },
  tickerItem: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
  mainGrid: { display: 'grid', gridTemplateColumns: '160px 1fr 160px', gap: '0.75rem' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  centerCol: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '0.6rem' },
  scoreCard: { background: 'white', borderRadius: '12px', padding: '0.75rem', boxShadow: '0 3px 12px rgba(139,92,246,0.1)', border: '1px solid #ede9fe', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' },
  scoreTitle: { fontSize: '0.7rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  scoreCircle: { width: '70px', height: '70px' },
  scoreLabel: { fontSize: '0.7rem', fontWeight: 600, color: '#2E073F' },
  card: { background: 'white', borderRadius: '10px', padding: '0.65rem', boxShadow: '0 2px 10px rgba(139,92,246,0.08)', border: '1px solid #ede9fe', display: 'flex', flexDirection: 'column', gap: '0.35rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' },
  cardTitle: { fontSize: '0.75rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.3rem' },
  link: { fontSize: '0.65rem', color: '#2E073F', textDecoration: 'none', display: 'flex', alignItems: 'center', fontWeight: 500 },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.4rem 0.6rem', borderRadius: '7px', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', fontSize: '0.7rem', fontWeight: 600, textDecoration: 'none', border: 'none', cursor: 'pointer', marginTop: '0.3rem' },
  btnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.35rem', borderRadius: '7px', background: 'linear-gradient(135deg, #2E073F, #a78bfa)', color: 'white', fontSize: '0.65rem', fontWeight: 600, textDecoration: 'none' },
  btnOutline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', padding: '0.35rem', borderRadius: '7px', background: '#ede9fe', color: '#2E073F', fontSize: '0.65rem', fontWeight: 600, textDecoration: 'none', border: '1px solid #c4b5fd' },
  achieveGrid: { display: 'flex', gap: '0.3rem', flexWrap: 'wrap' },
  achieveItem: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ff', fontSize: '0.85rem', border: '1px solid #ede9fe' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' },
  statCard: { background: 'white', borderRadius: '10px', padding: '0.6rem', boxShadow: '0 2px 10px rgba(139,92,246,0.08)', border: '1px solid #ede9fe', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  statIcon: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' },
  statLabel: { fontSize: '0.65rem', color: '#6b7280' },
  statTrend: { fontSize: '0.6rem', color: '#2E073F', display: 'flex', alignItems: 'center', gap: '0.15rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' },
  skillItem: { display: 'flex', gap: '0.35rem', padding: '0.35rem 0', borderBottom: '1px solid #f3f4f6' },
  skillIcon: { fontSize: '0.85rem' },
  skillInfo: { flex: 1, minWidth: 0 },
  skillHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' },
  skillName: { fontSize: '0.7rem', fontWeight: 600, color: '#374151' },
  badge: { fontSize: '0.55rem', padding: '0.1rem 0.3rem', borderRadius: '4px', fontWeight: 600, textTransform: 'capitalize' },
  progressBar: { height: '4px', background: '#ede9fe', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s' },
  skillMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', color: '#9ca3af', marginTop: '0.15rem' },
  jobItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem', background: '#faf5ff', borderRadius: '7px', marginBottom: '0.3rem', border: '1px solid #ede9fe' },
  jobLogo: { width: '26px', height: '26px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 },
  jobInfo: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  jobTitle: { fontSize: '0.7rem', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  jobMeta: { fontSize: '0.6rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  jobMatch: { fontSize: '0.65rem', fontWeight: 700, color: '#2E073F', background: '#ede9fe', padding: '0.2rem 0.35rem', borderRadius: '5px', flexShrink: 0 },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.45rem' },
  courseItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem', background: '#faf5ff', borderRadius: '7px', border: '1px solid #ede9fe' },
  courseIcon: { fontSize: '0.9rem', flexShrink: 0 },
  courseInfo: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  courseTitle: { fontSize: '0.65rem', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  courseMeta: { fontSize: '0.55rem', color: '#9ca3af' },
  courseProgress: { fontSize: '0.65rem', fontWeight: 700, color: '#2E073F', flexShrink: 0 },
  eventItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0' },
  eventDot: { width: '6px', height: '6px', borderRadius: '50%', flexShrink: 0 },
  eventTitle: { fontSize: '0.65rem', fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  eventDate: { fontSize: '0.55rem', color: '#9ca3af' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  activityItem: { fontSize: '0.65rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0' }
};

export default Dashboard;
