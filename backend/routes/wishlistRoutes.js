const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { supabaseSellerAdmin } = require('../config/supabaseSeller'); // Import seller client
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Get wishlist items
    const { data: wishlistItems, error } = await supabaseAdmin
        .from('wishlist')
        .select('product_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('❌ Error fetching wishlist:', error);
        res.status(500);
        throw new Error('Failed to fetch wishlist');
    }

    if (!wishlistItems || wishlistItems.length === 0) {
        return res.json([]);
    }

    const productIds = wishlistItems.map(item => item.product_id);

    // 2. Fetch from Main Database
    const { data: mainProducts, error: mainError } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', productIds);

    // 3. Fetch from Seller Database (if enabled)
    let sellerProducts = [];
    if (supabaseSellerAdmin) {
        const { data: sProducts, error: sellerError } = await supabaseSellerAdmin
            .from('products')
            .select('*')
            .in('id', productIds);

        if (!sellerError && sProducts) {
            sellerProducts = sProducts;
        }
    }

    // 4. Merge results
    const allProducts = [
        ...(mainProducts || []),
        ...sellerProducts
    ];

    // 5. Map back to wishlist items to preserve order and added_at date
    const result = wishlistItems.map(item => {
        const product = allProducts.find(p => p.id === item.product_id);
        // Add _id for frontend compatibility if needed, though id is standard now
        return product ? { ...product, _id: product.id, added_at: item.created_at } : null;
    }).filter(item => item !== null);

    res.json(result);
}));

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
        res.status(400);
        throw new Error('Product ID is required');
    }

    // Check if already in wishlist to avoid unique violation error spam
    const { data: existing } = await supabaseAdmin
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (existing) {
        return res.status(200).json({ message: 'Product already in wishlist' });
    }

    const { error } = await supabaseAdmin
        .from('wishlist')
        .insert({
            user_id: userId,
            product_id: productId
        });

    if (error) {
        console.error('❌ Error adding to wishlist:', error);
        res.status(500);
        throw new Error('Failed to add to wishlist');
    }

    res.status(201).json({ message: 'Product added to wishlist' });
}));

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;

    const { error } = await supabaseAdmin
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (error) {
        console.error('❌ Error removing from wishlist:', error);
        res.status(500);
        throw new Error('Failed to remove from wishlist');
    }

    res.json({ message: 'Product removed from wishlist' });
}));

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
router.delete('/clear', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { error } = await supabaseAdmin
        .from('wishlist')
        .delete()
        .eq('user_id', userId);

    if (error) {
        console.error('❌ Error clearing wishlist:', error);
        res.status(500);
        throw new Error('Failed to clear wishlist');
    }

    res.json({ message: 'Wishlist cleared' });
}));

module.exports = router;
