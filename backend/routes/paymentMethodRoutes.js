const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// @desc    Get all payment methods for user
// @route   GET /api/profile/payment-methods
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const { data: paymentMethods, error } = await supabaseAdmin
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        res.status(400);
        throw new Error('Failed to fetch payment methods');
    }

    res.json({ payment_methods: paymentMethods });
}));

// @desc    Add new payment method
// @route   POST /api/profile/payment-methods
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const {
        method_type,
        card_last4,
        card_brand,
        card_expiry_month,
        card_expiry_year,
        cardholder_name,
        upi_id,
        wallet_provider,
        wallet_phone,
        is_default
    } = req.body;

    // If setting as default, unset other defaults first
    if (is_default) {
        await supabaseAdmin
            .from('payment_methods')
            .update({ is_default: false })
            .eq('user_id', userId);
    }

    const { data, error } = await supabaseAdmin
        .from('payment_methods')
        .insert({
            user_id: userId,
            method_type,
            card_last4,
            card_brand,
            card_expiry_month,
            card_expiry_year,
            cardholder_name,
            upi_id,
            wallet_provider,
            wallet_phone,
            is_default: is_default || false,
        })
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to add payment method');
    }

    res.status(201).json({ success: true, payment_method: data });
}));

// @desc    Delete payment method
// @route   DELETE /api/profile/payment-methods/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const methodId = req.params.id;

    const { error } = await supabaseAdmin
        .from('payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', userId);

    if (error) {
        res.status(400);
        throw new Error('Failed to delete payment method');
    }

    res.json({ success: true });
}));

// @desc    Set payment method as default
// @route   POST /api/profile/payment-methods/:id/set-default
// @access  Private
router.post('/:id/set-default', protect, asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const methodId = req.params.id;

    // Unset all defaults
    await supabaseAdmin
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

    // Set new default
    const { data, error } = await supabaseAdmin
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) {
        res.status(400);
        throw new Error('Failed to set default payment method');
    }

    res.json({ success: true, payment_method: data });
}));

module.exports = router;
