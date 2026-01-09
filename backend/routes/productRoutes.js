const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');

// Helper to check if user can manage product
const canManageProduct = async (user, productId) => {
  if (user.isAdmin) return true;
  if (!user.is_seller) return false;

  const { data: product } = await supabase
    .from('products')
    .select('seller_profile_id')
    .eq('id', productId)
    .single();

  // If product has no seller (admin created) and user is not admin -> False
  // If product seller profile matches user's seller profile -> True
  if (!product) return false;

  // We need the user's seller profile ID. It should be on req.user from protect middleware if we update it,
  // or we need to fetch it.
  // Ideally protect middleware or a new middleware attaches it.
  // For now let's query it or assume req.user has it if we update authMiddleware/protect.
  // Actually, let's fetch it here to be safe if not in req.user.
  const { data: userData } = await supabase.from('users').select('seller_profile_id').eq('id', user.id).single();

  return product.seller_profile_id === userData.seller_profile_id;
};

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const { data: products, error } = await supabase.from('products').select('*');

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json(products.map(p => ({ ...p, _id: p.id })));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const { data: product, error } = await supabase
    .from('products')
    .select('*, seller_profiles(store_name, rating)')
    .eq('id', req.params.id)
    .single();

  if (product) {
    // Flatten structure slightly for easier consumption, or keep nested
    const productWithSeller = {
      ...product,
      _id: product.id,
      seller_store_name: product.seller_profiles?.store_name,
      seller_rating: product.seller_profiles?.rating
    };
    res.json(productWithSeller);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
}));

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin or Seller (Owner)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const { data: product } = await supabase.from('products').select('*').eq('id', req.params.id).single();

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Permission Check
  let authorized = false;
  if (req.user.isAdmin) {
    authorized = true;
  } else if (req.user.is_seller) {
    // Check ownership
    const { data: userData } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    if (product.seller_profile_id === userData.seller_profile_id) {
      authorized = true;
    }
  }

  if (!authorized) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  // Use supabaseAdmin to bypass RLS
  const { error } = await supabaseAdmin
    .from('products')
    .delete()
    .eq('id', req.params.id);

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({ message: 'Product removed' });
}));


// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin or Seller
router.post('/', protect, asyncHandler(async (req, res) => {
  // Check permission
  if (!req.user.isAdmin && !req.user.is_seller) {
    res.status(403);
    throw new Error('Not authorized to create products');
  }

  let sellerProfileId = null;
  if (req.user.is_seller) {
    const { data: u } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    sellerProfileId = u.seller_profile_id;
  }

  const product = {
    name: 'Sample name',
    price: 0,
    user_id: req.user.id,
    seller_profile_id: sellerProfileId, // Link to seller store
    seller_id: req.user.id, // Explicit link to user
    image: '/images/sample.jpg',
    brand: 'Sample brand',
    category: 'Sample category',
    count_in_stock: 0,
    num_reviews: 0,
    description: 'Sample description',
  };

  // Use supabaseAdmin to bypass RLS
  const { data: createdProduct, error } = await supabaseAdmin
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.status(201).json({ ...createdProduct, _id: createdProduct.id });
}));


// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin or Seller
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const {
    name,
    price,
    description,
    image,
    brand,
    category,
    countInStock,
  } = req.body;

  const { data: product } = await supabase.from('products').select('*').eq('id', req.params.id).single();
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Permission Check
  let authorized = false;
  if (req.user.isAdmin) {
    authorized = true;
  } else if (req.user.is_seller) {
    const { data: userData } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    if (product.seller_profile_id === userData.seller_profile_id) {
      authorized = true;
    }
  }

  if (!authorized) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  // Use supabaseAdmin to bypass RLS
  const { data: updatedProduct, error } = await supabaseAdmin
    .from('products')
    .update({
      name,
      price,
      description,
      image,
      brand,
      category,
      count_in_stock: countInStock,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({ ...updatedProduct, _id: updatedProduct.id });
}));

module.exports = router;
