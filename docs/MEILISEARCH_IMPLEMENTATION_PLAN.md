# Meilisearch Integration Implementation Plan

## Executive Summary

This document outlines a comprehensive plan to integrate **Meilisearch** as the primary search engine for the Serendipity e-commerce platform. The integration will replace the current basic Supabase `ilike` text search with a high-performance, typo-tolerant, and feature-rich search experience.

---

## 1. Current State Analysis

### 1.1 Existing Search Implementation

#### Backend (productRoutes.js)
```javascript
// Current search implementation - Basic Supabase ilike
const buildQuery = (client) => {
  let q = client
    .from('products')
    .select(selectCols, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(rangeFrom, rangeTo);

  if (category) q = q.eq('category', category);
  if (keyword) q = q.ilike('name', `%${keyword}%`);  // Basic text search
  return q;
};
```

**Limitations:**
- Simple substring matching (`%keyword%`)
- No typo tolerance
- No relevance ranking
- No faceted search capabilities
- Limited filtering (exact match only)
- Searches only `name` field
- No search suggestions or autocomplete
- Case-sensitive issues with `ilike`

#### Frontend (Web - search/page.jsx)
```javascript
// Client-side filtering after fetching all products
const filteredProducts = useMemo(() => {
  return products.filter(product => {
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        product.name?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query);
      if (!matchesSearch) return false;
    }
    // ... more filters
  });
}, [products, searchQuery, ...]);
```

**Limitations:**
- Fetches ALL products (up to 1000) then filters client-side
- No pagination for search results
- Slow performance with large datasets
- No instant search/debouncing

#### Frontend (Mobile - search.tsx)
```typescript
// Mobile search using dedicated endpoint
async searchProducts(query: string): Promise<Product[]> {
  const response = await fetch(
    `${API_BASE_URL}/products/search?q=${encodeURIComponent(query)}`,
    { headers: this.getAuthHeaders() }
  );
  return response.json();
}
```

**Note:** The mobile app expects a `/products/search` endpoint that doesn't exist yet.

### 1.2 Database Schema

**Products Table (Both Main & Seller Databases):**
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),
    subcategory VARCHAR(100),
    count_in_stock INTEGER DEFAULT 0,
    num_reviews INTEGER DEFAULT 0,
    rating DECIMAL(3, 2) DEFAULT 0,
    seller_profile_id UUID REFERENCES seller_profiles(id),
    user_id UUID,
    seller_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Extended fields:
    sku VARCHAR(50),
    tags TEXT[],
    slug VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',
    featured BOOLEAN DEFAULT false
);
```

**Search-relevant fields:**
- `name` - Product name (primary search field)
- `description` - Product description
- `brand` - Brand name
- `category` - Main category
- `subcategory` - Subcategory
- `tags` - Array of searchable tags
- `sku` - Product SKU

---

## 2. Meilisearch Overview

### 2.1 Why Meilisearch?

| Feature | Current Supabase | Meilisearch |
|---------|-----------------|-------------|
| Typo Tolerance | ❌ No | ✅ Yes (configurable) |
| Relevance Ranking | ❌ No | ✅ Built-in |
| Faceted Search | ❌ Limited | ✅ Full support |
| Autocomplete | ❌ No | ✅ Instant search |
| Synonyms | ❌ No | ✅ Configurable |
| Stop Words | ❌ No | ✅ Configurable |
| Geo Search | ❌ No | ✅ Available |
| Search Speed | ⚠️ Medium | ✅ < 50ms typical |
| Highlighting | ❌ No | ✅ Built-in |
| Filtering | ⚠️ Basic | ✅ Advanced |

### 2.2 Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Web Frontend  │     │  Mobile App     │     │  Admin Panel    │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │    Express Backend API    │
                    │  /api/products/search     │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │      Meilisearch          │
                    │    (Search Engine)        │
                    └─────────────┬─────────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              │                   │                   │
    ┌─────────▼─────────┐ ┌───────▼────────┐ ┌───────▼────────┐
    │  Main Supabase    │ │ Seller Supabase│ │  Sync Service  │
    │    (Products)     │ │   (Products)   │ │  (Webhooks)    │
    └───────────────────┘ └────────────────┘ └────────────────┘
```

