const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');
const {
  STATUSES,
  BUYER_CANCELLABLE,
  STOCK_RESTORE_ON,
  buildStatusHistoryEntry,
  statusLabel,
} = require('../utils/orderStatusValidation');

const router = express.Router();

// @desc    Create new order (COD or Razorpay)
// @route   POST /api/orders
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  console.log('[ORDER] === Order Creation Start ===');
  console.log('[ORDER] User:', req.user?.id);
  console.log('[ORDER] Body keys:', Object.keys(req.body));

  const {
    items,
    shippingAddress,
    paymentMethod = 'COD',
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    shipping,
    stripeSessionId
  } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Pre-validate products (Existence + Stock + Seller Ownership Warning)
  const productIds = [...new Set(items.map(item => item.product_id || item.product || item.id).filter(Boolean))];

  // Check BOTH main database AND seller database for products
  const sellerClient = supabaseSellerAdmin || supabaseSeller;

  const [mainProductsResult, sellerProductsResult] = await Promise.all([
    supabaseAdmin.from('products').select('id, count_in_stock, name, user_id').in('id', productIds),
    sellerClient
      ? sellerClient.from('products').select('id, count_in_stock, name, user_id').in('id', productIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  const validProducts = [
    ...(mainProductsResult.data || []),
    ...(sellerProductsResult.data || [])
  ];

  console.log('[ORDER] Product check - Main DB:', mainProductsResult.data?.length || 0, 'Seller DB:', sellerProductsResult.data?.length || 0, 'Using admin:', !!supabaseSellerAdmin);
  // 1. Check for missing products
  const foundIds = validProducts?.map(p => p.id) || [];
  const missing = productIds.filter(id => !foundIds.includes(id));
  if (missing.length > 0) {
    console.warn('[ORDER] ⚠️ Missing products:', missing);
    res.status(400);
    throw new Error(`Products not found: ${missing.join(', ')}`);
  }

  // 2. Check for Out of Stock
  const productMap = new Map(validProducts.map(p => [p.id, p]));
  const outOfStockItems = [];

  items.forEach(item => {
    const pid = item.product_id || item.product || item.id;
    const product = productMap.get(pid);
    // Determine qty (frontend sends quantity or qty)
    const qty = parseInt(item.quantity || item.qty || 1, 10);

    if (product && product.count_in_stock < qty) {
      outOfStockItems.push(`${product.name} (Requested: ${qty}, Available: ${product.count_in_stock})`);
    }
  });

  if (outOfStockItems.length > 0) {
    res.status(400);
    throw new Error(`Out of Stock: ${outOfStockItems.join(', ')}`);
  }

  console.log('[ORDER] Items count:', items.length);
  console.log('[ORDER] Payment method:', paymentMethod);
  console.log('[ORDER] Shipping:', JSON.stringify(shipping));
  console.log('[ORDER] Total price:', totalPrice);

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const isCOD = paymentMethod === 'COD';

  const initialHistory = [buildStatusHistoryEntry(STATUSES.PENDING, req.user.id, 'Order placed')];

  // Step 1: Insert order using ADMIN client (bypass RLS)
  // DB schema: shipping_address is JSONB, total_price is the original column
  const orderPayload = {
    user_id: req.user.id,
    order_number: orderNumber,
    total_price: parseFloat(totalPrice) || 0,
    total_amount: parseFloat(totalPrice) || 0,
    stripe_session_id: stripeSessionId || null,
    payment_status: isCOD ? 'cod_pending' : 'pending',
    shipping_address: {
      name: shipping?.name || '',
      address: shipping?.address || '',
      city: shipping?.city || '',
      state: shipping?.state || '',
      zip: shipping?.zip || '',
      country: shipping?.country || 'IN',
      phone: shipping?.phone || ''
    },
    payment_method: isCOD ? 'COD' : 'Razorpay',
    is_paid: false,
    is_delivered: false,
    status: STATUSES.PENDING,
    status_history: initialHistory,
  };

  console.log('[ORDER] Step 1: Inserting order with columns:', Object.keys(orderPayload));

  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) {
    console.error('[ORDER] ❌ Step 1 FAILED - Order insert error:', JSON.stringify(orderError));
    if (orderError.code === '23503') { // Foreign key violation
      res.status(400);
      throw new Error(`Order creation failed: User or related data not found (FK violation). details: ${orderError.details}`);
    }
    if (orderError.code === '42501') { // RLS violation
      res.status(403); // Forbidden
      throw new Error('Order creation failed: Permission denied (RLS). Check request headers.');
    }
    res.status(500);
    throw new Error(`Order creation failed: ${orderError.message} (code: ${orderError.code}, details: ${orderError.details})`);
  }

  console.log('[ORDER] ✅ Step 1 OK - Order created:', order.id);

  // Step 2: Create Order Items using ADMIN client
  // DB schema: columns are name, qty, image (NOT product_title, quantity, image_url)
  // Build seller map from validProducts (user_id = seller's auth ID)
  const sellerMap = {};
  validProducts.forEach(p => { if (p.user_id) sellerMap[p.id] = p.user_id; });

  const orderItemsData = items.map(item => {
    const pid = item.product_id || item.product || item.id;
    return {
      order_id: order.id,
      product_id: pid,
      seller_id: sellerMap[pid] || null,
      name: item.title || item.name || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      qty: parseInt(item.quantity || item.qty || 1, 10),
      image: item.image || item.image_url || item.images?.[0] || ''
    };
  });

  console.log('[ORDER] Step 2: Inserting', orderItemsData.length, 'order items');
  console.log('[ORDER] Step 2: Item columns:', Object.keys(orderItemsData[0] || {}));

  const { error: itemsError } = await supabaseAdmin
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    console.error('[ORDER] ❌ Step 2 FAILED - Order items insert error:', JSON.stringify(itemsError));
    // Don't leave orphan order — clean up
    await supabaseAdmin.from('orders').delete().eq('id', order.id);

    if (itemsError.code === '23503') {
      res.status(400);
      throw new Error('Order items failed: Product not found (Foreign Key Violation).');
    }
    res.status(500);
    throw new Error(`Order items creation failed: ${itemsError.message} (code: ${itemsError.code}, details: ${itemsError.details})`);
  }

  console.log('[ORDER] ✅ Step 2 OK - Order items created');

  // Step 2.5: Deduct Stock from SELLER DB (where products live)
  try {
    const stockClient = supabaseSellerAdmin || supabaseSeller;
    const stockPromises = items.map(async (item) => {
      const pid = item.product_id || item.product || item.id;
      const qty = parseInt(item.quantity || item.qty || 1, 10);
      // Get current stock from Seller DB
      const { data: prod } = await stockClient
        .from('products')
        .select('count_in_stock')
        .eq('id', pid)
        .single();
      if (prod) {
        const newStock = Math.max((prod.count_in_stock || 0) - qty, 0);
        await stockClient
          .from('products')
          .update({ count_in_stock: newStock })
          .eq('id', pid);
      }
    });

    await Promise.all(stockPromises);
    console.log('[ORDER] ✅ Step 2.5 OK - Stock deducted from Seller DB');
  } catch (stockErr) {
    console.error('[ORDER] ❌ Step 2.5 FAILED - Stock deduction error:', stockErr);
    // Non-fatal: Order is created, just stock might be off. Admin can fix.
  }

  // Step 3: Clear User's Cart (non-critical, don't fail order if this breaks)
  try {
    await supabase.from('saved_carts').delete().eq('user_id', req.user.id);
    console.log('[ORDER] ✅ Step 3 OK - Cart cleared');
  } catch (cartErr) {
    console.warn('[ORDER] ⚠️ Step 3 - Cart clear failed (non-critical):', cartErr.message);
  }

  // Step 4: Real-time Notifications for Sellers (non-critical)
  try {
    const productIds = items.map(item => item.product_id || item.product || item.id).filter(Boolean);
    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select('seller_profile:seller_profiles(user_id)')
        .in('id', productIds);

      if (productsData) {
        const sellerUserIds = [...new Set(productsData.map(p => p.seller_profile?.user_id).filter(Boolean))];
        sellerUserIds.forEach(sellerUserId => {
          req.io?.to(sellerUserId).emit('NEW_ORDER', {
            orderId: order.id,
            orderNumber: order.order_number,
            totalAmount: order.total_amount,
            paymentMethod: order.payment_method,
            message: 'You have a new order!'
          });
        });
      }
    }
    console.log('[ORDER] ✅ Step 4 OK - Notifications sent');
  } catch (socketErr) {
    console.warn('[ORDER] ⚠️ Step 4 - Socket notification failed (non-critical):', socketErr.message);
  }

  console.log('[ORDER] === Order Creation Complete ===', order.id);
  res.status(201).json({ ...order, _id: order.id, orderNumber: order.order_number });
}));

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '20', 10), 1), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Use admin client to ensure consistent read access
  const { data: orders, error, count } = await supabaseAdmin
    .from('orders')
    .select('id,order_number,total_amount,total_price,payment_status,payment_method,status,is_paid,is_delivered,created_at', { count: 'exact' })
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.setHeader('Cache-Control', 'private, max-age=15');
  res.json({ page, limit, total: count || 0, orders: orders || [] });
}));

