"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
// FontAwesome icons loaded globally
import { formatCurrency } from "@/utils/format";
import ProductCard from "@/components/ProductCard";
import GlassCard from "@/components/ui/GlassCard";


export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [sortBy, setSortBy] = useState("BEST_MATCH");
  const [minRating, setMinRating] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState("");

  useEffect(() => {
    // Get query from URL
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    setSearchQuery(query);

    // Always fetch products (all products if no query, filtered if query exists)
    fetchProducts(query);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    // Only refetch on filter change, not on initial load
    if (products.length > 0 || query) {
      fetchProducts(searchQuery);
    }
  }, [sortBy, minRating, maxPrice, condition]);

  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products?limit=100`);
      const data = await response.json();

      // API returns { products: [...] } format
      const productsArray = data.products || data || [];

      if (productsArray && productsArray.length > 0) {
        // If there's a query, filter results; otherwise show all products
        let filtered = productsArray;
        if (query && query.trim()) {
          filtered = productsArray.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.category && p.category.toLowerCase().includes(query.toLowerCase())) ||
            (p.brand && p.brand.toLowerCase().includes(query.toLowerCase()))
          );
        }

        // Apply additional filters
        if (minRating) {
          filtered = filtered.filter(p => (p.rating || 0) >= parseFloat(minRating));
        }
        if (maxPrice) {
          filtered = filtered.filter(p => p.price <= parseFloat(maxPrice));
        }

        // Apply sorting
        switch (sortBy) {
          case "LOWEST_PRICE":
            filtered = [...filtered].sort((a, b) => a.price - b.price);
            break;
          case "HIGHEST_PRICE":
            filtered = [...filtered].sort((a, b) => b.price - a.price);
            break;
          case "TOP_RATED":
            filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
            break;
          default:
            break;
        }

        // Format data to match ProductCard interface
        const mappedData = filtered.map(p => ({
          id: p.id,
          _id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          rating: p.rating || 4.5,
          num_reviews: p.num_reviews || 0,
          brand: p.brand || 'Brand',
          count_in_stock: p.count_in_stock || 10,
          discount: p.discount || 0,
          compare_at_price: p.compare_at_price || null
        }));
        setProducts(mappedData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-white border-8 border-black">


      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="bg-black text-white border-4 border-white p-4 inline-block">
            <h1 className="font-brutalist font-bold text-2xl sm:text-3xl">
              {searchQuery ? `RESULTS FOR "${searchQuery.toUpperCase()}"` : "ALL PRODUCTS"}
            </h1>
            {products.length > 0 && !loading && (
              <p className="text-sm text-yellow-400 mt-1">{products.length} items found</p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 bg-orange-500 text-white font-bold border-4 border-black hover:bg-orange-600 hover:translate(-1px,-1px) hover:shadow-[4px_4px_0_#000000] transition-all duration-100"
            >
              <i className="fa-solid fa-sliders text-base mr-2"></i>
              FILTERS
              <i className={`fa-solid fa-chevron-down text-base ml-2 transform transition-transform ${showFilters ? "rotate-180" : ""}`}></i>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 bg-white border-4 border-black font-bold text-black text-sm focus:outline-none focus:border-pink-500 focus:bg-yellow-200 transition-colors"
            >
              <option value="BEST_MATCH">BEST MATCH</option>
              <option value="LOWEST_PRICE">LOWEST PRICE</option>
              <option value="HIGHEST_PRICE">HIGHEST PRICE</option>
              <option value="TOP_RATED">TOP RATED</option>
            </select>
          </div>
        </div>

        {/* Filters Panel - Neo Brutalism */}
        {showFilters && (
          <div className="mb-8 bg-white border-4 border-black shadow-[8px_8px_0_#000000] p-6 animate-brutalist-fadeIn">
            {/* Filter Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b-4 border-black">
              <h2 className="text-xl font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="bg-yellow-400 px-3 py-1 border-4 border-black">
                  <i className="fa-solid fa-filter mr-2"></i>FILTERS
                </span>
              </h2>
              <button
                onClick={() => {
                  setMinRating("");
                  setMaxPrice("");
                  setCondition("");
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm border-4 border-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000] transition-all duration-100 cursor-pointer"
              >
                <i className="fa-solid fa-xmark mr-1"></i> CLEAR
              </button>
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Price Range */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-black uppercase tracking-wide">
                  <span className="w-8 h-8 bg-green-400 border-4 border-black flex items-center justify-center">
                    <i className="fa-solid fa-dollar-sign text-sm"></i>
                  </span>
                  MAX PRICE
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Enter max price..."
                  className="w-full px-4 py-3 bg-white border-4 border-black font-bold text-black placeholder-gray-400 focus:outline-none focus:bg-yellow-100 focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Rating Filter */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-black uppercase tracking-wide">
                  <span className="w-8 h-8 bg-yellow-400 border-4 border-black flex items-center justify-center">
                    <i className="fa-solid fa-star text-sm"></i>
                  </span>
                  MIN RATING
                </label>
                <div className="flex gap-2">
                  {[4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(minRating === String(rating) ? "" : String(rating))}
                      className={`flex-1 py-3 font-bold text-sm border-4 border-black transition-all duration-100 cursor-pointer ${minRating === String(rating)
                          ? "bg-yellow-400 text-black -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0_#000000]"
                          : "bg-white text-black hover:bg-yellow-200"
                        }`}
                    >
                      {rating}+
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-black uppercase tracking-wide">
                  <span className="w-8 h-8 bg-pink-400 border-4 border-black flex items-center justify-center">
                    <i className="fa-solid fa-tag text-sm"></i>
                  </span>
                  CONDITION
                </label>
                <div className="flex flex-wrap gap-2">
                  {["NEW", "USED", "REFURBISHED"].map((cond) => (
                    <button
                      key={cond}
                      onClick={() => setCondition(condition === cond ? "" : cond)}
                      className={`px-4 py-2 font-bold text-xs border-4 border-black transition-all duration-100 cursor-pointer ${condition === cond
                          ? "bg-pink-400 text-black -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0_#000000]"
                          : "bg-white text-black hover:bg-pink-200"
                        }`}
                    >
                      {cond}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm font-bold text-black uppercase tracking-wide">
                  <span className="w-8 h-8 bg-orange-400 border-4 border-black flex items-center justify-center">
                    <i className="fa-solid fa-arrow-up-wide-short text-sm"></i>
                  </span>
                  SORT BY
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-4 border-black font-bold text-black text-sm focus:outline-none focus:bg-orange-100 focus:border-orange-500 transition-colors cursor-pointer appearance-none"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='black'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: "16px" }}
                >
                  <option value="BEST_MATCH">BEST MATCH</option>
                  <option value="LOWEST_PRICE">PRICE: LOW → HIGH</option>
                  <option value="HIGHEST_PRICE">PRICE: HIGH → LOW</option>
                  <option value="TOP_RATED">TOP RATED</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(minRating || maxPrice || condition) && (
              <div className="mt-6 pt-4 border-t-4 border-dashed border-black">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-black uppercase">Active:</span>
                  {minRating && (
                    <span className="px-3 py-1 bg-yellow-400 border-4 border-black text-xs font-bold flex items-center gap-1">
                      {minRating}+ Stars
                      <button onClick={() => setMinRating("")} className="ml-1 hover:text-red-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {maxPrice && (
                    <span className="px-3 py-1 bg-green-400 border-4 border-black text-xs font-bold flex items-center gap-1">
                      Max ₹{maxPrice}
                      <button onClick={() => setMaxPrice("")} className="ml-1 hover:text-red-600 cursor-pointer">×</button>
                    </span>
                  )}
                  {condition && (
                    <span className="px-3 py-1 bg-pink-400 border-4 border-black text-xs font-bold flex items-center gap-1">
                      {condition}
                      <button onClick={() => setCondition("")} className="ml-1 hover:text-red-600 cursor-pointer">×</button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white border-4 border-black p-4 animate-brutalist-jitter">
                <div className="aspect-square bg-gray-200 border-4 border-black mb-4"></div>
                <div className="h-4 bg-gray-200 border-4 border-black w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 border-4 border-black w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-yellow-400 border-4 border-black flex items-center justify-center mx-auto mb-6 animate-brutalist-jitter">
              <i className="fa-solid fa-search text-4xl text-black"></i>
            </div>
            <h3 className="text-3xl font-brutalist text-black mb-4 bg-black px-6 py-2 border-4 border-white inline-block">NO PRODUCTS FOUND</h3>
            <p className="text-black mb-6 font-bold text-lg">TRY ADJUSTING YOUR SEARCH</p>
            <a
              href="/"
              className="inline-flex items-center px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all duration-100"
            >
              <i className="fa-solid fa-home mr-2"></i>
              BACK TO HOME
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="animate-brutalist-fadeIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={() => {
                    console.log("Added to cart:", product.name);
                    // Add to cart logic here
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}
