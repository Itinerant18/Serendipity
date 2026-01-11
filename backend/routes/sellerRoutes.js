const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const { protect } = require('../middleware/authMiddleware');
const { protectSeller } = require('../middleware/sellerMiddleware');
const dotenv = require('dotenv');

dotenv.config();

// Regular client for queries
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Service role client (bypasses RLS) - use for server-side admin operations
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
);

// @desc    Register as a Seller (Create Profile from existing account)
// @route   POST /api/seller/register
// @access  Private
router.post('/register', protect, async (req, res) => {
    try {
        const { store_name, description, logo_url } = req.body;
        const userId = req.user.id;

        // Check if user is already a seller
        const { data: existingProfile } = await supabase
            .from('seller_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (existingProfile) {
            return res.status(400).json({ message: 'You are already registered as a seller' });
        }

        // Check if store name exists
        const { data: existingStore } = await supabase
            .from('seller_profiles')
            .select('id')
            .eq('store_name', store_name)
            .single();

        if (existingStore) {
            return res.status(400).json({ message: 'Store name already taken' });
        }

        // Create Seller Profile
        const { data: profile, error } = await supabase
            .from('seller_profiles')
            .insert([
                {
                    user_id: userId,
                    store_name,
                    description,
                    logo_url,
                    rating: 0
                },
            ])
            .select()
            .single();

        if (error) throw error;

        // Update User to be a seller (using admin client to bypass RLS)
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({ is_seller: true, seller_profile_id: profile.id })
            .eq('id', userId);

        if (userError) {
            console.error('User Update Error:', userError);
            throw userError;
        }

        res.status(201).json({
            message: 'Seller profile created successfully',
            seller: profile
        });
    } catch (error) {
        console.error('Seller Register Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Complete Seller Signup (Create user account + seller profile in one step)
// @route   POST /api/seller/signup
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password, mobile, store_name, description } = req.body;

        // Validation
        if (!name || !email || !password || !store_name) {
            return res.status(400).json({
                message: 'Please provide name, email, password, and store name'
            });
        }

        // Check if store name already exists first
        const { data: existingStore } = await supabase
            .from('seller_profiles')
            .select('id')
            .eq('store_name', store_name.trim())
            .single();

        if (existingStore) {
            return res.status(400).json({ message: 'Store name already taken' });
        }

        // Use Admin API to create user (bypasses email confirmation, creates immediately)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true, // Auto-confirm email
            user_metadata: {
                name: name.trim(),
                mobile: mobile || null,
                isAdmin: false,
                isSeller: true
            }
        });

        if (authError) {
            return res.status(400).json({ message: authError.message });
        }

        if (!authData.user) {
            return res.status(400).json({ message: 'Failed to create user' });
        }

        const userId = authData.user.id;

        // Wait for trigger to create user in public.users, with retry logic
        let userExists = false;
        let retries = 0;
        const maxRetries = 5;

        while (!userExists && retries < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 500));

            const { data: existingUser } = await supabaseAdmin
                .from('users')
                .select('id')
                .eq('id', userId)
                .single();

            if (existingUser) {
                userExists = true;
            }
            retries++;
        }

        // If user still doesn't exist in public.users, create it manually
        if (!userExists) {
            console.log('Trigger did not create user, inserting manually...');
            const { error: insertUserError } = await supabaseAdmin
                .from('users')
                .insert({
                    id: userId,
                    email: email.trim().toLowerCase(),
                    name: name.trim(),
                    is_admin: false,
                    is_seller: false
                });

            if (insertUserError) {
                console.error('Manual user insert error:', insertUserError);
                // If it's a duplicate key error, the trigger worked - continue
                if (insertUserError.code !== '23505') {
                    throw insertUserError;
                }
            }
        }

        // Create Seller Profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('seller_profiles')
            .insert([
                {
                    user_id: userId,
                    store_name: store_name.trim(),
                    description: description || '',
                    rating: 0
                },
            ])
            .select()
            .single();

        if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
        }

        // Update user to mark as seller
        const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
                is_seller: true,
                seller_profile_id: profile.id,
                name: name.trim(),
                mobile: mobile || null
            })
            .eq('id', userId);

        if (updateError) {
            console.error('User update error:', updateError);
        }

        // Sign in the user to get a proper session token
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password
        });

        const accessToken = signInData?.session?.access_token || null;

        res.status(201).json({
            _id: userId,
            name: name.trim(),
            email: authData.user.email,
            mobile: mobile || null,
            isAdmin: false,
            isSeller: true,
            sellerProfileId: profile.id,
            token: accessToken,
            message: 'Seller account created successfully'
        });

    } catch (error) {
        console.error('Seller Signup Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller Profile (My Store)
// @route   GET /api/seller/profile
// @access  Private (Seller)
router.get('/profile', protect, protectSeller, async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('seller_profiles')
            .select('*')
            .eq('user_id', req.user.id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update Seller Profile
// @route   PUT /api/seller/profile
// @access  Private (Seller)
router.put('/profile', protect, protectSeller, async (req, res) => {
    try {
        const { store_name, description, logo_url } = req.body;
        const userId = req.user.id;

        // Validate store_name if provided
        if (store_name !== undefined && store_name.trim().length < 2) {
            return res.status(400).json({ message: 'Store name must be at least 2 characters' });
        }

        // Check if new store name is already taken by another seller
        if (store_name) {
            const { data: existingStore } = await supabase
                .from('seller_profiles')
                .select('id, user_id')
                .eq('store_name', store_name.trim())
                .single();

            if (existingStore && existingStore.user_id !== userId) {
                return res.status(400).json({ message: 'Store name already taken' });
            }
        }

        // Build update object
        const updates = {};
        if (store_name !== undefined) updates.store_name = store_name.trim();
        if (description !== undefined) updates.description = description;
        if (logo_url !== undefined) updates.logo_url = logo_url;

        // Update profile
        const { data, error } = await supabaseAdmin
            .from('seller_profiles')
            .update(updates)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile updated successfully', profile: data });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller Dashboard Stats
// @route   GET /api/seller/stats
// @access  Private (Seller)
router.get('/stats', protect, protectSeller, async (req, res) => {
    try {
        const userId = req.user.id;
        const sellerProfileId = req.user.sellerProfileId;

        // Get total products
        const { data: products, count: productCount } = await supabase
            .from('products')
            .select('*', { count: 'exact' })
            .eq('seller_profile_id', sellerProfileId);

        // Calculate total sales and orders from order_items
        let totalSales = 0;
        let totalOrders = 0;

        if (products && products.length > 0) {
            const productIds = products.map(p => p.id);

            const { data: orderItems } = await supabase
                .from('order_items')
                .select('price, quantity, order_id')
                .in('product_id', productIds);

            if (orderItems) {
                const uniqueOrderIds = new Set(orderItems.map(item => item.order_id));
                totalOrders = uniqueOrderIds.size;

                totalSales = orderItems.reduce((sum, item) => {
                    return sum + (parseFloat(item.price) * item.quantity);
                }, 0);
            }
        }

        res.json({
            totalProducts: productCount || 0,
            totalSales: totalSales.toFixed(2),
            totalOrders: totalOrders
        });
    } catch (error) {
        console.error('Get Stats Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller's Products
// @route   GET /api/seller/products
// @access  Private (Seller)
router.get('/products', protect, protectSeller, async (req, res) => {
    try {
        const sellerProfileId = req.user.sellerProfileId;

        const { data, error } = await supabase
            .from('products')
            .select('*')
            .eq('seller_profile_id', sellerProfileId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller Orders
// @route   GET /api/seller/orders
// @access  Private (Seller)
router.get('/orders', protect, protectSeller, async (req, res) => {
    try {
        const sellerProfileId = req.user.sellerProfileId;
        const limit = parseInt(req.query.limit) || 10;

        // 1. Get all product IDs for this seller
        const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('seller_profile_id', sellerProfileId);

        if (!products || products.length === 0) {
            return res.json([]);
        }

        const productIds = products.map(p => p.id);

        // 2. Find order items for these products, get unique order IDs
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('order_id, created_at')
            .in('product_id', productIds)
            .order('created_at', { ascending: false })
            .limit(limit * 5); // Fetch more items to ensure we get enough unique orders

        if (!orderItems || orderItems.length === 0) {
            return res.json([]);
        }

        const uniqueOrderIds = [...new Set(orderItems.map(item => item.order_id))].slice(0, limit);

        // 3. Fetch full order details for these IDs
        const { data: orders, error } = await supabase
            .from('orders')
            .select('*, user:users(name, email)')
            .in('id', uniqueOrderIds)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 4. Transform to match frontend expectations
        const formattedOrders = orders.map(order => ({
            _id: order.id,
            id: order.id,
            orderNumber: order.order_number,
            user: {
                name: order.user?.name || 'Guest User',
                email: order.user?.email
            },
            totalAmount: order.total_amount,
            status: order.is_delivered ? 'Delivered' : (order.is_paid ? 'Processing' : 'Pending'),
            createdAt: order.created_at,
            paymentStatus: order.is_paid ? 'Paid' : 'Unpaid'
        }));

        res.json(formattedOrders);
    } catch (error) {
        console.error('Get Seller Orders Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller Weekly Analytics
// @route   GET /api/seller/analytics/weekly
// @access  Private (Seller)
router.get('/analytics/weekly', protect, protectSeller, async (req, res) => {
    try {
        const sellerProfileId = req.user.sellerProfileId;

        // 1. Get all product IDs
        const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('seller_profile_id', sellerProfileId);

        if (!products || products.length === 0) {
            return res.json(Array(7).fill({ date: '', sales: 0 }));
        }

        const productIds = products.map(p => p.id);

        // 2. Get order items from last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { data: orderItems, error } = await supabase
            .from('order_items')
            .select('price, quantity, created_at')
            .in('product_id', productIds)
            .gte('created_at', sevenDaysAgo.toISOString());

        if (error) throw error;

        // 3. Aggregate by day
        const dailySales = {};

        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
            dailySales[dateStr] = 0;
        }

        if (orderItems) {
            orderItems.forEach(item => {
                const date = new Date(item.created_at);
                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                const amount = parseFloat(item.price) * item.quantity;

                if (dailySales[dayStr] !== undefined) {
                    dailySales[dayStr] += amount;
                }
            });
        }

        // Convert to array format for chart
        const chartData = Object.keys(dailySales).map(day => ({
            name: day,
            sales: parseFloat(dailySales[day].toFixed(2))
        }));

        res.json(chartData);

    } catch (error) {
        console.error('Get Analytics Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;