// @desc    Get logged in user order history with items
// @route   GET /api/orders/history
// @access  Private
router.get('/history', protect, asyncHandler(async (req, res) => {
  // Use admin client to ensure consistent read access
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({ orders: orders || [] });
}));

// @desc    Cancel order (buyer)
// @route   POST /api/orders/:id/cancel
// @access  Private
router.post('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const { reason } = req.body;

  // Use admin client + explicit user_id check
  const { data: order, error: fetchErr } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('id', req.params.id)
    .eq('user_id', req.user.id)
    .single();

  if (fetchErr || !order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!BUYER_CANCELLABLE.includes(order.status)) {
    res.status(400);
    throw new Error(`Cannot cancel order in "${statusLabel(order.status)}" status`);
  }

  const wasConfirmed = order.status === STATUSES.CONFIRMED;
  const history = Array.isArray(order.status_history) ? order.status_history : [];
  history.push(buildStatusHistoryEntry(STATUSES.CANCELLED, req.user.id, reason || 'Cancelled by buyer'));

  // Use admin client for update
  const { error: updateErr } = await supabaseAdmin
    .from('orders')
    .update({
      status: STATUSES.CANCELLED,
      status_history: history,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || 'Cancelled by buyer',
    })
    .eq('id', order.id);

  if (updateErr) throw new Error(updateErr.message);

  // Restore stock in SELLER DB if the order was confirmed (stock was deducted)
  if (wasConfirmed) {
    try {
      const stockClient = supabaseSellerAdmin || supabaseSeller;
      const { data: items } = await supabaseAdmin
        .from('order_items')
        .select('product_id, qty')
        .eq('order_id', order.id);

      if (items && items.length > 0) {
        const productIds = items.map(i => i.product_id);
        const { data: products } = await stockClient
          .from('products')
          .select('id, count_in_stock')
          .in('id', productIds);

        if (products && products.length > 0) {
          const updates = products.map(prod => {
            const item = items.find(i => i.product_id === prod.id);
            return {
              id: prod.id,
              count_in_stock: (prod.count_in_stock || 0) + (item ? item.qty : 0)
            };
          });

          await stockClient
            .from('products')
            .upsert(updates);
        }
      }
    } catch (stockErr) {
      console.error('Stock restore error on cancel:', stockErr);
    }
  }

  // Notify seller
  try {
    const { data: items } = await supabaseAdmin
      .from('order_items')
      .select('product_id')
      .eq('order_id', order.id);

    if (items) {
      const productIds = items.map(i => i.product_id);
      const { data: productsData } = await supabaseAdmin
        .from('products')
        .select('seller_profile:seller_profiles(user_id)')
        .in('id', productIds);

      if (productsData) {
        const sellerUserIds = [...new Set(productsData.map(p => p.seller_profile?.user_id).filter(Boolean))];
        sellerUserIds.forEach(sellerUserId => {
          req.io.to(sellerUserId).emit('ORDER_STATUS_UPDATED', {
            orderId: order.id,
            orderNumber: order.order_number,
            newStatus: STATUSES.CANCELLED,
            message: `Order #${order.order_number} was cancelled by the buyer`,
          });
        });
      }
    }
  } catch (socketErr) {
    console.error('Socket notification error:', socketErr);
  }

  res.json({ success: true, message: 'Order cancelled successfully' });
}));

// @desc    Get single order by ID
// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  // Use admin client to bypass potential RLS issues, but strictly verify ownership
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*, user:users(name, email), orderItems:order_items(*)')
    .eq('id', req.params.id)
    .single();

  if (order) {
    if (order.user_id !== req.user.id && !req.user.isAdmin) {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }
    res.json({ ...order, _id: order.id });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
}));

// @desc    Get all orders stats (Admin)
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  const { count: orderCount } = await supabaseAdmin.from('orders').select('*', { count: 'exact', head: true });
  const { count: productCount } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true });
  const { count: userCount } = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true });
  const { data: salesData } = await supabaseAdmin.from('orders').select('total_amount, total_price').eq('is_paid', true);
  const totalSales = salesData ? salesData.reduce((acc, order) => acc + (order.total_amount || order.total_price || 0), 0) : 0;

  res.json({
    totalOrders: orderCount || 0,
    totalProducts: productCount || 0,
    totalUsers: userCount || 0,
    totalSales: totalSales.toFixed(2)
  });
}));

module.exports = router;
