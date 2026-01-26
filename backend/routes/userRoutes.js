const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const { name, email, mobile, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (avatar !== undefined) updateData.avatar_url = avatar;

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('Profile update error:', error);
        res.status(400);
        throw new Error('Failed to update profile');
    }

    // Return data in format expected by frontend
    res.json({
        id: data.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatar: data.avatar_url,
        image: data.avatar_url,
        isAdmin: data.is_admin || false,
        isSeller: data.is_seller || false
    });
}));

module.exports = router;
