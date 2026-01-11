const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/supabase');
const Stripe = require('stripe');

let stripe;
try {
    if (process.env.STRIPE_SECRET_KEY) {
        stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    } else {
        console.warn("STRIPE_SECRET_KEY is missing. Stripe routes will fail if called.");
    }
} catch (err) {
    console.warn("Failed to initialize Stripe:", err.message);
}

// POST /api/stripe-checkout
router.post('/', protect, asyncHandler(async (req, res) => {
    const { items, redirectURL } = req.body;
    const userId = req.user.id;
    const email = req.user.email;

    if (!items || items.length === 0) {
        res.status(400);
        throw new Error('Cart is empty');
    }

    // Get or create Stripe customer
    // Check auth_users table logic from frontend - implementing on users table for backend
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('stripe_id')
        .eq('id', userId)
        .single();

    let stripeCustomerId = user?.stripe_id;

    if (!stripeCustomerId) {
        const customer = await stripe.customers.create({ email });
        stripeCustomerId = customer.id;

        await supabase
            .from('users')
            .update({ stripe_id: stripeCustomerId })
            .eq('id', userId);
    }

    // Prepare line items
    const lineItems = items.map((item) => {
        // Clean price string if needed (e.g. "$10.00" -> 10.00)
        let priceVal = item.price;
        if (typeof item.price === 'string') {
            priceVal = parseFloat(item.price.replace(/[^0-9.]/g, ""));
        }

        return {
            price_data: {
                currency: "usd",
                product_data: {
                    name: item.title,
                    images: item.image ? [item.image] : [],
                },
                unit_amount: Math.round(priceVal * 100),
            },
            quantity: item.quantity,
        };
    });

    const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${redirectURL}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: redirectURL,
    });

    res.json({
        url: checkoutSession.url,
        sessionId: checkoutSession.id,
    });
}));

module.exports = router;
