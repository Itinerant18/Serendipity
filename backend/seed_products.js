const { supabaseAdmin } = require('./config/supabase');

async function seedProducts() {
    try {
        console.log('Seeding products with NEW SCHEMA (subcategory column)...');

        // 1. Get a user ID
        const { data: users, error: userError } = await supabaseAdmin.from('users').select('id').limit(1);
        if (userError || !users.length) {
            console.error('No users found to associate products with.');
            return;
        }
        const userId = users[0].id;

        // 2. DELETE ALL EXISTING PRODUCTS
        console.log('Deleting all existing products...');
        const { error: deleteError } = await supabaseAdmin.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all non-nil UUIDs
        if (deleteError) {
            console.error('Error deleting products:', deleteError);
            // Continue anyway, maybe table is empty
        }

        // 3. Sample Products across all 6 categories with dedicated subcategory
        const products = [
            // Electronics
            {
                name: 'Dell XPS 15',
                price: 185000,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1593642632823-8f785bc67252?auto=format&fit=crop&q=80&w=800',
                brand: 'Dell',
                category: 'Electronics',
                subcategory: 'Laptops',
                count_in_stock: 8,
                num_reviews: 56,
                rating: 4.5,
                description: 'The Dell XPS 15 is a high-performance laptop with a stunning InfinityEdge display, perfect for creators and professionals.'
            },
            {
                name: 'Logitech MX Master 3S',
                price: 8990,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80&w=800',
                brand: 'Logitech',
                category: 'Electronics',
                subcategory: 'Accessories',
                count_in_stock: 30,
                num_reviews: 120,
                rating: 4.8,
                description: 'An iconic master of the scroll. Quiet Click technology and 8K DPI tracking for precision on any surface.'
            },
            {
                name: 'Sony WH-1000XM5',
                price: 29900,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1618366712277-70f39e53b6ac?auto=format&fit=crop&q=80&w=800',
                brand: 'Sony',
                category: 'Electronics',
                subcategory: 'Audio',
                count_in_stock: 40,
                num_reviews: 156,
                rating: 4.7,
                description: 'Industry-leading noise cancellation. With two processors controlling eight microphones, WH-1000XM5 headphones redefine silence.'
            },
            // Fashion
            {
                name: 'Levi\'s 501 Original',
                price: 4999,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&q=80&w=800',
                brand: 'Levi\'s',
                category: 'Fashion',
                subcategory: 'Men\'s Wear',
                count_in_stock: 45,
                num_reviews: 88,
                rating: 4.6,
                description: 'The original blue jean. Close your eyes. Think “jeans.” Now open. They were 501s®, right?'
            },
            {
                name: 'Zara Floral Dress',
                price: 3590,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
                brand: 'Zara',
                category: 'Fashion',
                subcategory: 'Women\'s Wear',
                count_in_stock: 20,
                num_reviews: 34,
                rating: 4.2,
                description: 'A beautiful floral print dress with a flowing silhouette, perfect for summer outings.'
            },
            // Home & Living
            {
                name: 'Nespresso Vertuo Pop',
                price: 12900,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&q=80&w=800',
                brand: 'Nespresso',
                category: 'Home & Living',
                subcategory: 'Appliances',
                count_in_stock: 12,
                num_reviews: 72,
                rating: 4.8,
                description: 'Add a touch of color to your life with the Nespresso Vertuo Pop machine. Compact, smart, and versatile.'
            },
            {
                name: 'IKEA Billy Bookcase',
                price: 5500,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?auto=format&fit=crop&q=80&w=800',
                brand: 'IKEA',
                category: 'Home & Living',
                subcategory: 'Furniture',
                count_in_stock: 100,
                num_reviews: 500,
                rating: 4.5,
                description: 'It is estimated that every five seconds, one BILLY bookcase is sold somewhere in the world. Pretty impressive.'
            },
            // Beauty
            {
                name: 'The Ordinary Hyaluronic Acid',
                price: 850,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=800',
                brand: 'The Ordinary',
                category: 'Beauty',
                subcategory: 'Skincare',
                count_in_stock: 60,
                num_reviews: 450,
                rating: 4.9,
                description: 'A hydration support formula with ultra-pure, vegan hyaluronic acid.'
            },
            // Sports
            {
                name: 'Yoga Mat Pro',
                price: 2500,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&q=80&w=800',
                brand: 'Manduka',
                category: 'Sports',
                subcategory: 'Fitness',
                count_in_stock: 25,
                num_reviews: 95,
                rating: 4.7,
                description: 'The world\'s finest yoga mat. Ultra-dense cushioning for superior support and stability.'
            },
            // Books
            {
                name: 'Atomic Habits',
                price: 599,
                user_id: userId,
                image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800',
                brand: 'James Clear',
                category: 'Books',
                subcategory: 'Self-Help',
                count_in_stock: 150,
                num_reviews: 12000,
                rating: 5.0,
                description: 'An easy & proven way to build good habits & break bad ones. The definitive guide to habit formation.'
            }
        ];

        // 4. Insert
        const { error: insertError } = await supabaseAdmin.from('products').insert(products);

        if (insertError) {
            console.error('Insert Error:', insertError);
            throw insertError;
        }

        console.log(`Successfully deleted old products and seeded ${products.length} new products with separate subcategories!`);
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seedProducts();
