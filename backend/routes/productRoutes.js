const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');
const asyncHandler = require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const cache = require('../utils/cache');

// Helper to check if user can manage product (checks seller database for seller products)
const canManageProduct = async (user, productId) => {
  if (user.isAdmin) return true; // Admins can manage products in main DB
  if (!user.isSeller) return false;

  // Check seller database for seller products
  const { data: product } = await supabaseSeller
    .from('products')
    .select('seller_profile_id')
    .eq('id', productId)
    .single();

  // If product has no seller (admin created) and user is not admin -> False
  // If product seller profile matches user's seller profile -> True
  if (!product) return false;

  // We need the user's seller profile ID
  const { data: userData } = await supabase.from('users').select('seller_profile_id').eq('id', user.id).single();

  return product.seller_profile_id === userData.seller_profile_id;
};

// Start Helper: Generate SKU
const generateSKU = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `SKU-${timestamp}-${randomPart}`;
};
// End Helper: Generate SKU

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  // Performance: paginate + select only listing fields (avoid select('*') and huge payloads)
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '24', 10), 1), 100);
  const keyword = (req.query.keyword || '').toString().trim();
  const category = (req.query.category || '').toString().trim();

  // Cache public catalog listing briefly (safe for anonymous browsing)
  const cacheKey = `products:list:v1:p=${page}:l=${limit}:k=${keyword.toLowerCase()}:c=${category.toLowerCase()}`;
  const ttlMs = 30 * 1000;

  const payload = await cache.getOrSet(cacheKey, ttlMs, async () => {
    const selectCols = 'id,name,price,image,brand,category,subcategory,count_in_stock,num_reviews,rating,created_at,user_id,seller_profile_id';
    // Fetch enough rows from each DB to satisfy combined page after merge.
    const fetchLimit = page * limit;
    const rangeFrom = 0;
    const rangeTo = fetchLimit - 1;

    const buildQuery = (client) => {
      let q = client
        .from('products')
        .select(selectCols, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(rangeFrom, rangeTo);

      if (category) q = q.eq('category', category);
      if (keyword) q = q.ilike('name', `%${keyword}%`);
      return q;
    };

    const [mainResult, sellerResult] = await Promise.all([
      buildQuery(supabase),
      supabaseSeller ? buildQuery(supabaseSeller) : Promise.resolve({ data: [], count: 0, error: null }),
    ]);

    // If both failed, surface error.
    if (mainResult.error && sellerResult.error) {
      throw new Error('Failed to fetch products');
    }

    const mainProducts = mainResult.data || [];
    const sellerProducts = sellerResult.data || [];
    const allProducts = [...mainProducts, ...sellerProducts]
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const start = (page - 1) * limit;
    const end = start + limit;
    const pageItems = allProducts.slice(start, end).map((p) => ({ ...p, _id: p.id }));

    return {
      page,
      limit,
      total: (mainResult.count || 0) + (sellerResult.count || 0),
      products: pageItems,
    };
  });

  // Route-specific cache header (short-lived, overridden from global default)
  res.setHeader('Cache-Control', 'public, max-age=30');
  res.json(payload);
}));

// @desc    Check for duplicate product names for bulk upload
// @route   POST /api/products/check-duplicates
// @access  Private/Seller or Admin
router.post('/check-duplicates', protect, asyncHandler(async (req, res) => {
  const { names } = req.body;

  if (!Array.isArray(names) || names.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of product names');
  }

  // Permission Check
  if (!req.user.isAdmin && !req.user.isSeller) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Normalize names for comparison
  const normalizedNames = names.map(n => n?.toString().trim().toLowerCase()).filter(Boolean);

  let existingProducts = [];

  if (req.user.isSeller) {
    // Get seller's existing products from seller database
    const { data: sellerProducts } = await supabaseSellerAdmin
      .from('products')
      .select('name')
      .eq('user_id', req.user.id);
    
    existingProducts = (sellerProducts || []).map(p => p.name?.toLowerCase());
  } else {
    // Admin checks main database
    const { data: mainProducts } = await supabaseAdmin
      .from('products')
      .select('name');
    
    existingProducts = (mainProducts || []).map(p => p.name?.toLowerCase());
  }

  // Find duplicates
  const duplicates = normalizedNames.filter(name => existingProducts.includes(name));
  const newNames = normalizedNames.filter(name => !existingProducts.includes(name));

  res.json({
    success: true,
    total: names.length,
    duplicates: duplicates,
    duplicateCount: duplicates.length,
    newNames: newNames,
    newCount: newNames.length
  });
}));

