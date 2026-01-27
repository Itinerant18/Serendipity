/**
 * Centralized API Configuration
 * 
 * This module provides the API base URL from environment variables.
 * Use this instead of hardcoding localhost URLs.
 * 
 * Usage:
 *   import { API_URL } from '@/lib/api';
 *   fetch(`${API_URL}/api/products`)
 */

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000');

/**
 * Helper function for making API requests with proper error handling
 */
export async function apiRequest(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
}
