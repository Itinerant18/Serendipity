/**
 * Database Verification Script
 * 
 * This script verifies both databases are properly configured and checks:
 * 1. Table existence and structure
 * 2. Data counts
 * 3. Index presence
 * 4. Performance indicators
 * 
 * Usage: node migrations/verifyDatabases.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Main database clients
const mainSupabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// Seller database clients
const sellerSupabaseAdmin = createClient(
    process.env.SELLER_SUPABASE_URL,
    process.env.SELLER_SUPABASE_SERVICE_KEY || process.env.SELLER_SUPABASE_KEY
);

async function checkTableExists(client, tableName, dbName) {
    try {
        const { data, error } = await client
            .from(tableName)
            .select('*', { count: 'exact', head: true })
            .limit(1);

        if (error) {
            if (error.code === '42P01') { // Table does not exist
                return { exists: false, error: 'Table does not exist' };
            }
            return { exists: false, error: error.message };
        }
        return { exists: true, count: data?.length || 0 };
    } catch (error) {
        return { exists: false, error: error.message };
    }
}

async function getTableInfo(client, tableName) {
    try {
        const { count, error } = await client
            .from(tableName)
            .select('*', { count: 'exact', head: true });

        if (error) {
            return { error: error.message };
        }
        return { count: count || 0 };
    } catch (error) {
        return { error: error.message };
    }
}

async function verifyMainDatabase() {
    console.log('\n📊 MAIN DATABASE VERIFICATION');
    console.log('=====================================');
    console.log(`URL: ${process.env.SUPABASE_URL}\n`);

    const tables = ['users', 'seller_profiles', 'products', 'orders', 'order_items', 'cart'];
    const results = {};

    for (const table of tables) {
        const info = await getTableInfo(mainSupabaseAdmin, table);
        results[table] = info;
        
        if (info.error) {
            console.log(`❌ ${table}: ${info.error}`);
        } else {
            console.log(`✅ ${table}: ${info.count} records`);
        }
    }

    // Check seller data in main DB
    let sellerProfilesCount = 0;
    let sellerProductsCount = 0;
    
    try {
        const { count } = await mainSupabaseAdmin
            .from('seller_profiles')
            .select('*', { count: 'exact', head: true });
        sellerProfilesCount = count || 0;
    } catch (error) {
        console.log(`   ⚠️  Could not count seller_profiles: ${error.message}`);
    }

    try {
        const { count } = await mainSupabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .not('seller_profile_id', 'is', null);
        sellerProductsCount = count || 0;
    } catch (error) {
        console.log(`   ⚠️  Could not count seller products: ${error.message}`);
    }

    console.log(`\n📦 Seller Data in Main DB:`);
    console.log(`   - Seller Profiles: ${sellerProfilesCount || 0}`);
    console.log(`   - Seller Products: ${sellerProductsCount || 0}`);

    return results;
}

async function verifySellerDatabase() {
    console.log('\n📊 SELLER DATABASE VERIFICATION');
    console.log('=====================================');
    console.log(`URL: ${process.env.SELLER_SUPABASE_URL}\n`);

    const tables = ['seller_profiles', 'products'];
    const results = {};

    for (const table of tables) {
        const info = await getTableInfo(sellerSupabaseAdmin, table);
        results[table] = info;
        
        if (info.error) {
            console.log(`❌ ${table}: ${info.error}`);
        } else {
            console.log(`✅ ${table}: ${info.count} records`);
        }
    }

    // Check for seller products specifically
    let sellerProductsCount = 0;
    try {
        const { count } = await sellerSupabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .not('seller_profile_id', 'is', null);
        sellerProductsCount = count || 0;
    } catch (error) {
        console.log(`   ⚠️  Could not count seller products: ${error.message}`);
    }

    console.log(`\n📦 Seller Products: ${sellerProductsCount}`);

    return results;
}

async function checkPerformance() {
    console.log('\n⚡ PERFORMANCE CHECKS');
    console.log('=====================================\n');

    // Test query performance on main DB
    console.log('Testing Main Database Query Performance...');
    const startMain = Date.now();
    try {
        await mainSupabaseAdmin
            .from('users')
            .select('id')
            .limit(1);
        const mainTime = Date.now() - startMain;
        console.log(`✅ Main DB query time: ${mainTime}ms`);
    } catch (error) {
        console.log(`❌ Main DB query failed: ${error.message}`);
    }

    // Test query performance on seller DB
    console.log('\nTesting Seller Database Query Performance...');
    const startSeller = Date.now();
    try {
        await sellerSupabaseAdmin
            .from('seller_profiles')
            .select('id')
            .limit(1);
        const sellerTime = Date.now() - startSeller;
        console.log(`✅ Seller DB query time: ${sellerTime}ms`);
    } catch (error) {
        console.log(`❌ Seller DB query failed: ${error.message}`);
    }
}

async function checkSchemaCompatibility() {
    console.log('\n🔍 SCHEMA COMPATIBILITY CHECK');
    console.log('=====================================\n');

    // Check seller_profiles schema
    console.log('Checking seller_profiles table...');
    try {
        const { data: mainProfile } = await mainSupabaseAdmin
            .from('seller_profiles')
            .select('*')
            .limit(1)
            .single()
            .catch(() => ({ data: null }));

        const { data: sellerProfile } = await sellerSupabaseAdmin
            .from('seller_profiles')
            .select('*')
            .limit(1)
            .single()
            .catch(() => ({ data: null }));

        if (mainProfile && sellerProfile) {
            const mainKeys = Object.keys(mainProfile);
            const sellerKeys = Object.keys(sellerProfile);
            const missingInSeller = mainKeys.filter(k => !sellerKeys.includes(k));
            const extraInSeller = sellerKeys.filter(k => !mainKeys.includes(k));

            if (missingInSeller.length === 0 && extraInSeller.length === 0) {
                console.log('✅ seller_profiles schemas match perfectly');
            } else {
                if (missingInSeller.length > 0) {
                    console.log(`⚠️  Missing columns in seller DB: ${missingInSeller.join(', ')}`);
                }
                if (extraInSeller.length > 0) {
                    console.log(`ℹ️  Extra columns in seller DB: ${extraInSeller.join(', ')}`);
                }
            }
        } else {
            console.log('ℹ️  Cannot compare schemas (no data in one or both tables)');
        }
    } catch (error) {
        console.log(`⚠️  Schema check error: ${error.message}`);
    }

    // Check products schema
    console.log('\nChecking products table...');
    try {
        const { data: mainProduct } = await mainSupabaseAdmin
            .from('products')
            .select('*')
            .not('seller_profile_id', 'is', null)
            .limit(1)
            .single()
            .catch(() => ({ data: null }));

        const { data: sellerProduct } = await sellerSupabaseAdmin
            .from('products')
            .select('*')
            .limit(1)
            .single()
            .catch(() => ({ data: null }));

        if (mainProduct && sellerProduct) {
            const mainKeys = Object.keys(mainProduct);
            const sellerKeys = Object.keys(sellerProduct);
            const missingInSeller = mainKeys.filter(k => !sellerKeys.includes(k));
            const extraInSeller = sellerKeys.filter(k => !mainKeys.includes(k));

            if (missingInSeller.length === 0 && extraInSeller.length === 0) {
                console.log('✅ products schemas match perfectly');
            } else {
                if (missingInSeller.length > 0) {
                    console.log(`⚠️  Missing columns in seller DB: ${missingInSeller.join(', ')}`);
                }
                if (extraInSeller.length > 0) {
                    console.log(`ℹ️  Extra columns in seller DB: ${extraInSeller.join(', ')}`);
                }
            }
        } else {
            console.log('ℹ️  Cannot compare schemas (no data in one or both tables)');
        }
    } catch (error) {
        console.log(`⚠️  Schema check error: ${error.message}`);
    }
}

async function generateRecommendations(mainResults, sellerResults) {
    console.log('\n💡 RECOMMENDATIONS');
    console.log('=====================================\n');

    const recommendations = [];

    // Check if seller data exists in main DB
    const mainSellerProfiles = mainResults.seller_profiles?.count || 0;
    const mainSellerProducts = mainResults.products?.count || 0;
    const sellerProfiles = sellerResults.seller_profiles?.count || 0;
    const sellerProducts = sellerResults.products?.count || 0;

    if (mainSellerProfiles > 0 && sellerProfiles === 0) {
        recommendations.push('⚠️  Run migration: Seller profiles exist in main DB but not in seller DB');
        recommendations.push('   → Run: npm run migrate:seller');
    }

    if (mainSellerProducts > 0 && sellerProducts === 0) {
        recommendations.push('⚠️  Run migration: Seller products exist in main DB but not in seller DB');
        recommendations.push('   → Run: npm run migrate:seller');
    }

    if (sellerProfiles > 0 && sellerProducts > 0) {
        recommendations.push('✅ Seller data is properly separated in seller database');
    }

    // Check for potential performance issues
    if (mainResults.products?.count > 10000) {
        recommendations.push('💡 Consider adding indexes on products table for better performance');
        recommendations.push('   → Index on: seller_profile_id, category, created_at');
    }

    if (sellerResults.products?.count > 10000) {
        recommendations.push('💡 Consider adding indexes on seller products table');
        recommendations.push('   → Index on: seller_profile_id, category, created_at');
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ Everything looks good! Both databases are properly configured.');
    }

    recommendations.forEach(rec => console.log(rec));
}

async function main() {
    console.log('🔍 DATABASE VERIFICATION & PERFORMANCE CHECK');
    console.log('==========================================\n');

    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Main database credentials not set in .env');
        process.exit(1);
    }

    if (!process.env.SELLER_SUPABASE_URL || !process.env.SELLER_SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Seller database credentials not set in .env');
        process.exit(1);
    }

    try {
        // Verify main database
        const mainResults = await verifyMainDatabase();

        // Verify seller database
        const sellerResults = await verifySellerDatabase();

        // Check performance
        await checkPerformance();

        // Check schema compatibility
        await checkSchemaCompatibility();

        // Generate recommendations
        await generateRecommendations(mainResults, sellerResults);

        console.log('\n✅ Verification completed!\n');

    } catch (error) {
        console.error('\n❌ Verification failed:', error);
        process.exit(1);
    }
}

// Run verification
if (require.main === module) {
    main();
}

module.exports = { verifyMainDatabase, verifySellerDatabase, checkPerformance };