---

## 3. Implementation Plan

### Phase 1: Infrastructure Setup

#### 3.1.1 Meilisearch Installation Options

**Option A: Self-Hosted (Recommended for Production)**
```bash
# Docker deployment
docker run -it --rm \
  -p 7700:7700 \
  -e MEILI_MASTER_KEY='your_master_key' \
  -v $(pwd)/meili_data:/meili_data \
  getmeili/meilisearch:v1.7

# Or use docker-compose
```

**Option B: Meilisearch Cloud (Managed)**
- Sign up at https://cloud.meilisearch.com
- Create a project
- Get host URL and API key

**Option C: Railway/Render/Fly.io**
- One-click deploy from Meilisearch template

#### 3.1.2 Environment Variables

Add to `backend/.env`:
```env
# Meilisearch Configuration
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=your_master_key
MEILISEARCH_PRODUCTS_INDEX=products
```

Add to `frontend/apps/web/.env`:
```env
# Meilisearch (Public - read-only key)
VITE_MEILISEARCH_HOST=http://localhost:7700
VITE_MEILISEARCH_SEARCH_API_KEY=your_search_key
VITE_MEILISEARCH_PRODUCTS_INDEX=products
```

### Phase 2: Backend Implementation

#### 3.2.1 Install Meilisearch SDK

```bash
cd backend
npm install meilisearch
# or
bun add meilisearch
```

#### 3.2.2 Create Meilisearch Configuration

**File: `backend/config/meilisearch.js`**
```javascript
const { MeiliSearch } = require('meilisearch');

const client = new MeiliSearch({
  host: process.env.MEILISEARCH_HOST || 'http://localhost:7700',
  apiKey: process.env.MEILISEARCH_API_KEY,
});

const PRODUCTS_INDEX = process.env.MEILISEARCH_PRODUCTS_INDEX || 'products';

module.exports = {
  client,
  PRODUCTS_INDEX,
};
```

#### 3.2.3 Create Search Service

