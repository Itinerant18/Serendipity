/**
 * Centralized API Configuration
 * 
 * This module provides the API base URL from environment variables.
 * Use this instead of hardcoding localhost URLs.
 * 
 * Usage:
 *   import { API_URL, apiRequest } from '@/lib/api';
 *   const data = await apiRequest('/api/products');
 */

import { supabase } from '@/lib/supabase';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Helper function for making API requests with proper error handling
 * Automatically includes auth token if user is logged in
 */
import useAuthStore from '@/utils/authStore';

export async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    // Get current session token
    let token = null;

    // 1. Try getting token from global auth store (Custom Auth)
    // 1. Try getting token from global auth store (Custom Auth)
    try {
        const authState = useAuthStore.getState();
        if (authState && authState.token) {
            token = authState.token;
            // Check for expiration and refresh if needed
            if (authState.isTokenValid && !authState.isTokenValid() && authState.refreshToken) {
                console.log('Token expired in apiRequest, attempting refresh...');
                try {
                    const refreshResponse = await fetch(`${API_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken: authState.refreshToken }),
                    });

                    if (refreshResponse.ok) {
                        const data = await refreshResponse.json();
                        // Update store
                        authState.setTokens(data.token, data.refreshToken);
                        token = data.token;
                        console.log('Token refreshed successfully in apiRequest');
                    } else {
                        throw new Error('Refresh failed');
                    }
                } catch (refreshError) {
                    console.warn('Token refresh failed in apiRequest, logging out...', refreshError);
                    authState.logout();
                    throw new Error('Session expired. Please log in again.');
                }
            }
        }
    } catch (e) {
        console.warn('Could not get auth store token:', e);
    }

    // 2. Fallback to Supabase session (Social Auth / Direct Supabase)
    if (!token) {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) throw error;
            token = session?.access_token;
        } catch (e) {
            console.warn('Could not get supabase auth session:', e);
        }
    }

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Add auth header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        if (response.status === 401) {
            console.warn('Received 401 in apiRequest, logging out...');
            try {
                useAuthStore.getState().logout();
                window.location.href = '/account/signin';
            } catch (e) { console.error('Logout failed', e); }
            throw new Error('Session expired. Please log in again.');
        }
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
