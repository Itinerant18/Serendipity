# Product Catalog Enhancement Plan

## Current State Analysis

### Products Page (`/products`)
| Aspect | Current Implementation |
|--------|------------------------|
| **Lines of Code** | 747 lines |
| **Design** | Neo-Brutalist (bold borders, offset shadows, vibrant colors) |
| **Data Fetching** | `fetch /api/products?limit=1000` - ALL products loaded upfront |
| **Filtering** | Client-side with `useMemo` |
| **Pagination** | Client-side (12 items/page) |
| **Filter Options** | Categories, Subcategories, Price, Brands, Rating, Stock, Sale |
| **Mobile Filters** | Full-screen slide-in modal |
| **Filter Persistence** | Local state only (lost on navigation) |

### Category Page (`/category/[id]`)
| Aspect | Current Implementation |
|--------|------------------------|
| **Lines of Code** | 592 lines |
| **Design** | Mixed - Glassmorphism hero + cleaner filter UI |
| **Data Fetching** | `fetch /api/products?category=X&limit=100` |
| **Filtering** | Client-side with `useMemo` |
| **Pagination** | Client-side (12 items/page) |
| **Filter Options** | Subcategories, Price, Brands, Rating |
| **Mobile Filters** | Full-screen slide-in modal |

---

## Observations & Recommendations

### 1. Backend Filtering Priority
**Recommendation: Keep client-side filtering for now**

| Factor | Analysis |
|--------|----------|
| Current catalog size | ~19 products (very small) |
| Performance impact | Negligible with current size |
| Complexity | Server-side adds API changes, query params |
| Future consideration | When catalog reaches 500+ products |

### 2. Mobile Filter Modal Design
**Recommendation: Unify to Brutalist design**

| Current State | Proposed Change |
|--------------|-----------------|
| Products page: Brutalist modal | Keep as-is |
| Category page: Glassmorphism modal | Convert to Brutalist |

**Benefits:**
- Consistent brand identity
- Single codebase for filter components
- Easier maintenance

### 3. Performance & Pagination
**Recommendation: Current approach is acceptable**

| Metric | Analysis |
|--------|----------|
| Products fetched | 1000 limit is fine for <100 products |
| Client-side filtering | Fast with `useMemo` |
| Pagination | 12 items per page is industry standard |
| Future improvement | Add server-side pagination when catalog grows |

### 4. Filter Persistence (URL Query Params)
**Recommendation: Implement URL-based filters**

**Benefits:**
- Shareable filtered views
- Browser back/forward button works
- Bookmark filtered results
- SEO benefits for category combinations

**Implementation approach:**
```
/products?category=Electronics&minPrice=1000&maxPrice=5000&rating=4
/category/Electronics?brand=Apple&inStock=true
```

### 5. Accessibility
**Recommendation: Add baseline accessibility**

| Feature | Priority |
|---------|----------|
| ARIA labels on filter controls | High |
| Keyboard navigation (Tab/Enter) | High |
| Screen reader announcements | Medium |
| Focus management in modals | High |
| Color contrast compliance | Medium |

---

## Implementation Phases

### Phase 1: Design Unification
- [ ] Extract shared `FilterPanel` component from products page
- [ ] Update category page to use unified brutalist filter UI
- [ ] Ensure consistent mobile modal behavior

### Phase 2: URL-Based Filter Persistence
- [ ] Use `useSearchParams` from react-router
- [ ] Sync filter state to URL on change
- [ ] Initialize filters from URL on page load
- [ ] Handle back/forward navigation

### Phase 3: Accessibility Improvements
- [ ] Add `aria-label` to all filter inputs
- [ ] Add `role="region"` to filter sections
- [ ] Implement focus trap in mobile modal
- [ ] Add keyboard shortcuts (Escape to close modal)
- [ ] Announce filter changes to screen readers

### Phase 4: Future Performance (When Needed)
- [ ] Implement server-side filtering API
- [ ] Add infinite scroll option
- [ ] Implement search debouncing
- [ ] Add loading skeletons for better perceived performance

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/app/products/page.jsx` | Extract filter components, add URL sync |
| `src/app/category/[id]/page.jsx` | Use shared filter component, brutalist design |
| `src/components/filters/FilterPanel.jsx` | **NEW** - Shared filter component |
| `src/components/filters/FilterSection.jsx` | **NEW** - Reusable accordion section |
| `src/components/filters/MobileFilterModal.jsx` | **NEW** - Unified mobile filter drawer |

---

## Summary

| Question | Answer |
|----------|--------|
| Backend filtering? | **No** - Keep client-side for now |
| Unified design? | **Yes** - Brutalist everywhere |
| Pagination/infinite scroll? | **Keep current** - 12 items/page is fine |
| URL filter persistence? | **Yes** - Implement with `useSearchParams` |
| Accessibility? | **Yes** - Add ARIA + keyboard nav |