**File: `backend/services/searchService.js`**
```javascript
const { client, PRODUCTS_INDEX } = require('../config/meilisearch');
const { supabase, supabaseSeller } = require('../config/supabase');

class SearchService {
  /**
   * Initialize the products index with settings
   */
  async initializeIndex() {
    try {
      const index = client.index(PRODUCTS_INDEX);
      
      // Configure searchable attributes with weights
      await index.updateSearchableAttributes([
        'name',
        'description',
        'brand',
        'category',
        'subcategory',
        'tags',
        'sku',
      ]);

      // Configure filterable attributes
      await index.updateFilterableAttributes([
        'category',
        'subcategory',
        'brand',
        'price',
        'rating',
        'count_in_stock',
        'seller_profile_id',
        'status',
        'featured',
      ]);

      // Configure sortable attributes
      await index.updateSortableAttributes([
        'price',
        'rating',
        'num_reviews',
        'created_at',
        'name',
      ]);

      // Configure ranking rules
      await index.updateRankingRules([
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ]);

      // Configure typo tolerance
      await index.updateTypoTolerance({
        enabled: true,
        minWordSizeForTypos: {
          oneTypo: 4,
          twoTypos: 8,
        },
      });

      // Configure pagination
      await index.updatePagination({
        maxTotalHits: 10000,
      });

      console.log('✅ Meilisearch index initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Meilisearch index:', error);
      throw error;
    }
  }

  /**
   * Transform product data for Meilisearch
   */
  transformProduct(product, source = 'main') {
    return {
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      image: product.image || '',
      images: product.images || [],
      brand: product.brand || '',
      category: product.category || '',
      subcategory: product.subcategory || '',
      count_in_stock: parseInt(product.count_in_stock) || 0,
      num_reviews: parseInt(product.num_reviews) || 0,
      rating: parseFloat(product.rating) || 0,
      seller_profile_id: product.seller_profile_id || null,
      user_id: product.user_id || null,
      sku: product.sku || '',
      tags: product.tags || [],
      slug: product.slug || '',
      status: product.status || 'active',
      featured: product.featured || false,
      source, // 'main' or 'seller'
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  }

  /**
   * Index all products from both databases
   */
  async indexAllProducts() {
    try {
      const index = client.index(PRODUCTS_INDEX);
      
      // Fetch products from main database
      const { data: mainProducts, error: mainError } = await supabase
        .from('products')
        .select('*');

      if (mainError) throw mainError;

      // Fetch products from seller database
      const { data: sellerProducts, error: sellerError } = await supabaseSeller
        .from('products')
        .select('*');

      if (sellerError) throw sellerError;

      // Transform and combine products
      const documents = [
        ...(mainProducts || []).map(p => this.transformProduct(p, 'main')),
        ...(sellerProducts || []).map(p => this.transformProduct(p, 'seller')),
      ];

      // Clear existing index and add new documents
      await index.deleteAllDocuments();
      const response = await index.addDocuments(documents);

      console.log(`✅ Indexed ${documents.length} products to Meilisearch`);
      return {
        success: true,
        indexedCount: documents.length,
        taskUid: response.taskUid,
      };
    } catch (error) {
      console.error('❌ Failed to index products:', error);
      throw error;
    }
  }

  /**
   * Add or update a single product
   */
  async indexProduct(product, source = 'main') {
    try {
      const index = client.index(PRODUCTS_INDEX);
      const document = this.transformProduct(product, source);
      const response = await index.addDocuments([document]);
      return response;
    } catch (error) {
      console.error('❌ Failed to index product:', error);
      throw error;
    }
  }

  /**
   * Remove a product from the index
   */
  async removeProduct(productId) {
    try {
      const index = client.index(PRODUCTS_INDEX);
      await index.deleteDocument(productId);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to remove product from index:', error);
      throw error;
    }
  }

  /**
   * Search products with filters
   */
  async search({
    query = '',
    page = 1,
    limit = 24,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sortBy = 'relevance',
  }) {
    try {
      const index = client.index(PRODUCTS_INDEX);
      
      // Build filter string
      const filters = [];
      if (category) filters.push(`category = "${category}"`);
      if (subcategory) filters.push(`subcategory = "${subcategory}"`);
      if (brand) filters.push(`brand = "${brand}"`);
      if (minPrice !== undefined) filters.push(`price >= ${minPrice}`);
      if (maxPrice !== undefined) filters.push(`price <= ${maxPrice}`);
      if (minRating) filters.push(`rating >= ${minRating}`);
      if (inStock) filters.push(`count_in_stock > 0`);
      filters.push('status = "active"'); // Only active products

      // Build sort array
      let sort = null;
      switch (sortBy) {
        case 'price-asc':
          sort = ['price:asc'];
          break;
        case 'price-desc':
          sort = ['price:desc'];
          break;
        case 'newest':
          sort = ['created_at:desc'];
          break;
        case 'rating':
          sort = ['rating:desc'];
          break;
        case 'popular':
          sort = ['num_reviews:desc'];
          break;
        default:
          sort = null; // Relevance
      }

      const searchOptions = {
        limit,
        offset: (page - 1) * limit,
        filter: filters.length > 0 ? filters.join(' AND ') : undefined,
        ...(sort && { sort }),
        attributesToHighlight: ['name', 'description'],
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      };

      const results = await index.search(query, searchOptions);

      return {
        products: results.hits.map(hit => ({
          ...hit,
          _id: hit.id,
          // Remove internal Meilisearch fields
          _matchesPosition: undefined,
          _formatted: undefined,
        })),
        total: results.estimatedTotalHits || results.totalHits || 0,
        page,
        limit,
        totalPages: Math.ceil((results.estimatedTotalHits || results.totalHits || 0) / limit),
        processingTimeMs: results.processingTimeMs,
      };
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query, limit = 5) {
    try {
      const index = client.index(PRODUCTS_INDEX);
      
      const results = await index.search(query, {
        limit,
        attributesToRetrieve: ['name', 'category', 'brand'],
        attributesToHighlight: ['name'],
        highlightPreTag: '',
        highlightPostTag: '',
      });

      return results.hits.map(hit => ({
        name: hit.name,
        category: hit.category,
        brand: hit.brand,
      }));
    } catch (error) {
      console.error('❌ Failed to get suggestions:', error);
      throw error;
    }
  }

  /**
   * Get facet counts for filters
   */
  async getFacets() {
    try {
      const index = client.index(PRODUCTS_INDEX);
      
      // Get unique categories
      const categorySearch = await index.search('', {
        limit: 0,
        facets: ['category'],
      });

      // Get unique brands
      const brandSearch = await index.search('', {
        limit: 0,
        facets: ['brand'],
      });

      return {
        categories: categorySearch.facetDistribution?.category || {},
        brands: brandSearch.facetDistribution?.brand || {},
      };
    } catch (error) {
      console.error('❌ Failed to get facets:', error);
      throw error;
    }
  }
}

module.exports = new SearchService();
```

