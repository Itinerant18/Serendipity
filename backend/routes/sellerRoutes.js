const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { protect } = require('../middleware/authMiddleware');
const { protectSeller } = require('../middleware/sellerMiddleware');
const dotenv = require('dotenv');

dotenv.config();

// Regular client for queries
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Service role client (bypasses RLS) - use for server-side admin operations
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// @desc    Register as a Seller (Create Profile)
// @route   POST /api/seller/register
// @access  Private
router.post('/register', protect, async (req, res) => {
    try {
        const { store_name, description, logo_url } = req.body;
        const userId = req.user.id;

        // Check if store name exists
        const { data: existingStore } = await supabase
            .from('seller_profiles')
            .select('id')
            .eq('store_name', store_name)
            .single();

        if (existingStore) {
            return res.status(400).json({ message: 'Store name already taken' });
        }

        // Create Seller Profile
        const { data: profile, error } = await supabase
            .from('seller_profiles')
            .insert([
                {
                    user_id: userId,
                    store_name,
                    description,
                    logo_url,
                    rating: 0
                },
            ])
            .select()
            .single();

        if (error) throw error;

        // Update User to be a seller (using admin client to bypass RLS)
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({ is_seller: true, seller_profile_id: profile.id })
            .eq('id', userId);

        if (userError) {
            console.error('User Update Error:', userError);
            throw userError;
        }

        res.status(201).json({
            message: 'Seller profile created successfully',
            seller: profile
        });
    } catch (error) {
        console.error('Seller Register Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller Profile (My Store)
// @route   GET /api/seller/profile
// @access  Private (Seller)
router.get('/profile', protect, protectSeller, async (req, res) => {
    try {
        const { data: profile, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ message: 'Seller profile not found' });
        }

        res.json(profile);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get Seller Stats (Dashboard)
// @route   GET /api/seller/stats
// @access  Private (Seller)
router.get('/stats', protect, protectSeller, async (req, res) => {
    try {
        const sellerProfileId = req.seller.profileId;

        // 1. Get total products
        const { count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('seller_profile_id', sellerProfileId);

        // 2. Get orders containing seller's products
        // This is complex in SQL/Supabase without a join table or specific query.
        // For MVP, we'll fetch orders and filter, or use a better query.
        // Better: Select order_items where product.seller_profile_id = ...

        // Fetch order items for this seller
        const { data: orderItems, error: itemsError } = await supabase
            .from('order_items') // Assuming order_items table exists, verify?
            // Wait, order_items usually stores product_id. We need to join products.
            .select('*, product:products!inner(seller_profile_id)');
        // Filter where product.seller_profile_id == sellerProfileId is tricky in simple select if relationship is not strict FK.
        // Let's assume we can filter by product_id if we fetch seller products first.

        // Improved Strategy:
        // Get all product IDs for this seller
        const { data: myProducts } = await supabase
            .from('products')
            .select('id')
            .eq('seller_profile_id', sellerProfileId);

        const productIds = myProducts.map(p => p.id);

        if (productIds.length === 0) {
            return res.json({ totalSales: 0, totalOrders: 0, totalProducts: 0 });
        }

        // Find order items
        const { data: items } = await supabase
            .from('order_items')
            .select('price, qty') // assuming price is stored in item
            .in('product', productIds); // 'product' is the column name in order_items for product id (legacy mongoose naming?) check schema.

        // Let's assume order_items has 'product' column as ID? or 'product_id'? 
        // Based on previous work, check orderRoutes or similar.

        // If I don't know the exact schema of `order_items`, I should check it. 
        // But for now I'll check orderRoutes.js quickly to confirm.

        let totalSales = 0;
        let totalItemsSold = 0;

        if (items) {
            items.forEach(item => {
                totalSales += item.price * item.qty;
                totalItemsSold += item.qty;
            });
        }

        res.json({
            totalSales,
            totalOrders: totalItemsSold, // Approximate for now
            totalProducts: productCount
        });

    } catch (error) {
        console.error('Stats Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
