const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/supabase');
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

  console.log('[ORDER] Items count:', items.length);
  console.log('[ORDER] Payment method:', paymentMethod);
  console.log('[ORDER] Shipping:', JSON.stringify(shipping));
  console.log('[ORDER] Total price:', totalPrice);

  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const isCOD = paymentMethod === 'COD';

  const initialHistory = [buildStatusHistoryEntry(STATUSES.PENDING, req.user.id, 'Order placed')];

  // Step 1: Insert order
  const orderPayload = {
    user_id: req.user.id,
    order_number: orderNumber,
    total_amount: parseFloat(totalPrice) || 0,
    stripe_session_id: stripeSessionId || null,
    payment_status: isCOD ? 'cod_pending' : 'pending',
    shipping_name: shipping?.name || '',
    shipping_address: shipping?.address || '',
    shipping_city: shipping?.city || '',
    shipping_state: shipping?.state || '',
    shipping_zip: shipping?.zip || '',
    shipping_country: shipping?.country || 'IN',
    is_paid: false,
    is_delivered: false,
    status: STATUSES.PENDING,
    payment_method: isCOD ? 'COD' : 'Razorpay',
    status_history: initialHistory,
  };

  console.log('[ORDER] Step 1: Inserting order with columns:', Object.keys(orderPayload));

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(orderPayload)
    .select()
    .single();

  if (orderError) {
    console.error('[ORDER] ❌ Step 1 FAILED - Order insert error:', JSON.stringify(orderError));
    res.status(500);
    throw new Error(`Order creation failed: ${orderError.message} (code: ${orderError.code}, details: ${orderError.details})`);
  }

  console.log('[ORDER] ✅ Step 1 OK - Order created:', order.id);

  // Step 2: Create Order Items
  const orderItemsData = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id || item.product || item.id,
    product_title: item.title || item.name || 'Unknown Product',
    price: parseFloat(item.price) || 0,
    quantity: parseInt(item.quantity || item.qty || 1, 10),
    image_url: item.image || item.image_url || item.images?.[0] || null
  }));

  console.log('[ORDER] Step 2: Inserting', orderItemsData.length, 'order items');
  console.log('[ORDER] Step 2: Item columns:', Object.keys(orderItemsData[0] || {}));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    console.error('[ORDER] ❌ Step 2 FAILED - Order items insert error:', JSON.stringify(itemsError));
    // Don't leave orphan order — clean up
    await supabase.from('orders').delete().eq('id', order.id);
    res.status(500);
    throw new Error(`Order items creation failed: ${itemsError.message} (code: ${itemsError.code}, details: ${itemsError.details})`);
  }

  console.log('[ORDER] ✅ Step 2 OK - Order items created');

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

  const { data: orders, error, count } = await supabase
    .from('orders')
    .select('id,order_number,total_amount,payment_status,payment_method,status,is_paid,is_delivered,created_at', { count: 'exact' })
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
  const { data: orders, error } = await supabase
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

  const { data: order, error: fetchErr } = await supabase
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

  const { error: updateErr } = await supabase
    .from('orders')
    .update({
      status: STATUSES.CANCELLED,
      status_history: history,
      cancelled_at: new Date().toISOString(),
      cancellation_reason: reason || 'Cancelled by buyer',
    })
    .eq('id', order.id);

  if (updateErr) throw new Error(updateErr.message);

  // Restore stock if the order was confirmed (stock was deducted)
  if (wasConfirmed) {
    try {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity')
        .eq('order_id', order.id);

      if (items) {
        for (const item of items) {
          await supabase.rpc('increment_stock', {
            p_product_id: item.product_id,
            p_amount: item.quantity,
          }).catch(() => {
            // fallback: manual increment
            supabase.from('products')
              .select('count_in_stock')
              .eq('id', item.product_id)
              .single()
              .then(({ data: prod }) => {
                if (prod) {
                  supabase.from('products')
                    .update({ count_in_stock: (prod.count_in_stock || 0) + item.quantity })
                    .eq('id', item.product_id);
                }
              });
          });
        }
      }
    } catch (stockErr) {
      console.error('Stock restore error on cancel:', stockErr);
    }
  }

  // Notify seller
  try {
    const { data: items } = await supabase
      .from('order_items')
      .select('product_id')
      .eq('order_id', order.id);

    if (items) {
      const productIds = items.map(i => i.product_id);
      const { data: productsData } = await supabase
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
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, user:users(name, email), orderItems:order_items(*)')
    .eq('id', req.params.id)
    .single();

  if (order) {
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

  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
  const { data: salesData } = await supabase.from('orders').select('total_amount').eq('is_paid', true);
  const totalSales = salesData ? salesData.reduce((acc, order) => acc + (order.total_amount || 0), 0) : 0;

  res.json({
    totalOrders: orderCount || 0,
    totalProducts: productCount || 0,
    totalUsers: userCount || 0,
    totalSales: totalSales.toFixed(2)
  });
}));

module.exports = router;
