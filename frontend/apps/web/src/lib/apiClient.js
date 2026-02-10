/**
 * Centralized API Client with auth interceptors
 * 
 * Features:
 * - Auto-attach Authorization header
 * - Token expiration pre-check
 * - Auto-logout on 401 responses
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

/**
 * Decode JWT and extract expiration time
 */
function getTokenExpiry(token) {
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // Convert to ms
    } catch {
        return null;
    }
}

/**
 * Check if token is expired (with 30 second buffer)
 */
function isTokenExpired(token) {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return Date.now() > expiry - 30000; // 30 second buffer
}

/**
 * Get token from localStorage
 */
function getStoredToken() {
    if (typeof window === 'undefined') return null;
    try {
        const authStorage = localStorage.getItem('auth-storage');
        if (!authStorage) return null;
        const parsed = JSON.parse(authStorage);
        return parsed?.state?.token || null;
    } catch {
        return null;
    }
}

/**
 * Clear auth state and redirect to login
 */
function handleLogout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('cart-storage');
    window.location.href = '/account/signin';
}

/**
 * Main API client
 */
const apiClient = {
    /**
     * Make an authenticated API request
     * @param {string} endpoint - API endpoint (e.g., '/api/profile')
     * @param {RequestInit} options - Fetch options
     * @returns {Promise<Response>}
     */
    async request(endpoint, options = {}) {
        const token = getStoredToken();

        // Check token expiration before making request
        if (token && isTokenExpired(token)) {
            console.warn('Token expired, logging out...');
            handleLogout();
            throw new Error('Session expired. Please log in again.');
        }

        // Build headers with auth
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        // Make the request
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Handle 401 - unauthorized
        if (response.status === 401) {
            console.warn('Received 401, logging out...');
            handleLogout();
            throw new Error('Session expired. Please log in again.');
        }

        return response;
    },

    /**
     * GET request
     */
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    },

    /**
     * POST request
     */
    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    /**
     * PUT request
     */
    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    },

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    },

    /**
     * PATCH request
     */
    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
};

// Export utilities for use elsewhere
export { getTokenExpiry, isTokenExpired, getStoredToken, API_URL };
export default apiClient;
