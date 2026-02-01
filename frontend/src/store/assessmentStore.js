import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

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
      
      // Real-time event listeners
      listeners: [],
      
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
        
        // Try to save to backend
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
        set({
          completedAssessments: [],
          totalScore: 0,
          averageScore: 0,
          badgesEarned: [],
          lastUpdated: null
        });
      }
    }),
    {
      name: 'assessment-storage',
      partialize: (state) => ({
        completedAssessments: state.completedAssessments,
        totalScore: state.totalScore,
        averageScore: state.averageScore,
        badgesEarned: state.badgesEarned,
        lastUpdated: state.lastUpdated
      })
    }
  )
);

export default useAssessmentStore;
