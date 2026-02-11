import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Helper to get storage key for current user
const getUserStorageKey = (userId) => `assessment-${userId || 'guest'}`;

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
  } catch (e) { console.error('Failed to save assessment data:', e); }
};

const useAssessmentStore = create(
  persist(
    (set, get) => ({
      // Assessment results history
      completedAssessments: [],
      totalScore: 0,
      averageScore: 0,
      badgesEarned: [],
      lastUpdated: null,
      isLoading: false,
      currentUserId: null,
      
      // Real-time event listeners
      listeners: [],

      // Load data for a specific user - fetches from backend first
      loadForUser: async (userId) => {
        set({ currentUserId: userId, isLoading: true });
        
        try {
          // Try to fetch from backend first
          const response = await api.get('/users/get-progress');
          if (response.data.success && response.data.data.assessmentData) {
            const backendData = response.data.data.assessmentData;
            set({
              completedAssessments: backendData.completedAssessments || [],
              badgesEarned: backendData.badgesEarned || [],
              totalScore: backendData.totalScore || 0,
              averageScore: backendData.averageScore || 0,
              lastUpdated: Date.now(),
              isLoading: false
            });
            // Also save to localStorage as cache
            saveUserData(userId, {
              completedAssessments: backendData.completedAssessments || [],
              badgesEarned: backendData.badgesEarned || [],
              totalScore: backendData.totalScore || 0,
              averageScore: backendData.averageScore || 0,
              lastUpdated: Date.now()
            });
            return;
          }
        } catch (error) {
          console.log('Could not fetch from backend, using local data:', error.message);
        }
        
        // Fallback to localStorage
        const userData = loadUserData(userId);
        set({
          completedAssessments: userData.completedAssessments || [],
          totalScore: userData.totalScore || 0,
          averageScore: userData.averageScore || 0,
          badgesEarned: userData.badgesEarned || [],
          lastUpdated: userData.lastUpdated || null,
          isLoading: false
        });
      },

      // Sync to backend
      _syncToBackend: async () => {
        const { completedAssessments, badgesEarned, totalScore, averageScore } = get();
        try {
          await api.post('/users/sync-progress', {
            assessmentData: {
              completedAssessments,
              badgesEarned,
              totalScore,
              averageScore
            }
          });
        } catch (error) {
          console.log('Backend sync failed, data saved locally:', error.message);
        }
      },

      // Save current state for current user (local + backend)
      _saveForCurrentUser: () => {
        const { currentUserId, completedAssessments, totalScore, averageScore, badgesEarned, lastUpdated } = get();
        if (currentUserId) {
          saveUserData(currentUserId, { completedAssessments, totalScore, averageScore, badgesEarned, lastUpdated });
          // Also sync to backend
          get()._syncToBackend();
        }
      },
      
      // Subscribe to updates
      subscribe: (callback) => {
        set(state => ({ listeners: [...state.listeners, callback] }));
        return () => {
          set(state => ({ listeners: state.listeners.filter(l => l !== callback) }));
        };
      },
      
      // Notify all listeners of updates
      notifyListeners: () => {
        const state = get();
        state.listeners.forEach(listener => listener(state));
      },
      
      // Add a completed assessment
      addCompletedAssessment: async (assessmentResult) => {
        const { completedAssessments } = get();
        
        // Check if this assessment was already completed (by title)
        const existingIndex = completedAssessments.findIndex(
          a => a.title === assessmentResult.title
        );
        
        let updatedAssessments;
        if (existingIndex >= 0) {
          // Update existing assessment with new result
          updatedAssessments = [...completedAssessments];
          updatedAssessments[existingIndex] = {
            ...updatedAssessments[existingIndex],
            ...assessmentResult,
            attempts: (updatedAssessments[existingIndex].attempts || 1) + 1,
            completedAt: new Date().toISOString()
          };
        } else {
          // Add new assessment
          updatedAssessments = [
            ...completedAssessments,
            {
              ...assessmentResult,
              id: Date.now(),
              attempts: 1,
              completedAt: new Date().toISOString()
            }
          ];
        }
        
        // Calculate new stats
        const totalAssessments = updatedAssessments.length;
        const totalScore = updatedAssessments.reduce((sum, a) => sum + (a.score || 0), 0);
        const averageScore = totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0;
        
        // Collect badges
        const badgesEarned = updatedAssessments
          .filter(a => a.badge && a.score >= 70)
          .map(a => ({ name: a.badge, earnedFor: a.title, earnedAt: a.completedAt }));
        
        set({
          completedAssessments: updatedAssessments,
          totalScore,
          averageScore,
          badgesEarned,
          lastUpdated: new Date().toISOString()
        });
        
        // Auto-save for current user (local + backend)
        setTimeout(() => get()._saveForCurrentUser(), 0);
        
        // Try to save to backend directly too
        try {
          await api.post('/assessments/save-result', {
            title: assessmentResult.title,
            score: assessmentResult.score,
            correctAnswers: assessmentResult.correctAnswers,
            totalQuestions: assessmentResult.totalQuestions,
            timeTaken: assessmentResult.timeTaken,
            badge: assessmentResult.badge,
            status: 'completed'
          });
        } catch (error) {
          console.log('Could not save to backend, result saved locally:', error.message);
        }
        
        // Notify all listeners about the update
        get().notifyListeners();
        
        return assessmentResult;
      },
      
      // Add terminated/failed assessment
      addTerminatedAssessment: async (assessmentTitle, reason) => {
        const { completedAssessments } = get();
        
        const terminatedResult = {
          id: Date.now(),
          title: assessmentTitle,
          score: 0,
          status: 'terminated',
          terminationReason: reason,
          completedAt: new Date().toISOString()
        };
        
        const updatedAssessments = [...completedAssessments, terminatedResult];
        
        set({
          completedAssessments: updatedAssessments,
          lastUpdated: new Date().toISOString()
        });
        
        // Auto-save for current user (local + backend)
        setTimeout(() => get()._saveForCurrentUser(), 0);
        
        // Try to save to backend
        try {
          await api.post('/assessments/save-result', terminatedResult);
        } catch (error) {
          console.log('Could not save terminated result to backend:', error.message);
        }
        
        get().notifyListeners();
        
        return terminatedResult;
      },
      
      // Fetch assessments from backend
      fetchAssessments: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/assessments/my');
          const backendAssessments = response.data.data || [];
          
          // Merge with local assessments
          const { completedAssessments: localAssessments } = get();
          
          // Combine, preferring backend data
          const mergedAssessments = [...backendAssessments];
          
          // Add local assessments that aren't in backend
          localAssessments.forEach(local => {
            if (!mergedAssessments.find(b => b.title === local.title)) {
              mergedAssessments.push(local);
            }
          });
          
          // Recalculate stats
          const completed = mergedAssessments.filter(a => a.status === 'completed');
          const totalScore = completed.reduce((sum, a) => sum + (a.score || 0), 0);
          const averageScore = completed.length > 0 ? Math.round(totalScore / completed.length) : 0;
          
          const badgesEarned = completed
            .filter(a => a.badge && a.score >= 70)
            .map(a => ({ name: a.badge, earnedFor: a.title, earnedAt: a.completedAt }));
          
          set({
            completedAssessments: mergedAssessments,
            totalScore,
            averageScore,
            badgesEarned,
            isLoading: false,
            lastUpdated: new Date().toISOString()
          });
          
          return mergedAssessments;
        } catch (error) {
          console.error('Error fetching assessments:', error);
          set({ isLoading: false });
          return get().completedAssessments;
        }
      },
      
      // Get stats for dashboard
      getStats: () => {
        const { completedAssessments, averageScore, badgesEarned } = get();
        const completed = completedAssessments.filter(a => a.status === 'completed');
        
        return {
          completedCount: completed.length,
          averageScore,
          badgesCount: badgesEarned.length,
          totalAttempts: completedAssessments.length,
          recentAssessments: completed.slice(-5).reverse()
        };
      },
      
      // Clear all data
      clearAssessments: () => {
        const userId = get().currentUserId;
        set({
          completedAssessments: [],
          totalScore: 0,
          averageScore: 0,
          badgesEarned: [],
          lastUpdated: null
        });
        if (userId) saveUserData(userId, { completedAssessments: [], totalScore: 0, averageScore: 0, badgesEarned: [], lastUpdated: null });
      }
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        completedAssessments: state.completedAssessments,
        totalScore: state.totalScore,
        averageScore: state.averageScore,
        badgesEarned: state.badgesEarned,
        lastUpdated: state.lastUpdated,
        currentUserId: state.currentUserId
      })
    }
  )
);

export default useAssessmentStore;
