import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Helper to get storage key for current user
const getUserStorageKey = (userId) => `course-progress-${userId || 'guest'}`;

// Load user-specific data from localStorage
const loadUserData = (userId) => {
  try {
    const key = getUserStorageKey(userId);
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    return data?.state || {};
  } catch { return {}; }
};

// Save user-specific data to localStorage
const saveUserData = (userId, state) => {
  try {
    const key = getUserStorageKey(userId);
    localStorage.setItem(key, JSON.stringify({ state }));
  } catch (e) { console.error('Failed to save course data:', e); }
};

const useCourseStore = create(
  persist(
    (set, get) => ({
      // Course progress data: { courseId: { progress, videosWatched, completedAt, startedAt, status } }
      courseProgress: {},
      lastUpdated: null,
      currentUserId: null,

      // Load data for a specific user - fetches from backend first, then localStorage fallback
      loadForUser: async (userId) => {
        // Clear any previous user's data first
        set({ 
          currentUserId: userId,
          courseProgress: {},
          lastUpdated: null
        });
        
        try {
          // Try to fetch from backend first
          const response = await api.get('/users/get-progress');
          if (response.data.success && response.data.data.courseProgress) {
            const backendProgress = response.data.data.courseProgress;
            set({
              courseProgress: backendProgress,
              lastUpdated: Date.now()
            });
            // Also save to localStorage as cache
            saveUserData(userId, { courseProgress: backendProgress, lastUpdated: Date.now() });
            return;
          }
        } catch (error) {
          console.log('Could not fetch from backend, using local data:', error.message);
        }
        
        // Fallback to localStorage
        const userData = loadUserData(userId);
        set({
          courseProgress: userData.courseProgress || {},
          lastUpdated: userData.lastUpdated || null
        });
      },

      // Sync progress to backend
      _syncToBackend: async () => {
        const { courseProgress } = get();
        try {
          await api.post('/users/sync-progress', { courseProgress });
        } catch (error) {
          console.log('Backend sync failed, data saved locally:', error.message);
        }
      },

      // Save current state for current user (local + backend)
      _saveForCurrentUser: () => {
        const { currentUserId, courseProgress, lastUpdated } = get();
        if (currentUserId) {
          saveUserData(currentUserId, { courseProgress, lastUpdated });
          // Also sync to backend (debounced)
          get()._syncToBackend();
        }
      },

      // Update course progress
      updateCourseProgress: (courseId, progressData) => {
        const currentProgress = get().courseProgress[courseId] || {};
        const newProgress = {
          ...currentProgress,
          ...progressData,
          updatedAt: new Date().toISOString()
        };
        
        // If progress is 100%, mark as completed
        if (newProgress.progress >= 100) {
          newProgress.status = 'completed';
          newProgress.completedAt = newProgress.completedAt || new Date().toISOString();
        } else if (newProgress.progress > 0) {
          newProgress.status = 'in-progress';
          newProgress.startedAt = newProgress.startedAt || new Date().toISOString();
        }

        set(state => ({
          courseProgress: {
            ...state.courseProgress,
            [courseId]: newProgress
          },
          lastUpdated: Date.now()
        }));
        // Auto-save for current user (local + backend)
        setTimeout(() => get()._saveForCurrentUser(), 0);
      },

      // Mark video as watched
      markVideoWatched: (courseId, videoId, totalVideos, courseTitle) => {
        const current = get().courseProgress[courseId] || { videosWatched: [] };
        const videosWatched = [...new Set([...(current.videosWatched || []), videoId])];
        const progress = Math.round((videosWatched.length / totalVideos) * 100);
        
        get().updateCourseProgress(courseId, {
          videosWatched,
          progress,
          courseTitle: courseTitle || current.courseTitle || ''
        });
      },

      // Mark roadmap week as completed
      markRoadmapCompleted: (courseId, weekIndex, totalWeeks, courseTitle) => {
        const current = get().courseProgress[courseId] || { completedWeeks: [] };
        const completedWeeks = [...new Set([...(current.completedWeeks || []), weekIndex])];
        const progress = Math.round((completedWeeks.length / totalWeeks) * 100);
        
        get().updateCourseProgress(courseId, {
          completedWeeks,
          progress,
          courseTitle: courseTitle || current.courseTitle || ''
        });
      },

      // Get course stats for analytics
      getStats: () => {
        const progress = get().courseProgress;
        const courses = Object.values(progress);
        
        const completed = courses.filter(c => c.status === 'completed').length;
        const inProgress = courses.filter(c => c.status === 'in-progress').length;
        const totalEnrolled = courses.length;
        
        const avgProgress = courses.length > 0
          ? Math.round(courses.reduce((sum, c) => sum + (c.progress || 0), 0) / courses.length)
          : 0;
        
        return {
          completed,
          inProgress,
          totalEnrolled,
          avgProgress,
          totalHours: courses.reduce((sum, c) => sum + (c.hoursSpent || 0), 0)
        };
      },

      // Get progress for a specific course
      getCourseProgress: (courseId) => {
        return get().courseProgress[courseId] || { progress: 0, status: 'not-started' };
      },

      // Enroll in a course
      enrollCourse: (courseId, courseTitle) => {
        get().updateCourseProgress(courseId, {
          courseTitle,
          progress: 0,
          status: 'enrolled',
          enrolledAt: new Date().toISOString(),
          videosWatched: [],
          completedWeeks: []
        });
      },

      // Get all enrolled course IDs
      getEnrolledCourseIds: () => {
        return Object.keys(get().courseProgress).map(id => parseInt(id));
      },

      // Reset store (clears for current user too)
      reset: () => {
        const userId = get().currentUserId;
        set({ courseProgress: {}, lastUpdated: null });
        if (userId) saveUserData(userId, { courseProgress: {}, lastUpdated: null });
      }
    }),
    {
      name: 'course-progress-storage',
      partialize: (state) => ({
        courseProgress: state.courseProgress,
        lastUpdated: state.lastUpdated,
        currentUserId: state.currentUserId
      })
    }
  )
);

export default useCourseStore;
