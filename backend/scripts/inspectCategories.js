require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const mainUrl = process.env.SUPABASE_URL;
const mainKey = process.env.SUPABASE_KEY;
const sellerUrl = process.env.SELLER_SUPABASE_URL;
const sellerKey = process.env.SELLER_SUPABASE_KEY;

if (!mainUrl || !mainKey || !sellerUrl || !sellerKey) {
    console.error('Missing Supabase credentials in .env');
    console.error(`Main URL: ${!!mainUrl}, Main Key: ${!!mainKey}`);
    console.error(`Seller URL: ${!!sellerUrl}, Seller Key: ${!!sellerKey}`);
    process.exit(1);
}

const mainSupabase = createClient(mainUrl, mainKey);
const sellerSupabase = createClient(sellerUrl, sellerKey);

async function inspectCategories() {
    console.log('Fetching subcategories from BOTH Main and Seller databases...');

    // Helper to fetch from a client
    const fetchFromDB = async (client, name) => {
        const { data, error } = await client
            .from('products')
            .select('category, subcategory');
        if (error) {
            console.error(`Error fetching from ${name}:`, error.message);
            return [];
        }
        return data || [];
    };

    const [mainData, sellerData] = await Promise.all([
        fetchFromDB(mainSupabase, 'Main DB'),
        fetchFromDB(sellerSupabase, 'Seller DB')
    ]);

    const allProducts = [...mainData, ...sellerData];
    console.log(`\nTotal Products: ${allProducts.length} (Main: ${mainData.length}, Seller: ${sellerData.length})`);

    // Group by category
    const categoryMap = {};
    allProducts.forEach(p => {
        if (!p.category) return;
        if (!categoryMap[p.category]) {
            categoryMap[p.category] = new Set();
        }
        if (p.subcategory) {
            categoryMap[p.category].add(p.subcategory);
        }
    });

    console.log('\nCombined Subcategories by Category:');
    Object.keys(categoryMap).sort().forEach(cat => {
        console.log(`\nCategory: "${cat}"`);
        const subs = Array.from(categoryMap[cat]).sort();
        subs.forEach(sub => console.log(`  - "${sub}"`));
    });
}

inspectCategories();
