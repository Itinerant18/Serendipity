const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const sellerSupabaseUrl = process.env.SELLER_SUPABASE_URL;
const sellerSupabaseKey = process.env.SELLER_SUPABASE_KEY;
const sellerSupabaseServiceKey = process.env.SELLER_SUPABASE_SERVICE_KEY;

console.log('Seller Supabase URL:', sellerSupabaseUrl);
console.log('Seller Supabase Key Loaded:', !!sellerSupabaseKey, sellerSupabaseKey?.substring(0, 10));
console.log('Seller Supabase Service Key Loaded:', !!sellerSupabaseServiceKey, sellerSupabaseServiceKey?.substring(0, 10));

// Validate seller database credentials
if (!sellerSupabaseUrl || !sellerSupabaseKey) {
    console.error('⚠️  WARNING: Seller database credentials not fully configured!');
    console.error('   Required: SELLER_SUPABASE_URL, SELLER_SUPABASE_KEY');
    console.error('   Seller database operations may fail.');
}

if (!sellerSupabaseServiceKey) {
    console.error('⚠️  WARNING: SELLER_SUPABASE_SERVICE_KEY not set!');
    console.error('   Admin operations on seller database may fail.');
}

// Regular client for seller database queries
const supabaseSeller = createClient(
    sellerSupabaseUrl || '',
    sellerSupabaseKey || ''
);

// Admin client with Service Role Key for bypassing RLS in seller database
let supabaseSellerAdmin = null;
if (sellerSupabaseServiceKey && sellerSupabaseUrl) {
    supabaseSellerAdmin = createClient(sellerSupabaseUrl, sellerSupabaseServiceKey);
} else {
    // Set to null to cause errors early if service key is missing
    // Routes should check for this and return clear error messages
    supabaseSellerAdmin = null;
}

module.exports = {
    supabaseSeller,
    supabaseSellerAdmin,
};
