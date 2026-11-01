import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from './lib/motion';

// Public & Student Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Courses from './pages/Courses';
import LearningPath from './pages/LearningPath';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Assessments from './pages/Assessments';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

// Dedicated Admin Module Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminJobs from './pages/admin/AdminJobs';
import AdminColleges from './pages/admin/AdminColleges';
import AdminAssessments from './pages/admin/AdminAssessments';
import AdminSettings from './pages/admin/AdminSettings';

// Dedicated Recruiter Module Pages
import RecruiterLoginPage from './pages/recruiter/RecruiterLoginPage';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import RecruiterJobs from './pages/recruiter/RecruiterJobs';
import RecruiterApplicants from './pages/recruiter/RecruiterApplicants';
import RecruiterCandidates from './pages/recruiter/RecruiterCandidates';
import RecruiterProfile from './pages/recruiter/RecruiterProfile';

// Layout & Protected Route
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Stores
import useAuthStore from './store/authStore';
import useCourseStore from './store/courseStore';
import useAssessmentStore from './store/assessmentStore';

function App() {
  const { user, isAuthenticated } = useAuthStore();

  // On app load and when user changes, restore user-specific data
  useEffect(() => {
    if (isAuthenticated && user) {
      const userId = user.id || user._id;
      if (userId) {
        // Reload fresh data from backend for this user
        useCourseStore.getState().loadForUser(userId);
        useAssessmentStore.getState().loadForUser(userId);
      }
    }
  }, [isAuthenticated, user]);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Dedicated Separate Login Pages */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/student/login" element={<LoginPage />} />
        <Route path="/recruiter/login" element={<RecruiterLoginPage />} />
        <Route path="/recruiter-login" element={<Navigate to="/recruiter/login" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin-login" element={<Navigate to="/admin/login" replace />} />

        {/* Public Registration (Student Only) */}
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected System Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          {/* Student & General Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin Module Pages */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/jobs" element={<AdminJobs />} />
          <Route path="/admin/colleges" element={<AdminColleges />} />
          <Route path="/admin/assessments" element={<AdminAssessments />} />
          <Route path="/admin/settings" element={<AdminSettings />} />

          {/* Recruiter Module Pages */}
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs" element={<RecruiterJobs />} />
          <Route path="/recruiter/applicants" element={<RecruiterApplicants />} />
          <Route path="/recruiter/candidates" element={<RecruiterCandidates />} />
          <Route path="/recruiter/profile" element={<RecruiterProfile />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
