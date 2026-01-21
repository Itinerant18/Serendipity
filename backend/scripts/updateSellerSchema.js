const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const sellerSupabaseAdmin = createClient(
    process.env.SELLER_SUPABASE_URL,
    process.env.SELLER_SUPABASE_SERVICE_KEY || process.env.SELLER_SUPABASE_KEY
);

async function main() {
    console.log('🚀 Automatic Seller Schema Update');
    console.log('=================================');
    console.log(`Target: ${process.env.SELLER_SUPABASE_URL}`);

    if (!process.env.SELLER_SUPABASE_URL || !process.env.SELLER_SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Missing SELLER_SUPABASE_URL or SELLER_SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    const migrationFile = path.join(__dirname, '../migrations/expand_product_schema.sql');

    if (!fs.existsSync(migrationFile)) {
        console.error('❌ Migration file not found:', migrationFile);
        process.exit(1);
    }

    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log(`\n📄 Loaded migration file: expand_product_schema.sql (${sql.length} bytes)`);

    try {
        console.log('⏳ Attempting to execute SQL via RPC...');

        // Attempt to call 'exec_sql' function which might exist on the DB
        // This function is often added to allow raw SQL execution via API
        const { error } = await sellerSupabaseAdmin.rpc('exec_sql', { query: sql });

        if (error) {
            console.error('\n❌ Automatic update failed via RPC.');
            console.error('   Reason:', error.message);
            console.error('   Code:', error.code);

            console.log('\n⚠️  MANUAL ACTION REQUIRED:');
            console.log('   The automatic update could not run because the "exec_sql" helper function');
            console.log('   is likely missing from your database.');
            console.log('\n   Please follow these manual steps:');
            console.log('   1. Copy the content of: backend/migrations/expand_product_schema.sql');
            console.log('   2. Go to your Supabase Dashboard -> SQL Editor');
            console.log('   3. Run the SQL script there.');
        } else {
            console.log('\n✅ Schema successfully updated!');
            console.log('   New columns (sku, tags, dimensions, etc.) added to "products" table.');
        }

    } catch (err) {
        console.error('\n❌ Unexpected error:', err.message);
    }
}

main();
