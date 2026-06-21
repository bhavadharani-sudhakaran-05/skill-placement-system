import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Pages
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

// Layout
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
  }, [isAuthenticated, user?.id, user?._id]);

  return (
    <AnimatePresence mode="wait">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

export default App;
