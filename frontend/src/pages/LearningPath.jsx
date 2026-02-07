import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useCourseStore from '../store/courseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  Route, Target, CheckCircle, Clock, BookOpen, Award, ChevronRight,
  Play, Lock, TrendingUp, Zap, Star, ArrowRight, AlertCircle, Gift,
  Trophy, Sparkles, X, ArrowLeft, Download, ExternalLink
} from 'lucide-react';

// Same courses data as Courses page - Single source of truth
const courses = [
  {
    id: 1,
    title: 'Data Structures & Algorithms',
    provider: 'LeetCode',
    instructor: 'Tech Lead',
    level: 'Beginner',
    rating: 4.9,
    duration: 50,
    price: 0,
    tags: ['DSA', 'Problem Solving', 'Coding'],
    category: 'Programming',
    image: '📊',
    color: '#2E073F',
    description: 'Master data structures and algorithms from scratch.',
    skills: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting'],
    videos: 6
  },
  {
    id: 2,
    title: 'Machine Learning A-Z',
    provider: 'Coursera',
    instructor: 'Andrew Ng',
    level: 'Intermediate',
    rating: 4.9,
    duration: 80,
    price: 4999,
    tags: ['ML', 'Python', 'TensorFlow'],
    category: 'AI/ML',
    image: '🤖',
    color: '#2E073F',
    description: 'Complete machine learning course covering supervised and unsupervised learning.',
    skills: ['Linear Regression', 'Neural Networks', 'Deep Learning', 'Classification', 'Clustering'],
    videos: 5
  },
  {
    id: 3,
    title: 'Complete React Developer',
    provider: 'Udemy',
    instructor: 'John Smith',
    level: 'Beginner',
    rating: 4.8,
    duration: 45,
    price: 2499,
    tags: ['React', 'JavaScript', 'Frontend'],
    category: 'Web Development',
    image: '⚛️',
    color: '#06b6d4',
    description: 'Build modern web applications with React.',
    skills: ['Components', 'Hooks', 'State Management', 'Redux', 'Context API'],
    videos: 5
  },
  {
    id: 4,
    title: 'AWS Solutions Architect',
    provider: 'AWS Training',
    instructor: 'Cloud Expert',
    level: 'Advanced',
    rating: 4.7,
    duration: 60,
    price: 7999,
    tags: ['AWS', 'Cloud', 'DevOps'],
    category: 'Cloud',
    image: '☁️',
    color: '#f59e0b',
    description: 'Prepare for AWS Solutions Architect certification.',
    skills: ['EC2', 'S3', 'Lambda', 'VPC', 'IAM', 'CloudFormation'],
    videos: 3
  },
  {
    id: 5,
    title: 'Python for Data Science',
    provider: 'edX',
    instructor: 'Dr. Analytics',
    level: 'Beginner',
    rating: 4.8,
    duration: 55,
    price: 0,
    tags: ['Python', 'Data Science', 'Analytics'],
    category: 'Data Science',
    image: '🐍',
    color: '#10b981',
    description: 'Learn Python programming for data analysis.',
    skills: ['NumPy', 'Pandas', 'Matplotlib', 'Data Cleaning', 'Visualization'],
    videos: 3
  },
  {
    id: 6,
    title: 'MongoDB Fundamentals',
    provider: 'MongoDB University',
    instructor: 'MongoDB Team',
    level: 'Beginner',
    rating: 4.7,
    duration: 35,
    price: 0,
    tags: ['MongoDB', 'NoSQL', 'Database'],
    category: 'Web Development',
    image: '🍃',
    color: '#00ed64',
    description: 'Learn MongoDB from scratch.',
    skills: ['CRUD Operations', 'Aggregation', 'Indexing', 'Schema Design'],
    videos: 4
  },
  {
    id: 7,
    title: 'Node.js & Express Masterclass',
    provider: 'Udemy',
    instructor: 'Brad Traversy',
    level: 'Intermediate',
    rating: 4.8,
    duration: 50,
    price: 1999,
    tags: ['Node.js', 'Express', 'Backend', 'API'],
    category: 'Web Development',
    image: '🟢',
    color: '#339933',
    description: 'Build scalable backend applications.',
    skills: ['REST APIs', 'Authentication', 'Middleware', 'Error Handling'],
    videos: 5
  },
  {
    id: 8,
    title: 'Docker & Kubernetes',
    provider: 'Linux Foundation',
    instructor: 'DevOps Pro',
    level: 'Intermediate',
    rating: 4.8,
    duration: 45,
    price: 3999,
    tags: ['Docker', 'Kubernetes', 'Containers', 'DevOps'],
    category: 'Cloud',
    image: '🐳',
    color: '#2496ed',
    description: 'Master containerization and orchestration.',
    skills: ['Containers', 'Docker Compose', 'K8s Deployments', 'Helm'],
    videos: 5
  },
  {
    id: 9,
    title: 'TensorFlow Deep Learning',
    provider: 'Coursera',
    instructor: 'Laurence Moroney',
    level: 'Advanced',
    rating: 4.9,
    duration: 70,
    price: 5999,
    tags: ['TensorFlow', 'Deep Learning', 'Neural Networks', 'AI'],
    category: 'AI/ML',
    image: '🧠',
    color: '#ff6f00',
    description: 'Build neural networks with TensorFlow.',
    skills: ['CNNs', 'RNNs', 'Transfer Learning', 'Model Deployment'],
    videos: 5
  },
  {
    id: 10,
    title: 'CI/CD with Jenkins & GitHub Actions',
    provider: 'LinkedIn Learning',
    instructor: 'DevOps Expert',
    level: 'Intermediate',
    rating: 4.6,
    duration: 30,
    price: 1499,
    tags: ['CI/CD', 'Jenkins', 'GitHub Actions', 'DevOps'],
    category: 'Cloud',
    image: '⚙️',
    color: '#d33833',
    description: 'Automate development workflows.',
    skills: ['Pipelines', 'Automated Testing', 'Deployment Strategies'],
    videos: 4
  },
  {
    id: 11,
    title: 'NLP with Transformers',
    provider: 'Hugging Face',
    instructor: 'NLP Research Team',
    level: 'Advanced',
    rating: 4.9,
    duration: 60,
    price: 0,
    tags: ['NLP', 'Transformers', 'BERT', 'GPT', 'AI'],
    category: 'AI/ML',
    image: '🤗',
    color: '#ffd21e',
    description: 'Master NLP with Transformer models.',
    skills: ['BERT', 'GPT', 'Text Classification', 'Text Generation'],
    videos: 5
  },
  {
    id: 12,
    title: 'MERN Stack Developer',
    provider: 'SkillForge',
    instructor: 'Full Stack Pro',
    level: 'Intermediate',
    rating: 4.9,
    duration: 120,
    price: 0,
    tags: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript', 'Full Stack'],
    category: 'Web Development',
    image: '💻',
    color: '#2E073F',
    description: 'Become a complete MERN Stack Developer.',
    skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'REST APIs'],
    videos: 6
  },
  {
    id: 13,
    title: 'AI/ML Engineer',
    provider: 'SkillForge',
    instructor: 'AI Research Team',
    level: 'Advanced',
    rating: 4.9,
    duration: 150,
    price: 0,
    tags: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'AI'],
    category: 'AI/ML',
    image: '🤖',
    color: '#2E073F',
    description: 'Become an AI/ML Engineer.',
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps'],
    videos: 6
  },
  {
    id: 14,
    title: 'DevOps Engineer',
    provider: 'SkillForge',
    instructor: 'DevOps Expert',
    level: 'Intermediate',
    rating: 4.8,
    duration: 90,
    price: 0,
    tags: ['Docker', 'Kubernetes', 'CI/CD', 'AWS', 'Linux'],
    category: 'Cloud',
    image: '🚀',
    color: '#06b6d4',
    description: 'Become a DevOps Engineer.',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    videos: 5
  }
];

