const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { protectSeller } = require('../middleware/sellerMiddleware');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');

// Note: server.js already loads dotenv; use shared clients from config for connection reuse.

// @desc    Register as a Seller (Create Profile from existing account)
// @route   POST /api/seller/register
// @access  Private
router.post('/register', protect, async (req, res) => {
    try {
        console.log('=== Seller Registration Request ===');
        console.log('User ID:', req.user?.id);
        console.log('Request Body:', req.body);
        
        // Validate seller database client
        if (!supabaseSellerAdmin || typeof supabaseSellerAdmin.from !== 'function') {
            console.error('ERROR: supabaseSellerAdmin is not initialized!');
            console.error('Please check your .env file has:');
            console.error('  - SELLER_SUPABASE_URL');
            console.error('  - SELLER_SUPABASE_KEY');
            console.error('  - SELLER_SUPABASE_SERVICE_KEY');
            return res.status(500).json({ 
                message: 'Seller database not configured',
                error: 'SELLER_SUPABASE_SERVICE_KEY is missing or invalid. Please check your .env file and restart the server.'
            });
        }

        const { store_name, description, logo_url, mobile, name } = req.body;
        const userId = req.user.id;

        console.log('Extracted from request body:', {
            store_name,
            description,
            logo_url,
            mobile,
            name,
            userId
        });

        if (!userId) {
            console.error('No user ID found in req.user');
            return res.status(401).json({ message: 'User ID not found. Please log in again.' });
        }

        // Validate required fields
        if (!store_name || typeof store_name !== 'string' || !store_name.trim()) {
            console.error('Validation failed: store_name is missing or invalid');
            console.error('Received store_name:', store_name);
            return res.status(400).json({ 
                message: 'Store name is required',
                received: { store_name: store_name || null }
            });
        }

        const trimmedStoreName = store_name.trim();
        if (trimmedStoreName.length < 2) {
            console.error('Validation failed: store_name too short');
            console.error('Store name length:', trimmedStoreName.length);
            return res.status(400).json({ 
                message: 'Store name must be at least 2 characters',
                received: { store_name: trimmedStoreName, length: trimmedStoreName.length }
            });
        }

        // Check if user is already a seller (using seller database admin client)
        console.log('Checking if user is already a seller...');
        const { data: existingProfile, error: profileCheckError } = await supabaseSellerAdmin
            .from('seller_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        // PGRST116 = no rows returned (this is normal for new sellers)
        if (profileCheckError && profileCheckError.code !== 'PGRST116') {
            console.error('Error checking existing profile:', profileCheckError);
            console.error('Error Code:', profileCheckError.code);
            console.error('Error Message:', profileCheckError.message);
            throw profileCheckError;
        }

        if (existingProfile) {
            console.log('User is already registered as a seller:', existingProfile.id);
            
            // Sync seller status to main database if not already set
            const { data: mainUser } = await supabaseAdmin
                .from('users')
                .select('is_seller, seller_profile_id')
                .eq('id', userId)
                .single();

            if (!mainUser?.is_seller || mainUser?.seller_profile_id !== existingProfile.id) {
                console.log('Syncing seller status to main database...');
                const { error: syncError } = await supabaseAdmin
                    .from('users')
                    .update({
                        is_seller: true,
                        seller_profile_id: existingProfile.id
                    })
                    .eq('id', userId);

                // If foreign key constraint fails (23503), just set is_seller without seller_profile_id
                if (syncError && syncError.code === '23503') {
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
                } else if (syncError) {
                    console.error('Failed to sync seller status:', syncError);
                } else {
                    console.log('Successfully synced seller status');
                }
            }

            return res.status(400).json({ 
                message: 'You are already registered as a seller',
                sellerProfileId: existingProfile.id,
                synced: true
            });
        }

        // Check if store name exists (using seller database admin client)
        console.log('Checking if store name exists...');
        const { data: existingStore, error: storeCheckError } = await supabaseSellerAdmin
            .from('seller_profiles')
            .select('id')
            .eq('store_name', trimmedStoreName)
            .single();

        // PGRST116 = no rows returned (this is normal if store name is available)
        if (storeCheckError && storeCheckError.code !== 'PGRST116') {
            console.error('Error checking existing store:', storeCheckError);
            console.error('Error Code:', storeCheckError.code);
            console.error('Error Message:', storeCheckError.message);
            throw storeCheckError;
        }

        if (existingStore) {
            return res.status(400).json({ message: 'Store name already taken' });
        }

        // Create Seller Profile in seller database (using admin client to bypass RLS)
        // Only include columns that exist in the database schema
        console.log('Creating seller profile...');
        const profileData = {
            user_id: userId,
            store_name: trimmedStoreName,
            description: description || '',
            rating: 0
        };

        // Only add optional fields if they exist in the schema
        if (logo_url) {
            profileData.logo_url = logo_url;
        }

        console.log('Profile data to insert:', profileData);
        const { data: profile, error } = await supabaseSellerAdmin
            .from('seller_profiles')
            .insert([profileData])
            .select()
            .single();

        if (error) {
            console.error('Seller Profile Creation Error:', error);
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            console.error('Error Details:', error.details);
            console.error('Error Hint:', error.hint);
            
            // Handle specific error codes
            if (error.code === 'PGRST205') {
                console.error('\n⚠️  SCHEMA CACHE ISSUE DETECTED!');
                console.error('The seller_profiles table exists but PostgREST schema cache is stale.');
                console.error('Solution: Refresh the schema cache in Supabase Dashboard:');
                console.error('  1. Go to: Settings > API');
                console.error('  2. Click "Reload Schema" or restart the project');
                return res.status(500).json({
                    message: 'Database schema cache issue. Please refresh the schema cache in Supabase Dashboard.',
                    error: 'PGRST205: Schema cache needs refresh',
                    hint: 'Go to Supabase Dashboard > Settings > API > Reload Schema'
                });
            } else if (error.code === '42P01') {
                return res.status(500).json({
                    message: 'Seller database table not found. Please run the schema creation script.',
                    error: 'Table seller_profiles does not exist',
                    hint: 'Run: backend/migrations/createSellerDatabaseSchema.sql in your seller database'
                });
            }
            
            throw error;
        }

        console.log('Seller profile created successfully:', profile.id);

        // Update User to be a seller (using admin client to bypass RLS)
        console.log('Updating user record in main database...');
        const { error: userError } = await supabaseAdmin
            .from('users')
            .update({
                is_seller: true,
                seller_profile_id: profile.id,
                mobile: mobile || req.user.mobile,
                name: name || req.user.name
            })
            .eq('id', userId);

        if (userError) {
            console.error('User Update Error:', userError);
            console.error('Error Code:', userError.code);
            console.error('Error Message:', userError.message);
            // Don't throw - profile is already created, just log the error
            console.warn('Warning: User update failed but profile was created');
        } else {
            console.log('User record updated successfully');
        }

        console.log('=== Seller Registration Complete ===');
        res.status(201).json({
            message: 'Seller profile created successfully',
            seller: profile,
            isSeller: true,
            sellerProfileId: profile.id
        });
    } catch (error) {
        console.error('Seller Register Error:', error);
        console.error('Error Details:', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
            stack: error.stack
        });
        res.status(500).json({ 
            message: 'Server Error', 
            error: error.message,
            ...(process.env.NODE_ENV === 'development' && { details: error.details, hint: error.hint })
        });
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

        // Check if store name already exists first (using seller database)
        const { data: existingStore } = await supabaseSellerAdmin
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

        // Create Seller Profile in seller database
        const { data: profile, error: profileError } = await supabaseSellerAdmin
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
        const { data, error } = await supabaseSeller
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

        // Check if new store name is already taken by another seller (using seller database)
        if (store_name) {
            const { data: existingStore } = await supabaseSellerAdmin
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

        // Update profile in seller database
        const { data, error } = await supabaseSellerAdmin
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
        const sellerProfileId = req.seller.profileId || req.user.sellerProfileId;

        // Get total products from seller database
        const { data: products, count: productCount } = await supabaseSeller
            .from('products')
            .select('*', { count: 'exact' })
            .eq('seller_profile_id', sellerProfileId);

        // Calculate total sales and orders from order_items
        let totalSales = 0;
        let totalOrders = 0;

        if (products && products.length > 0) {
            const productIds = products.map(p => p.id);

            // Order items are in main database (orders are customer-facing)
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
        const sellerProfileId = req.seller.profileId || req.user.sellerProfileId;
        const userId = req.user.id;

        console.log(`Fetching products for seller: userId=${userId}, sellerProfileId=${sellerProfileId || 'null'}`);

        // Get products from seller database - match by seller_profile_id OR user_id
        // This handles cases where products were uploaded before seller_profile_id was set
        let query = supabaseSeller
            .from('products')
            .select('*');

        if (sellerProfileId) {
            // If seller_profile_id exists, filter by it
            query = query.eq('seller_profile_id', sellerProfileId);
        } else {
            // If no seller_profile_id, filter by user_id
            query = query.eq('user_id', userId);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Get Products Error:', error);
            throw error;
        }

        console.log(`Found ${data?.length || 0} products`);
        res.json(data || []);
    } catch (error) {
        console.error('Get Products Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Get Seller Orders
// @route   GET /api/seller/orders?status=pending|shipped|delivered
// @access  Private (Seller)
router.get('/orders', protect, protectSeller, async (req, res) => {
    try {
        const sellerProfileId = req.seller.profileId || req.user.sellerProfileId;
        const limit = parseInt(req.query.limit) || 10;
        const statusFilter = (req.query.status || 'all').toLowerCase();

        // 1. Get all product IDs for this seller from seller database
        const { data: products } = await supabaseSeller
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
        const formattedOrders = orders.map(order => {
            // Normalize status from DB; fallback to derived
            const dbStatus = (order.status || '').toLowerCase();
            let status = 'pending';
            if (dbStatus === 'shipped' || dbStatus === 'delivered' || dbStatus === 'pending') {
                status = dbStatus;
            } else if (order.is_delivered) {
                status = 'delivered';
            } else if (order.is_paid) {
                status = 'shipped'; // treat paid as shipped if no explicit status
            } else {
                status = 'pending';
            }

            return {
                _id: order.id,
                id: order.id,
                orderNumber: order.order_number,
                user: {
                    name: order.user?.name || 'Guest User',
                    email: order.user?.email
                },
                totalAmount: order.total_amount,
                status,
                createdAt: order.created_at,
                paymentStatus: order.is_paid ? 'Paid' : 'Unpaid'
            };
        }).filter(o => statusFilter === 'all' ? true : o.status === statusFilter);

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
        const sellerProfileId = req.seller.profileId;

        // 1. Get all product IDs from seller database
        const { data: products } = await supabaseSeller
            .from('products')
            .select('id')
            .eq('seller_profile_id', sellerProfileId);

        if (!products || products.length === 0) {
            return res.json(Array(7).fill({ date: '', sales: 0 }));
        }

        const productIds = products.map(p => p.id);

        // 2. Get order items from last 7 days by joining with orders
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Use a join to get order_items with order's created_at
        const { data: orderItems, error } = await supabase
            .from('order_items')
            .select('price, qty, order_id, orders!inner(created_at)')
            .in('product_id', productIds)
            .gte('orders.created_at', sevenDaysAgo.toISOString());

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
                const date = new Date(item.orders.created_at);
                const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
                const amount = parseFloat(item.price) * item.qty;

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

// @desc    Sync Seller Status (Fix mismatch between seller DB and main DB)
// @route   POST /api/seller/sync-status
// @access  Private
router.post('/sync-status', protect, async (req, res) => {
    try {
        const userId = req.user.id;

        // Check seller database for existing profile
        const { data: sellerProfile, error: sellerError } = await supabaseSellerAdmin
            .from('seller_profiles')
            .select('id')
            .eq('user_id', userId)
            .single();

        if (sellerError && sellerError.code !== 'PGRST116') {
            throw sellerError;
        }

        if (sellerProfile) {
            // Update main database - try to set seller_profile_id, but handle foreign key constraint error
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
                    throw fallbackError;
                }
            } else if (updateError) {
                throw updateError;
            }

            res.json({
                message: 'Seller status synced successfully',
                isSeller: true,
                sellerProfileId: sellerProfile.id
            });
        } else {
            // No seller profile found - ensure main DB reflects this
            const { error: updateError } = await supabaseAdmin
                .from('users')
                .update({
                    is_seller: false,
                    seller_profile_id: null
                })
                .eq('id', userId);

            res.json({
                message: 'No seller profile found. User is not a seller.',
                isSeller: false,
                sellerProfileId: null
            });
        }
    } catch (error) {
        console.error('Sync Seller Status Error:', error);
        res.status(500).json({
            message: 'Failed to sync seller status',
            error: error.message
        });
    }
});

module.exports = router;
