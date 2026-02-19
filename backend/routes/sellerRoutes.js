const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { protectSeller } = require('../middleware/sellerMiddleware');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');
const {
    STATUSES,
    isValidTransition,
    buildStatusHistoryEntry,
    statusLabel,
    STOCK_DEDUCT_ON,
    STOCK_RESTORE_ON,
} = require('../utils/orderStatusValidation');

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
                .select('price, qty, order_id')
                .in('product_id', productIds);

            if (orderItems) {
                const uniqueOrderIds = new Set(orderItems.map(item => item.order_id));
                totalOrders = uniqueOrderIds.size;

                totalSales = orderItems.reduce((sum, item) => {
                    return sum + (parseFloat(item.price) * item.qty);
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
                totalAmount: order.total_amount || order.total_price,
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

// @desc    Get Seller Order Detail
// @route   GET /api/seller/orders/:id
// @access  Private (Seller)
router.get('/orders/:id', protect, protectSeller, async (req, res) => {
    try {
        const sellerProfileId = req.seller.profileId || req.user.sellerProfileId;

        // 1. Get seller's product IDs
        const { data: products } = await supabaseSeller
            .from('products')
            .select('id')
            .eq('seller_profile_id', sellerProfileId);

        if (!products || products.length === 0) {
            return res.status(404).json({ message: 'No products found for this seller' });
        }

        const productIds = products.map(p => p.id);

        // 2. Verify this order contains at least one of seller's products
        const { data: orderItems } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', req.params.id)
            .in('product_id', productIds);

        if (!orderItems || orderItems.length === 0) {
            return res.status(404).json({ message: 'Order not found or does not contain your products' });
        }

        // 3. Get full order details
        const { data: order, error } = await supabase
            .from('orders')
            .select('*, user:users(name, email)')
            .eq('id', req.params.id)
            .single();

        if (error || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // shipping_address is JSONB in DB
        const shippingAddr = order.shipping_address || {};

        res.json({
            id: order.id,
            orderNumber: order.order_number,
            status: order.status || 'pending',
            statusHistory: order.status_history || [],
            paymentMethod: order.payment_method || 'N/A',
            paymentStatus: order.is_paid ? 'Paid' : (order.payment_method === 'COD' ? 'COD - Pay on Delivery' : 'Unpaid'),
            isPaid: order.is_paid,
            isDelivered: order.is_delivered,
            totalAmount: order.total_amount || order.total_price,
            createdAt: order.created_at,
            customer: {
                name: order.user?.name || 'Guest',
                email: order.user?.email || '',
            },
            shippingAddress: {
                name: shippingAddr.name || '',
                address: shippingAddr.address || '',
                city: shippingAddr.city || '',
                state: shippingAddr.state || '',
                zip: shippingAddr.zip || '',
                country: shippingAddr.country || '',
            },
            // order_items use DB columns: name, qty, image
            items: orderItems.map(item => ({
                id: item.id,
                productId: item.product_id,
                title: item.name,
                price: item.price,
                quantity: item.qty,
                image: item.image,
            })),
        });
    } catch (error) {
        console.error('Get Seller Order Detail Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// @desc    Update Order Status (Seller)
// @route   PATCH /api/seller/orders/:id/status
// @access  Private (Seller)
router.patch('/orders/:id/status', protect, protectSeller, async (req, res) => {
    try {
        const { status: newStatus, note } = req.body;
        const sellerProfileId = req.seller.profileId || req.user.sellerProfileId;

        if (!newStatus) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // 1. Verify seller owns products in this order
        const { data: products } = await supabaseSeller
            .from('products')
            .select('id')
            .eq('seller_profile_id', sellerProfileId);

        if (!products || products.length === 0) {
            return res.status(403).json({ message: 'No products found for this seller' });
        }

        const productIds = products.map(p => p.id);

        const { data: orderItems } = await supabase
            .from('order_items')
            .select('product_id, qty')
            .eq('order_id', req.params.id)
            .in('product_id', productIds);

        if (!orderItems || orderItems.length === 0) {
            return res.status(403).json({ message: 'Not authorized to update this order' });
        }

        // 2. Get current order
        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();

        if (orderErr || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const currentStatus = order.status || 'pending';

        // 3. Validate transition
        if (!isValidTransition(currentStatus, newStatus)) {
            return res.status(400).json({
                message: `Cannot change status from "${statusLabel(currentStatus)}" to "${statusLabel(newStatus)}"`,
            });
        }

        // 4. Build update payload
        const history = Array.isArray(order.status_history) ? [...order.status_history] : [];
        history.push(buildStatusHistoryEntry(newStatus, req.user.id, note));

        const updateData = {
            status: newStatus,
            status_history: history,
        };

        // Extra fields based on new status
        if (newStatus === STATUSES.SHIPPED) {
            updateData.shipped_at = new Date().toISOString();
        } else if (newStatus === STATUSES.DELIVERED) {
            updateData.is_delivered = true;
            updateData.delivered_at = new Date().toISOString();
            // COD: mark as paid on delivery
            if (order.payment_method === 'COD') {
                updateData.is_paid = true;
                updateData.paid_at = new Date().toISOString();
                updateData.payment_status = 'paid';
            }
        } else if (newStatus === STATUSES.CANCELLED) {
            updateData.cancelled_at = new Date().toISOString();
            updateData.cancellation_reason = note || 'Cancelled by seller';
        }

        // 5. Update order
        const { error: updateErr } = await supabase
            .from('orders')
            .update(updateData)
            .eq('id', order.id);

        if (updateErr) throw updateErr;

        // 6. Stock management
        if (newStatus === STOCK_DEDUCT_ON) {
            // Deduct stock on confirmation
            for (const item of orderItems) {
                const { data: prod } = await supabase
                    .from('products')
                    .select('count_in_stock')
                    .eq('id', item.product_id)
                    .single();

                if (prod) {
                    const newStock = Math.max(0, (prod.count_in_stock || 0) - item.qty);
                    await supabase.from('products')
                        .update({ count_in_stock: newStock })
                        .eq('id', item.product_id);
                }
            }
        } else if (STOCK_RESTORE_ON.includes(newStatus)) {
            // Restore stock on cancel/return
            for (const item of orderItems) {
                const { data: prod } = await supabase
                    .from('products')
                    .select('count_in_stock')
                    .eq('id', item.product_id)
                    .single();

                if (prod) {
                    await supabase.from('products')
                        .update({ count_in_stock: (prod.count_in_stock || 0) + item.qty })
                        .eq('id', item.product_id);
                }
            }
        }

        // 7. Notify buyer via socket
        try {
            req.io.to(order.user_id).emit('ORDER_STATUS_UPDATED', {
                orderId: order.id,
                orderNumber: order.order_number,
                newStatus,
                message: `Your order #${order.order_number} is now ${statusLabel(newStatus)}`,
            });
        } catch (socketErr) {
            console.error('Socket notification error:', socketErr);
        }

        res.json({
            success: true,
            message: `Order status updated to ${statusLabel(newStatus)}`,
            status: newStatus,
        });
    } catch (error) {
        console.error('Update Order Status Error:', error);
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

// =============================================
// SELLER ORDER MANAGEMENT ENDPOINTS
// =============================================

// @desc    Get orders for a seller (orders containing their products)
// @route   GET /api/seller/orders
// @access  Private (Seller)
router.get('/orders', protect, protectSeller, async (req, res) => {
    try {
        const sellerId = req.user.id;
        const { status, limit = 50 } = req.query;

        // Find all order IDs that contain this seller's products
        let orderItemsQuery = supabaseAdmin
            .from('order_items')
            .select('order_id')
            .eq('seller_id', sellerId);

        const { data: sellerItems, error: itemsError } = await orderItemsQuery;

        if (itemsError) {
            console.error('[SELLER ORDERS] Error fetching seller order items:', itemsError);
            return res.status(500).json({ message: 'Failed to fetch orders' });
        }

        if (!sellerItems || sellerItems.length === 0) {
            return res.json([]);
        }

        // Get unique order IDs
        const orderIds = [...new Set(sellerItems.map(i => i.order_id))];

        // Fetch full order details
        let ordersQuery = supabaseAdmin
            .from('orders')
            .select('id, order_number, total_amount, total_price, payment_method, payment_status, status, is_paid, is_delivered, created_at, shipping_address, user_id')
            .in('id', orderIds)
            .order('created_at', { ascending: false })
            .limit(parseInt(limit));

        if (status && status !== 'all') {
            ordersQuery = ordersQuery.eq('status', status);
        }

        const { data: orders, error: ordersError } = await ordersQuery;

        if (ordersError) {
            console.error('[SELLER ORDERS] Error fetching orders:', ordersError);
            return res.status(500).json({ message: 'Failed to fetch orders' });
        }

        res.json(orders || []);
    } catch (error) {
        console.error('[SELLER ORDERS] Unexpected error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Get single order detail for seller
// @route   GET /api/seller/orders/:id
// @access  Private (Seller)
router.get('/orders/:id', protect, protectSeller, async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orderId = req.params.id;

        // Verify this seller has items in this order
        const { data: sellerItems, error: checkError } = await supabaseAdmin
            .from('order_items')
            .select('id')
            .eq('order_id', orderId)
            .eq('seller_id', sellerId)
            .limit(1);

        if (checkError || !sellerItems || sellerItems.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Fetch full order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (orderError || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Fetch order items (only this seller's items)
        const { data: items } = await supabaseAdmin
            .from('order_items')
            .select('*')
            .eq('order_id', orderId)
            .eq('seller_id', sellerId);

        // Fetch customer info
        const { data: customer } = await supabaseAdmin
            .from('users')
            .select('name, email')
            .eq('id', order.user_id)
            .single();

        // Format response to match frontend expectations
        res.json({
            id: order.id,
            orderNumber: order.order_number,
            status: order.status || 'pending',
            statusHistory: order.status_history || [],
            customer: customer || { name: 'Guest', email: 'N/A' },
            items: (items || []).map(item => ({
                id: item.id,
                title: item.name,
                quantity: item.qty,
                price: parseFloat(item.price),
                image: item.image,
            })),
            shippingAddress: order.shipping_address || {},
            paymentMethod: order.payment_method || 'N/A',
            paymentStatus: order.payment_status || 'pending',
            isPaid: order.is_paid || false,
            totalAmount: parseFloat(order.total_amount || order.total_price || 0),
            createdAt: order.created_at,
        });
    } catch (error) {
        console.error('[SELLER ORDER DETAIL] Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Update order status (seller)
// @route   PATCH /api/seller/orders/:id/status
// @access  Private (Seller)
router.patch('/orders/:id/status', protect, protectSeller, async (req, res) => {
    try {
        const sellerId = req.user.id;
        const orderId = req.params.id;
        const { status: newStatus, note } = req.body;

        if (!newStatus) {
            return res.status(400).json({ message: 'Status is required' });
        }

        // Verify seller owns items in this order
        const { data: sellerItems, error: checkError } = await supabaseAdmin
            .from('order_items')
            .select('id')
            .eq('order_id', orderId)
            .eq('seller_id', sellerId)
            .limit(1);

        if (checkError || !sellerItems || sellerItems.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Fetch current order
        const { data: order, error: fetchError } = await supabaseAdmin
            .from('orders')
            .select('id, status, status_history, user_id')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Validate status transition
        if (!isValidTransition(order.status, newStatus)) {
            return res.status(400).json({
                message: `Cannot transition from "${statusLabel(order.status)}" to "${statusLabel(newStatus)}"`
            });
        }

        // Build updated history
        const history = Array.isArray(order.status_history) ? [...order.status_history] : [];
        history.push(buildStatusHistoryEntry(newStatus, sellerId, note || `Updated by seller`));

        // Build update payload
        const updatePayload = {
            status: newStatus,
            status_history: history,
        };

        if (newStatus === STATUSES.DELIVERED) {
            updatePayload.is_delivered = true;
            updatePayload.delivered_at = new Date().toISOString();
        }
        if (newStatus === STATUSES.SHIPPED) {
            updatePayload.shipped_at = new Date().toISOString();
        }
        if (newStatus === STATUSES.CANCELLED) {
            updatePayload.cancelled_at = new Date().toISOString();
            updatePayload.cancellation_reason = note || 'Cancelled by seller';
        }

        // Update order
        const { error: updateError } = await supabaseAdmin
            .from('orders')
            .update(updatePayload)
            .eq('id', orderId);

        if (updateError) {
            console.error('[SELLER STATUS UPDATE] Error:', updateError);
            return res.status(500).json({ message: 'Failed to update status' });
        }

        // Stock deduction on confirm, restore on cancel
        if (newStatus === STOCK_DEDUCT_ON) {
            try {
                const stockClient = supabaseSellerAdmin || supabaseSeller;
                const { data: orderItems } = await supabaseAdmin
                    .from('order_items')
                    .select('product_id, qty')
                    .eq('order_id', orderId)
                    .eq('seller_id', sellerId);

                if (stockClient && orderItems) {
                    for (const item of orderItems) {
                        await stockClient
                            .from('products')
                            .update({ count_in_stock: supabaseAdmin.rpc ? undefined : undefined })
                            .eq('id', item.product_id);
                        // Use RPC or manual decrement
                        const { data: product } = await stockClient
                            .from('products')
                            .select('count_in_stock')
                            .eq('id', item.product_id)
                            .single();
                        if (product) {
                            await stockClient
                                .from('products')
                                .update({ count_in_stock: Math.max(0, (product.count_in_stock || 0) - item.qty) })
                                .eq('id', item.product_id);
                        }
                    }
                }
            } catch (stockErr) {
                console.error('[SELLER STATUS] Stock deduction error (non-critical):', stockErr);
            }
        }

        if (STOCK_RESTORE_ON.includes(newStatus)) {
            try {
                const stockClient = supabaseSellerAdmin || supabaseSeller;
                const { data: orderItems } = await supabaseAdmin
                    .from('order_items')
                    .select('product_id, qty')
                    .eq('order_id', orderId)
                    .eq('seller_id', sellerId);

                if (stockClient && orderItems) {
                    for (const item of orderItems) {
                        const { data: product } = await stockClient
                            .from('products')
                            .select('count_in_stock')
                            .eq('id', item.product_id)
                            .single();
                        if (product) {
                            await stockClient
                                .from('products')
                                .update({ count_in_stock: (product.count_in_stock || 0) + item.qty })
                                .eq('id', item.product_id);
                        }
                    }
                }
            } catch (stockErr) {
                console.error('[SELLER STATUS] Stock restore error (non-critical):', stockErr);
            }
        }

        // Notify buyer via socket
        try {
            if (req.io && order.user_id) {
                req.io.to(order.user_id).emit('ORDER_STATUS_UPDATED', {
                    orderId: order.id,
                    newStatus,
                    message: `Your order status has been updated to ${statusLabel(newStatus)}`
                });
            }
        } catch (socketErr) {
            console.warn('[SELLER STATUS] Socket notification failed:', socketErr.message);
        }

        res.json({
            message: `Order status updated to ${statusLabel(newStatus)}`,
            status: newStatus
        });
    } catch (error) {
        console.error('[SELLER STATUS UPDATE] Unexpected error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
