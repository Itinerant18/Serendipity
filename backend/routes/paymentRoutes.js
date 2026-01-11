const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { supabase } = require('../config/supabase');

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Create Razorpay Order
// @route   POST /api/payment/razorpay/order
// @access  Private
router.post('/razorpay/order', protect, asyncHandler(async (req, res) => {
    const { amount, currency = 'INR', receipt } = req.body;

    const options = {
        amount: amount * 100, // Razorpay works in smallest currency unit (paise)
        currency,
        receipt,
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
}));

// @desc    Verify Razorpay Payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
router.post('/razorpay/verify', protect, asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order_id } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Payment successful, update order in database
        // Assuming 'orders' table exists and has 'is_paid', 'paid_at', 'payment_result'

        const paymentResult = {
            id: razorpay_payment_id,
            status: 'success',
            update_time: new Date().toISOString(),
            email_address: req.user.email,
        };

        // Use supabaseClient (assuming exported as default or named)
        // Note: verify import at top

        const { error } = await supabase
            .from('orders')
            .update({
                is_paid: true,
                paid_at: new Date().toISOString(),
                payment_result: paymentResult,
                payment_method: 'Razorpay'
            })
            .eq('id', order_id);

        if (error) {
            throw new Error('Payment successful but failed to update order: ' + error.message);
        }

        res.json({ success: true, message: 'Payment verified and order updated' });
    } else {
        res.status(400);
        throw new Error('Invalid signature');
    }
}));

module.exports = router;
