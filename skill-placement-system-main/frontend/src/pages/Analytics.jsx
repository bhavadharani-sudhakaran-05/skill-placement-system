import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import {
  BarChart3, TrendingUp, Award, Target, Calendar,
  Download, ChevronDown, ArrowUp, ArrowDown, BookOpen, Briefcase, Clock
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import useAssessmentStore from '../store/assessmentStore';
import useCourseStore from '../store/courseStore';
import api from '../utils/api';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const { user } = useAuthStore();
  const { completedAssessments, getStats, fetchAssessments, lastUpdated } = useAssessmentStore();
  const { getStats: getCourseStats, courseProgress, lastUpdated: courseLastUpdated } = useCourseStore();
  const [timeRange] = useState('6 months');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobMatchCount, setJobMatchCount] = useState(0);

  // Format relative time
  const formatRelativeTime = useCallback((dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  }, []);

  // Format join date
  const formatJoinDate = useCallback((dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  // Fetch real data from backend and assessment store
  const fetchAnalyticsData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      
      // Get assessment stats from store first
      const assessmentStats = getStats();
      
      // Try to fetch user profile with skills
      let backendUser = {};
      try {
        const userRes = await api.get('/auth/me');
        backendUser = userRes.data?.data || {};
      } catch (err) {
        console.log('Could not fetch user profile, using local data');
      }
      
      // Merge backend data with local store data
      const backendAssessments = backendUser.assessmentHistory || [];
      const backendBadges = backendUser.badges || [];
      const backendSkills = backendUser.skills || [];
      
      // Calculate real assessment data
      const allAssessments = [...backendAssessments];
      completedAssessments.forEach(local => {
        if (!allAssessments.find(b => b.title === local.title)) {
          allAssessments.push(local);
        }
      });
      
      const passedAssessments = allAssessments.filter(a => a.status === 'completed' && a.score >= 70);
      const completedCount = allAssessments.filter(a => a.status === 'completed').length;
      const totalScore = allAssessments.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.score || 0), 0);
      const avgScore = completedCount > 0 ? Math.round(totalScore / completedCount) : 0;
      
      // Get skill readiness score
      const skillReadiness = Math.max(
        backendUser.metrics?.skillReadinessScore || 0,
        assessmentStats.averageScore || 0,
        avgScore
      );
      
      // Fetch jobs count
      let jobsApplied = 0;
      try {
        const jobsRes = await api.get('/jobs?limit=100');
        jobsApplied = jobsRes.data.data?.length || 0;
      } catch { jobsApplied = 0; }
      setJobMatchCount(jobsApplied);
      
      // Get course progress from store
      const courseStats = getCourseStats();
      let coursesCompleted = courseStats.completed;
      let coursesInProgress = courseStats.inProgress;
      let totalCourses = courseStats.totalEnrolled || 5; // Default 5 courses available
      
      // Also try to fetch learning path data from API
      try {
        const pathRes = await api.get('/learning-paths/my');
        const activePath = pathRes.data.data;
        if (activePath && activePath.courses) {
          const apiCompleted = activePath.courses.filter(c => c.status === 'completed').length;
          const apiInProgress = activePath.courses.filter(c => c.status === 'in-progress').length;
          // Use the higher values between store and API
          coursesCompleted = Math.max(coursesCompleted, apiCompleted);
          coursesInProgress = Math.max(coursesInProgress, apiInProgress);
          totalCourses = Math.max(totalCourses, activePath.courses.length);
        } else if (activePath && activePath.path?.stages) {
          const stageCount = activePath.path.stages.length;
          const completedStages = activePath.progress?.completedModules || 0;
          coursesCompleted = Math.max(coursesCompleted, completedStages);
          totalCourses = Math.max(totalCourses, stageCount);
        }
      } catch (err) { 
        console.error('Error fetching learning path:', err);
      }
      
      // Ensure we have at least the store values
      if (courseStats.totalEnrolled > 0) {
        totalCourses = Math.max(totalCourses, courseStats.totalEnrolled);
      }
      
      // Process skills from backend or assessments
      let processedSkills = [];
      if (backendSkills.length > 0) {
        processedSkills = backendSkills.slice(0, 6).map(s => ({
          name: s.name || 'Skill', level: s.level || 0
        }));
      } else {
        const skillMap = {};
        allAssessments.filter(a => a.status === 'completed').forEach(a => {
          const skillName = a.title.split(' ')[0];
          if (!skillMap[skillName] || skillMap[skillName] < a.score) {
            skillMap[skillName] = a.score;
          }
        });
        processedSkills = Object.entries(skillMap).slice(0, 6).map(([name, level]) => ({ name, level }));
      }
      if (processedSkills.length === 0) {
        processedSkills = [{ name: 'Take assessments', level: 0 }];
      }
      
      // Calculate monthly progress based on assessment dates
      const monthlyProgress = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthAssessments = allAssessments.filter(a => {
          const assessmentDate = new Date(a.completedAt || a.takenAt);
          return assessmentDate <= monthDate;
        });
        if (monthAssessments.length > 0) {
          const total = monthAssessments.reduce((sum, a) => sum + (a.score || 0), 0);
          monthlyProgress.push(Math.round(total / monthAssessments.length));
        } else if (monthlyProgress.length > 0) {
          monthlyProgress.push(monthlyProgress[monthlyProgress.length - 1]);
        } else {
          monthlyProgress.push(0);
        }
      }
      if (monthlyProgress.length > 0) {
        monthlyProgress[monthlyProgress.length - 1] = Math.max(monthlyProgress[monthlyProgress.length - 1], skillReadiness);
      }
      
      // Build recent activity from real data
      const recentActivity = [];
      allAssessments.slice(-4).reverse().forEach(a => {
        recentActivity.push({
          type: 'assessment', title: a.title, date: formatRelativeTime(a.completedAt || a.takenAt),
          status: a.status === 'completed' ? (a.score >= 70 ? 'passed' : 'completed') : a.status, score: a.score
        });
      });
      if (recentActivity.length < 4) {
        recentActivity.push({ type: 'course', title: 'Start a Learning Path', date: 'Recommended', status: 'not-started' });
      }
      
      // Calculate soft skills from assessments
      const softSkills = {
        technical: Math.round(avgScore) || skillReadiness,
        problemSolving: Math.round((avgScore || skillReadiness) * 0.95),
        communication: Math.round(skillReadiness * 0.85),
        leadership: Math.round(skillReadiness * 0.7),
        teamwork: Math.round(skillReadiness * 0.9),
        creativity: Math.round(skillReadiness * 0.85)
      };
      
      // Calculate streak days
      let streakDays = 0;
      if (allAssessments.length > 0) {
        const sorted = allAssessments.filter(a => a.completedAt || a.takenAt)
          .sort((a, b) => new Date(b.completedAt || b.takenAt) - new Date(a.completedAt || a.takenAt));
        if (sorted.length > 0) {
          const lastActivity = new Date(sorted[0].completedAt || sorted[0].takenAt);
          const daysSince = Math.floor((now - lastActivity) / 86400000);
          if (daysSince <= 1) streakDays = Math.min(sorted.length, 30);
        }
      }
      
      const certificatesEarned = Math.max(backendBadges.length, assessmentStats.badgesCount);
      const skillGrowth = monthlyProgress.length > 1 ? monthlyProgress[monthlyProgress.length - 1] - monthlyProgress[0] : skillReadiness;
      
      const userProgress = {
        name: user.name || 'User', email: user.email, joinDate: formatJoinDate(backendUser.createdAt),
        coursesCompleted, coursesInProgress, totalCourses: totalCourses || 10,
        assessmentsTaken: allAssessments.length, assessmentsPassed: passedAssessments.length, averageScore: avgScore,
        certificatesEarned, jobsApplied, interviewsScheduled: Math.floor(jobsApplied / 3),
        skillGrowth: Math.max(0, skillGrowth), readinessScore: skillReadiness,
        hoursLearned: Math.max(coursesCompleted * 6, allAssessments.length * 2), streakDays,
        skills: processedSkills, monthlyProgress, softSkills, recentActivity: recentActivity.slice(0, 4)
      };
      
      setUserData(userProgress);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      // Set default data so the page still renders
      const assessmentStats = getStats();
      const courseStats = getCourseStats();
      setUserData({
        name: user?.name || 'User', email: user?.email || '', joinDate: 'Recently',
        coursesCompleted: courseStats.completed || 0, 
        coursesInProgress: courseStats.inProgress || 0, 
        totalCourses: courseStats.totalEnrolled || 5,
        assessmentsTaken: assessmentStats.totalAssessments || completedAssessments.length,
        assessmentsPassed: assessmentStats.passedAssessments || 0,
        averageScore: assessmentStats.averageScore || 0,
        certificatesEarned: assessmentStats.badgesCount || 0, jobsApplied: 0, interviewsScheduled: 0,
        skillGrowth: 0, readinessScore: assessmentStats.averageScore || 0,
        hoursLearned: 0, streakDays: 0,
        skills: [{ name: 'Take assessments', level: 0 }],
        monthlyProgress: [0, 0, 0, 0, 0, assessmentStats.averageScore || 0],
        softSkills: { technical: 0, problemSolving: 0, communication: 0, leadership: 0, teamwork: 0, creativity: 0 },
        recentActivity: completedAssessments.slice(-4).reverse().map(a => ({
          type: 'assessment', title: a.title, date: 'Recently', 
          status: a.score >= 70 ? 'passed' : 'completed', score: a.score
        }))
      });
    } finally {
      setLoading(false);
    }
  }, [user, completedAssessments, getStats, getCourseStats, formatRelativeTime, formatJoinDate]);

  // Initial fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAssessments();
      } catch (e) {
        console.log('Could not fetch assessments from store');
      }
      await fetchAnalyticsData();
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Refetch when assessments or courses update
  useEffect(() => {
    if (lastUpdated || courseLastUpdated) fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated, courseLastUpdated]);

  // Generate dynamic month labels based on current date
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(months[date.getMonth()]);
    }
    return labels;
  };

  const monthLabels = getMonthLabels();

  const completedPercent = userData ? Math.round((userData.coursesCompleted / userData.totalCourses) * 100) : 0;
  const inProgressPercent = userData ? Math.round((userData.coursesInProgress / userData.totalCourses) * 100) : 0;
  const notStartedPercent = Math.max(0, 100 - completedPercent - inProgressPercent);

  const stats = [
    { icon: TrendingUp, label: 'Skill Growth', value: `+${userData?.skillGrowth || 0}%`, change: userData?.skillGrowth > 0 ? `+${userData.skillGrowth}%` : '0%', positive: true, color: '#10b981' },
    { icon: Target, label: 'Readiness Score', value: `${userData?.readinessScore || 0}%`, change: userData?.readinessScore > 50 ? 'Good' : 'Improve', positive: userData?.readinessScore > 50, color: '#2E073F' },
    { icon: Award, label: 'Certificates', value: userData?.certificatesEarned || 0, change: `${userData?.assessmentsPassed || 0} passed`, positive: true, color: '#f59e0b' },
    { icon: Briefcase, label: 'Job Matches', value: jobMatchCount, change: 'Available', positive: true, color: '#ec4899' }
  ];

  const progressData = {
    labels: monthLabels,
    datasets: [{
      label: 'Skill Score', data: userData?.monthlyProgress || [0, 0, 0, 0, 0, 0], fill: true,
      borderColor: '#2E073F', backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4, pointBackgroundColor: '#2E073F', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5
    }]
  };

  const skillsData = {
    labels: userData?.skills?.map(s => s.name) || ['No Skills Yet'],
    datasets: [{
      label: 'Current Level', data: userData?.skills?.map(s => s.level) || [0],
      backgroundColor: ['#2E073F', '#2E073F', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']
    }]
  };

  const radarData = {
    labels: ['Technical', 'Problem Solving', 'Communication', 'Leadership', 'Teamwork', 'Creativity'],
    datasets: [{
      label: 'Your Skills',
      data: userData ? [userData.softSkills.technical, userData.softSkills.problemSolving, userData.softSkills.communication, userData.softSkills.leadership, userData.softSkills.teamwork, userData.softSkills.creativity] : [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: '#2E073F', pointBackgroundColor: '#2E073F'
    }, {
      label: 'Industry Average', data: [70, 72, 75, 70, 75, 68],
      backgroundColor: 'rgba(236, 72, 153, 0.2)', borderColor: '#ec4899', pointBackgroundColor: '#ec4899'
    }]
  };

  const distributionData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [{
      data: [completedPercent, inProgressPercent, notStartedPercent], backgroundColor: ['#10b981', '#f59e0b', '#e5e7eb'],
      borderWidth: 0, hoverOffset: 4
    }]
  };

  // eslint-disable-next-line no-unused-vars
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f5f3ff' } }, x: { grid: { display: false } } } };

  // Generate contribution heatmap data (GitHub-style)
  const generateContributionData = () => {
    const now = new Date();
    const data = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get all activity dates (assessments + courses)
    const activityDates = {};
    
    // Add assessment dates
    if (completedAssessments) {
      completedAssessments.forEach(a => {
        const date = new Date(a.completedAt || a.takenAt);
        if (!isNaN(date.getTime())) {
          const key = date.toISOString().split('T')[0];
          activityDates[key] = (activityDates[key] || 0) + 1;
        }
      });
    }
    
    // Add course activity dates from courseProgress
    if (courseProgress) {
      Object.values(courseProgress).forEach(course => {
        if (course.updatedAt) {
          const date = new Date(course.updatedAt);
          if (!isNaN(date.getTime())) {
            const key = date.toISOString().split('T')[0];
            activityDates[key] = (activityDates[key] || 0) + 1;
          }
        }
        if (course.enrolledAt) {
          const date = new Date(course.enrolledAt);
          if (!isNaN(date.getTime())) {
            const key = date.toISOString().split('T')[0];
            activityDates[key] = (activityDates[key] || 0) + 1;
          }
        }
      });
    }
    
    // Generate 52 weeks of data (1 year)
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 364); // Go back ~1 year
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday
    
    const weeks = [];
    let currentDate = new Date(startDate);
    
    for (let week = 0; week < 53; week++) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const count = activityDates[dateKey] || 0;
        weekData.push({
          date: new Date(currentDate),
          count: count,
          dateStr: dateKey
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekData);
    }
    
    // Get month labels with positions
    const monthLabels = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0].date;
      const month = firstDayOfWeek.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], position: weekIndex });
        lastMonth = month;
      }
    });
    
    return { weeks, monthLabels };
  };
  
  const contributionData = generateContributionData();
  
  const getContributionColor = (count) => {
    if (count === 0) return '#ebedf0';
    if (count === 1) return '#9be9a8';
    if (count === 2) return '#40c463';
    if (count === 3) return '#30a14e';
    return '#216e39';
  };

  const styles = {
    container: { padding: '1rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' },
    headerLeft: {},
    title: { fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #2E073F, #2E073F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.3rem' },
    subtitle: { color: '#6b7280', fontSize: '0.75rem' },
    headerRight: { display: 'flex', gap: '0.75rem' },
    filterButton: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', borderRadius: '10px', border: '2px solid #ede9fe', background: 'white', cursor: 'pointer', fontWeight: 500, color: '#2E073F', fontSize: '0.75rem' },
    downloadButton: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.85rem', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 3px 12px rgba(139, 92, 246, 0.3)', fontSize: '0.75rem' },
    userCard: { background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', borderRadius: '14px', padding: '1rem', marginBottom: '1rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', boxShadow: '0 6px 20px rgba(139, 92, 246, 0.25)' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '0.75rem' },
    avatar: { width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700 },
    userName: { fontSize: '1.1rem', fontWeight: 700 },
    userEmail: { opacity: 0.9, fontSize: '0.72rem' },
    userStats: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap' },
    userStatBox: { textAlign: 'center' },
    userStatValue: { fontSize: '1.25rem', fontWeight: 700 },
    userStatLabel: { fontSize: '0.65rem', opacity: 0.8 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1rem' },
    statCard: { background: 'white', borderRadius: '12px', padding: '0.85rem', boxShadow: '0 2px 8px rgba(139, 92, 246, 0.08)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #ede9fe' },
    statIcon: (color) => ({ width: '36px', height: '36px', borderRadius: '10px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statInfo: { flex: 1 },
    statValue: { fontSize: '1.1rem', fontWeight: 700, color: '#1f2937' },
    statLabel: { fontSize: '0.65rem', color: '#6b7280' },
    statChange: (positive) => ({ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', fontWeight: 600, color: positive ? '#10b981' : '#ef4444' }),
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1rem', marginBottom: '1rem' },
    chartCard: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139, 92, 246, 0.08)', border: '1px solid #ede9fe' },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    chartTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.35rem' },
    chartContainer: { height: '220px' },
    smallChartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' },
    legendItems: { display: 'flex', gap: '1rem', marginTop: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: '#6b7280' },
    legendDot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', background: color }),
    activityCard: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139, 92, 246, 0.08)', marginTop: '1rem', border: '1px solid #ede9fe' },
    activityTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' },
    activityList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    activityItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: '#faf5ff', borderRadius: '10px' },
    activityIcon: (type) => ({
      width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: type === 'course' ? '#f5f3ff' : type === 'assessment' ? '#d1fae5' : '#fce7f3',
      color: type === 'course' ? '#2E073F' : type === 'assessment' ? '#10b981' : '#ec4899'
    }),
    activityInfo: { flex: 1 },
    activityName: { fontWeight: 600, color: '#1f2937', fontSize: '0.8rem' },
    activityDate: { fontSize: '0.65rem', color: '#6b7280' },
    activityStatus: (status) => ({
      padding: '0.15rem 0.5rem', borderRadius: '15px', fontSize: '0.6rem', fontWeight: 600,
      background: status === 'completed' ? '#d1fae5' : status === 'passed' ? '#d1fae5' : status === 'applied' ? '#fce7f3' : '#fef3c7',
      color: status === 'completed' ? '#059669' : status === 'passed' ? '#059669' : status === 'applied' ? '#db2777' : '#d97706'
    }),
    insightCard: { background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', borderRadius: '14px', padding: '1.25rem', color: 'white', marginTop: '1rem', boxShadow: '0 6px 20px rgba(139, 92, 246, 0.25)' },
    insightTitle: { fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' },
    insightText: { opacity: 0.95, marginBottom: '1rem', lineHeight: 1.5, fontSize: '0.8rem' },
    insightStats: { display: 'flex', gap: '1.25rem', flexWrap: 'wrap' },
    insightStat: {},
    insightValue: { fontSize: '1.4rem', fontWeight: 700 },
    insightLabel: { fontSize: '0.72rem', opacity: 0.85 },
    // Contribution graph styles
    contributionCard: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139, 92, 246, 0.08)', marginBottom: '1rem', border: '1px solid #ede9fe' },
    contributionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' },
    contributionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.35rem' },
    contributionGraph: { overflowX: 'auto', paddingBottom: '0.35rem' },
    contributionContainer: { display: 'flex', gap: '2px', minWidth: 'fit-content' },
    contributionLabels: { display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '6px', paddingTop: '16px' },
    contributionDayLabel: { fontSize: '9px', color: '#6b7280', height: '10px', lineHeight: '10px' },
    contributionWeeksContainer: { display: 'flex', flexDirection: 'column' },
    contributionMonths: { display: 'flex', marginBottom: '3px', fontSize: '9px', color: '#6b7280' },
    contributionWeeks: { display: 'flex', gap: '2px' },
    contributionWeek: { display: 'flex', flexDirection: 'column', gap: '2px' },
    contributionDay: { width: '10px', height: '10px', borderRadius: '2px', cursor: 'pointer' },
    contributionLegend: { display: 'flex', alignItems: 'center', gap: '3px', marginTop: '0.75rem', justifyContent: 'flex-end' },
    contributionLegendText: { fontSize: '9px', color: '#6b7280', marginRight: '3px' }
  };

  if (loading || !userData) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', padding: '4rem 1rem 1rem 1rem' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>Loading Your Analytics...</h2>
          <p style={{ color: '#6b7280' }}>Fetching your real-time data</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <motion.h1 style={styles.title} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>📊 My Analytics</motion.h1>
          <p style={styles.subtitle}>Real-time learning and career progress</p>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.filterButton}><Calendar size={18} /> {timeRange} <ChevronDown size={16} /></button>
          <button style={styles.downloadButton}><Download size={18} /> Export Report</button>
        </div>
      </div>

      {/* User Profile Card */}
      <motion.div style={styles.userCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>{userData.name.charAt(0).toUpperCase()}</div>
          <div>
            <div style={styles.userName}>Welcome, {userData.name}! 👋</div>
            <div style={styles.userEmail}>{userData.email} • Member since {userData.joinDate}</div>
          </div>
        </div>
        <div style={styles.userStats}>
          <div style={styles.userStatBox}>
            <div style={styles.userStatValue}>{userData.hoursLearned}h</div>
            <div style={styles.userStatLabel}>Hours Learned</div>
          </div>
          <div style={styles.userStatBox}>
            <div style={styles.userStatValue}>{userData.streakDays} 🔥</div>
            <div style={styles.userStatLabel}>Day Streak</div>
          </div>
          <div style={styles.userStatBox}>
            <div style={styles.userStatValue}>{userData.averageScore}%</div>
            <div style={styles.userStatLabel}>Avg Score</div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <motion.div key={stat.label} style={styles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <div style={styles.statIcon(stat.color)}><stat.icon size={24} /></div>
            <div style={styles.statInfo}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
            <div style={styles.statChange(stat.positive)}>
              {stat.positive ? <ArrowUp size={14} /> : <ArrowDown size={14} />} {stat.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Contribution Graph (GitHub-style) */}
      <motion.div style={styles.contributionCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <div style={styles.contributionHeader}>
          <h3 style={styles.contributionTitle}><Calendar size={20} color="#2E073F" /> Activity Contributions</h3>
          <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{userData.assessmentsTaken} activities in the last year</span>
        </div>
        <div style={styles.contributionGraph}>
          <div style={styles.contributionContainer}>
            {/* Day labels */}
            <div style={styles.contributionLabels}>
              <span style={styles.contributionDayLabel}>Sun</span>
              <span style={styles.contributionDayLabel}>Mon</span>
              <span style={styles.contributionDayLabel}>Tue</span>
              <span style={styles.contributionDayLabel}>Wed</span>
              <span style={styles.contributionDayLabel}>Thu</span>
              <span style={styles.contributionDayLabel}>Fri</span>
              <span style={styles.contributionDayLabel}>Sat</span>
            </div>
            {/* Weeks container */}
            <div style={styles.contributionWeeksContainer}>
              {/* Month labels */}
              <div style={styles.contributionMonths}>
                {contributionData.monthLabels.map((m, i) => (
                  <span key={i} style={{ marginLeft: i === 0 ? 0 : `${(m.position - (contributionData.monthLabels[i-1]?.position || 0)) * 14 - 20}px` }}>
                    {m.month}
                  </span>
                ))}
              </div>
              {/* Week columns */}
              <div style={styles.contributionWeeks}>
                {contributionData.weeks.map((week, weekIndex) => (
                  <div key={weekIndex} style={styles.contributionWeek}>
                    {week.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        style={{
                          ...styles.contributionDay,
                          backgroundColor: getContributionColor(day.count)
                        }}
                        title={`${day.dateStr}: ${day.count} ${day.count === 1 ? 'activity' : 'activities'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div style={styles.contributionLegend}>
          <span style={styles.contributionLegendText}>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div key={level} style={{ ...styles.contributionDay, backgroundColor: getContributionColor(level) }} />
          ))}
          <span style={styles.contributionLegendText}>More</span>
        </div>
      </motion.div>

      {/* Main Charts */}
      <div style={styles.chartsGrid}>
        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><TrendingUp size={20} color="#2E073F" /> Skill Progress Over Time</h3>
          </div>
          <div style={styles.chartContainer}>
            <Line data={progressData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><BarChart3 size={20} color="#2E073F" /> Skills Breakdown</h3>
          </div>
          <div style={styles.chartContainer}>
            <Bar data={skillsData} options={{ ...chartOptions, indexAxis: 'y' }} />
          </div>
        </motion.div>
      </div>

      {/* Smaller Charts */}
      <div style={styles.smallChartsGrid}>
        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><Target size={20} color="#2E073F" /> Skill Comparison</h3>
          </div>
          <div style={{ ...styles.chartContainer, height: '250px' }}>
            <Radar data={radarData} options={{ ...chartOptions, scales: { r: { beginAtZero: true, max: 100 } } }} />
          </div>
          <div style={styles.legendItems}>
            <div style={styles.legendItem}><div style={styles.legendDot('#2E073F')} /> Your Skills</div>
            <div style={styles.legendItem}><div style={styles.legendDot('#ec4899')} /> Industry Average</div>
          </div>
        </motion.div>

        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><Award size={20} color="#2E073F" /> Course Completion</h3>
          </div>
          <div style={{ ...styles.chartContainer, height: '250px', display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '200px' }}>
              <Doughnut data={distributionData} options={{ ...chartOptions, cutout: '70%' }} />
            </div>
          </div>
          <div style={styles.legendItems}>
            <div style={styles.legendItem}><div style={styles.legendDot('#10b981')} /> Completed ({completedPercent}%)</div>
            <div style={styles.legendItem}><div style={styles.legendDot('#f59e0b')} /> In Progress ({inProgressPercent}%)</div>
            <div style={styles.legendItem}><div style={styles.legendDot('#e5e7eb')} /> Not Started ({notStartedPercent}%)</div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div style={styles.activityCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <h3 style={styles.activityTitle}><Clock size={20} color="#2E073F" /> Recent Activity</h3>
        <div style={styles.activityList}>
          {userData.recentActivity.map((activity, index) => (
            <div key={index} style={styles.activityItem}>
              <div style={styles.activityIcon(activity.type)}>
                {activity.type === 'course' ? <BookOpen size={18} /> : activity.type === 'assessment' ? <Award size={18} /> : <Briefcase size={18} />}
              </div>
              <div style={styles.activityInfo}>
                <div style={styles.activityName}>{activity.title}</div>
                <div style={styles.activityDate}>{activity.date} {activity.score && `• Score: ${activity.score}%`}</div>
              </div>
              <div style={styles.activityStatus(activity.status)}>{activity.status}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Insight Card */}
      <motion.div style={styles.insightCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
        <h3 style={styles.insightTitle}>🎯 AI Insights for {userData.name}</h3>
        <p style={styles.insightText}>
          {userData.assessmentsTaken > 0 
            ? `You've completed ${userData.assessmentsTaken} assessments with ${userData.averageScore}% avg score. ${userData.assessmentsPassed} passed! ${userData.readinessScore >= 70 ? 'Great job!' : 'Keep practicing to improve.'}`
            : 'Start taking assessments to get personalized insights and track your progress!'
          }
        </p>
        <div style={styles.insightStats}>
          <div style={styles.insightStat}><div style={styles.insightValue}>{userData.assessmentsPassed}/{userData.assessmentsTaken}</div><div style={styles.insightLabel}>Assessments Passed</div></div>
          <div style={styles.insightStat}><div style={styles.insightValue}>{userData.readinessScore}%</div><div style={styles.insightLabel}>Job Readiness</div></div>
          <div style={styles.insightStat}><div style={styles.insightValue}>{userData.certificatesEarned}</div><div style={styles.insightLabel}>Badges Earned</div></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
