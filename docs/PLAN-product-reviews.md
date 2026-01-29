# Product Reviews Feature - Implementation Plan

> **Project**: Serendipity E-commerce
> **Feature**: Product Reviews with Photos/Videos
> **Theme**: Neo-Brutalism
> **Database**: Main Supabase (customer-centric data)

---

## Design Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Eligibility** | `is_delivered = true` | Customer must receive product before reviewing |
| **Edit/Delete** | Yes, within 30 days | Standard e-commerce practice |
| **Database** | Main Supabase | Reviews tied to users/orders; easier file storage |
| **Photo Size** | 500KB max | As requested |
| **Video Size** | 5MB max | 500KB too small for video; 5MB = ~30sec compressed |
| **Seller Response** | Yes, one reply per review | Like Amazon, increases engagement |
| **Moderation** | Auto-publish | As requested |
| **One Review Per Product** | Yes | Customer can only review a product once |

---

## Database Schema

### Table: `reviews` (Main Supabase)

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- References product in either DB (no FK constraint)
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(100),
  comment TEXT,
  media JSONB DEFAULT '[]', -- Array of {url, type: 'image'|'video', size}
  is_verified_purchase BOOLEAN DEFAULT true,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, product_id) -- One review per product per user
);

-- Indexes
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);
```

### Table: `review_responses` (Seller Replies)

```sql
CREATE TABLE review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  seller_profile_id UUID NOT NULL, -- References seller_profiles in Seller DB
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(review_id) -- One response per review
);
```

### Table: `review_helpful_votes`

```sql
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(review_id, user_id)
);
```

---

## API Endpoints

### Base Route: `/api/reviews`

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/product/:productId` | Public | Get reviews for a product (paginated) |
| `GET` | `/my-reviews` | Auth | Get user's own reviews |
| `GET` | `/can-review/:productId` | Auth | Check if user can review this product |
| `POST` | `/` | Auth | Create a review |
| `PUT` | `/:id` | Auth (Owner) | Update review (within 30 days) |
| `DELETE` | `/:id` | Auth (Owner) | Delete review |
| `POST` | `/:id/helpful` | Auth | Vote review as helpful/not helpful |
| `POST` | `/:id/response` | Seller | Add seller response |

---

## File Upload Strategy

### Bucket: `review-media` (Main Supabase Storage)

**Upload Flow**:
1. Frontend validates file size client-side
2. POST to `/api/upload/review-media` with file + `productId`
3. Backend validates:
   - User is authenticated
   - User has purchased & received the product
   - File size: Image ≤ 500KB, Video ≤ 5MB
   - File type: JPEG, PNG, WebP, MP4, WebM
4. Upload to Supabase Storage: `review-media/{userId}/{timestamp}-{random}.{ext}`
5. Return public URL
6. Frontend includes URLs in review submission

**Compression (Frontend)**:
- Images: Compress to 80% quality if > 400KB
- Videos: Show warning if > 5MB, reject upload

---

## Frontend Components

### 1. `ReviewSection` (Product Page)