// Learning paths based on dedicated courses
const learningPaths = [
  { 
    id: 'full-stack', 
    title: 'MERN Stack Developer', 
    icon: '💻', 
    estimatedTime: '4 months', 
    jobsAvailable: 312,
    courseIds: [12], // MERN Stack Developer course
    skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JavaScript', 'REST APIs']
  },
  { 
    id: 'data-scientist', 
    title: 'AI/ML Engineer', 
    icon: '🤖', 
    estimatedTime: '5 months', 
    jobsAvailable: 245,
    courseIds: [13], // AI/ML Engineer course
    skills: ['Python', 'TensorFlow', 'Deep Learning', 'NLP', 'Computer Vision', 'MLOps']
  },
  { 
    id: 'cloud-engineer', 
    title: 'DevOps Engineer', 
    icon: '🚀', 
    estimatedTime: '3 months', 
    jobsAvailable: 198,
    courseIds: [14], // DevOps Engineer course
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform']
  }
];

const LearningPath = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { courseProgress, getEnrolledCourseIds, getCourseProgress, reset: resetProgress, enrollCourse } = useCourseStore();
  const [selectedPathId, setSelectedPathId] = useState('full-stack');
  const [showMilestoneDetails, setShowMilestoneDetails] = useState(null);
  const [showCertificates, setShowCertificates] = useState(false);

  // Get enrolled course IDs from store
  const enrolledCourseIds = getEnrolledCourseIds();
  
  // Get enrolled courses with real progress
  const enrolledCourses = enrolledCourseIds.map(id => {
    const course = courses.find(c => c.id === id);
    if (!course) return null;
    const progress = getCourseProgress(id);
    return {
      ...course,
      progress: progress.progress || 0,
      videosWatched: progress.videosWatched?.length || 0,
      status: progress.status || 'not-started'
    };
  }).filter(Boolean);

  // Calculate overall stats
  const totalEnrolled = enrolledCourses.length;
  const completedCourses = enrolledCourses.filter(c => c.progress === 100);
  const inProgressCourses = enrolledCourses.filter(c => c.progress > 0 && c.progress < 100);
  
  // Calculate overall progress
  const overallProgress = totalEnrolled > 0 
    ? Math.round(enrolledCourses.reduce((sum, c) => sum + c.progress, 0) / totalEnrolled)
    : 0;

  // Build path data with real progress
  const pathsWithProgress = learningPaths.map(path => {
    const pathCourses = path.courseIds.map(id => {
      const course = courses.find(c => c.id === id);
      const progress = getCourseProgress(id);
      const isEnrolled = enrolledCourseIds.includes(id);
      return { ...course, progress: progress.progress || 0, isEnrolled };
    });
    
    const enrolledInPath = pathCourses.filter(c => c.isEnrolled).length;
    const totalInPath = pathCourses.length;
    const pathProgress = enrolledInPath > 0 
      ? Math.round(pathCourses.filter(c => c.isEnrolled).reduce((sum, c) => sum + c.progress, 0) / enrolledInPath)
      : 0;
    
    return {
      ...path,
      progress: pathProgress,
      completedSkills: Math.round((pathProgress / 100) * path.skills.length),
      totalSkills: path.skills.length,
      courses: pathCourses
    };
  });

  const selectedPath = pathsWithProgress.find(p => p.id === selectedPathId);

  // Generate milestones from enrolled courses
  const milestones = enrolledCourses.map((course, index) => ({
    id: course.id,
    title: course.title,
    status: course.progress === 100 ? 'completed' : course.progress > 0 ? 'in-progress' : 'not-started',
    skills: course.skills.slice(0, 3),
    progress: course.progress,
    reward: `🏆 ${course.title.split(' ')[0]} Badge`,
    courses: 1,
    hours: course.duration,
    provider: course.provider,
    image: course.image,
    color: course.color,
    videosWatched: course.videosWatched,
    totalVideos: course.videos
  }));

  // If no enrolled courses, show recommended milestones from selected path
  const displayMilestones = milestones.length > 0 ? milestones : selectedPath.courses.map((course, index) => ({
    id: course.id,
    title: course.title,
    status: 'locked',
    skills: course.skills?.slice(0, 3) || [],
    progress: 0,
    reward: `🏆 ${course.title.split(' ')[0]} Badge`,
    courses: 1,
    hours: course.duration,
    provider: course.provider,
    image: course.image,
    color: course.color
  }));

  // Calculate skill gaps from all courses
  const allSkillsFromCourses = courses.flatMap(c => c.tags);
  const uniqueSkills = [...new Set(allSkillsFromCourses)];
  
  const skillGaps = uniqueSkills.slice(0, 5).map((skill, index) => {
    // Check if user has enrolled in course with this skill
    const relatedCourses = courses.filter(c => c.tags.includes(skill));
    const enrolledRelated = relatedCourses.filter(c => enrolledCourseIds.includes(c.id));
    const currentLevel = enrolledRelated.length > 0 
      ? Math.round(enrolledRelated.reduce((sum, c) => sum + getCourseProgress(c.id).progress, 0) / enrolledRelated.length)
      : 0;
    
    return {
      skill,
      current: currentLevel,
      required: 80,
      priority: index < 2 ? 'high' : index < 4 ? 'medium' : 'low'
    };
  });

  // Generate recommendations from unenrolled courses
  const unenrolledCourses = courses.filter(c => !enrolledCourseIds.includes(c.id));
  const recommendations = unenrolledCourses.slice(0, 3).map((course, index) => ({
    id: course.id,
    title: `Enroll in ${course.title}`,
    type: 'course',
    impact: course.price === 0 ? 'Free Course!' : `₹${course.price}`,
    icon: course.image,
    action: 'Enroll',
    courseId: course.id
  }));

  // Generate certificates from completed courses
  const earnedCertificates = completedCourses.map((course, index) => ({
    id: course.id,
    name: course.title,
    issuer: course.provider,
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    image: '🎓',
    skills: course.skills?.slice(0, 3) || course.tags,
    hours: course.duration,
    grade: 'A'
  }));

  // Current courses to continue (in progress)
  const currentCourses = inProgressCourses.map(course => ({
    id: course.id,
    title: course.title,
    progress: course.progress,
    timeLeft: `${Math.ceil((course.duration * (100 - course.progress)) / 100)} hours left`,
    provider: course.provider,
    image: course.image
  }));

  // If no in-progress courses, show enrolled but not started
  const displayCurrentCourses = currentCourses.length > 0 
    ? currentCourses 
    : enrolledCourses.filter(c => c.progress === 0).slice(0, 3).map(course => ({
        id: course.id,
        title: course.title,
        progress: 0,
        timeLeft: `${course.duration} hours`,
        provider: course.provider,
        image: course.image
      }));

  const downloadCertificate = (cert) => {
    const certificateHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${cert.name} - Certificate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 40px; }
    .certificate { width: 800px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 80px rgba(0,0,0,0.3); }
    .header { background: linear-gradient(135deg, #2E073F 0%, #2E073F 100%); padding: 40px; text-align: center; color: white; }
    .header h1 { font-size: 36px; letter-spacing: 3px; margin-bottom: 5px; }
    .body { padding: 50px; text-align: center; }
    .name { font-size: 42px; color: #111827; border-bottom: 3px solid #10b981; display: inline-block; padding-bottom: 10px; margin: 20px 0 30px; }
    .course-box { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 2px solid #10b981; border-radius: 15px; padding: 25px; margin: 30px 0; }
    .course-title { font-size: 24px; font-weight: 700; color: #059669; }
    .skills { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; margin: 25px 0; }
    .skill { background: linear-gradient(135deg, #ede9fe, #c4b5fd); color: #6d28d9; padding: 8px 20px; border-radius: 25px; font-weight: 600; }
    .footer { display: flex; justify-content: space-around; padding: 30px; background: #f9fafb; }
    .seal { width: 80px; height: 80px; border: 4px solid #f59e0b; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #fef3c7, #fde68a); }
    .seal-grade { font-size: 28px; color: #d97706; font-weight: 700; }
    .print-btn { display: block; margin: 20px auto; padding: 15px 40px; background: linear-gradient(135deg, #2E073F, #2E073F); color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; }
    @media print { .print-btn { display: none; } }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="header">
      <div>🎓 SkillForge Academy</div>
      <h1>CERTIFICATE</h1>
      <p>OF COMPLETION</p>
    </div>
    <div class="body">
      <p>This is to certify that</p>
      <div class="name">${user?.name || 'Student'}</div>
      <p>has successfully completed the course</p>
      <div class="course-box">
        <div class="course-title">${cert.name}</div>
        <p>Completed ${cert.hours} hours of training</p>
      </div>
      <p>Skills Acquired:</p>
      <div class="skills">
        ${cert.skills.map(s => `<span class="skill">${s}</span>`).join('')}
      </div>
    </div>
    <div class="footer">
      <div><strong>Date:</strong> ${cert.date}</div>
      <div class="seal"><div class="seal-grade">${cert.grade}</div><small>CERTIFIED</small></div>
      <div><strong>Issuer:</strong> ${cert.issuer}</div>
    </div>
  </div>
  <button class="print-btn" onclick="window.print()">📄 Print / Save as PDF</button>
</body>
</html>`;
    
    const blob = new Blob([certificateHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cert.name.replace(/\s+/g, '_')}_Certificate.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    window.open(url, '_blank');
  };

  const styles = {
    container: { padding: '1rem', maxWidth: '1100px', margin: '0 auto', fontFamily: "'Inter', sans-serif" },
    header: { marginBottom: '1rem' },
    title: { fontSize: '1.4rem', fontWeight: 700, background: 'linear-gradient(135deg, #2E073F, #2E073F)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.35rem' },
    subtitle: { color: '#6b7280', fontSize: '0.75rem' },
    grid: { display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1rem' },
    sidebar: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
    pathCard: (selected) => ({
      background: selected ? 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)' : 'white',
      borderRadius: '12px', padding: '0.75rem', cursor: 'pointer', transition: 'all 0.3s',
      border: selected ? 'none' : '1px solid #ede9fe', boxShadow: selected ? '0 6px 20px rgba(139,92,246,0.3)' : '0 2px 8px rgba(139,92,246,0.08)'
    }),
    pathHeader: { display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' },
    pathIcon: { fontSize: '1rem' },
    pathTitle: (selected) => ({ fontSize: '0.85rem', fontWeight: 600, color: selected ? 'white' : '#1f2937' }),
    pathStats: (selected) => ({ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: selected ? 'rgba(255,255,255,0.9)' : '#6b7280', fontSize: '0.7rem', marginBottom: '0.4rem' }),
    pathMeta: (selected) => ({ display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: selected ? 'rgba(255,255,255,0.8)' : '#9ca3af' }),
    progressMini: (selected) => ({ width: '50px', height: '5px', background: selected ? 'rgba(255,255,255,0.3)' : '#ede9fe', borderRadius: '3px', overflow: 'hidden' }),
    progressMiniFill: (selected, progress) => ({ width: `${progress}%`, height: '100%', background: selected ? 'white' : '#2E073F', borderRadius: '3px' }),
    skillGapCard: { background: 'white', borderRadius: '12px', padding: '0.75rem', marginTop: '0.5rem', boxShadow: '0 2px 8px rgba(139,92,246,0.08)', border: '1px solid #ede9fe' },
    skillGapTitle: { fontSize: '0.8rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    skillGapItem: { marginBottom: '0.75rem' },
    skillGapHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' },
    skillName: { fontWeight: 500, color: '#374151', fontSize: '0.72rem' },
    skillPriority: (priority) => ({ padding: '0.1rem 0.4rem', borderRadius: '8px', fontSize: '0.6rem', fontWeight: 600, background: priority === 'high' ? '#fee2e2' : priority === 'medium' ? '#fef3c7' : '#d1fae5', color: priority === 'high' ? '#dc2626' : priority === 'medium' ? '#d97706' : '#059669' }),
    skillGapBar: { height: '6px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden', position: 'relative' },
    skillGapFill: (current) => ({ position: 'absolute', height: '100%', width: `${current}%`, background: 'linear-gradient(90deg, #f59e0b, #ef4444)', borderRadius: '3px' }),
    skillGapTarget: (required) => ({ position: 'absolute', height: '100%', width: '2px', left: `${required}%`, background: '#10b981' }),
    recsCard: { background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)', borderRadius: '12px', padding: '0.75rem', marginTop: '0.5rem', border: '2px solid #c4b5fd' },
    recsTitle: { fontSize: '0.8rem', fontWeight: 700, color: '#2E073F', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    recItem: { display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem', background: 'white', borderRadius: '8px', marginBottom: '0.3rem' },
    recIcon: { fontSize: '0.85rem' },
    recInfo: { flex: 1 },
    recTitle: { fontWeight: 600, fontSize: '0.7rem', color: '#1f2937' },
    recImpact: { fontSize: '0.6rem', color: '#10b981', fontWeight: 500 },
    recBtn: { padding: '0.25rem 0.5rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '5px', fontSize: '0.6rem', fontWeight: 600, cursor: 'pointer' },
    mainContent: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    progressCard: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139,92,246,0.08)', display: 'flex', gap: '1rem', alignItems: 'center', border: '1px solid #ede9fe' },
    progressCircle: { width: '90px', height: '90px', flexShrink: 0 },
    progressInfo: { flex: 1 },
    progressTitle: { fontSize: '1rem', fontWeight: 700, color: '#1f2937', marginBottom: '0.35rem' },
    progressSubtitle: { color: '#6b7280', marginBottom: '0.5rem', fontSize: '0.75rem' },
    statsRow: { display: 'flex', gap: '0.85rem', flexWrap: 'wrap' },
    statBox: { display: 'flex', alignItems: 'center', gap: '0.35rem' },
    statIcon: (color) => ({ width: '32px', height: '32px', borderRadius: '8px', background: `${color}15`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    statValue: { fontWeight: 700, color: '#1f2937', fontSize: '1rem' },
    statLabel: { color: '#6b7280', fontSize: '0.65rem' },
    certsBtn: { display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', marginTop: '0.5rem', boxShadow: '0 3px 12px rgba(139,92,246,0.3)', fontSize: '0.75rem' },
    section: { background: 'white', borderRadius: '14px', padding: '1rem', boxShadow: '0 3px 15px rgba(139,92,246,0.08)', border: '1px solid #ede9fe' },
    sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    sectionTitle: { fontSize: '0.9rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    timeline: { position: 'relative', paddingLeft: '1.5rem' },
    timelineLine: { position: 'absolute', left: '9px', top: '0', bottom: '0', width: '2px', background: 'linear-gradient(180deg, #10b981, #2E073F, #ede9fe)' },
    milestone: { position: 'relative', marginBottom: '1rem' },
    milestoneIcon: (status) => ({
      position: 'absolute', left: '-1.5rem', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: status === 'completed' ? '#10b981' : status === 'in-progress' ? '#2E073F' : '#ede9fe',
      color: status === 'locked' || status === 'not-started' ? '#a78bfa' : 'white', zIndex: 1
    }),
    milestoneContent: (status) => ({
      background: status === 'in-progress' ? 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(167,139,250,0.08) 100%)' : status === 'completed' ? 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.08) 100%)' : '#faf5ff',
      borderRadius: '10px', padding: '0.65rem', border: status === 'in-progress' ? '2px solid #2E073F' : status === 'completed' ? '2px solid #10b981' : '1px solid #ede9fe', cursor: 'pointer', transition: 'all 0.2s'
    }),
    milestoneHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' },
    milestoneTitle: { fontWeight: 600, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem' },
    milestoneMeta: { display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: '#6b7280', marginBottom: '0.35rem' },
    milestoneBadge: (status) => ({
      padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.6rem', fontWeight: 600,
      background: status === 'completed' ? '#d1fae5' : status === 'in-progress' ? '#f5f3ff' : '#faf5ff',
      color: status === 'completed' ? '#059669' : status === 'in-progress' ? '#2E073F' : '#a78bfa'
    }),
    skillsList: { display: 'flex', gap: '0.35rem', flexWrap: 'wrap' },
    skillChip: (status) => ({
      padding: '0.15rem 0.45rem', borderRadius: '10px', fontSize: '0.65rem', fontWeight: 500,
      background: status === 'completed' ? '#d1fae5' : status === 'in-progress' ? '#f5f3ff' : '#faf5ff',
      color: status === 'completed' ? '#059669' : status === 'in-progress' ? '#2E073F' : '#a78bfa'
    }),
    rewardText: { display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.7rem', color: '#f59e0b', fontWeight: 500, marginTop: '0.35rem' },
    coursesList: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
    courseItem: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem', background: '#faf5ff', borderRadius: '10px', border: '1px solid #ede9fe' },
    courseIcon: { width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1rem' },
    courseInfo: { flex: 1 },
    courseTitle: { fontWeight: 600, color: '#1f2937', marginBottom: '0.15rem', fontSize: '0.8rem' },
    courseMeta: { display: 'flex', gap: '0.75rem', fontSize: '0.65rem', color: '#6b7280' },
    courseProgress: { width: '80px' },
    progressBar: { height: '5px', background: '#ede9fe', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.15rem' },
    progressFill: (progress) => ({ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #2E073F 0%, #2E073F 100%)', borderRadius: '3px' }),
    progressText: { fontSize: '0.65rem', color: '#2E073F', fontWeight: 600, textAlign: 'right' },
    continueBtn: { padding: '0.35rem 0.65rem', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #2E073F 0%, #2E073F 100%)', color: 'white', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', boxShadow: '0 3px 10px rgba(139,92,246,0.25)' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    certModal: { background: 'white', borderRadius: '16px', padding: '1.25rem', width: '100%', maxWidth: '420px' },
    certModalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    certModalTitle: { fontSize: '1rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    closeBtn: { background: '#f5f3ff', border: 'none', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer', color: '#2E073F' },
    certCard: { display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: '10px', border: '2px solid #10b981', marginBottom: '0.75rem' },
    certIcon: { fontSize: '1.75rem' },
    certInfo: { flex: 1 },
    certName: { fontWeight: 700, color: '#1f2937', fontSize: '0.85rem' },
    certIssuer: { fontSize: '0.72rem', color: '#6b7280' },
    certDate: { fontSize: '0.65rem', color: '#9ca3af' },
    downloadBtn: { padding: '0.35rem 0.75rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem', boxShadow: '0 3px 10px rgba(139,92,246,0.25)', fontSize: '0.72rem' },
    emptyState: { textAlign: 'center', padding: '1.5rem', color: '#6b7280' },
    emptyIcon: { fontSize: '2rem', marginBottom: '0.75rem' },
    enrollBtn: { marginTop: '0.75rem', padding: '0.5rem 1rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }
  };

  return (
    <div style={styles.container}>
      <motion.div style={{ ...styles.header, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={styles.title}>Adaptive Learning Path</h1>
          <p style={styles.subtitle}>Personalized roadmap based on your enrolled courses</p>
        </div>
        {enrolledCourseIds.length > 0 && (
          <button 
            onClick={() => { if(window.confirm('Reset all course progress? This cannot be undone.')) resetProgress(); }}
            style={{ padding: '0.5rem 1rem', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer' }}
          >
            Reset Progress
          </button>
        )}
      </motion.div>

      <div style={styles.grid}>
        {/* Sidebar - Path Selection */}
        <div style={styles.sidebar}>
          {pathsWithProgress.map((path, index) => (
            <motion.div key={path.id} style={styles.pathCard(selectedPathId === path.id)} onClick={() => setSelectedPathId(path.id)} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ scale: 1.02 }}>
              <div style={styles.pathHeader}>
                <span style={styles.pathIcon}>{path.icon}</span>
                <h3 style={styles.pathTitle(selectedPathId === path.id)}>{path.title}</h3>
              </div>
              <div style={styles.pathStats(selectedPathId === path.id)}>
                <span>{path.completedSkills}/{path.totalSkills} skills</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={styles.progressMini(selectedPathId === path.id)}>
                    <div style={styles.progressMiniFill(selectedPathId === path.id, path.progress)} />
                  </div>
                  <span>{path.progress}%</span>
                </div>
              </div>
              <div style={styles.pathMeta(selectedPathId === path.id)}>
                <span>⏱ {path.estimatedTime}</span>
                <span>💼 {path.jobsAvailable} jobs</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); navigate('/courses'); }} 
                style={{ marginTop: '0.75rem', width: '100%', padding: '0.5rem', background: selectedPathId === path.id ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.8rem' }}
              >
                {path.progress > 0 ? 'Continue Learning' : 'Start Learning'}
              </button>
            </motion.div>
          ))}

          {/* Skill Gap Analysis */}
          <motion.div style={styles.skillGapCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={styles.skillGapTitle}>
              <AlertCircle size={18} color="#f59e0b" /> Skill Gap Analysis
            </div>
            {skillGaps.map((gap) => (
              <div key={gap.skill} style={styles.skillGapItem}>
                <div style={styles.skillGapHeader}>
                  <span style={styles.skillName}>{gap.skill}</span>
                  <span style={styles.skillPriority(gap.priority)}>{gap.priority}</span>
                </div>
                <div style={styles.skillGapBar}>
                  <div style={styles.skillGapFill(gap.current)} />
                  <div style={styles.skillGapTarget(gap.required)} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                  <span>Current: {gap.current}%</span>
                  <span>Target: {gap.required}%</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <motion.div style={styles.recsCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div style={styles.recsTitle}>
                <Sparkles size={18} /> Recommended Courses
              </div>
              {recommendations.map((rec) => (
                <div key={rec.id} style={styles.recItem}>
                  <span style={styles.recIcon}>{rec.icon}</span>
                  <div style={styles.recInfo}>
                    <div style={styles.recTitle}>{rec.title}</div>
                    <div style={styles.recImpact}>{rec.impact}</div>
                  </div>
                  <button style={styles.recBtn} onClick={() => navigate('/courses')}>{rec.action}</button>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Main Content */}
        <div style={styles.mainContent}>
          {/* Progress Overview */}
          <motion.div style={styles.progressCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={styles.progressCircle}>
              <CircularProgressbar value={overallProgress} text={`${overallProgress}%`}
                styles={buildStyles({ textSize: '22px', pathColor: '#2E073F', textColor: '#111827', trailColor: '#ede9fe' })} />
            </div>
            <div style={styles.progressInfo}>
              <h2 style={styles.progressTitle}>{selectedPath?.icon} {selectedPath?.title} Path</h2>
              <p style={styles.progressSubtitle}>
                {totalEnrolled === 0 
                  ? 'Start your journey by enrolling in courses!' 
                  : `You're making great progress! ${completedCourses.length} course${completedCourses.length !== 1 ? 's' : ''} completed.`}
              </p>
              <div style={styles.statsRow}>
                <div style={styles.statBox}>
                  <div style={styles.statIcon('#10b981')}><CheckCircle size={20} /></div>
                  <div><div style={styles.statValue}>{completedCourses.length}</div><div style={styles.statLabel}>Completed</div></div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statIcon('#2E073F')}><Target size={20} /></div>
                  <div><div style={styles.statValue}>{inProgressCourses.length}</div><div style={styles.statLabel}>In Progress</div></div>
                </div>
                <div style={styles.statBox}>
                  <div style={styles.statIcon('#f59e0b')}><Trophy size={20} /></div>
                  <div><div style={styles.statValue}>{earnedCertificates.length}</div><div style={styles.statLabel}>Certificates</div></div>
                </div>
              </div>
              {earnedCertificates.length > 0 && (
                <button style={styles.certsBtn} onClick={() => setShowCertificates(true)}>
                  <Award size={18} /> View My Certificates
                </button>
              )}
            </div>
          </motion.div>

          {/* Milestones / Enrolled Courses */}
          <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}><Route size={22} color="#2E073F" /> {selectedPath?.title} - Required Courses</h3>
            </div>
            
            {/* Path Courses Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {selectedPath?.courses.map((course) => {
                const isEnrolledInCourse = enrolledCourseIds.includes(course.id);
                const courseProgressData = getCourseProgress(course.id);
                return (
                  <motion.div 
                    key={course.id} 
                    style={{ 
                      background: isEnrolledInCourse ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)' : 'linear-gradient(135deg, #faf5ff, #f3e8ff)', 
                      borderRadius: '16px', 
                      padding: '1.25rem', 
                      border: isEnrolledInCourse ? '2px solid #10b981' : '2px solid #c4b5fd',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 25px rgba(139,92,246,0.15)' }}
                    onClick={() => navigate('/courses')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>{course.image}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: '#1f2937', fontSize: '0.95rem' }}>{course.title}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{course.provider}</div>
                      </div>
                      {isEnrolledInCourse && (
                        <span style={{ background: '#10b981', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 600 }}>
                          {courseProgressData.progress === 100 ? '✓ Completed' : `${courseProgressData.progress || 0}%`}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                      <span>⏱ {course.duration}h</span>
                      <span>🎬 {course.videos} videos</span>
                      <span style={{ color: course.price === 0 ? '#10b981' : '#2E073F', fontWeight: 600 }}>
                        {course.price === 0 ? 'Free' : `₹${course.price}`}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      {course.skills?.slice(0, 3).map(skill => (
                        <span key={skill} style={{ background: '#ede9fe', color: '#2E073F', padding: '0.2rem 0.5rem', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 500 }}>{skill}</span>
                      ))}
                    </div>
                    {isEnrolledInCourse ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/courses'); }}
                        style={{ width: '100%', padding: '0.6rem', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <Play size={16} /> {courseProgressData.progress > 0 ? 'Continue Course' : 'Start Course'}
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); enrollCourse(course.id, course.title); }}
                        style={{ width: '100%', padding: '0.6rem', background: 'linear-gradient(135deg, #2E073F, #2E073F)', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      >
                        <BookOpen size={16} /> Enroll Now {course.price === 0 ? '(Free)' : ''}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {displayMilestones.length > 0 && (
              <>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#6b7280', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} /> Your Learning Progress
                </h4>
                <div style={styles.timeline}>
                  <div style={styles.timelineLine} />
                  {displayMilestones.map((milestone, index) => (
                    <motion.div key={milestone.id} style={styles.milestone} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                      <div style={styles.milestoneIcon(milestone.status)}>
                        {milestone.status === 'completed' ? <CheckCircle size={14} /> : milestone.status === 'in-progress' ? <Play size={12} /> : <Lock size={12} />}
                      </div>
                      <motion.div style={styles.milestoneContent(milestone.status)} whileHover={{ scale: 1.01 }} onClick={() => milestone.status !== 'locked' && navigate('/courses')}>
                        <div style={styles.milestoneHeader}>
                          <span style={styles.milestoneTitle}>
                            <span style={{ marginRight: '0.5rem' }}>{milestone.image}</span>
                            {milestone.title} <ChevronRight size={16} color="#9ca3af" />
                          </span>
                          <span style={styles.milestoneBadge(milestone.status)}>
                            {milestone.status === 'in-progress' ? `${milestone.progress}% complete` : milestone.status === 'completed' ? 'Completed' : 'Not Started'}
                          </span>
                      </div>
                      <div style={styles.milestoneMeta}>
                        <span>📚 {milestone.provider}</span>
                        <span>⏱ {milestone.hours} hours</span>
                        {milestone.videosWatched !== undefined && (
                          <span>🎬 {milestone.videosWatched}/{milestone.totalVideos} videos</span>
                        )}
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
              </>
            )}
          </motion.div>

          {/* Continue Learning */}
          {displayCurrentCourses.length > 0 && (
            <motion.div style={styles.section} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <div style={styles.sectionHeader}>
                <h3 style={styles.sectionTitle}><BookOpen size={22} color="#2E073F" /> Continue Learning</h3>
              </div>
              <div style={styles.coursesList}>
                {displayCurrentCourses.map((course) => (
                  <motion.div key={course.id} style={styles.courseItem} whileHover={{ scale: 1.01 }}>
                    <div style={styles.courseIcon}>{course.image}</div>
                    <div style={styles.courseInfo}>
                      <div style={styles.courseTitle}>{course.title}</div>
                      <div style={styles.courseMeta}>
                        <span>{course.provider}</span>
                        <span>•</span>
                        <span>{course.timeLeft}</span>
                      </div>
                    </div>
                    <div style={styles.courseProgress}>
                      <div style={styles.progressBar}><div style={styles.progressFill(course.progress)} /></div>
                      <div style={styles.progressText}>{course.progress}%</div>
                    </div>
                    <button style={styles.continueBtn} onClick={() => navigate('/courses')}><Play size={14} /> Resume</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
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
              {earnedCertificates.length > 0 ? earnedCertificates.map(cert => (
                <div key={cert.id} style={styles.certCard}>
                  <span style={styles.certIcon}>{cert.image}</span>
                  <div style={styles.certInfo}>
                    <div style={styles.certName}>{cert.name}</div>
                    <div style={styles.certIssuer}>{cert.issuer}</div>
                    <div style={styles.certDate}>Earned on {cert.date}</div>
                  </div>
                  <button style={styles.downloadBtn} onClick={() => downloadCertificate(cert)}><ExternalLink size={14} /> View</button>
                </div>
              )) : (
                <p style={{ textAlign: 'center', color: '#6b7280' }}>Complete courses to earn certificates!</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LearningPath;
