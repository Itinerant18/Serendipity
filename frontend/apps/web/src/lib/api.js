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

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Helper function for making API requests with proper error handling
 * Automatically includes auth token if user is logged in
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    // Get current session token
    let token = null;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        token = session?.access_token;
    } catch (e) {
        console.warn('Could not get auth session:', e);
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
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
