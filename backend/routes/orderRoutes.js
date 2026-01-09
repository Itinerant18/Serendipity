const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const asyncHandler = require('express-async-handler');
const supabase = require('../config/supabase');

const router = express.Router();

router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    items, // Frontend sends 'items'
    shippingAddress,
    paymentMethod, // Frontend sends stripeSessionId, logic might need adjustment
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    shipping, // Frontend sends shipping object
    stripeSessionId
  } = req.body;

  // Map frontend payload to backend variables if needed
  // Frontend: items, shipping, stripeSessionId
  // Backend DB: payment_method, shipping_address etc.

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

  // 1. Create Order
  // Note: Frontend sends 'shipping' object with address fields. Backend schema expects separate columns or json? 
  // Based on existing route code: shipping_address (string/json?), shipping_city...
  // Let's assume the DB has columns matching the INSERT from frontend API:
  // shipping_name, shipping_address, shipping_city, shipping_state, shipping_zip, shipping_country

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: req.user.id,
      order_number: orderNumber,
      total_amount: totalPrice || 0, // Frontend calc logic was in route, better to trust backend or passed value?
      stripe_session_id: stripeSessionId || null,
      payment_status: 'pending', // Default
      shipping_name: shipping?.name,
      shipping_address: shipping?.address,
      shipping_city: shipping?.city,
      shipping_state: shipping?.state,
      shipping_zip: shipping?.zip,
      shipping_country: shipping?.country || 'US',
      is_paid: false,
      is_delivered: false,
      // Map legacy fields if table requires them (based on old code)
      tax_price: taxPrice || 0,
      shipping_price: shippingPrice || 0,
      payment_method: 'Stripe'
    })
    .select()
    .single();

  if (orderError) {
    throw new Error(orderError.message);
  }

  // 2. Create Order Items
  const orderItemsData = items.map(item => ({
    order_id: order.id,
    product_id: item.product_id || item.product,
    product_title: item.title || item.name,
    price: item.price,
    quantity: item.quantity || item.qty,
    image_url: item.image
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  // 3. Clear User's Cart
  await supabase
    .from('saved_carts')
    .delete()
    .eq('user_id', req.user.id);

  res.status(201).json({ ...order, _id: order.id, orderNumber: order.order_number });
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
  // Fetch order with user details and partial order items logic if needed
  // Supabase join syntax: user:users(...)

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, user:users(name, email), orderItems:order_items(*)')
    .eq('id', req.params.id)
    .single();

  if (order) {
    // Transform to match frontend expectation
    // Map order.id to order._id
    // And map items if necessary.
    res.json({ ...order, _id: order.id });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
}));

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, asyncHandler(async (req, res) => {
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', req.user.id);

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json(orders);
}));

// @desc    Get all orders (Admin) or Stats
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, asyncHandler(async (req, res) => {
  if (!req.user.isAdmin) {
    res.status(403);
    throw new Error('Not authorized as admin');
  }

  // Fetch Stats
  const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
  const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
  const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });

  // Access restricted
  // Calculate total sales - sum total_amount
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