// @desc    Bulk create products (for CSV upload)
// @route   POST /api/products/bulk
// @access  Private/Admin or Seller
router.post('/bulk', protect, asyncHandler(async (req, res) => {
  const products = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    res.status(400);
    throw new Error('Please provide an array of products');
  }

  // Permission Check
  if (!req.user.isAdmin && !req.user.isSeller) {
    res.status(403);
    throw new Error('Not authorized to create products');
  }

  let sellerProfileId = null;
  if (req.user.isSeller) {
    const { data: u } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    sellerProfileId = u?.seller_profile_id || null;

    // If seller_profile_id is null, try to get it from seller database
    if (!sellerProfileId) {
      const { data: sellerProfile } = await supabaseSellerAdmin
        ?.from('seller_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();

      if (sellerProfile?.id) {
        sellerProfileId = sellerProfile.id;
        console.log(`Found seller profile ${sellerProfileId} for user ${req.user.id}`);
      }
    }
  }

  console.log(`Bulk upload: User ${req.user.id}, is_seller: ${req.user.is_seller}, sellerProfileId: ${sellerProfileId || 'null'}`);

  // Prepare products for insertion (only columns that exist in current schema)
  const productsToInsert = products.map(p => ({
    name: p.name || 'Unnamed Product',
    price: parseFloat(p.price) || 0,
    user_id: req.user.id,
    seller_profile_id: sellerProfileId, // Can be null - will be filtered by user_id
    seller_id: req.user.id,
    image: p.image_url || p.image || '/images/sample.jpg', // Default local image
    brand: p.brand || 'Generic',
    category: p.category || 'Uncategorized',
    subcategory: p.subcategory || null,
    count_in_stock: parseInt(p.stock || p.count_in_stock || 0),
    num_reviews: 0,
    rating: 0,
    description: p.description || '',
    images: Array.isArray(p.images) ? p.images : (typeof p.images === 'string' ? p.images.split(',').map(i => i.trim()).filter(i => i) : []),
    sku: generateSKU() // Auto-generate SKU, ignoring input
  }));

  // Use seller database for seller products, main database for admin products
  let createdProducts, error;
  if (req.user.isSeller) {
    // Seller products go to seller database (even if sellerProfileId is null initially)
    console.log(`Bulk upload: Inserting ${productsToInsert.length} products into seller database for user ${req.user.id}`);
    console.log(`Seller profile ID: ${sellerProfileId || 'null (will be set later)'}`);

    const result = await supabaseSellerAdmin
      .from('products')
      .insert(productsToInsert)
      .select();
    createdProducts = result.data;
    error = result.error;

    if (error) {
      console.error('Bulk upload error (seller DB):', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log(`Successfully inserted ${createdProducts?.length || 0} products into seller database`);
    }
  } else {
    // Admin products go to main database
    console.log(`Bulk upload: Inserting ${productsToInsert.length} products into main database`);
    const result = await supabaseAdmin
      .from('products')
      .insert(productsToInsert)
      .select();
    createdProducts = result.data;
    error = result.error;

    if (error) {
      console.error('Bulk upload error (main DB):', error);
    }
  }

  if (error) {
    console.error('Final bulk upload error:', error);
    res.status(500);
    throw new Error(`Failed to upload products: ${error.message || JSON.stringify(error)}`);
  }

  res.status(201).json({
    success: true,
    count: createdProducts?.length || 0,
    products: createdProducts
  });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  // Check both databases for the product
  let product = null;
  let sellerProfile = null;

  // First check seller database
  const { data: sellerProduct } = await supabaseSeller
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (sellerProduct) {
    product = sellerProduct;
    // Get seller profile info from seller database
    if (sellerProduct.seller_profile_id) {
      const { data: profile } = await supabaseSeller
        .from('seller_profiles')
        .select('store_name, rating')
        .eq('id', sellerProduct.seller_profile_id)
        .single();
      sellerProfile = profile;
    }
  } else {
    // Check main database
    const { data: mainProduct } = await supabase
      .from('products')
      .select('*, seller_profiles(store_name, rating)')
      .eq('id', req.params.id)
      .single();
    product = mainProduct;
    if (mainProduct?.seller_profiles) {
      sellerProfile = mainProduct.seller_profiles;
    }
  }

  // Calculate review stats
  // Since we are moving to a separate reviews table, product.rating/num_reviews in products table might become stale
  // So let's fetch fresh stats on the fly or rely on a periodic sync.
  // For consistency, let's fetch stats from reviews table now.

  const { count: reviewCount, error: countError } = await supabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', req.params.id);

  const { data: ratingData, error: ratingError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', req.params.id);

  let avgRating = 0;
  if (ratingData && Array.isArray(ratingData) && ratingData.length > 0) {
    const sum = ratingData.reduce((acc, curr) => acc + curr.rating, 0);
    avgRating = sum / ratingData.length;
  }

  if (countError || ratingError) {
    console.warn("Reviews table stats fetch failed (table might be missing):", countError || ratingError);
  }

  if (product) {
    // Flatten structure slightly for easier consumption
    const productWithSeller = {
      ...product,
      _id: product.id,
      seller_store_name: sellerProfile?.store_name,
      seller_rating: sellerProfile?.rating,
      // Override with fresh stats
      num_reviews: reviewCount || 0,
      rating: parseFloat(avgRating.toFixed(1))
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
  // Check both databases for the product
  let product = null;
  let isSellerProduct = false;

  // First check seller database
  const { data: sellerProduct } = await supabaseSeller
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (sellerProduct) {
    product = sellerProduct;
    isSellerProduct = true;
  } else {
    // Check main database
    const { data: mainProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    product = mainProduct;
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Permission Check
  let authorized = false;
  if (req.user.isAdmin) {
    authorized = true;
  } else if (req.user.isSeller) {
    // Check ownership by seller_profile_id OR user_id
    const { data: userData } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    if (
      (product.seller_profile_id && product.seller_profile_id === userData?.seller_profile_id) ||
      product.user_id === req.user.id
    ) {
      authorized = true;
    }
  }

  if (!authorized) {
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  // Delete from appropriate database
  let error;
  if (isSellerProduct) {
    // Delete from seller database
    const result = await supabaseSellerAdmin
      .from('products')
      .delete()
      .eq('id', req.params.id);
    error = result.error;
  } else {
    // Delete from main database
    const result = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', req.params.id);
    error = result.error;
  }

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({ message: 'Product removed' });
  // Best-effort cache invalidation for listing endpoints
  await cache.delPrefix('products:list:');
  await cache.delPrefix('categories:');
  await cache.delPrefix('subcategories:');
}));


// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin or Seller
router.post('/', protect, asyncHandler(async (req, res) => {
  // Check permission
  if (!req.user.isAdmin && !req.user.isSeller) {
    res.status(403);
    throw new Error('Not authorized to create products');
  }

  let sellerProfileId = null;
  if (req.user.isSeller) {
    const { data: u } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    sellerProfileId = u?.seller_profile_id || null;
    // If missing, try seller DB
    if (!sellerProfileId) {
      const { data: sellerProfile } = await supabaseSellerAdmin
        ?.from('seller_profiles')
        .select('id')
        .eq('user_id', req.user.id)
        .single();
      if (sellerProfile?.id) sellerProfileId = sellerProfile.id;
    }
  }

  const {
    name,
    price,
    description,
    image,
    images,
    brand,
    category,
    subcategory,
    countInStock,
    sku, tags, compareAtPrice, weight, dimensions,
    video_url, videos,
    shippingRequired, shippingWeight, shippingClass, freeShipping,
    metaTitle, metaDescription, slug, status, featured
  } = req.body;

  // Only send columns that exist in the current schema to avoid missing-column errors
  const product = {
    name: name || 'Sample name',
    price: parseFloat(price) || 0,
    user_id: req.user.id,
    seller_profile_id: sellerProfileId,
    seller_id: req.user.id,
    image: image || (images && images[0]) || '/images/sample.jpg',
    brand: brand || 'Generic',
    category: category || 'Uncategorized',
    subcategory: subcategory || null,
    count_in_stock: parseInt(countInStock) || 0,
    num_reviews: 0,
    rating: 0,
    description: description || '',
    images: images || [],
    sku: generateSKU(), // Auto-generate SKU
    compare_at_price: compareAtPrice || null,
    weight: weight || null,
    dimensions: dimensions || null,
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    video_url: video_url || null,
    videos: videos || [],
    shipping_required: shippingRequired !== undefined ? shippingRequired : true,
    shipping_weight: shippingWeight || null,
    shipping_class: shippingClass || 'standard',
    free_shipping: freeShipping || false,
    meta_title: metaTitle || null,
    meta_description: metaDescription || null,
    slug: slug || null,
    status: status || 'draft',
    featured: featured || false
  };

  console.log('Create product request:', {
    userId: req.user.id,
    isSeller: req.user.isSeller,
    sellerProfileId: sellerProfileId || 'null',
    productPreview: {
      name: product.name,
      price: product.price,
      category: product.category,
      subcategory: product.subcategory
    }
  });

  // Use seller database for seller products, main database for admin products
  let createdProduct, error;
  if (req.user.isSeller) {
    const result = await supabaseSellerAdmin
      .from('products')
      .insert(product)
      .select()
      .single();
    createdProduct = result.data;
    error = result.error;
    if (error) {
      console.error('Create product error (seller DB):', error);
    } else {
      console.log('Created product in seller DB:', createdProduct?.id);
    }
  } else {
    const result = await supabaseAdmin
      .from('products')
      .insert(product)
      .select()
      .single();
    createdProduct = result.data;
    error = result.error;
    if (error) {
      console.error('Create product error (main DB):', error);
    } else {
      console.log('Created product in main DB:', createdProduct?.id);
    }
  }

  if (error || !createdProduct) {
    res.status(500);
    throw new Error(error?.message || 'Failed to create product');
  }

  res.status(201).json({ ...createdProduct, _id: createdProduct.id });
  // Best-effort cache invalidation for listing endpoints
  await cache.delPrefix('products:list:');
  await cache.delPrefix('categories:');
  await cache.delPrefix('subcategories:');
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
    images,  // <-- This was missing! Caused ReferenceError
    brand,
    category,
    subcategory,
    countInStock,
    sku, tags, compareAtPrice, weight, dimensions,
    video_url, videos,
    shippingRequired, shippingWeight, shippingClass, freeShipping,
    metaTitle, metaDescription, slug, status, featured
  } = req.body;

  // Safe extraction of image to prevent ReferenceError
  const unsafeImage = req.body.image; 
  const safeImage = unsafeImage === undefined ? undefined : unsafeImage;

  console.log('DEBUG: Update Request ID:', req.params.id);
  console.log('DEBUG: req.body keys:', Object.keys(req.body));
  console.log('DEBUG: safeImage:', safeImage);

  // Check both databases for the product
  let product = null;
  let isSellerProduct = false;

  // First check seller database
  const { data: sellerProduct } = await supabaseSeller
    .from('products')
    .select('*')
    .eq('id', req.params.id)
    .single();

  if (sellerProduct) {
    product = sellerProduct;
    isSellerProduct = true;
  } else {
    // Check main database
    const { data: mainProduct } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();
    product = mainProduct;
  }

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Permission Check
  let authorized = false;
  if (req.user.isAdmin) {
    authorized = true;
  } else if (req.user.isSeller) {
    const { data: userData } = await supabase.from('users').select('seller_profile_id').eq('id', req.user.id).single();
    if (
      (product.seller_profile_id && product.seller_profile_id === userData?.seller_profile_id) ||
      product.user_id === req.user.id
    ) {
      authorized = true;
    }
  }

  if (!authorized) {
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  // Helper to sanitize numeric values (convert empty string to null)
  const toNumber = (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // Update in appropriate database
  let updatedProduct, error;
  if (isSellerProduct) {
    // Update in seller database
    const result = await supabaseSellerAdmin
      .from('products')
      .update({
        name,
        price: toNumber(price),
        description,
        image: safeImage,
        brand,
        category,
        subcategory,
        count_in_stock: toNumber(countInStock),
        images: Array.isArray(images) ? images : (typeof images === 'string' ? images.split(',').map(i => i.trim()).filter(i => i) : undefined),
        // sku, // Immutable
        compare_at_price: toNumber(compareAtPrice),
        weight: toNumber(weight),
        dimensions,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : undefined,
        video_url,
        videos,
        shipping_required: shippingRequired,
        shipping_weight: toNumber(shippingWeight),
        shipping_class: shippingClass,
        free_shipping: freeShipping,
        meta_title: metaTitle,
        meta_description: metaDescription,
        slug,
        status,
        featured
      })
      .eq('id', req.params.id)
      .select()
      .single();
    updatedProduct = result.data;
    error = result.error;
  } else {
    // Update in main database
    const result = await supabaseAdmin
      .from('products')
      .update({
        name,
        price: toNumber(price),
        description,
        image: safeImage,
        brand,
        category,
        subcategory,
        count_in_stock: toNumber(countInStock),
        images: Array.isArray(images) ? images : (typeof images === 'string' ? images.split(',').map(i => i.trim()).filter(i => i) : undefined),
        // sku, // Immutable
        compare_at_price: toNumber(compareAtPrice),
        weight: toNumber(weight),
        dimensions,
        tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : undefined,
        video_url,
        videos,
        shipping_required: shippingRequired,
        shipping_weight: toNumber(shippingWeight),
        shipping_class: shippingClass,
        free_shipping: freeShipping,
        meta_title: metaTitle,
        meta_description: metaDescription,
        slug,
        status,
        featured
      })
      .eq('id', req.params.id)
      .select()
      .single();
    updatedProduct = result.data;
    error = result.error;
  }

  if (error) {
    console.error('Update product error:', error);
    res.status(500);
    throw new Error(`Failed to update product: ${error.message || JSON.stringify(error)}`);
  }

  res.json({ ...updatedProduct, _id: updatedProduct.id });
  // Best-effort cache invalidation for listing endpoints
  await cache.delPrefix('products:list:');
  await cache.delPrefix('categories:');
  await cache.delPrefix('subcategories:');
}));

module.exports = router;
