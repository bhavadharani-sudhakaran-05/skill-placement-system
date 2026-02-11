import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';

// Import stores to load/clear per-user data
import useCourseStore from './courseStore';
import useAssessmentStore from './assessmentStore';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { user, token } = response.data.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });

          // Load user-specific progress data (non-blocking)
          const userId = user.id || user._id;
          Promise.all([
            useCourseStore.getState().loadForUser(userId).catch(e => console.log('Course load error:', e)),
            useAssessmentStore.getState().loadForUser(userId).catch(e => console.log('Assessment load error:', e))
          ]).catch(() => {});
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const response = await api.post('/auth/register', userData);
          const { user, token } = response.data.data;
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });

          // Fresh user — load empty data for this user (non-blocking)
          const userId = user.id || user._id;
          Promise.all([
            useCourseStore.getState().loadForUser(userId).catch(e => console.log('Course load error:', e)),
            useAssessmentStore.getState().loadForUser(userId).catch(e => console.log('Assessment load error:', e))
          ]).catch(() => {});
          
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { 
            success: false, 
            error: error.response?.data?.message || 'Registration failed' 
          };
        }
      },

      logout: () => {
        // Save current user's data before clearing
        useCourseStore.getState()._saveForCurrentUser();
        useAssessmentStore.getState()._saveForCurrentUser();

        // Clear stores (in-memory state only, per-user data stays in localStorage)
        useCourseStore.getState().reset();
        useAssessmentStore.getState().clearAssessments();

        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },

      fetchUser: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data });
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      })
    }
  )
);

export default useAuthStore;
