import { useCallback } from 'react';
import useAuthStore from './authStore';

function useAuth() {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  const signInWithCredentials = useCallback(async ({ email, password }) => {
    console.log("Attempting login via:", 'http://localhost:5000/api/auth/login');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(text || 'Login failed');
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      login(data, data.token);
      return { success: true, user: data };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }, [login]);

  const signUpWithCredentials = useCallback(async ({ email, password, name }) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically login after register
      login(data, data.token);
      return { success: true, user: data };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }, [login]);

  // Mock implementations for social auth to prevent crashes if used
  const signInWithGoogle = useCallback(async () => { console.warn('Google Auth not implemented in backend yet'); }, []);
  const signInWithFacebook = useCallback(async () => { console.warn('Facebook Auth not implemented in backend yet'); }, []);
  const signInWithTwitter = useCallback(async () => { console.warn('Twitter Auth not implemented in backend yet'); }, []);

  return {
    user,
    token, // Expose token for API calls
    isAuthenticated,
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut: logout,
  }
}

export default useAuth;