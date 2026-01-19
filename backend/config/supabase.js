const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Avoid logging secrets in production. If you need debug output, log only booleans.
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL Loaded:', !!supabaseUrl);
  console.log('Supabase Key Loaded:', !!supabaseKey);
  console.log('Supabase Service Key Loaded:', !!supabaseServiceKey);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client with Service Role Key for bypassing RLS
const supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : supabase; // Fallback to anon (will fail RLS if not set, which is expected behavior)

module.exports = {
  supabase,
  supabaseAdmin,
};
