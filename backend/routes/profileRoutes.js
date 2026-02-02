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

    // STRICT SELLER VERIFICATION
    // Always check the seller database (Source of Truth) to verify status
    let isSeller = false;
    let sellerProfileId = null;

    try {
        const { data: sellerProfile, error: sellerError } = await supabaseSellerAdmin
            ?.from('seller_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        // Check if a valid seller profile exists
        if (sellerProfile && (!sellerError || sellerError.code === 'PGRST116') && sellerProfile.id) {
            isSeller = true;
            sellerProfileId = sellerProfile.id;
        }
    } catch (err) {
        console.error('Error verifying seller status:', err);
        // Fallback: If seller DB is unreachable, trust the main DB but log it
        isSeller = user.is_seller || false;
        sellerProfileId = user.seller_profile_id || null;
    }

    // SYNC: Ensure main database matches the Source of Truth
    // Case 1: Seller DB says YES, Main DB says NO (or mismatch ID) -> GRANT
    if (isSeller && (!user.is_seller || user.seller_profile_id !== sellerProfileId)) {
        console.log(`Syncing seller status: Profile found (${sellerProfileId}), updating user record...`);
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                is_seller: true,
                seller_profile_id: sellerProfileId
            })
            .eq('id', userId);

        if (updateError) {
             // Handle FK constraint error (23503) from dual DB setup
             if (updateError.code === '23503') {
                console.log('Foreign key constraint detected - setting is_seller only');
                await supabaseAdmin.from('users').update({ is_seller: true }).eq('id', userId);
             } else {
                console.error('Failed to sync positive seller status:', updateError);
             }
        }
    }
    // Case 2: Seller DB says NO, Main DB says YES -> REVOKE
    else if (!isSeller && user.is_seller) {
        console.log(`Syncing seller status: Profile missing/revoked, updating user record...`);
        const { error: revokeError } = await supabaseAdmin
            .from('users')
            .update({
                is_seller: false,
                seller_profile_id: null
            })
            .eq('id', userId);
            
        if (revokeError) console.error('Failed to revoke seller status:', revokeError);
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
            avatar: user.avatar_url, // Alias for compatibility
            date_of_birth: user.date_of_birth,
            gender: user.gender,
            created_at: user.created_at,
            isAdmin: user.is_admin || false,
            isSeller: isSeller,
            sellerProfileId: sellerProfileId,
            authProvider: user.auth_provider, // Include auth provider in profile response
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
    console.log('=== Profile Update Request ===');
    console.log('User from middleware:', req.user);
    
    const userId = req.user.id;
    
    // Get user's auth provider first
    const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*') // Get all fields for debugging
        .eq('id', userId)
        .single();

    console.log('User from database:', userData);
    console.log('Database error:', userError);

    if (userError) {
        res.status(404);
        throw new Error('User not found');
    }

    const isGoogleUser = userData.auth_provider === 'google';
    
    // For Google users, restrict updating certain fields
    let updateData = {};
    
    // Allow updating auth provider regardless of current status (for initial setup)
    if (req.body.auth_provider !== undefined) {
        updateData.auth_provider = req.body.auth_provider;
    }
    
    if (isGoogleUser) {
        // Only allow updating these fields for Google users
        if (req.body.mobile !== undefined) updateData.mobile = req.body.mobile;
        if (req.body.date_of_birth !== undefined) updateData.date_of_birth = req.body.date_of_birth;
        if (req.body.gender !== undefined) updateData.gender = req.body.gender;
        // Google users can update avatar_url if it's a Google avatar
        if (req.body.avatar_url !== undefined && req.body.avatar_url.includes('googleusercontent.com')) {
            updateData.avatar_url = req.body.avatar_url;
        }
    } else {
        // Allow updating all fields for non-Google users
        if (req.body.name !== undefined) updateData.name = req.body.name;
        if (req.body.mobile !== undefined) updateData.mobile = req.body.mobile;
        if (req.body.date_of_birth !== undefined) updateData.date_of_birth = req.body.date_of_birth;
        if (req.body.gender !== undefined) updateData.gender = req.body.gender;
        if (req.body.avatar_url !== undefined) updateData.avatar_url = req.body.avatar_url;
    }

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to update profile');
    }

    res.json({ success: true, user: data, isGoogleUser: data.auth_provider === 'google' });
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

// @desc    Change user password
// @route   POST /api/profile/security/change-password
// @access  Private
router.post('/security/change-password', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validation
    if (!current_password || !new_password) {
        res.status(400);
        throw new Error('Please provide current and new password');
    }

    if (new_password.length < 8) {
        res.status(400);
        throw new Error('New password must be at least 8 characters');
    }

    // Get user to check auth provider
    const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('email, auth_provider')
        .eq('id', userId)
        .single();

    if (userError || !user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if user is Google OAuth user
    if (user.auth_provider === 'google') {
        res.status(403);
        throw new Error('Cannot change password for Google OAuth accounts. Please manage your password through Google.');
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: current_password,
    });

    if (signInError) {
        res.status(401);
        throw new Error('Current password is incorrect');
    }

    // Update password using Supabase Admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: new_password }
    );

    if (updateError) {
        console.error('Password update error:', updateError);
        res.status(400);
        throw new Error('Failed to update password');
    }

    res.json({ 
        success: true, 
        message: 'Password changed successfully' 
    });
}));

module.exports = router;
