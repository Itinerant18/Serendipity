const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get user profile with stats
// @route   GET /api/profile
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // Fetch user profile
    const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) {
        res.status(404);
        throw new Error('User not found');
    }

    // Fetch stats
    const [ordersResult, addressesResult] = await Promise.all([
        supabaseAdmin.from('orders').select('id', { count: 'exact' }).eq('user_id', userId),
        supabaseAdmin.from('addresses').select('id', { count: 'exact' }).eq('user_id', userId),
    ]);

    res.json({
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            avatar_url: user.avatar_url,
            date_of_birth: user.date_of_birth,
            gender: user.gender,
            created_at: user.created_at,
            isAdmin: user.is_admin || false,
            isSeller: user.is_seller || false,
            sellerProfileId: user.seller_profile_id || null,
        },
        stats: {
            orders: ordersResult.count || 0,
            addresses: addressesResult.count || 0,
            wishlist: 0, // Placeholder
            reviews: 0,  // Placeholder
        }
    });
}));

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
router.put('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, mobile, date_of_birth, gender, avatar_url } = req.body;

    const { data, error } = await supabaseAdmin
        .from('users')
        .update({
            name,
            mobile,
            date_of_birth,
            gender,
            avatar_url,
        })
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to update profile');
    }

    res.json({ success: true, user: data });
}));

// @desc    Get user preferences
// @route   GET /api/profile/preferences
// @access  Private
router.get('/preferences', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    let { data: preferences, error } = await supabaseAdmin
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

    // If no preferences exist, create default ones
    if (error || !preferences) {
        const { data: newPrefs } = await supabaseAdmin
            .from('user_preferences')
            .insert({ user_id: userId })
            .select()
            .single();
        preferences = newPrefs;
    }

    res.json({ preferences });
}));

// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
router.put('/preferences', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        email_notifications,
        sms_notifications,
        order_updates,
        promotional_emails,
        language,
        currency,
        theme,
        show_profile_public,
        show_order_history
    } = req.body;

    // Upsert preferences
    const { data, error } = await supabaseAdmin
        .from('user_preferences')
        .upsert({
            user_id: userId,
            email_notifications,
            sms_notifications,
            order_updates,
            promotional_emails,
            language,
            currency,
            theme,
            show_profile_public,
            show_order_history,
        }, { onConflict: 'user_id' })
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to update preferences');
    }

    res.json({ success: true, preferences: data });
}));

module.exports = router;
