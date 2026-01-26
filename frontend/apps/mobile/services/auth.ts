import AsyncStorage from '@react-native-async-storage/async-storage';
import API_CONFIG from '../config/api';
import { supabase } from '../config/supabase';
import * as Linking from 'expo-linking';

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  isAdmin: boolean;
  token: string;
}

class AuthManager {
  private static instance: AuthManager;
  private currentUser: User | null = null;

  static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login Response Status:', response.status);
      const textData = await response.text();
      console.log('Login Response Text:', textData);

      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        console.error('Failed to parse login response:', e);
        throw new Error(`Server returned non-JSON response: ${textData.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      this.currentUser = data;
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('token', data.token);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }



  async register(userData: {
    name: string;
    email: string;
    password: string;
    mobile?: string;
  }): Promise<User> {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('Register Response Status:', response.status);
      const textData = await response.text();
      console.log('Register Response Text:', textData);

      let data;
      try {
        data = JSON.parse(textData);
      } catch (e) {
        console.error('Failed to parse register response:', e);
        throw new Error(`Server returned non-JSON response: ${textData.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      this.currentUser = data;
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('token', data.token);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }



  async logout(): Promise<void> {
    this.currentUser = null;
    await AsyncStorage.multiRemove(['user', 'token']);

    // Also clear Supabase sessions if they exist
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn('Error signing out from Supabase:', error);
    }
  }

  async loadUser(): Promise<User | null> {
    if (this.currentUser) {
      return this.currentUser;
    }

    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        return this.currentUser;
      }
    } catch (error) {
      console.error('Load user error:', error);
    }

    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getToken(): string | null {
    return this.currentUser?.token || null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.isAdmin || false;
  }

  async openSellerPortal() {
    try {
      const canOpen = await Linking.canOpenURL(API_CONFIG.WEB_URL);
      if (canOpen) {
        await Linking.openURL(API_CONFIG.WEB_URL);
      } else {
        console.error('Cannot open web URL:', API_CONFIG.WEB_URL);
      }
    } catch (error) {
      console.error('Error opening seller portal:', error);
    }
  }

  async loginWithGoogle(): Promise<User | null> {
    try {
      const redirectUrl = Linking.createURL('/');
      console.log('Google Login Redirect URL:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No OAuth URL returned');
      console.log('Google Auth URL:', data.url);

      // Use require here to avoid import issues if not available, though package.json says it is.
      const WebBrowser = require('expo-web-browser');
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        // Parse access_token and refresh_token from the URL fragment
        const params = new URLSearchParams(result.url.split('#')[1]);
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          const { data: { session }, error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          if (sessionError) throw sessionError;

          if (session?.user) {
            // Sync with our backend / AuthManager user structure
            // For now, we reuse the session user details
            this.currentUser = {
              _id: session.user.id,
              name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email!,
              isAdmin: false, // Default for google login
              token: session.access_token,
            };

            await AsyncStorage.setItem('user', JSON.stringify(this.currentUser));
            await AsyncStorage.setItem('token', this.currentUser.token);

            return this.currentUser;
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }
}

export const authManager = AuthManager.getInstance();