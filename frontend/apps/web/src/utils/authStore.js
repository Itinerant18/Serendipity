import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Stub storage for SSR (server-side rendering)
const createStubStorage = () => ({
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
});

/**
 * Decode JWT and extract expiration time
 */
const getTokenExpiry = (token) => {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
};

/**
 * Check if token is expired (with 30 second buffer)
 */
const isTokenExpired = (token) => {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return Date.now() > expiry - 30000;
};

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            hasHydrated: false,
            login: (userData, token) => set({ user: userData, token, isAuthenticated: true }),
            logout: () => set({ user: null, token: null, isAuthenticated: false }),
            updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),
            setHasHydrated: (val) => set({ hasHydrated: val }),

            // Token helpers
            getToken: () => get().token,
            isTokenValid: () => {
                const token = get().token;
                return token && !isTokenExpired(token);
            },
            getTokenExpiry: () => getTokenExpiry(get().token),
        }),
        {
            name: 'auth-storage',
            getStorage: () => (typeof window !== 'undefined' ? localStorage : createStubStorage()),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

export { getTokenExpiry, isTokenExpired };
export default useAuthStore;