#### 3.2.4 Create Search Routes

**File: `backend/routes/searchRoutes.js`**
```javascript
const express = require('express');
const asyncHandler = require('express-async-handler');
const searchService = require('../services/searchService');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @desc    Search products with filters
// @route   GET /api/products/search
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  const {
    q: query = '',
    page = 1,
    limit = 24,
    category,
    subcategory,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    sortBy,
  } = req.query;

  const results = await searchService.search({
    query: query.toString().trim(),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    category,
    subcategory,
    brand,
    minPrice: minPrice ? parseFloat(minPrice) : undefined,
    maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
    minRating: minRating ? parseFloat(minRating) : undefined,
    inStock: inStock === 'true',
    sortBy,
  });

  res.json(results);
}));

// @desc    Get search suggestions (autocomplete)
// @route   GET /api/products/suggestions
// @access  Public
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { q: query = '', limit = 5 } = req.query;

  if (!query.trim()) {
    return res.json({ suggestions: [] });
  }

  const suggestions = await searchService.getSuggestions(
    query.toString().trim(),
    parseInt(limit, 10)
  );

  res.json({ suggestions });
}));

// @desc    Get search facets (for filter UI)
// @route   GET /api/products/facets
// @access  Public
router.get('/facets', asyncHandler(async (req, res) => {
  const facets = await searchService.getFacets();
  res.json(facets);
}));

// Admin routes for index management

// @desc    Initialize Meilisearch index
// @route   POST /api/products/search/init
// @access  Private/Admin
router.post('/search/init', protect, admin, asyncHandler(async (req, res) => {
  await searchService.initializeIndex();
  res.json({ success: true, message: 'Search index initialized' });
}));

// @desc    Reindex all products
// @route   POST /api/products/search/reindex
// @access  Private/Admin
router.post('/search/reindex', protect, admin, asyncHandler(async (req, res) => {
  const result = await searchService.indexAllProducts();
  res.json(result);
}));

module.exports = router;
```

#### 3.2.5 Update Product Routes for Sync

**Update: `backend/routes/productRoutes.js`**

Add imports at top:
```javascript
const searchService = require('../services/searchService');
```

Update POST / (create product):
```javascript
router.post('/', protect, asyncHandler(async (req, res) => {
  // ... existing validation code ...
  
  // After successful creation:
  if (createdProduct) {
    // Index in Meilisearch (fire and forget)
    searchService.indexProduct(createdProduct, req.user.is_seller ? 'seller' : 'main')
      .catch(err => console.error('Failed to index new product:', err));
  }
  
  res.status(201).json(createdProduct);
}));
```

Update PUT /:id (update product):
```javascript
router.put('/:id', protect, asyncHandler(async (req, res) => {
  // ... existing update code ...
  
  // After successful update:
  if (updatedProduct) {
    searchService.indexProduct(updatedProduct, isSellerProduct ? 'seller' : 'main')
      .catch(err => console.error('Failed to update product index:', err));
  }
  
  res.json(updatedProduct);
}));
```

Update DELETE /:id (delete product):
```javascript
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  // ... existing delete code ...
  
  // After successful deletion:
  searchService.removeProduct(req.params.id)
    .catch(err => console.error('Failed to remove product from index:', err));
  
  res.json({ message: 'Product removed' });
}));
```

#### 3.2.6 Update Server.js

**Update: `backend/server.js`**

