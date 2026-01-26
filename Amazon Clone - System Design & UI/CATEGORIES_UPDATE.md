# Categories & Subcategories Update

This document describes the updated category structure and how to populate the database.

## Updated Category Structure

### Electronics
- Smartphones & Accessories
- Laptops & Computers
- Audio & Headphones
- Cameras & Photography
- Gaming & Consoles
- Wearables & Smart Devices
- TV & Home Entertainment
- Computer Accessories

### Fashion
- Men's Clothing
- Women's Clothing
- Kids' Clothing
- Footwear
- Bags & Luggage
- Watches
- Jewelry & Accessories
- Sunglasses & Eyewear

### Home & Living
- Furniture
- Kitchen & Dining
- Bedding & Bath
- Home Decor
- Storage & Organization
- Lighting
- Garden & Outdoor
- Home Appliances

### Beauty
- Skincare
- Makeup & Cosmetics
- Haircare
- Fragrances
- Personal Care & Grooming
- Bath & Body
- Beauty Tools & Accessories
- Men's Grooming

### Sports
- Fitness Equipment
- Sportswear & Activewear
- Outdoor & Camping
- Cycling
- Yoga & Pilates
- Team Sports
- Running & Athletics
- Sports Accessories

### Books
- Fiction
- Non-Fiction
- Children's Books
- Comics & Graphic Novels
- Educational & Textbooks
- Self-Help & Business
- Magazines
- E-Books & Audiobooks

## How to Populate Database

### Option 1: Using Migration Script (Recommended)

Run the migration script to populate categories in the database:

```bash
cd backend
npm run populate:categories
```

This script will:
1. Create sample products for each category/subcategory combination
2. Insert them into both main and seller databases
3. Verify that categories are properly stored

**Note:** The sample products can be deleted later. Categories will persist as long as at least one product exists in each category/subcategory.

### Option 2: Manual Product Creation

Simply create products using the add product form with the new categories and subcategories. The API will automatically recognize and serve these categories.

## Files Updated

1. **`backend/migrations/populateCategories.js`**
   - Migration script to populate categories
   - Creates sample products for testing

2. **`frontend/apps/web/src/utils/categories.js`**
   - Updated with new category structure
   - Added helper functions: `getAllCategories()`, `getCategoryByName()`
   - Used as fallback when API is unavailable

3. **`frontend/apps/web/src/app/seller/inventory/new/page.jsx`**
   - Updated to use fallback categories from utility
   - Improved error handling

4. **`frontend/apps/web/src/app/seller/inventory/page.jsx`**
   - Updated modal form to use new categories
   - Added fallback support

5. **`backend/package.json`**
   - Added `populate:categories` script

## API Endpoints

The following endpoints automatically return categories from the database:

- `GET /api/categories` - Returns all unique categories
- `GET /api/categories/:category/subcategories` - Returns subcategories for a category
- `GET /api/categories/with-subcategories` - Returns all categories with their subcategories

## Frontend Fallback

If the API fails or returns empty results, the frontend will use the categories from `@/utils/categories.js` as a fallback, ensuring the form always works.

## Next Steps

1. Run `npm run populate:categories` in the backend directory
2. Verify categories appear in the add product form dropdowns
3. Test creating products with different categories/subcategories
4. (Optional) Delete sample products after verification

## Notes

- Categories are dynamically generated from existing products in the database
- If you want to ensure categories always exist, keep at least one product per category/subcategory
- The migration script creates sample products that can be deleted after verification
- The frontend has fallback categories built-in, so the form will work even if the database is empty
