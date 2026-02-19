import { useCallback } from 'react';
import useAuthStore from './authStore';
import useCartStore from './cartStore';
import { supabase } from '@/lib/supabase';

import { API_URL } from '@/lib/api';

function useAuth() {
  const { user, token, isAuthenticated, hasHydrated, login, logout, updateUser, setUser, setToken, setIsAuthenticated } = useAuthStore();

  const signInWithCredentials = useCallback(async ({ email, password }) => {
    console.log("Attempting login via:", `${API_URL}/api/auth/login`);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
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
        return { success: false, error: data.message || 'Login failed' };
      }

      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatar: data.avatar || null,
        isAdmin: data.isAdmin,
        isSeller: data.isSeller,
        sellerProfileId: data.sellerProfileId,
      };

      login(userData, data.token, data.refreshToken);

      // Restore cart from server after successful login
      try {
        await useCartStore.getState().restoreFromServer(data.token);
      } catch (e) {
        console.warn('Cart restore after login failed:', e);
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Login failed' };
    }
  }, [login]);

  const signUpWithCredentials = useCallback(async ({ email, password, name, mobile }) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, mobile }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Registration failed' };
      }

      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatar: data.avatar || null,
        isAdmin: data.isAdmin,
        isSeller: data.isSeller || false,
        sellerProfileId: data.sellerProfileId,
      };

      if (data.token) {
        login(userData, data.token, data.refreshToken);
      }

      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message || 'Registration failed' };
    }
  }, [login]);

  const signInAsSeller = useCallback(async ({ email, password }) => {
    console.log("Attempting seller login via:", `${API_URL}/api/auth/seller-login`);
    try {
      const response = await fetch(`${API_URL}/api/auth/seller-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.message || 'Seller login failed' };
      }

      const userData = {
        id: data._id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatar: data.avatar || null,
        isAdmin: data.isAdmin,
        isSeller: data.isSeller,
        sellerProfileId: data.sellerProfileId,
      };

      login(userData, data.token, data.refreshToken);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Seller login error:', error);
      return { success: false, error: error.message || 'Seller login failed' };
    }
  }, [login]);

  const signInWithGoogle = useCallback(async (role = 'customer') => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_intent_role', role);
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Google login error:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const signInWithFacebook = useCallback(async () => {
    console.warn('Facebook Auth not implemented in backend yet');
    return { success: false, error: 'Facebook Auth not implemented' };
  }, []);

  const signInWithTwitter = useCallback(async () => {
    console.warn('Twitter Auth not implemented in backend yet');
    return { success: false, error: 'Twitter Auth not implemented' };
  }, []);

  return {
    user,
    token,
    isAuthenticated,
    hasHydrated,
    signInWithCredentials,
    signUpWithCredentials,
    signInAsSeller,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
    signOut: async () => {
      // Sync cart to server BEFORE clearing local state
      try {
        await useCartStore.getState().syncToServer();
      } catch (e) {
        console.warn('Cart sync before logout failed:', e);
      }

      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Error signing out from supabase:', error);
      }
      logout();
      useCartStore.getState().clearCart();
      localStorage.removeItem('cart-storage');
      window.location.href = '/account/signin';
    },
    updateUser,
    setUser: (userData) => useAuthStore.setState({ user: userData }),
    setToken: (token) => useAuthStore.setState({ token }),
    setIsAuthenticated: (val) => useAuthStore.setState({ isAuthenticated: val }),
  }
}

export default useAuth;