Add search routes:
```javascript
const searchRoutes = require('./routes/searchRoutes');

// ... existing routes ...
app.use('/api/products', searchRoutes);
```

### Phase 3: Frontend Implementation

#### 3.3.1 Install Meilisearch Client (Web)

```bash
cd frontend/apps/web
npm install meilisearch
# or
bun add meilisearch
```

#### 3.3.2 Create Search Hook (Web)

**File: `frontend/apps/web/src/hooks/useMeilisearch.js`**
```javascript
import { useState, useEffect, useCallback, useRef } from 'react';
import { MeiliSearch } from 'meilisearch';

const client = new MeiliSearch({
  host: import.meta.env.VITE_MEILISEARCH_HOST,
  apiKey: import.meta.env.VITE_MEILISEARCH_SEARCH_API_KEY,
});

const index = client.index(import.meta.env.VITE_MEILISEARCH_PRODUCTS_INDEX);

export function useMeilisearch() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  });

  const search = useCallback(async (query, options = {}) => {
    setLoading(true);
    setError(null);

    try {
      const searchOptions = {
        limit: options.limit || 24,
        offset: ((options.page || 1) - 1) * (options.limit || 24),
        ...(options.category && { filter: [`category = "${options.category}"`] }),
        ...(options.sortBy && options.sortBy !== 'relevance' && {
          sort: [options.sortBy],
        }),
      };

      const searchResults = await index.search(query, searchOptions);

      setResults(searchResults.hits.map(hit => ({
        ...hit,
        _id: hit.id,
      })));

      setPagination({
        page: options.page || 1,
        limit: options.limit || 24,
        total: searchResults.estimatedTotalHits || 0,
        totalPages: Math.ceil((searchResults.estimatedTotalHits || 0) / (options.limit || 24)),
      });

      return searchResults;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    results,
    loading,
    error,
    pagination,
    search,
  };
}

export function useSearchSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const fetchSuggestions = useCallback((query) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await index.search(query, {
          limit: 5,
          attributesToRetrieve: ['name', 'category'],
        });
        setSuggestions(results.hits);
      } catch (err) {
        console.error('Suggestions error:', err);
      } finally {
        setLoading(false);
      }
    }, 150); // 150ms debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    suggestions,
    loading,
    fetchSuggestions,
  };
}
```

#### 3.3.3 Update Search Page (Web)

**File: `frontend/apps/web/src/app/search/page.jsx`** (Key changes)

```javascript
"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useMeilisearch, useSearchSuggestions } from "@/hooks/useMeilisearch";
import ProductCard from "@/components/ProductCard";
// ... other imports

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const { results, loading, error, pagination, search } = useMeilisearch();
  const { suggestions, fetchSuggestions } = useSearchSuggestions();
  
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
  });

  // Perform search when query or filters change
  useEffect(() => {
    if (query) {
      search(query, {
        page: parseInt(searchParams.get("page") || "1"),
        limit: 24,
        ...filters,
      });
    }
  }, [query, filters, searchParams.get("page")]);

  // Fetch suggestions as user types (for search input)
  const handleSearchInput = useCallback((value) => {
    fetchSuggestions(value);
  }, [fetchSuggestions]);

  // ... rest of component with Meilisearch-powered results

  return (
    <div className="min-h-screen bg-[#F0F9FF]">
      {/* Search header with autocomplete */}
      <SearchHeader 
        query={query}
        onInput={handleSearchInput}
        suggestions={suggestions}
      />
      
      {/* Filter sidebar */}
      <FilterPanel 
        filters={filters}
        onChange={setFilters}
        facets={/* Get from API */}
      />
      
      {/* Results grid */}
      {loading ? (
        <SearchSkeleton />
      ) : (
        <>
          <ResultsGrid products={results} />
          <Pagination 
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setSearchParams({ ...searchParams, page })}
          />
        </>
      )}
    </div>
  );
}
```

#### 3.3.4 Update Header Search (Web)

**File: `frontend/apps/web/src/components/Header.jsx`** (Search input with autocomplete)

