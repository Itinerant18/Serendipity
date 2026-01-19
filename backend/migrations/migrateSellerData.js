/**
 * Migration Script: Transfer Seller Data from Main Database to Seller Database
 * 
 * This script migrates:
 * 1. All seller_profiles from main database to seller database
 * 2. All products created by sellers from main database to seller database
 * 
 * Usage: node migrations/migrateSellerData.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

// Main database clients
const mainSupabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
const mainSupabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// Seller database clients
const sellerSupabase = createClient(
    process.env.SELLER_SUPABASE_URL,
    process.env.SELLER_SUPABASE_KEY
);
const sellerSupabaseAdmin = createClient(
    process.env.SELLER_SUPABASE_URL,
    process.env.SELLER_SUPABASE_SERVICE_KEY || process.env.SELLER_SUPABASE_KEY
);

async function migrateSellerProfiles() {
    console.log('\n📦 Step 1: Migrating seller_profiles...');
    
    try {
        // Fetch all seller profiles from main database
        const { data: sellerProfiles, error: fetchError } = await mainSupabaseAdmin
            .from('seller_profiles')
            .select('*');

        if (fetchError) {
            throw new Error(`Error fetching seller profiles: ${fetchError.message}`);
        }

        if (!sellerProfiles || sellerProfiles.length === 0) {
            console.log('✅ No seller profiles found in main database. Nothing to migrate.');
            return { migrated: 0, skipped: 0 };
        }

        console.log(`Found ${sellerProfiles.length} seller profile(s) to migrate`);

        let migrated = 0;
        let skipped = 0;

        // Migrate each seller profile
        for (const profile of sellerProfiles) {
            try {
                // Check if profile already exists in seller database
                const { data: existing, error: checkError } = await sellerSupabaseAdmin
                    .from('seller_profiles')
                    .select('id')
                    .eq('id', profile.id)
                    .single();

                // If profile exists, skip it
                if (existing) {
                    console.log(`⏭️  Skipping seller profile ${profile.id} (already exists in seller DB)`);
                    skipped++;
                    continue;
                }

                // If error is not "no rows found" (PGRST116), log warning but continue
                if (checkError && checkError.code !== 'PGRST116') {
                    console.warn(`⚠️  Warning checking profile ${profile.id}:`, checkError.message);
                    // Continue anyway - might be a schema issue but we'll try to insert
                }

                // Insert into seller database
                const { error: insertError } = await sellerSupabaseAdmin
                    .from('seller_profiles')
                    .insert([profile]);

                if (insertError) {
                    console.error(`❌ Error migrating profile ${profile.id}:`, insertError.message);
                    continue;
                }

                console.log(`✅ Migrated seller profile: ${profile.store_name} (ID: ${profile.id})`);
                migrated++;
            } catch (error) {
                console.error(`❌ Error processing profile ${profile.id}:`, error.message);
            }
        }

        console.log(`\n✅ Seller Profiles Migration Complete:`);
        console.log(`   - Migrated: ${migrated}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total: ${sellerProfiles.length}`);

        return { migrated, skipped };
    } catch (error) {
        console.error('❌ Fatal error in seller_profiles migration:', error);
        throw error;
    }
}

async function migrateSellerProducts() {
    console.log('\n📦 Step 2: Migrating seller products...');
    
    try {
        // Fetch all products that belong to sellers from main database
        const { data: sellerProducts, error: fetchError } = await mainSupabaseAdmin
            .from('products')
            .select('*')
            .not('seller_profile_id', 'is', null);

        if (fetchError) {
            throw new Error(`Error fetching seller products: ${fetchError.message}`);
        }

        if (!sellerProducts || sellerProducts.length === 0) {
            console.log('✅ No seller products found in main database. Nothing to migrate.');
            return { migrated: 0, skipped: 0 };
        }

        console.log(`Found ${sellerProducts.length} seller product(s) to migrate`);

        let migrated = 0;
        let skipped = 0;

        // Migrate products in batches to avoid overwhelming the database
        const batchSize = 50;
        for (let i = 0; i < sellerProducts.length; i += batchSize) {
            const batch = sellerProducts.slice(i, i + batchSize);
            console.log(`\n   Processing batch ${Math.floor(i / batchSize) + 1} (${batch.length} products)...`);

            // Check which products already exist
            const productIds = batch.map(p => p.id);
            const { data: existingProducts } = await sellerSupabaseAdmin
                .from('products')
                .select('id')
                .in('id', productIds);

            const existingIds = new Set((existingProducts || []).map(p => p.id));

            // Filter out existing products
            const productsToInsert = batch.filter(p => !existingIds.has(p.id));

            if (productsToInsert.length === 0) {
                console.log(`   ⏭️  All products in this batch already exist. Skipping...`);
                skipped += batch.length;
                continue;
            }

            // Insert batch into seller database
            const { error: insertError } = await sellerSupabaseAdmin
                .from('products')
                .insert(productsToInsert);

            if (insertError) {
                console.error(`   ❌ Error inserting batch:`, insertError.message);
                // Try inserting one by one if batch fails
                for (const product of productsToInsert) {
                    try {
                        const { error } = await sellerSupabaseAdmin
                            .from('products')
                            .insert([product]);
                        
                        if (error) {
                            console.error(`   ❌ Error migrating product ${product.id}:`, error.message);
                        } else {
                            migrated++;
                        }
                    } catch (err) {
                        console.error(`   ❌ Error migrating product ${product.id}:`, err.message);
                    }
                }
            } else {
                migrated += productsToInsert.length;
                skipped += (batch.length - productsToInsert.length);
                console.log(`   ✅ Migrated ${productsToInsert.length} product(s) in this batch`);
            }
        }

        console.log(`\n✅ Seller Products Migration Complete:`);
        console.log(`   - Migrated: ${migrated}`);
        console.log(`   - Skipped: ${skipped}`);
        console.log(`   - Total: ${sellerProducts.length}`);

        return { migrated, skipped };
    } catch (error) {
        console.error('❌ Fatal error in seller products migration:', error);
        throw error;
    }
}

async function verifyMigration() {
    console.log('\n🔍 Step 3: Verifying migration...');
    
    try {
        // Count seller profiles
        const { count: mainProfilesCount } = await mainSupabaseAdmin
            .from('seller_profiles')
            .select('*', { count: 'exact', head: true });
        
        const { count: sellerProfilesCount } = await sellerSupabaseAdmin
            .from('seller_profiles')
            .select('*', { count: 'exact', head: true });

        // Count seller products (products with seller_profile_id)
        const { count: mainProductsCount } = await mainSupabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .not('seller_profile_id', 'is', null);
        
        const { count: sellerProductsCount } = await sellerSupabaseAdmin
            .from('products')
            .select('*', { count: 'exact', head: true })
            .not('seller_profile_id', 'is', null);

        console.log('\n📊 Migration Summary:');
        console.log('   Seller Profiles:');
        console.log(`     - Main DB: ${mainProfilesCount || 0}`);
        console.log(`     - Seller DB: ${sellerProfilesCount || 0}`);
        console.log('   Seller Products:');
        console.log(`     - Main DB: ${mainProductsCount || 0}`);
        console.log(`     - Seller DB: ${sellerProductsCount || 0}`);

        if (sellerProfilesCount >= mainProfilesCount && sellerProductsCount >= mainProductsCount) {
            console.log('\n✅ Migration verification passed!');
        } else {
            console.log('\n⚠️  Warning: Some data may not have been migrated. Please review.');
        }
    } catch (error) {
        console.error('❌ Error during verification:', error.message);
    }
}

async function main() {
    console.log('🚀 Starting Seller Data Migration');
    console.log('=====================================');
    console.log(`Main Database: ${process.env.SUPABASE_URL}`);
    console.log(`Seller Database: ${process.env.SELLER_SUPABASE_URL}`);
    console.log('=====================================\n');

    // Validate environment variables
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Main database credentials not set in .env');
        process.exit(1);
    }

    if (!process.env.SELLER_SUPABASE_URL || !process.env.SELLER_SUPABASE_SERVICE_KEY) {
        console.error('❌ Error: Seller database credentials not set in .env');
        console.error('   Required: SELLER_SUPABASE_URL, SELLER_SUPABASE_SERVICE_KEY');
        process.exit(1);
    }

    try {
        // Step 1: Migrate seller profiles
        await migrateSellerProfiles();

        // Step 2: Migrate seller products
        await migrateSellerProducts();

        // Step 3: Verify migration
        await verifyMigration();

        console.log('\n✅ Migration completed successfully!');
        console.log('\n⚠️  IMPORTANT: After verifying the migration:');
        console.log('   1. Test your application with the new seller database');
        console.log('   2. Once confirmed working, you can optionally clean up seller data from main DB');
        console.log('   3. Keep a backup of the main database before deleting any data');

    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
if (require.main === module) {
    main();
}

module.exports = { migrateSellerProfiles, migrateSellerProducts, verifyMigration };
