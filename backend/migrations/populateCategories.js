const { supabaseAdmin } = require('../config/supabase');
const { supabaseSellerAdmin } = require('../config/supabaseSeller');
const dotenv = require('dotenv');

dotenv.config();

const categoriesData = {
    'Electronics': [
        'Smartphones & Accessories',
        'Laptops & Computers',
        'Audio & Headphones',
        'Cameras & Photography',
        'Gaming & Consoles',
        'Wearables & Smart Devices',
        'TV & Home Entertainment',
        'Computer Accessories'
    ],
    'Fashion': [
        "Men's Clothing",
        "Women's Clothing",
        "Kids' Clothing",
        'Footwear',
        'Bags & Luggage',
        'Watches',
        'Jewelry & Accessories',
        'Sunglasses & Eyewear'
    ],
    'Home & Living': [
        'Furniture',
        'Kitchen & Dining',
        'Bedding & Bath',
        'Home Decor',
        'Storage & Organization',
        'Lighting',
        'Garden & Outdoor',
        'Home Appliances'
    ],
    'Beauty': [
        'Skincare',
        'Makeup & Cosmetics',
        'Haircare',
        'Fragrances',
        'Personal Care & Grooming',
        'Bath & Body',
        'Beauty Tools & Accessories',
        "Men's Grooming"
    ],
    'Sports': [
        'Fitness Equipment',
        'Sportswear & Activewear',
        'Outdoor & Camping',
        'Cycling',
        'Yoga & Pilates',
        'Team Sports',
        'Running & Athletics',
        'Sports Accessories'
    ],
    'Books': [
        'Fiction',
        'Non-Fiction',
        "Children's Books",
        'Comics & Graphic Novels',
        'Educational & Textbooks',
        'Self-Help & Business',
        'Magazines',
        'E-Books & Audiobooks'
    ]
};

async function populateCategories() {
    console.log('\n🚀 Starting Category Population...\n');
    console.log('=====================================\n');

    try {
        // Create sample products in both databases to establish categories
        const sampleProducts = [];

        // Generate sample products for each category/subcategory combination
        Object.entries(categoriesData).forEach(([category, subcategories]) => {
            subcategories.forEach((subcategory, index) => {
                // Create products in main database
                sampleProducts.push({
                    name: `Sample ${subcategory} Product ${index + 1}`,
                    price: Math.floor(Math.random() * 1000) + 10,
                    category: category,
                    subcategory: subcategory,
                    brand: 'Sample Brand',
                    count_in_stock: Math.floor(Math.random() * 100),
                    description: `This is a sample product in ${category} > ${subcategory}`,
                    image: 'https://via.placeholder.com/300',
                    user_id: '00000000-0000-0000-0000-000000000000', // Dummy user ID
                    seller_profile_id: null,
                    seller_id: null,
                    num_reviews: 0,
                    rating: 0
                });
            });
        });

        console.log(`📦 Creating ${sampleProducts.length} sample products...\n`);

        // Insert into main database
        console.log('1. Inserting into main database...');
        const { data: mainProducts, error: mainError } = await supabaseAdmin
            .from('products')
            .insert(sampleProducts)
            .select('id, category, subcategory');

        if (mainError) {
            console.error('❌ Main database error:', mainError);
        } else {
            console.log(`✅ Created ${mainProducts.length} products in main database`);
        }

        // Insert into seller database (if seller database is configured)
        if (supabaseSellerAdmin) {
            console.log('\n2. Inserting into seller database...');
            const { data: sellerProducts, error: sellerError } = await supabaseSellerAdmin
                .from('products')
                .insert(sampleProducts.map(p => ({
                    ...p,
                    seller_profile_id: null // Will be set when sellers add products
                })))
                .select('id, category, subcategory');

            if (sellerError) {
                console.error('❌ Seller database error:', sellerError);
            } else {
                console.log(`✅ Created ${sellerProducts.length} products in seller database`);
            }
        } else {
            console.log('⚠️  Seller database not configured, skipping...');
        }

        // Verify categories
        console.log('\n3. Verifying categories...\n');
        const { data: mainCategories } = await supabaseAdmin
            .from('products')
            .select('category')
            .not('category', 'is', null);

        const uniqueCategories = [...new Set(mainCategories?.map(p => p.category) || [])].sort();
        
        console.log('📋 Categories found in database:');
        uniqueCategories.forEach(cat => {
            const subcats = categoriesData[cat] || [];
            console.log(`   • ${cat} (${subcats.length} subcategories)`);
        });

        console.log('\n✅ Category population completed!\n');
        console.log('📝 Next steps:');
        console.log('   1. Categories and subcategories are now available in the database');
        console.log('   2. The API endpoints will automatically return these categories');
        console.log('   3. You can delete the sample products if needed');
        console.log('   4. Categories will persist as long as at least one product exists\n');

    } catch (error) {
        console.error('\n❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    populateCategories()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { populateCategories, categoriesData };
