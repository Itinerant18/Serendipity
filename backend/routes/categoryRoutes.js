const express = require('express');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSeller, supabaseSellerAdmin } = require('../config/supabaseSeller');
const asyncHandler = require('express-async-handler');
const cache = require('../utils/cache');

const router = express.Router();

// Default categories structure (fallback)
const DEFAULT_CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Beauty',
    'Sports',
    'Books'
];

const DEFAULT_SUBCATEGORIES = {
    'Electronics': [
        'Smartphones & Accessories',
        'Laptops & Computers',
        'Audio & Headphones',
        'Cameras & Photography',
        'Gaming & Consoles',
        'Wearables & Smart Devices',
        'TV & Home Entertainment',
        'Computer Accessories'
    ],
    'Fashion': [
        "Men's Clothing",
        "Women's Clothing",
        "Kids' Clothing",
        'Footwear',
        'Bags & Luggage',
        'Watches',
        'Jewelry & Accessories',
        'Sunglasses & Eyewear'
    ],
    'Home & Living': [
        'Furniture',
        'Kitchen & Dining',
        'Bedding & Bath',
        'Home Decor',
        'Storage & Organization',
        'Lighting',
        'Garden & Outdoor',
        'Home Appliances'
    ],
    'Beauty': [
        'Skincare',
        'Makeup & Cosmetics',
        'Haircare',
        'Fragrances',
        'Personal Care & Grooming',
        'Bath & Body',
        'Beauty Tools & Accessories',
        "Men's Grooming"
    ],
    'Sports': [
        'Fitness Equipment',
        'Sportswear & Activewear',
        'Outdoor & Camping',
        'Cycling',
        'Yoga & Pilates',
        'Team Sports',
        'Running & Athletics',
        'Sports Accessories'
    ],
    'Books': [
        'Fiction',
        'Non-Fiction',
        "Children's Books",
        'Comics & Graphic Novels',
        'Educational & Textbooks',
        'Self-Help & Business',
        'Magazines',
        'E-Books & Audiobooks'
    ]
};

// @desc    Get all unique categories
// @route   GET /api/categories
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  try {
    const payload = await cache.getOrSet('categories:v1', 5 * 60 * 1000, async () => {
      // Fetch categories from both databases
      const [mainCategoriesResult, sellerCategoriesResult] = await Promise.all([
        supabase.from('products').select('category').not('category', 'is', null),
        supabaseSeller?.from('products').select('category').not('category', 'is', null) || { data: [] }
      ]);

      const mainCategories = mainCategoriesResult.data || [];
      const sellerCategories = sellerCategoriesResult.data || [];

      // Combine and get unique categories from database
      const dbCategories = [...mainCategories, ...sellerCategories]
        .map(p => p.category)
        .filter((cat, index, self) => cat && self.indexOf(cat) === index)
        .sort();

      // ONLY return the 6 specified categories (filter out any extras like "Appliances")
      // Merge with default categories but filter to only show our 6 categories
      const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])]
        .filter(cat => DEFAULT_CATEGORIES.includes(cat)) // Only allow our 6 categories
        .sort();

      return {
        success: true,
        categories: allCategories,
        fromDatabase: dbCategories.length > 0
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(payload);
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Return default categories on error
    res.json({
      success: true,
      categories: DEFAULT_CATEGORIES,
      fromDatabase: false
    });
  }
}));

// @desc    Get subcategories for a specific category
// @route   GET /api/categories/:category/subcategories
// @access  Public
router.get('/:category/subcategories', asyncHandler(async (req, res) => {
  try {
    const { category } = req.params;

    if (!category) {
      res.status(400);
      throw new Error('Category is required');
    }

    const key = `subcategories:v1:${category.toLowerCase()}`;
    const payload = await cache.getOrSet(key, 5 * 60 * 1000, async () => {
      // Fetch subcategories from both databases for the given category
      const [mainSubcategoriesResult, sellerSubcategoriesResult] = await Promise.all([
        supabase
          .from('products')
          .select('subcategory')
          .eq('category', category)
          .not('subcategory', 'is', null),
        supabaseSeller?.from('products')
          .select('subcategory')
          .eq('category', category)
          .not('subcategory', 'is', null) || { data: [] }
      ]);

      const mainSubcategories = mainSubcategoriesResult.data || [];
      const sellerSubcategories = sellerSubcategoriesResult.data || [];

      // Combine and get unique subcategories from database
      const dbSubcategories = [...mainSubcategories, ...sellerSubcategories]
        .map(p => p.subcategory)
        .filter((subcat, index, self) => subcat && self.indexOf(subcat) === index)
        .sort();

      // Merge with default subcategories for this category
      const defaultSubcats = DEFAULT_SUBCATEGORIES[category] || [];
      const allSubcategories = [...new Set([...defaultSubcats, ...dbSubcategories])].sort();

      return {
        success: true,
        category: category,
        subcategories: allSubcategories,
        fromDatabase: dbSubcategories.length > 0
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(payload);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    // Return default subcategories on error
    const defaultSubcats = DEFAULT_SUBCATEGORIES[category] || [];
    res.json({
      success: true,
      category: category,
      subcategories: defaultSubcats,
      fromDatabase: false
    });
  }
}));

// @desc    Get all categories with their subcategories
// @route   GET /api/categories/with-subcategories
// @access  Public
router.get('/with-subcategories', asyncHandler(async (req, res) => {
  try {
    const payload = await cache.getOrSet('categories:with-subcategories:v1', 5 * 60 * 1000, async () => {
      // Fetch all products with category and subcategory from both databases
      const [mainProductsResult, sellerProductsResult] = await Promise.all([
        supabase
          .from('products')
          .select('category, subcategory')
          .not('category', 'is', null),
        supabaseSeller
          ? supabaseSeller
            .from('products')
            .select('category, subcategory')
            .not('category', 'is', null)
          : Promise.resolve({ data: [] })
      ]);

      const mainProducts = mainProductsResult.data || [];
      const sellerProducts = sellerProductsResult.data || [];
      const allProducts = [...mainProducts, ...sellerProducts];

      // Group subcategories by category
      const categoryMap = {};

      allProducts.forEach(product => {
        if (!product.category) return;

        if (!categoryMap[product.category]) {
          categoryMap[product.category] = new Set();
        }

        if (product.subcategory) {
          categoryMap[product.category].add(product.subcategory);
        }
      });

      // Convert to array format
      const categoriesWithSubcategories = Object.keys(categoryMap)
        .sort()
        .map(category => ({
          name: category,
          subcategories: Array.from(categoryMap[category]).sort()
        }));

      return {
        success: true,
        categories: categoriesWithSubcategories
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=300');
    res.json(payload);
  } catch (error) {
    console.error('Error fetching categories with subcategories:', error);
    res.status(500);
    throw new Error('Failed to fetch categories with subcategories');
  }
}));

module.exports = router;
