import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage interface for Supabase auth
interface StorageAdapter {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

// Cross-platform storage adapter
const createStorage = (): StorageAdapter | undefined => {
  // On native platforms, use AsyncStorage
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return AsyncStorage;
  }

  // On web, check if we're in browser context
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: (key: string) => Promise.resolve(window.localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        window.localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        window.localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }

  // SSR or no storage available - don't persist sessions
  return undefined;
};

// Main Database (Customers, Orders, Cart)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

const storage = createStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: !!storage,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Seller Database (Seller Profiles, Products)
const sellerSupabaseUrl = process.env.EXPO_PUBLIC_SELLER_SUPABASE_URL || 'YOUR_SELLER_SUPABASE_URL';
const sellerSupabaseAnonKey = process.env.EXPO_PUBLIC_SELLER_SUPABASE_ANON_KEY || 'YOUR_SELLER_SUPABASE_ANON_KEY';

export const supabaseSeller = createClient(sellerSupabaseUrl, sellerSupabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: !!storage,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Backend API base URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.245.54.106:5000/api';