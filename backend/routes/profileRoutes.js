const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSellerAdmin } = require('../config/supabaseSeller');
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

    // Check seller database if user doesn't have seller status set
    let isSeller = user.is_seller || false;
    let sellerProfileId = user.seller_profile_id || null;

    if (!isSeller || !sellerProfileId) {
        // Check if seller profile exists in seller database
        const { data: sellerProfile, error: sellerError } = await supabaseSellerAdmin
            .from('seller_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (sellerProfile && !sellerError) {
            // Seller profile exists but user record is not updated - sync it
            console.log(`Syncing seller status for user ${userId}: Found seller profile ${sellerProfile.id}`);
            isSeller = true;
            sellerProfileId = sellerProfile.id;

            // Update user record in main database - try to set seller_profile_id, but handle foreign key constraint error
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    is_seller: true,
                    seller_profile_id: sellerProfile.id
                })
                .eq('id', userId);

            // If foreign key constraint fails (23503), just set is_seller without seller_profile_id
            if (updateError && updateError.code === '23503') {
                console.log('Foreign key constraint detected - setting is_seller only (dual database setup)');
                const { error: fallbackError } = await supabaseAdmin
                    .from('users')
                    .update({
                        is_seller: true
                        // Don't set seller_profile_id - it exists in seller database, not main database
                    })
                    .eq('id', userId);
                
                if (fallbackError) {
                    console.error('Failed to sync seller status (fallback):', fallbackError);
                } else {
                    console.log('Successfully synced seller status (is_seller only)');
                }
            } else if (updateError) {
                console.error('Failed to sync seller status:', updateError);
            } else {
                console.log('Successfully synced seller status to user record');
            }
        }
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
            isSeller: isSeller,
            sellerProfileId: sellerProfileId,
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
