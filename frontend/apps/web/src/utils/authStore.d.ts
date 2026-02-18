export interface User {
    id: string;
    email: string;
    name?: string;
    [key: string]: any;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    hasHydrated: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
    setHasHydrated: (val: boolean) => void;
    getToken: () => string | null;
    isTokenValid: () => boolean | null;
    getTokenExpiry: () => number | null;
}

import { StoreApi, UseBoundStore } from 'zustand';

declare const useAuthStore: UseBoundStore<StoreApi<AuthState>>;

export default useAuthStore;

export declare const getTokenExpiry: (token: string) => number | null;
export declare const isTokenExpired: (token: string) => boolean | null;
