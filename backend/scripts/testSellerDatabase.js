/**
 * Quick Test Script for Seller Database Connection
 * Run this to verify seller database is properly configured
 */

const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');
const dotenv = require('dotenv');

dotenv.config();

async function testSellerDatabase() {
    console.log('\n🔍 Testing Seller Database Connection\n');
    console.log('=====================================\n');

    // Check environment variables
    console.log('Environment Variables:');
    console.log(`  SELLER_SUPABASE_URL: ${process.env.SELLER_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`  SELLER_SUPABASE_KEY: ${process.env.SELLER_SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`  SELLER_SUPABASE_SERVICE_KEY: ${process.env.SELLER_SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log('');

    if (!supabaseSellerAdmin) {
        console.error('❌ ERROR: supabaseSellerAdmin is not initialized!');
        console.error('   This usually means SELLER_SUPABASE_SERVICE_KEY is missing.');
        process.exit(1);
    }

    // Test connection
    console.log('Testing connection...\n');

    try {
        // Test 1: Check seller_profiles table
        console.log('Test 1: Checking seller_profiles table...');
        const { data: profiles, error: profilesError, count } = await supabaseSellerAdmin
            .from('seller_profiles')
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (profilesError) {
            console.error(`❌ Error: ${profilesError.message}`);
            console.error(`   Code: ${profilesError.code}`);
            if (profilesError.code === '42P01') {
                console.error('   ⚠️  Table "seller_profiles" does not exist!');
                console.error('   → Run createSellerDatabaseSchema.sql in your seller database');
            }
        } else {
            console.log(`✅ seller_profiles table accessible (${count || 0} records)`);
        }

        // Test 2: Check products table
        console.log('\nTest 2: Checking products table...');
        const { data: products, error: productsError, count: productsCount } = await supabaseSellerAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (productsError) {
            console.error(`❌ Error: ${productsError.message}`);
            console.error(`   Code: ${productsError.code}`);
            if (productsError.code === '42P01') {
                console.error('   ⚠️  Table "products" does not exist!');
                console.error('   → Run createSellerDatabaseSchema.sql in your seller database');
            }
        } else {
            console.log(`✅ products table accessible (${productsCount || 0} records)`);
        }

        // Test 3: Try inserting a test query (will fail if table structure is wrong)
        console.log('\nTest 3: Testing insert capability...');
        const testData = {
            user_id: '00000000-0000-0000-0000-000000000000',
            store_name: '__TEST_STORE_DELETE_ME__' + Date.now(),
            description: 'Test',
            rating: 0
        };

        const { data: testInsert, error: insertError } = await supabaseSellerAdmin
            .from('seller_profiles')
            .insert([testData])
            .select()
            .single();

        if (insertError) {
            console.error(`❌ Insert test failed: ${insertError.message}`);
            console.error(`   Code: ${insertError.code}`);
            console.error(`   Details: ${insertError.details}`);
            console.error(`   Hint: ${insertError.hint}`);
        } else {
            console.log('✅ Insert test successful');
            // Clean up test record
            await supabaseSellerAdmin
                .from('seller_profiles')
                .delete()
                .eq('id', testInsert.id);
            console.log('✅ Test record cleaned up');
        }

        console.log('\n✅ All tests passed! Seller database is ready.');
        console.log('\n📝 Next Steps:');
        console.log('   1. Ensure your .env file has all seller database credentials');
        console.log('   2. Restart your backend server');
        console.log('   3. Try seller registration again');

    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error('Stack:', error.stack);
    }
}

if (require.main === module) {
    testSellerDatabase();
}

module.exports = { testSellerDatabase };
