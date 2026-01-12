const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all addresses for user
// @route   GET /api/profile/addresses
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { data: addresses, error } = await supabaseAdmin
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        res.status(400);
        throw new Error('Failed to fetch addresses');
    }

    res.json({ addresses });
}));

// @desc    Add new address
// @route   POST /api/profile/addresses
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        address_type,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default
    } = req.body;

    // If setting as default, unset other defaults first
    if (is_default) {
        await supabaseAdmin
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
        .from('addresses')
        .insert({
            user_id: userId,
            address_type: address_type || 'shipping',
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country: country || 'India',
            is_default: is_default || false,
        })
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to add address');
    }

    res.status(201).json({ success: true, address: data });
}));

// @desc    Update address
// @route   PUT /api/profile/addresses/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;
    const {
        address_type,
        full_name,
        phone,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default
    } = req.body;

    // If setting as default, unset other defaults first
    if (is_default) {
        await supabaseAdmin
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
        .from('addresses')
        .update({
            address_type,
            full_name,
            phone,
            address_line1,
            address_line2,
            city,
            state,
            postal_code,
            country,
            is_default,
        })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to update address');
    }

    res.json({ success: true, address: data });
}));

// @desc    Delete address
// @route   DELETE /api/profile/addresses/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    const { error } = await supabaseAdmin
        .from('addresses')
        .delete()
        .eq('id', addressId)
        .eq('user_id', userId);

    if (error) {
        res.status(400);
        throw new Error('Failed to delete address');
    }

    res.json({ success: true });
}));

// @desc    Set address as default
// @route   POST /api/profile/addresses/:id/set-default
// @access  Private
router.post('/:id/set-default', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const addressId = req.params.id;

    // Unset all defaults
    await supabaseAdmin
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);

    // Set new default
    const { data, error } = await supabaseAdmin
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to set default address');
    }

    res.json({ success: true, address: data });
}));

module.exports = router;