```javascript
import { useSearchSuggestions } from "@/hooks/useMeilisearch";

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, loading, fetchSuggestions } = useSearchSuggestions();
  const navigate = useNavigate();

  const handleSearchInput = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchSuggestions(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/search?q=${encodeURIComponent(suggestion.name)}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  return (
    <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-8 relative">
      <div className="relative w-full">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchInput}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search products..."
          className="w-full px-4 py-2.5 pl-4 pr-12 border-2 border-white bg-white text-black placeholder-gray-500 focus:outline-none focus:bg-yellow-200 focus:border-black transition-colors font-bold"
        />
        <button type="submit" className="...">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
        
        {/* Autocomplete dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-white border-4 border-black shadow-[8px_8px_0_#000000] mt-2 z-50">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-yellow-200 font-bold border-b-2 border-gray-200 last:border-b-0"
              >
                {suggestion.name}
                <span className="text-sm text-gray-500 ml-2">in {suggestion.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  );
}
```

#### 3.3.5 Mobile App Updates

**File: `frontend/apps/mobile/services/api.ts`**

Update search to use new endpoint:
```typescript
async searchProducts(query: string, filters?: SearchFilters): Promise<SearchResults> {
  const params = new URLSearchParams({ q: query });
  
  if (filters?.category) params.append('category', filters.category);
  if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
  if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
  if (filters?.sortBy) params.append('sortBy', filters.sortBy);
  
  const response = await fetch(
    `${API_BASE_URL}/products/search?${params.toString()}`,
    { headers: this.getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to search products');
  }

  return response.json();
}

async getSearchSuggestions(query: string): Promise<Suggestion[]> {
  const response = await fetch(
    `${API_BASE_URL}/products/suggestions?q=${encodeURIComponent(query)}`,
    { headers: this.getAuthHeaders() }
  );

  if (!response.ok) {
    throw new Error('Failed to get suggestions');
  }

  const data = await response.json();
  return data.suggestions;
}
```

### Phase 4: Data Synchronization

#### 3.4.1 Supabase Webhooks (Optional but Recommended)

Create database triggers to sync changes to Meilisearch:

**File: `backend/migrations/createMeilisearchTriggers.sql`**
```sql
-- This would require a Supabase Edge Function or external webhook handler
-- Alternative: Use the application layer sync as shown above

-- For real-time sync, consider using Supabase Realtime
-- and handle updates in the backend
```

#### 3.4.2 Periodic Sync Script

**File: `backend/scripts/syncMeilisearch.js`**
```javascript
const searchService = require('../services/searchService');

async function sync() {
  console.log('🔄 Starting Meilisearch sync...');
  try {
    await searchService.indexAllProducts();
    console.log('✅ Sync completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
}

sync();
```

Add to package.json:
```json
{
  "scripts": {
    "search:sync": "node scripts/syncMeilisearch.js",
    "search:init": "node -e \"require('./services/searchService').initializeIndex()\""
  }
}
```

### Phase 5: Deployment & Operations

#### 3.5.1 Docker Compose Configuration

**File: `docker-compose.yml`** (Add to existing)
```yaml
version: '3.8'
services:
  # ... existing services ...
  
  meilisearch:
    image: getmeili/meilisearch:v1.7
    environment:
      - MEILI_MASTER_KEY=${MEILISEARCH_MASTER_KEY}
      - MEILI_ENV=production
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data
    restart: unless-stopped

volumes:
  meilisearch_data:
```

#### 3.5.2 Environment Configuration

**Production considerations:**
- Use strong API keys
- Enable master key authentication
- Configure CORS properly
- Set up monitoring and alerts
- Regular backups of `/meili_data`

---

## 4. API Reference

### 4.1 Search Endpoint

```http
GET /api/products/search?q={query}&page={page}&limit={limit}&category={category}&sortBy={sort}
```

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| q | string | Search query |
| page | number | Page number (default: 1) |
| limit | number | Items per page (default: 24) |
| category | string | Filter by category |
| subcategory | string | Filter by subcategory |
| brand | string | Filter by brand |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| minRating | number | Minimum rating |
| inStock | boolean | Only in-stock items |
| sortBy | string | Sort: relevance, price-asc, price-desc, newest, rating, popular |

**Response:**
```json
{
  "products": [...],
  "total": 150,
  "page": 1,
  "limit": 24,
  "totalPages": 7,
  "processingTimeMs": 12
}
```

