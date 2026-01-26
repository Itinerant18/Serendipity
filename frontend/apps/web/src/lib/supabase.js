
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase;

if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn('Supabase URL or Anon Key is missing. Google Login will not work.');
    // Mock client to prevent app crash
    supabase = {
        auth: {
            signInWithOAuth: async () => ({ error: { message: 'Supabase credentials missing in .env' } }),
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        }
    };
}

export { supabase };
