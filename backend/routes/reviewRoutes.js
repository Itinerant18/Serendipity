const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/supabase');
const { supabaseSeller } = require('../config/supabaseSeller');

const router = express.Router();

// @desc    Get reviews for a product
// @route   GET /api/reviews/product/:productId
// @access  Public
router.get('/product/:productId', asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const page = Math.max(parseInt(req.query.page || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 50);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Fetch reviews with user details and seller responses
    const { data: reviews, count, error } = await supabase
        .from('reviews')
        .select('*, user:users(name, avatar_url), response:review_responses(response, created_at, seller_profile_id)', { count: 'exact' })
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    // If there are responses, we might want to fetch seller store names if possible
    // Optimisation: Fetch seller profiles for unique seller_profile_ids in responses
    // For now, return basic structure

    res.json({
        reviews: reviews || [],
        page,
        limit,
        total: count || 0
    });
}));

// @desc    Check if user can review a product
// @route   GET /api/reviews/can-review/:productId
// @access  Private
router.get('/can-review/:productId', protect, asyncHandler(async (req, res) => {
    const { productId } = req.params;

    // 1. Check if user already reviewed
    const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', productId)
        .single();

    if (existingReview) {
        return res.json({ canReview: false, reason: 'already_reviewed' });
    }

    // 2. Check strict eligibility: Must have purchased AND received (is_delivered=true)
    // We need to find an order that contains this product and is delivered

    // First get orders for this user that are delivered
    const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('is_delivered', true);

    if (!orders || orders.length === 0) {
        return res.json({ canReview: false, reason: 'no_delivered_order' });
    }

    const orderIds = orders.map(o => o.id);

    // Check if any of these orders contain the product
    const { data: orderItem } = await supabase
        .from('order_items')
        .select('order_id')
        .in('order_id', orderIds)
        .eq('product_id', productId)
        .limit(1)
        .single();

    if (orderItem) {
        return res.json({
            canReview: true,
            orderId: orderItem.order_id
        });
    }

    return res.json({ canReview: false, reason: 'not_purchased_or_delivered' });
}));

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const { productId, orderId, rating, title, comment, media } = req.body;

    // Double check eligibility
    if (!orderId) {
        res.status(400);
        throw new Error('Order ID is required to verify purchase');
    }

    // Verify order belongs to user and is delivered
    const { data: order } = await supabase
        .from('orders')
        .select('id, is_delivered')
        .eq('id', orderId)
        .eq('user_id', req.user.id)
        .single();

    if (!order || !order.is_delivered) {
        res.status(403);
        throw new Error('You can only review products from delivered orders');
    }

    // Insert review
    const { data: review, error } = await supabase
        .from('reviews')
        .insert({
            user_id: req.user.id,
            product_id: productId,
            order_id: orderId,
            rating,
            title,
            comment,
            media: media || [],
            is_verified_purchase: true
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') { // Unique violation
            res.status(400);
            throw new Error('You have already reviewed this product');
        }
        res.status(500);
        throw new Error(error.message);
    }

    res.status(201).json(review);
}));

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private (Owner)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    // Check ownership
    const { data: review } = await supabase
        .from('reviews')
        .select('user_id, created_at')
        .eq('id', req.params.id)
        .single();

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    if (review.user_id !== req.user.id) {
        res.status(403);
        throw new Error('Not authorized to delete this review');
    }

    // Check 30 day limit
    const daysDiff = (new Date() - new Date(review.created_at)) / (1000 * 60 * 60 * 24);
    if (daysDiff > 30) {
        res.status(400);
        throw new Error('Cannot delete reviews older than 30 days');
    }

    const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', req.params.id);

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    res.json({ message: 'Review deleted' });
}));

// @desc    Vote review helpful
// @route   POST /api/reviews/:id/vote
// @access  Private
router.post('/:id/vote', protect, asyncHandler(async (req, res) => {
    const { isHelpful } = req.body; // true = helpful, false = not helpful (or just remove vote if toggle)

    // Upsert vote
    const { error } = await supabase
        .from('review_helpful_votes')
        .upsert({
            review_id: req.params.id,
            user_id: req.user.id,
            is_helpful: isHelpful
        }, { onConflict: 'review_id, user_id' });

    if (error) {
        res.status(500);
        throw new Error(error.message);
    }

    // Update helpful count denormalized field
    // Calculate new count
    const { count } = await supabase
        .from('review_helpful_votes')
        .select('*', { count: 'exact', head: true })
        .eq('review_id', req.params.id)
        .eq('is_helpful', true);

    await supabase
        .from('reviews')
        .update({ helpful_count: count || 0 })
        .eq('id', req.params.id);

    res.json({ success: true, count: count || 0 });
}));

// @desc    Seller response
// @route   POST /api/reviews/:id/response
// @access  Private (Seller)
router.post('/:id/response', protect, asyncHandler(async (req, res) => {
    if (!req.user.is_seller) {
        res.status(403);
        throw new Error('Only sellers can respond to reviews');
    }

    const { response } = req.body;
    const reviewId = req.params.id;

    // Verify seller owns the product being reviewed
    // 1. Get review product_id
    const { data: review } = await supabase
        .from('reviews')
        .select('product_id')
        .eq('id', reviewId)
        .single();

    if (!review) {
        res.status(404);
        throw new Error('Review not found');
    }

    // 2. Check if product belongs to this seller
    // Check both databases or just trust the seller_profile_id check mapping?
    // Robust check:

    // Get user's seller profile
    const { data: user } = await supabase
        .from('users')
        .select('seller_profile_id')
        .eq('id', req.user.id)
        .single();

    if (!user?.seller_profile_id) {
        res.status(403);
        throw new Error('Seller profile not found');
    }

    // Check valid ownership is complex due to split products DB. 
    // Simplified: Check if product.seller_profile_id matches

    // Try seller DB first
    let productSellerId = null;
    const { data: sellerProduct } = await supabaseSeller
        .from('products')
        .select('seller_profile_id')
        .eq('id', review.product_id)
        .single();

    if (sellerProduct) productSellerId = sellerProduct.seller_profile_id;
    else {
        // Try main DB
        const { data: mainProduct } = await supabase
            .from('products')
            .select('seller_profile_id')
            .eq('id', review.product_id)
            .single();
        if (mainProduct) productSellerId = mainProduct.seller_profile_id;
    }

    if (productSellerId !== user.seller_profile_id) {
        res.status(403);
        throw new Error('You can only respond to reviews on your own products');
    }

    // Insert response
    const { data: newResponse, error } = await supabase
        .from('review_responses')
        .insert({
            review_id: reviewId,
            seller_profile_id: user.seller_profile_id,
            response
        })
        .select()
        .single();

    if (error) {
        if (error.code === '23505') {
            res.status(400);
            throw new Error('You have already responded to this review');
        }
        res.status(500);
        throw new Error(error.message);
    }

    res.status(201).json(newResponse);
}));

module.exports = router;
