import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../services/auth';
import { authManager } from '../services/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: { name: string; email: string; password: string; mobile?: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  getCurrentUserRole: () => 'customer' | 'admin' | null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await authManager.login(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true });
        try {
          const user = await authManager.loginWithGoogle();
          if (user) {
             set({ user, isAuthenticated: true, isLoading: false });
          } else {
             set({ isLoading: false }); // User cancelled or failed
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },



      register: async (userData) => {
        set({ isLoading: true });
        try {
          const user = await authManager.register(userData);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },



      logout: async () => {
        set({ isLoading: true });
        try {
          await authManager.logout();
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      loadUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authManager.loadUser();
          set({ user, isAuthenticated: !!user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      getCurrentUserRole: () => {
        const { user } = get();
        if (!user) return null;
        if (user.isAdmin) return 'admin';
        return 'customer';
      },
    }),
    {
      name: 'auth-storage',
      storage: {
        getItem: async (name: string) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name: string, value: any) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name: string) => {
          await AsyncStorage.removeItem(name);
        },
      },
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);