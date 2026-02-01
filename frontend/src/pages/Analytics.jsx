import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import {
  BarChart3, TrendingUp, Users, Award, Target, Calendar,
  Download, Filter, ChevronDown, ArrowUp, ArrowDown, BookOpen, Briefcase, Clock, Star
} from 'lucide-react';
import useAuthStore from '../store/authStore';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, RadialLinearScale, Title, Tooltip, Legend, Filler);

const Analytics = () => {
  const { user } = useAuthStore();
  const [timeRange, setTimeRange] = useState('6 months');
  const [userData, setUserData] = useState(null);

  // Simulate real user data based on logged-in user
  useEffect(() => {
    if (user) {
      // Real user progress data - simulated based on user activity
      const userProgress = {
        name: user.name || 'User',
        email: user.email,
        joinDate: 'November 2024',
        coursesCompleted: 8,
        coursesInProgress: 3,
        totalCourses: 12,
        assessmentsTaken: 5,
        assessmentsPassed: 4,
        averageScore: 82,
        certificatesEarned: 2,
        jobsApplied: 6,
        interviewsScheduled: 2,
        skillGrowth: 32,
        readinessScore: 75,
        hoursLearned: 48,
        streakDays: 12,
        skills: [
          { name: 'JavaScript', level: 85 },
          { name: 'React.js', level: 78 },
          { name: 'Node.js', level: 72 },
          { name: 'Python', level: 65 },
          { name: 'SQL', level: 70 },
          { name: 'System Design', level: 45 }
        ],
        monthlyProgress: [45, 52, 58, 65, 70, 75], // Jan to Jun
        softSkills: { technical: 82, problemSolving: 78, communication: 68, leadership: 55, teamwork: 75, creativity: 72 },
        recentActivity: [
          { type: 'course', title: 'React Advanced Patterns', date: '2 hours ago', status: 'completed' },
          { type: 'assessment', title: 'JavaScript Proficiency', date: '1 day ago', status: 'passed', score: 88 },
          { type: 'job', title: 'Applied to TCS', date: '2 days ago', status: 'applied' },
          { type: 'course', title: 'System Design Basics', date: '3 days ago', status: 'in-progress' }
        ]
      };
      setUserData(userProgress);
    }
  }, [user]);

  const completedPercent = userData ? Math.round((userData.coursesCompleted / userData.totalCourses) * 100) : 0;
  const inProgressPercent = userData ? Math.round((userData.coursesInProgress / userData.totalCourses) * 100) : 0;
  const notStartedPercent = 100 - completedPercent - inProgressPercent;

  const stats = [
    { icon: TrendingUp, label: 'Skill Growth', value: `+${userData?.skillGrowth || 0}%`, change: '+8%', positive: true, color: '#10b981' },
    { icon: Target, label: 'Readiness Score', value: `${userData?.readinessScore || 0}%`, change: '+12%', positive: true, color: '#7c3aed' },
    { icon: Award, label: 'Certificates', value: userData?.certificatesEarned || 0, change: '+2', positive: true, color: '#f59e0b' },
    { icon: Briefcase, label: 'Jobs Applied', value: userData?.jobsApplied || 0, change: '+3', positive: true, color: '#ec4899' }
  ];

  const progressData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Skill Score', data: userData?.monthlyProgress || [45, 52, 58, 65, 70, 75], fill: true,
      borderColor: '#7c3aed', backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4, pointBackgroundColor: '#7c3aed', pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 5
    }]
  };

  const skillsData = {
    labels: userData?.skills?.map(s => s.name) || ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'System Design'],
    datasets: [{
      label: 'Current Level', data: userData?.skills?.map(s => s.level) || [85, 78, 72, 65, 70, 45],
      backgroundColor: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe']
    }]
  };

  const radarData = {
    labels: ['Technical', 'Problem Solving', 'Communication', 'Leadership', 'Teamwork', 'Creativity'],
    datasets: [{
      label: 'Your Skills',
      data: userData ? [userData.softSkills.technical, userData.softSkills.problemSolving, userData.softSkills.communication, userData.softSkills.leadership, userData.softSkills.teamwork, userData.softSkills.creativity] : [82, 78, 68, 55, 75, 72],
      backgroundColor: 'rgba(139, 92, 246, 0.2)', borderColor: '#7c3aed', pointBackgroundColor: '#7c3aed'
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

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: '#f5f3ff' } }, x: { grid: { display: false } } } };

  const styles = {
    container: { padding: '2rem', maxWidth: '1400px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' },
    headerLeft: {},
    title: { fontSize: '2rem', fontWeight: 700, background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' },
    subtitle: { color: '#6b7280', fontSize: '1rem' },
    headerRight: { display: 'flex', gap: '1rem' },
    filterButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', border: '2px solid #ede9fe', background: 'white', cursor: 'pointer', fontWeight: 500, color: '#7c3aed' },
    downloadButton: { display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)' },
    userCard: { background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', borderRadius: '20px', padding: '1.5rem', marginBottom: '2rem', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.25)' },
    userInfo: { display: 'flex', alignItems: 'center', gap: '1rem' },
    avatar: { width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 },
    userName: { fontSize: '1.5rem', fontWeight: 700 },
    userEmail: { opacity: 0.9, fontSize: '0.9rem' },
    userStats: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
    userStatBox: { textAlign: 'center' },
    userStatValue: { fontSize: '1.75rem', fontWeight: 700 },
    userStatLabel: { fontSize: '0.8rem', opacity: 0.8 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: 'white', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 10px rgba(139, 92, 246, 0.08)', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #ede9fe' },
    statIcon: (color) => ({ width: '50px', height: '50px', borderRadius: '12px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statInfo: { flex: 1 },
    statValue: { fontSize: '1.5rem', fontWeight: 700, color: '#1f2937' },
    statLabel: { fontSize: '0.8rem', color: '#6b7280' },
    statChange: (positive) => ({ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', fontWeight: 600, color: positive ? '#10b981' : '#ef4444' }),
    chartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
    chartCard: { background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)', border: '1px solid #ede9fe' },
    chartHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    chartTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    chartContainer: { height: '280px' },
    smallChartsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' },
    legendItems: { display: 'flex', gap: '1.5rem', marginTop: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' },
    legendDot: (color) => ({ width: '10px', height: '10px', borderRadius: '50%', background: color }),
    activityCard: { background: 'white', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 20px rgba(139, 92, 246, 0.08)', marginTop: '2rem', border: '1px solid #ede9fe' },
    activityTitle: { fontSize: '1.15rem', fontWeight: 700, color: '#1f2937', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    activityList: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    activityItem: { display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#faf5ff', borderRadius: '12px' },
    activityIcon: (type) => ({
      width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: type === 'course' ? '#f5f3ff' : type === 'assessment' ? '#d1fae5' : '#fce7f3',
      color: type === 'course' ? '#7c3aed' : type === 'assessment' ? '#10b981' : '#ec4899'
    }),
    activityInfo: { flex: 1 },
    activityName: { fontWeight: 600, color: '#1f2937', fontSize: '0.95rem' },
    activityDate: { fontSize: '0.8rem', color: '#6b7280' },
    activityStatus: (status) => ({
      padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
      background: status === 'completed' ? '#d1fae5' : status === 'passed' ? '#d1fae5' : status === 'applied' ? '#fce7f3' : '#fef3c7',
      color: status === 'completed' ? '#059669' : status === 'passed' ? '#059669' : status === 'applied' ? '#db2777' : '#d97706'
    }),
    insightCard: { background: 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)', borderRadius: '20px', padding: '2rem', color: 'white', marginTop: '2rem', boxShadow: '0 8px 30px rgba(139, 92, 246, 0.25)' },
    insightTitle: { fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' },
    insightText: { opacity: 0.95, marginBottom: '1.5rem', lineHeight: 1.6, fontSize: '1rem' },
    insightStats: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
    insightStat: {},
    insightValue: { fontSize: '2rem', fontWeight: 700 },
    insightLabel: { fontSize: '0.875rem', opacity: 0.85 }
  };

  if (!userData) {
    return (
      <div style={{ ...styles.container, textAlign: 'center', paddingTop: '4rem' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h2 style={{ color: '#111827', marginBottom: '0.5rem' }}>Loading Your Analytics...</h2>
          <p style={{ color: '#6b7280' }}>Please wait while we fetch your data</p>
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
          <p style={styles.subtitle}>Your personalized learning and career progress</p>
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

      {/* Main Charts */}
      <div style={styles.chartsGrid}>
        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><TrendingUp size={20} color="#7c3aed" /> Skill Progress Over Time</h3>
          </div>
          <div style={styles.chartContainer}>
            <Line data={progressData} options={chartOptions} />
          </div>
        </motion.div>

        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><BarChart3 size={20} color="#7c3aed" /> Skills Breakdown</h3>
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
            <h3 style={styles.chartTitle}><Target size={20} color="#7c3aed" /> Skill Comparison</h3>
          </div>
          <div style={{ ...styles.chartContainer, height: '250px' }}>
            <Radar data={radarData} options={{ ...chartOptions, scales: { r: { beginAtZero: true, max: 100 } } }} />
          </div>
          <div style={styles.legendItems}>
            <div style={styles.legendItem}><div style={styles.legendDot('#7c3aed')} /> Your Skills</div>
            <div style={styles.legendItem}><div style={styles.legendDot('#ec4899')} /> Industry Average</div>
          </div>
        </motion.div>

        <motion.div style={styles.chartCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}><Award size={20} color="#7c3aed" /> Course Completion</h3>
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
        <h3 style={styles.activityTitle}><Clock size={20} color="#7c3aed" /> Recent Activity</h3>
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
        <h3 style={styles.insightTitle}>🎯 AI-Powered Insights for {userData.name}</h3>
        <p style={styles.insightText}>
          Based on your progress, you're performing <strong>above average</strong> in technical skills! 
          You've completed {userData.coursesCompleted} courses and passed {userData.assessmentsPassed}/{userData.assessmentsTaken} assessments.
          Focus on <strong>System Design</strong> and <strong>Leadership skills</strong> to increase your job match rate to 90%+.
        </p>
        <div style={styles.insightStats}>
          <div style={styles.insightStat}><div style={styles.insightValue}>2 weeks</div><div style={styles.insightLabel}>To reach 85% readiness</div></div>
          <div style={styles.insightStat}><div style={styles.insightValue}>{userData.interviewsScheduled}</div><div style={styles.insightLabel}>Interviews scheduled</div></div>
          <div style={styles.insightStat}><div style={styles.insightValue}>Top 15%</div><div style={styles.insightLabel}>Among learners</div></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
