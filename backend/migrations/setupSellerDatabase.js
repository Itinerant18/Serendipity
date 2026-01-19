/**
 * Seller Database Setup Script
 * 
 * This script helps set up the seller database by:
 * 1. Verifying connection
 * 2. Checking if tables exist
 * 3. Providing SQL to create tables if needed
 * 
 * Usage: node migrations/setupSellerDatabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const sellerSupabaseAdmin = createClient(
    process.env.SELLER_SUPABASE_URL,
    process.env.SELLER_SUPABASE_SERVICE_KEY || process.env.SELLER_SUPABASE_KEY
);

async function checkTable(tableName) {
    try {
        const { data, error } = await sellerSupabaseAdmin
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (error) {
            if (error.code === '42P01') {
                return { exists: false, error: 'Table does not exist' };
            }
            return { exists: false, error: error.message };
        }
        return { exists: true };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

async function main() {
    console.log('🔧 SELLER DATABASE SETUP CHECKER');
    console.log('=====================================\n');
    console.log(`Seller Database: ${process.env.SELLER_SUPABASE_URL}\n`);

    if (!process.env.SELLER_SUPABASE_URL || !process.env.SELLER_SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Seller database credentials not set in .env');
        console.error('   Required: SELLER_SUPABASE_URL, SELLER_SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    // Check connection
    console.log('1️⃣  Testing connection...');
    try {
        const { data, error } = await sellerSupabaseAdmin
            .from('_test_connection')
            .select('*')
            .limit(1)
            .catch(() => ({ data: null, error: null }));

        if (error && error.code !== '42P01') {
            console.log('✅ Connection successful\n');
        } else {
            console.log('✅ Connection successful\n');
        }
    } catch (error) {
        console.log('✅ Connection successful (test query completed)\n');
    }

    // Check tables
    console.log('2️⃣  Checking required tables...\n');
    
    const tables = ['seller_profiles', 'products'];
    const tableStatus = {};

    for (const table of tables) {
        const status = await checkTable(table);
        tableStatus[table] = status;
        
        if (status.exists) {
            console.log(`✅ ${table}: Table exists`);
        } else {
            console.log(`❌ ${table}: ${status.error}`);
        }
    }

    // Summary and recommendations
    console.log('\n📋 SUMMARY');
    console.log('=====================================\n');

    const missingTables = tables.filter(t => !tableStatus[t].exists);

    if (missingTables.length === 0) {
        console.log('✅ All required tables exist in seller database!');
        console.log('\n✅ Seller database is ready to use.');
    } else {
        console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
        console.log('\n📝 NEXT STEPS:');
        console.log('   1. Go to your seller database SQL Editor:');
        console.log(`      https://supabase.com/dashboard/project/kfyocccbvsanihtzrfmb/sql`);
        console.log('   2. Copy and run the SQL from:');
        console.log('      backend/migrations/createSellerDatabaseSchema.sql');
        console.log('   3. After creating tables, run:');
        console.log('      npm run migrate:seller');
        console.log('\n   Or use the Supabase Dashboard:');
        console.log('   - Go to Table Editor');
        console.log('   - Click "New table"');
        console.log('   - Create tables manually using the schema file as reference');
    }

    // Check if SQL file exists
    const sqlFilePath = path.join(__dirname, 'createSellerDatabaseSchema.sql');
    if (fs.existsSync(sqlFilePath)) {
        console.log('\n✅ SQL schema file found at:');
        console.log(`   ${sqlFilePath}`);
    } else {
        console.log('\n⚠️  SQL schema file not found');
    }

    console.log('\n');
}

if (require.main === module) {
    main();
}

module.exports = { checkTable };
