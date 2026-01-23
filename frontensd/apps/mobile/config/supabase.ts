import { createClient } from '@supabase/supabase-js';

import AsyncStorage from '@react-native-async-storage/async-storage';

// Main Database (Customers, Orders, Cart)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Seller Database (Seller Profiles, Products)
const sellerSupabaseUrl = process.env.EXPO_PUBLIC_SELLER_SUPABASE_URL || 'YOUR_SELLER_SUPABASE_URL';
const sellerSupabaseAnonKey = process.env.EXPO_PUBLIC_SELLER_SUPABASE_ANON_KEY || 'YOUR_SELLER_SUPABASE_ANON_KEY';

export const supabaseSeller = createClient(sellerSupabaseUrl, sellerSupabaseAnonKey);

// Backend API base URL
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.135:5000/api';