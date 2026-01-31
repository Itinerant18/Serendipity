const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { supabaseSellerAdmin } = require('../config/supabaseSeller');
const { protect } = require('../middleware/authMiddleware');

/**
 * Helper: Normalize product ID to string
 * Ensures consistent type handling
 */
const normalizeProductId = (productId) => {
    if (typeof productId === 'object' && productId !== null) {
        return String(productId.id || productId._id || productId);
    }
    return String(productId).trim();
};

/**
 * Helper: Log wishlist operations
 */
const logWishlistOperation = (operation, userId, details) => {
    const timestamp = new Date().toISOString();
    console.log(`[WISHLIST ${operation}] ${timestamp} | User: ${userId} | ${JSON.stringify(details)}`);
};

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const startTime = Date.now();
    
    logWishlistOperation('GET_START', userId, {});

    // 1. Get wishlist items
    const { data: wishlistItems, error } = await supabaseAdmin
        .from('wishlist')
        .select('product_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        logWishlistOperation('GET_ERROR', userId, { error: error.message });
        res.status(500);
        throw new Error('Failed to fetch wishlist');
    }

    if (!wishlistItems || wishlistItems.length === 0) {
        logWishlistOperation('GET_EMPTY', userId, { duration: Date.now() - startTime });
        return res.json([]);
    }

    const productIds = wishlistItems.map(item => item.product_id);

    // 2. Fetch from Main Database
    const { data: mainProducts, error: mainError } = await supabaseAdmin
        .from('products')
        .select('*')
        .in('id', productIds);

    if (mainError) {
        logWishlistOperation('GET_PRODUCTS_ERROR', userId, { error: mainError.message });
    }

    // 3. Fetch from Seller Database (if enabled)
    let sellerProducts = [];
    if (supabaseSellerAdmin) {
        const { data: sProducts, error: sellerError } = await supabaseSellerAdmin
            .from('products')
            .select('*')
            .in('id', productIds);

        if (sellerError) {
            logWishlistOperation('GET_SELLER_PRODUCTS_ERROR', userId, { error: sellerError.message });
        } else if (sProducts) {
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
        return product ? { 
            ...product, 
            _id: product.id, 
            added_at: item.created_at,
            id: normalizeProductId(product.id)
        } : null;
    }).filter(item => item !== null);

    logWishlistOperation('GET_SUCCESS', userId, { 
        itemCount: result.length, 
        duration: Date.now() - startTime 
    });

    res.json(result);
}));

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    let { productId } = req.body;

    // Normalize product ID
    productId = normalizeProductId(productId);

    if (!productId || productId === 'undefined' || productId === 'null') {
        res.status(400);
        throw new Error('Valid Product ID is required');
    }

    logWishlistOperation('ADD_START', userId, { productId });

    // Check if already in wishlist
    const { data: existing, error: checkError } = await supabaseAdmin
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
        logWishlistOperation('ADD_CHECK_ERROR', userId, { productId, error: checkError.message });
        res.status(500);
        throw new Error('Failed to check wishlist');
    }

    if (existing) {
        logWishlistOperation('ADD_EXISTS', userId, { productId });
        return res.status(200).json({ message: 'Product already in wishlist' });
    }

    const { error } = await supabaseAdmin
        .from('wishlist')
        .insert({
            user_id: userId,
            product_id: productId
        });

    if (error) {
        logWishlistOperation('ADD_ERROR', userId, { productId, error: error.message });
        res.status(500);
        throw new Error('Failed to add to wishlist');
    }

    logWishlistOperation('ADD_SUCCESS', userId, { productId });
    res.status(201).json({ message: 'Product added to wishlist' });
}));

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
router.delete('/:productId', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    let { productId } = req.params;

    // Normalize product ID
    productId = normalizeProductId(productId);

    if (!productId || productId === 'undefined' || productId === 'null') {
        res.status(400);
        throw new Error('Valid Product ID is required');
    }

    logWishlistOperation('REMOVE_START', userId, { productId });

    // Check if item exists first
    const { data: existingItem, error: checkError } = await supabaseAdmin
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    if (checkError && checkError.code !== 'PGRST116') {
        logWishlistOperation('REMOVE_CHECK_ERROR', userId, { productId, error: checkError.message });
        res.status(500);
        throw new Error('Failed to check wishlist item');
    }

    if (!existingItem) {
        logWishlistOperation('REMOVE_NOT_FOUND', userId, { productId });
        return res.status(404).json({ message: 'Item not found in wishlist' });
    }

    // Delete the item
    const { error: deleteError } = await supabaseAdmin
        .from('wishlist')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (deleteError) {
        logWishlistOperation('REMOVE_ERROR', userId, { productId, error: deleteError.message });
        res.status(500);
        throw new Error('Failed to remove from wishlist');
    }

    logWishlistOperation('REMOVE_SUCCESS', userId, { productId });
    res.json({ message: 'Product removed from wishlist' });
}));

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
router.delete('/clear', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const startTime = Date.now();

    logWishlistOperation('CLEAR_START', userId, {});

    // Get count before deleting
    const { data: itemsToDelete, error: countError } = await supabaseAdmin
        .from('wishlist')
        .select('id')
        .eq('user_id', userId);

    if (countError) {
        logWishlistOperation('CLEAR_COUNT_ERROR', userId, { error: countError.message });
        res.status(500);
        throw new Error('Failed to count wishlist items');
    }

    if (!itemsToDelete || itemsToDelete.length === 0) {
        logWishlistOperation('CLEAR_EMPTY', userId, {});
        return res.json({ message: 'Wishlist already empty', count: 0 });
    }

    const { error } = await supabaseAdmin
        .from('wishlist')
        .delete()
        .eq('user_id', userId);

    if (error) {
        logWishlistOperation('CLEAR_ERROR', userId, { 
            count: itemsToDelete.length, 
            error: error.message 
        });
        res.status(500);
        throw new Error('Failed to clear wishlist');
    }

    logWishlistOperation('CLEAR_SUCCESS', userId, { 
        deletedCount: itemsToDelete.length,
        duration: Date.now() - startTime
    });

    res.json({ 
        message: 'Wishlist cleared', 
        deletedCount: itemsToDelete.length 
    });
}));

module.exports = router;
