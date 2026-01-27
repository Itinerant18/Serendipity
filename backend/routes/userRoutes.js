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
    
    console.log('📝 Profile update request:', {
        userId,
        name,
        email,
        mobile,
        avatar: avatar ? avatar.substring(0, 50) + '...' : 'null'
    });

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (mobile !== undefined) updateData.mobile = mobile;
    if (avatar !== undefined) updateData.avatar_url = avatar;
    
    console.log('📊 Update data:', updateData);

    const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

    if (error) {
        console.error('❌ Profile update error:', error);
        res.status(400);
        throw new Error('Failed to update profile');
    }
    
    console.log('✅ Profile updated in database:', {
        id: data.id,
        name: data.name,
        avatar_url: data.avatar_url ? data.avatar_url.substring(0, 50) + '...' : 'null'
    });

    // Return data in format expected by frontend
    const responseData = {
        id: data.id,
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        avatar: data.avatar_url,
        image: data.avatar_url,
        isAdmin: data.is_admin || false,
        isSeller: data.is_seller || false
    };
    
    console.log('📤 Sending response:', {
        ...responseData,
        avatar: responseData.avatar ? responseData.avatar.substring(0, 50) + '...' : 'null'
    });

    res.json(responseData);
}));

module.exports = router;
