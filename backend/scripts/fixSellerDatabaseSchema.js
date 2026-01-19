/**
 * Fix Seller Database Schema Cache Issue
 * This script verifies the schema and provides instructions to fix PGRST205 errors
 */

const { supabaseSellerAdmin } = require('../config/supabaseSeller');
const dotenv = require('dotenv');

dotenv.config();

async function fixSellerDatabaseSchema() {
    console.log('\n🔧 Fixing Seller Database Schema Cache Issue\n');
    console.log('==========================================\n');

    if (!supabaseSellerAdmin) {
        console.error('❌ ERROR: supabaseSellerAdmin is not initialized!');
        console.error('   Please check your .env file has SELLER_SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    try {
        // Test 1: Check if we can query the table structure
        console.log('Test 1: Checking table structure...');
        const { data: tableInfo, error: tableError } = await supabaseSellerAdmin
            .rpc('exec_sql', {
                query: `
                    SELECT column_name, data_type 
                    FROM information_schema.columns 
                    WHERE table_schema = 'public' 
                    AND table_name = 'seller_profiles'
                    ORDER BY ordinal_position;
                `
            });

        if (tableError) {
            console.log('   Note: Cannot query table structure directly (this is normal)');
        }

        // Test 2: Try a simple select with explicit schema
        console.log('\nTest 2: Testing SELECT query...');
        const { data: selectData, error: selectError, count } = await supabaseSellerAdmin
            .from('seller_profiles')
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (selectError) {
            console.error(`❌ SELECT failed: ${selectError.message}`);
            console.error(`   Code: ${selectError.code}`);
            if (selectError.code === 'PGRST205') {
                console.error('\n   ⚠️  SCHEMA CACHE ISSUE DETECTED!');
                console.error('\n   Solution: Refresh PostgREST schema cache');
                console.error('   1. Go to your Supabase Dashboard');
                console.error('   2. Navigate to: Settings > API');
                console.error('   3. Click "Reload Schema" or "Refresh Schema Cache"');
                console.error('   4. Wait a few seconds for the cache to refresh');
                console.error('   5. Try again\n');
            }
        } else {
            console.log(`✅ SELECT works (${count || 0} records found)`);
        }

        // Test 3: Try insert with minimal data
        console.log('\nTest 3: Testing INSERT query...');
        const testData = {
            user_id: '00000000-0000-0000-0000-000000000000',
            store_name: '__TEST_STORE_' + Date.now(),
            description: 'Test',
            rating: 0
        };

        const { data: insertData, error: insertError } = await supabaseSellerAdmin
            .from('seller_profiles')
            .insert([testData])
            .select()
            .single();

        if (insertError) {
            console.error(`❌ INSERT failed: ${insertError.message}`);
            console.error(`   Code: ${insertError.code}`);
            console.error(`   Details: ${insertError.details}`);
            console.error(`   Hint: ${insertError.hint}`);

            if (insertError.code === 'PGRST205') {
                console.error('\n   ⚠️  SCHEMA CACHE ISSUE CONFIRMED!');
                console.error('\n   📋 Steps to Fix:');
                console.error('   1. Open Supabase Dashboard: https://supabase.com/dashboard');
                console.error('   2. Select your seller project (kfyocccbvsanihtzrfmb)');
                console.error('   3. Go to: Settings > API');
                console.error('   4. Look for "Reload Schema" or "Refresh Schema" button');
                console.error('   5. Click it and wait 10-30 seconds');
                console.error('   6. Alternatively, restart your Supabase project');
                console.error('\n   OR use SQL Editor to refresh:');
                console.error('   Run: NOTIFY pgrst, \'reload schema\';');
            } else if (insertError.code === '42P01') {
                console.error('\n   ⚠️  TABLE DOES NOT EXIST!');
                console.error('   Run the SQL schema script:');
                console.error('   backend/migrations/createSellerDatabaseSchema.sql');
            } else if (insertError.code === '23505') {
                console.error('\n   ⚠️  UNIQUE CONSTRAINT VIOLATION');
                console.error('   Test record already exists (this is OK)');
            }
        } else {
            console.log('✅ INSERT works!');
            // Clean up
            await supabaseSellerAdmin
                .from('seller_profiles')
                .delete()
                .eq('id', insertData.id);
            console.log('✅ Test record cleaned up');
        }

        // Test 4: Check RLS policies
        console.log('\nTest 4: Checking RLS status...');
        const { data: rlsInfo, error: rlsError } = await supabaseSellerAdmin
            .rpc('exec_sql', {
                query: `
                    SELECT tablename, rowsecurity 
                    FROM pg_tables 
                    WHERE schemaname = 'public' 
                    AND tablename = 'seller_profiles';
                `
            });

        if (rlsError) {
            console.log('   Note: Cannot check RLS status directly (this is normal)');
            console.log('   Using service role key should bypass RLS anyway');
        }

        console.log('\n✅ Diagnostic complete!\n');

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error('Stack:', error.stack);
    }
}

if (require.main === module) {
    fixSellerDatabaseSchema();
}

module.exports = { fixSellerDatabaseSchema };
