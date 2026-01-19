# Fixes Applied - Categories & CSV Upload

## Issues Fixed

### 1. ✅ Categories Showing 7 Instead of 6
**Problem**: Dropdown was showing 7 categories including "Appliances" which wasn't in your list.

**Solution**:
- Updated backend `categoryRoutes.js` to filter and ONLY return the 6 specified categories
- Updated frontend to filter categories to match the allowed list
- Categories now show exactly: Electronics, Fashion, Home & Living, Beauty, Sports, Books

**Files Changed**:
- `backend/routes/categoryRoutes.js` - Filters categories to only DEFAULT_CATEGORIES
- `frontensd/apps/web/src/app/seller/inventory/page.jsx` - Filters categories on frontend
- `frontensd/apps/web/src/app/seller/inventory/new/page.jsx` - Filters categories on frontend

### 2. ✅ CSV Bulk Upload Not Working
**Problem**: CSV upload wasn't inserting products into database or showing in inventory.

**Root Causes Found**:
1. CSV column mapping wasn't handling different case variations (name vs Name vs NAME)
2. Seller products endpoint was filtering by `seller_profile_id` only, missing products where it's null
3. Error handling wasn't showing detailed error messages

**Solutions Applied**:

#### Backend Fixes (`backend/routes/productRoutes.js`):
- Added better column mapping (handles name/Name/NAME variations)
- Added logging to track upload process
- Improved error messages with details
- Handles null `seller_profile_id` by looking it up from seller database

#### Seller Products Endpoint Fix (`backend/routes/sellerRoutes.js`):
- Now fetches products by `seller_profile_id` OR `user_id`
- Shows products even if `seller_profile_id` is null initially
- Added logging for debugging

#### Frontend Fixes (`frontensd/apps/web/src/app/seller/inventory/page.jsx`):
- Better CSV column mapping (handles case variations)
- Validates required fields before upload
- Shows success message with count
- Better error messages
- Refreshes inventory after successful upload

### 3. ✅ Input Focus Issue
**Problem**: Cursor was exiting input fields after typing one character.

**Solution**:
- Memoized `handleInputChange` with `useCallback` to prevent re-renders
- This was already fixed in previous updates

## CSV Upload Format

Your CSV file should have these columns (case-insensitive):
- `name` (required) - Product name
- `price` (required) - Product price
- `category` (required) - Must be one of: Electronics, Fashion, Home & Living, Beauty, Sports, Books
- `subcategory` (optional) - Subcategory for the selected category
- `brand` (optional) - Product brand (defaults to "Generic")
- `stock` or `count_in_stock` (optional) - Stock count (defaults to 0)
- `description` (optional) - Product description
- `image_url` or `image` (optional) - Product image URL

### Example CSV:
```csv
name,price,category,subcategory,brand,stock,description,image_url
iPhone 15,999,Electronics,Smartphones & Accessories,Apple,50,Latest iPhone model,https://example.com/iphone.jpg
Running Shoes,120,Sports,Running & Athletics,Nike,100,Comfortable running shoes,https://example.com/shoes.jpg
```

## Testing Steps

1. **Restart Backend Server**:
   ```bash
   cd backend
   npm start
   ```

2. **Refresh Frontend**:
   - Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

3. **Test Categories**:
   - Open "Add Product" modal
   - Check Category dropdown - should show exactly 6 categories
   - Select a category - Subcategory should show 8 options

4. **Test CSV Upload**:
   - Create a CSV file with the format above
   - Click "Import CSV" button
   - Select your CSV file
   - Review the preview
   - Click "Upload Products"
   - Check inventory - products should appear
   - Check database - products should be in seller database

## Database Verification

Products uploaded via CSV will be stored in:
- **Seller Database** (`products` table) if user is a seller
- Filtered by `seller_profile_id` OR `user_id` when fetching

## Next Steps

1. Restart backend server
2. Test category dropdown (should show 6 categories)
3. Test CSV upload with a sample file
4. Verify products appear in inventory
5. Check products appear on shopping page (if frontend fetches from seller DB)

## Notes

- Categories are now strictly filtered to your 6 specified categories
- CSV upload handles various column name formats (case-insensitive)
- Products will show in inventory even if `seller_profile_id` is null initially
- All uploads include detailed logging for debugging
