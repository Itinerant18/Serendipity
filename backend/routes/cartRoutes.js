const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');

// POST /api/cart/sync
router.post('/sync', protect, asyncHandler(async (req, res) => {
    const { items } = req.body;
    const userId = req.user.id;

    // Clear existing cart items for this user
    const { error: deleteError } = await supabase
        .from('saved_carts')
        .delete()
        .eq('user_id', userId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    // Insert new cart items
    if (items && items.length > 0) {
        const cartItems = items.map(item => ({
            user_id: userId,
            product_id: item.product_id,
            product_title: item.title,
            price: item.price,
            image_url: item.image,
            quantity: item.quantity
        }));

        const { error: insertError } = await supabase
            .from('saved_carts')
            .insert(cartItems);

        if (insertError) {
            throw new Error(insertError.message);
        }
    }

    res.json({ success: true });
}));

// GET /api/cart
router.get('/', protect, asyncHandler(async (req, res) => {
    const { data: items, error } = await supabase
        .from('saved_carts')
        .select('product_id, product_title, price, image_url, quantity')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    // Map to match frontend expected format
    const mappedItems = items.map(item => ({
        product_id: item.product_id,
        title: item.product_title,
        price: item.price,
        image: item.image_url,
        quantity: item.quantity
    }));

    res.json({ items: mappedItems });
}));

module.exports = router;
