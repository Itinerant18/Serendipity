import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Stub storage for SSR (server-side rendering)
const createStubStorage = () => ({
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
});

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
        }),
        {
            name: 'auth-storage', // unique name
            getStorage: () => (typeof window !== 'undefined' ? localStorage : createStubStorage()), // safely handle SSR
        }
    )
);

export default useAuthStore;
