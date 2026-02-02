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
        updates.push({ id: 1, type: 'success', message: `${finalAssessmentCount} assessments completed with ${avgScore}% avg score!`, time: 'Updated', icon: '🎯' });
      } else {
        updates.push({ id: 1, type: 'info', message: 'Complete assessments to increase your skill score!', time: 'Now', icon: '📊' });
      }
      if (skills.length > 0) updates.push({ id: 2, type: 'skill', message: `${skills.length} skills detected`, time: 'Resume', icon: '📝' });
      if (finalBadgesCount > 0) updates.push({ id: 3, type: 'badge', message: `${finalBadgesCount} badges earned!`, time: 'Achievement', icon: '🏆' });
      else updates.push({ id: 3, type: 'assessment', message: 'Take assessments to verify expertise', time: 'Recommended', icon: '✅' });
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

  const quickStats = [
    { icon: Target, label: 'Skill Score', value: loading ? '...' : `${readinessScore}%`, trend: readinessScore > 0 ? 'Calculated' : 'Take tests', color: '#7c3aed' },
    { icon: Briefcase, label: 'Job Matches', value: loading ? '...' : jobMatchCount.toString(), trend: 'Available', color: '#8b5cf6' },
    { icon: BookOpen, label: 'Assessments', value: loading ? '...' : completedAssessments.toString(), trend: completedAssessments > 0 ? `${assessmentStats.averageScore}% avg` : 'Take tests', color: '#a78bfa' },
    { icon: Award, label: 'Badges', value: loading ? '...' : badgesEarned.toString(), trend: 'Earned', color: '#c4b5fd' }
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
                  styles={buildStyles({ textSize: '22px', pathColor: '#7c3aed', textColor: '#1f2937', trailColor: '#ede9fe' })} />
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
                  <div style={{...styles.eventDot, background: e.type === 'assessment' ? '#7c3aed' : '#8b5cf6'}} />
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
  content: { padding: '0.75rem', maxWidth: '1200px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
  greeting: { fontSize: '1.1rem', fontWeight: 700, color: '#7c3aed', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' },
  subGreeting: { fontSize: '0.7rem', color: '#6b7280', margin: '0.2rem 0 0', display: 'flex', alignItems: 'center', gap: '0.2rem' },
  timeCard: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', background: 'white', padding: '0.4rem 0.6rem', borderRadius: '6px', boxShadow: '0 2px 8px rgba(139,92,246,0.1)' },
  time: { fontSize: '0.9rem', fontWeight: 700, color: '#7c3aed' },
  date: { fontSize: '0.6rem', color: '#9ca3af' },
  ticker: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', borderRadius: '6px', padding: '0.3rem 0.6rem', marginBottom: '0.5rem', color: 'white', fontSize: '0.7rem', overflow: 'hidden' },
  tickerScroll: { display: 'flex', gap: '1.5rem', whiteSpace: 'nowrap' },
  tickerItem: { display: 'flex', alignItems: 'center', gap: '0.2rem' },
  mainGrid: { display: 'grid', gridTemplateColumns: '140px 1fr 150px', gap: '0.5rem' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  centerCol: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  scoreCard: { background: 'white', borderRadius: '10px', padding: '0.6rem', boxShadow: '0 2px 12px rgba(139,92,246,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' },
  scoreTitle: { fontSize: '0.65rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.2rem' },
  scoreCircle: { width: '70px', height: '70px' },
  scoreLabel: { fontSize: '0.65rem', fontWeight: 600, color: '#7c3aed' },
  card: { background: 'white', borderRadius: '8px', padding: '0.5rem', boxShadow: '0 2px 8px rgba(139,92,246,0.08)', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: '0.7rem', fontWeight: 600, color: '#374151', display: 'flex', alignItems: 'center', gap: '0.25rem' },
  link: { fontSize: '0.6rem', color: '#7c3aed', textDecoration: 'none', display: 'flex', alignItems: 'center' },
  btn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.35rem', borderRadius: '5px', background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', fontSize: '0.65rem', fontWeight: 600, textDecoration: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem' },
  btnSecondary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.3rem', borderRadius: '5px', background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: 'white', fontSize: '0.6rem', fontWeight: 600, textDecoration: 'none' },
  btnOutline: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', padding: '0.3rem', borderRadius: '5px', background: '#ede9fe', color: '#7c3aed', fontSize: '0.6rem', fontWeight: 600, textDecoration: 'none' },
  achieveGrid: { display: 'flex', gap: '0.25rem', flexWrap: 'wrap' },
  achieveItem: { width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ff', fontSize: '0.8rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' },
  statCard: { background: 'white', borderRadius: '8px', padding: '0.5rem', boxShadow: '0 2px 8px rgba(139,92,246,0.08)', display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  statIcon: { width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  statInfo: { display: 'flex', flexDirection: 'column' },
  statValue: { fontSize: '1rem', fontWeight: 700, color: '#1f2937' },
  statLabel: { fontSize: '0.6rem', color: '#6b7280' },
  statTrend: { fontSize: '0.55rem', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '0.15rem' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' },
  skillItem: { display: 'flex', gap: '0.3rem', padding: '0.3rem 0', borderBottom: '1px solid #f3f4f6' },
  skillIcon: { fontSize: '0.8rem' },
  skillInfo: { flex: 1 },
  skillHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.15rem' },
  skillName: { fontSize: '0.65rem', fontWeight: 600, color: '#374151' },
  badge: { fontSize: '0.5rem', padding: '0.1rem 0.25rem', borderRadius: '3px', fontWeight: 600, textTransform: 'capitalize' },
  progressBar: { height: '3px', background: '#ede9fe', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: '2px', transition: 'width 0.5s' },
  skillMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '0.5rem', color: '#9ca3af', marginTop: '0.1rem' },
  jobItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem', background: '#faf5ff', borderRadius: '5px', marginBottom: '0.25rem' },
  jobLogo: { width: '24px', height: '24px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem' },
  jobInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  jobTitle: { fontSize: '0.65rem', fontWeight: 600, color: '#1f2937' },
  jobMeta: { fontSize: '0.55rem', color: '#6b7280' },
  jobMatch: { fontSize: '0.6rem', fontWeight: 700, color: '#7c3aed', background: '#ede9fe', padding: '0.15rem 0.3rem', borderRadius: '3px' },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' },
  courseItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.35rem', background: '#faf5ff', borderRadius: '5px' },
  courseIcon: { fontSize: '0.9rem' },
  courseInfo: { flex: 1, display: 'flex', flexDirection: 'column' },
  courseTitle: { fontSize: '0.6rem', fontWeight: 600, color: '#1f2937' },
  courseMeta: { fontSize: '0.5rem', color: '#9ca3af' },
  courseProgress: { fontSize: '0.65rem', fontWeight: 700, color: '#7c3aed' },
  eventItem: { display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0' },
  eventDot: { width: '5px', height: '5px', borderRadius: '50%' },
  eventTitle: { fontSize: '0.6rem', fontWeight: 500, color: '#374151' },
  eventDate: { fontSize: '0.5rem', color: '#9ca3af' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '0.25rem' },
  activityItem: { fontSize: '0.6rem', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }
};

export default Dashboard;
