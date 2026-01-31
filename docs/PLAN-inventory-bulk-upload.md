# PLAN: Seller Bulk Inventory Upload Optimization

## Overview

Optimize the seller inventory bulk upload experience with better progress feedback, validation, duplicate handling, and clearer CSV instructions.

---

## Requirements Summary

| Requirement | Decision |
|-------------|----------|
| **Upload Scale** | ~500 products per upload |
| **Progress** | Progress bar with percentage |
| **Images** | URL in CSV + optional separate file upload |
| **Validation** | Preview all errors before upload, user decides |
| **Duplicates** | Skip (don't update) for same seller account |

---

## Proposed Changes

### Phase 1: Backend Chunked Upload API

#### [MODIFY] [productRoutes.js](file:///d:/Aniket_karmakar_R&D/Backup-Aniket/New%20folder/New%20folder/Serendipity/backend/routes/productRoutes.js)

**Current**: Single batch insert of all products  
**New**:

- Add duplicate check endpoint: `POST /api/products/check-duplicates`
- Modify `/bulk` to accept chunks with progress tracking
- Return `{ total, processed, skipped, errors }` per chunk

```
POST /api/products/check-duplicates
Body: { names: ["Product A", "Product B"] }
Response: { duplicates: ["Product A"], new: ["Product B"] }
```

---

### Phase 2: Frontend Progress & Validation UI

#### [MODIFY] [inventory/page.jsx](file:///d:/Aniket_karmakar_R&D/Backup-Aniket/New%20folder/New%20folder/Serendipity/frontend/apps/web/src/app/seller/inventory/page.jsx)

**Changes**:

1. **Pre-upload validation** - Check for:
   - Missing required fields (name, price, category, stock)
   - Invalid data types (non-numeric price/stock)
   - Duplicate names within CSV
   - Existing products in database

2. **Validation preview table** with:
   - ✅ Valid rows (green)
   - ⚠️ Warning rows (duplicates to skip, yellow)
   - ❌ Error rows (invalid data, red)
   - Checkbox to include/exclude rows

3. **Progress bar component** during upload:
   - Overall percentage
   - Current chunk indicator (e.g., "Chunk 3/10")
   - Success/fail counters

4. **Chunked upload** - Split array into chunks of 50 products, upload sequentially

---

### Phase 3: Enhanced CSV Guide Modal

#### [MODIFY] CSV Guide Dialog (lines 884-1003)

**Add**:

- Example CSV with 3-4 sample rows
- Common mistakes section with fixes
- Category hierarchy reference
- Download sample button (already exists, enhance CSV)

**New Guide Structure**:

```
┌─────────────────────────────────────┐
│ 📋 CSV Format Guide                 │
├─────────────────────────────────────┤
│ ⬇️ Download Sample CSV             │
├─────────────────────────────────────┤
│ 🔴 Required Columns                 │
│ ├── name (text)                     │
│ ├── price (number, e.g. 99.99)      │
│ ├── category (from list)            │
│ └── stock (whole number)            │
├─────────────────────────────────────┤
│ 🔵 Optional Columns                 │
│ └── subcategory, brand, description │
├─────────────────────────────────────┤
│ ⚠️ Common Mistakes                  │
│ ├── Price with currency symbol (×)  │
│ ├── Stock as float (×)              │
│ └── Empty header row (×)            │
├─────────────────────────────────────┤
│ 📁 Valid Categories                 │
│ └── Collapsible list...             │
└─────────────────────────────────────┘
```

---

### Phase 4 (Optional): Separate Image Upload

#### [NEW] Image Bulk Upload Feature

If time permits:

- Add separate "Upload Images" button
- Match images to products by filename (e.g., `ProductName.jpg`)
- Show matched/unmatched status
- Update product image URLs after upload to storage

---

## Task Breakdown

| # | Task | File | Est. Time |
|---|------|------|-----------|
| 1 | Add `/check-duplicates` endpoint | productRoutes.js | 20 min |
| 2 | Add chunked progress to `/bulk` endpoint | productRoutes.js | 30 min |
| 3 | Create `<UploadProgress>` component | new component | 30 min |
| 4 | Add pre-upload validation logic | inventory/page.jsx | 45 min |
| 5 | Create validation preview table UI | inventory/page.jsx | 45 min |
| 6 | Implement chunked upload with progress | inventory/page.jsx | 30 min |
| 7 | Enhance CSV guide modal content | inventory/page.jsx | 30 min |
| 8 | Update sample CSV with better examples | inventory/page.jsx | 15 min |

**Total Estimated Time**: ~4 hours

---

## Verification Plan

### Functional Tests

- [ ] Upload 500 products successfully
- [ ] Progress bar updates correctly
- [ ] Duplicate products are skipped (not inserted)
- [ ] Invalid rows are highlighted and excluded
- [ ] User can toggle rows on/off before upload

### Edge Cases

- [ ] Empty CSV file
- [ ] CSV with only header row
- [ ] All rows are duplicates
- [ ] Mixed valid/invalid rows
- [ ] Network interruption during upload

---

## Agent Assignments

| Phase | Primary Agent | Skills |
|-------|---------------|--------|
| 1 | backend-specialist | api-patterns, database-design |
| 2-3 | frontend-specialist | react-patterns, frontend-design |
| 4 | frontend-specialist + orchestrator | app-builder |

---

## Next Steps

1. ✅ Review this plan
2. Run `/create` or proceed with implementation
3. Start with Phase 1 (backend) then Phase 2-3 (frontend)