### 4.2 Suggestions Endpoint

```http
GET /api/products/suggestions?q={query}&limit={limit}
```

**Response:**
```json
{
  "suggestions": [
    { "name": "Wireless Headphones", "category": "Electronics" },
    { "name": "Wireless Mouse", "category": "Electronics" }
  ]
}
```

---

## 5. Migration Strategy

### 5.1 Step-by-Step Rollout

1. **Phase 1**: Set up Meilisearch instance (local/dev)
2. **Phase 2**: Implement backend service and routes
3. **Phase 3**: Index existing products
4. **Phase 4**: Update frontend to use new endpoints
5. **Phase 5**: Test thoroughly in staging
6. **Phase 6**: Deploy to production
7. **Phase 7**: Monitor and optimize

### 5.2 Fallback Strategy

Keep the existing Supabase search as fallback:

```javascript
// In searchService.js - search method
async search(params) {
  try {
    return await this.searchMeilisearch(params);
  } catch (error) {
    console.warn('Meilisearch failed, falling back to Supabase:', error);
    return this.searchSupabaseFallback(params);
  }
}
```

---

## 6. Performance Considerations

### 6.1 Expected Performance

| Metric | Before (Supabase) | After (Meilisearch) |
|--------|-------------------|---------------------|
| Search latency | 200-500ms | 10-50ms |
| Typo tolerance | None | Built-in |
| Concurrent searches | Limited | 1000+/sec |
| Indexing speed | N/A | 1000 docs/sec |

### 6.2 Optimization Tips

1. Use pagination (don't fetch all results)
2. Enable caching for popular queries
3. Use facet distribution for filter counts
4. Configure typo tolerance based on your data
5. Monitor index size and optimize if needed

---

## 7. Cost Analysis

### 7.1 Self-Hosted (Recommended)

- **Server**: $10-50/month (depending on traffic)
- **Storage**: ~$1/month per 100k products
- **Total**: ~$15-60/month

### 7.2 Meilisearch Cloud

- **Starter**: $30/month (up to 100k documents)
- **Pro**: $150/month (up to 1M documents)
- **Enterprise**: Custom pricing

---

## 8. Security Considerations

1. **API Keys**: Use separate keys for search (read-only) and indexing (admin)
2. **CORS**: Configure allowed origins
3. **Rate Limiting**: Implement on search endpoints
4. **Data Privacy**: Don't index sensitive fields
5. **SSL/TLS**: Always use HTTPS in production

---

## 9. Monitoring & Maintenance

### 9.1 Health Checks

```javascript
// Health check endpoint
app.get('/health/search', async (req, res) => {
  try {
    await client.health();
    res.json({ status: 'healthy' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

### 9.2 Key Metrics to Monitor

- Search latency (p50, p95, p99)
- Index size
- Query volume
- Error rates
- Cache hit rates

---

## 10. Conclusion

This implementation plan provides a complete roadmap for integrating Meilisearch into the Serendipity e-commerce platform. The integration will significantly improve search performance, user experience, and enable advanced search features like autocomplete, typo tolerance, and faceted filtering.

**Estimated Implementation Time**: 3-5 days
**Complexity**: Medium
**Impact**: High (significant UX improvement)

---

## Appendix A: File Structure

```
backend/
├── config/
│   └── meilisearch.js          # NEW
├── services/
│   └── searchService.js        # NEW
├── routes/
│   └── searchRoutes.js         # NEW
├── scripts/
│   └── syncMeilisearch.js      # NEW
└── migrations/
    └── createMeilisearchTriggers.sql  # NEW

frontend/apps/web/src/
├── hooks/
│   └── useMeilisearch.js       # NEW
└── components/
    └── SearchAutocomplete.jsx  # NEW

frontend/apps/mobile/
└── services/
    └── api.ts                  # UPDATE
```

## Appendix B: Dependencies

**Backend:**
- `meilisearch` - Official Meilisearch client

**Frontend (Web):**
- `meilisearch` - Official Meilisearch client

**Infrastructure:**
- Meilisearch v1.7+ (Docker or Cloud)