```
┌─────────────────────────────────────────────────────────────────┐
│ ████ REVIEWS ████                           [WRITE A REVIEW] ▓▓▓│
│ ─────────────────────────────────────────────────────────────── │
│ ⭐⭐⭐⭐⭐ 4.5 out of 5  (127 reviews)                          │
│                                                                 │
│ █████████████████████████ 5★ (89)                               │
│ ██████████             4★ (24)                                  │
│ ████                   3★ (8)                                   │
│ ██                     2★ (4)                                   │
│ █                      1★ (2)                                   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ⭐⭐⭐⭐⭐  Amazing quality!           ✓ Verified Purchase    │ │
│ │ John D. • 2 days ago                                        │ │
│ │                                                              │ │
│ │ This product exceeded my expectations...                    │ │
│ │ [📷 IMG] [📷 IMG] [🎬 VID]                                  │ │
│ │                                                              │ │
│ │ 👍 12 found helpful  |  Was this helpful? [YES] [NO]        │ │
│ │                                                              │ │
│ │ ▓▓ SELLER RESPONSE:                                         │ │
│ │ Thanks for your review! We're glad you love it.             │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ [LOAD MORE REVIEWS]                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 2. `WriteReviewModal`

```
┌───────────────────────────────────────────────────────────────┐
│ ████ WRITE YOUR REVIEW ████                              [X]  │
│ ───────────────────────────────────────────────────────────── │
│                                                               │
│ RATING *                                                      │
│ [★] [★] [★] [★] [☆]  4/5                                     │
│                                                               │
│ REVIEW TITLE                                                  │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Great product!                                            │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ YOUR REVIEW *                                                 │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │                                                           │ │
│ │ Share your experience with this product...                │ │
│ │                                                           │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ADD PHOTOS/VIDEOS                                             │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ [+] [📷] [📷]  Max: 5 files. Photo ≤500KB, Video ≤5MB     │ │
│ └───────────────────────────────────────────────────────────┘ │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │          ████ SUBMIT REVIEW ████                        │   │
│ └─────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### 3. `ReviewCard` (Brutalist Style)

- **Border**: 4px solid black
- **Shadow**: 8px 8px 0 #000
- **Verified Badge**: Gradient yellow-orange with black border
- **Star Rating**: Custom brutalist stars (filled/empty)
- **Media Gallery**: Grid with thick borders, hover zoom
- **Helpful Buttons**: Brutalist button style with counters

### 4. `ReviewMediaUploader`

- Drag & drop zone with brutalist dashed border
- Progress bar (brutalist style - thick, solid colors)
- Preview thumbnails with delete option
- File size validation feedback

---

## File Structure

```
backend/
├── routes/
│   └── reviewRoutes.js         # [NEW] Review API endpoints
├── migrations/
│   └── XXXX_create_reviews.sql # [NEW] Database migration

frontend/apps/web/src/
├── components/
│   └── reviews/                # [NEW] Review components
│       ├── ReviewSection.jsx
│       ├── ReviewCard.jsx
│       ├── WriteReviewModal.jsx
│       ├── ReviewMediaUploader.jsx
│       ├── StarRating.jsx
│       ├── RatingSummary.jsx
│       └── SellerResponseCard.jsx
├── utils/
│   └── reviewStore.js          # [NEW] Zustand store for reviews
```

---

## Implementation Phases

### Phase 1: Database & API (Backend)
1. Create migration SQL for tables
2. Create `reviewRoutes.js` with all endpoints
3. Add upload route for review media
4. Update product routes to include average rating recalculation

### Phase 2: Core UI Components (Frontend)
1. Create `StarRating` component (brutalist style)
2. Create `ReviewCard` component
3. Create `RatingSummary` component
4. Create `ReviewSection` wrapper

### Phase 3: Write Review Flow (Frontend)
1. Create `WriteReviewModal`
2. Create `ReviewMediaUploader`
3. Integrate with product page
4. Add "Write Review" button with eligibility check

### Phase 4: Seller Response (Backend + Frontend)
1. Add seller response endpoint
2. Create `SellerResponseCard` component
3. Add to seller dashboard

### Phase 5: Polish & Integration
1. Helpful votes system
2. Loading skeletons
3. Error handling
4. Mobile responsiveness

---

## Verification Checklist

- [ ] Customer can only review products they purchased & received
- [ ] One review per product per customer enforced
- [ ] Photo upload respects 500KB limit
- [ ] Video upload respects 5MB limit
- [ ] Reviews auto-publish immediately
- [ ] Edit/delete works within 30-day window
- [ ] Seller can respond to reviews (one response per review)
- [ ] Product rating recalculates on review CRUD
- [ ] Neo-brutalism styling matches existing theme
- [ ] Mobile responsive design

---

## Next Steps

After approval, run `/create` or proceed with implementation:
1. Start with Phase 1 (Database migration)
2. Then Phase 2 (Core UI)
3. Then integrate (Phase 3-5)
