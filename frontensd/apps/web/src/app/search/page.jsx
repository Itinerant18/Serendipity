"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  ShoppingCart,
  Menu,
  X,
  SlidersHorizontal,
  Star,
  ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/utils/format";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

    if (query) {
      fetchProducts(query);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    if (query && searchQuery) {
      fetchProducts(searchQuery);
    }
  }, [sortBy, minRating, maxPrice, condition]);

  const fetchProducts = async (query) => {
    setLoading(true);
    try {
      // Fetch all products then filter (temporary mock search)
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();

      if (data) {
        const filtered = data.filter(p =>
          p.name.toLowerCase().includes(query.toLowerCase())
        );

        const mappedData = filtered.map(p => ({
          product_id: p.id,
          product_title: p.name,
          product_photos: [p.image],
          product_rating: p.rating || 4.5,
          product_num_reviews: p.num_reviews || 0,
          offer: { price: formatCurrency(p.price) }
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
    <div className="min-h-screen bg-[#FFF8F0]">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="font-playfair font-bold text-2xl sm:text-3xl text-[#8B4513]">
            {searchQuery ? `Results for "${searchQuery}"` : "Search Results"}
          </h1>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow font-inter text-sm text-gray-700 border border-gray-200"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown
                className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow font-inter text-sm text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#D97534]"
            >
              <option value="BEST_MATCH">Best Match</option>
              <option value="LOWEST_PRICE">Lowest Price</option>
              <option value="HIGHEST_PRICE">Highest Price</option>
              <option value="TOP_RATED">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-lg animate-slideDown">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                  Min Rating
                </label>
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] font-inter text-sm"
                >
                  <option value="">Any Rating</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                </select>
              </div>

              <div>
                <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                  Max Price
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] font-inter text-sm"
                />
              </div>

              <div>
                <label className="block font-inter text-sm font-semibold text-gray-700 mb-2">
                  Condition
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] font-inter text-sm"
                >
                  <option value="">All Conditions</option>
                  <option value="NEW">New</option>
                  <option value="USED">Used</option>
                  <option value="REFURBISHED">Refurbished</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                setMinRating("");
                setMaxPrice("");
                setCondition("");
              }}
              className="mt-4 text-[#D97534] hover:text-[#C86429] font-inter text-sm font-semibold"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <p className="font-playfair text-2xl text-gray-500 mb-4">
              No products found
            </p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-semibold rounded-full transition-colors"
            >
              Back to Home
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, index) => (
              <a
                key={product.product_id}
                href={`/product/${product.product_id}`}
                className="bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1 opacity-0 animate-staggerIn"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.product_photos[0]}
                    alt={product.product_title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-inter font-medium text-sm text-gray-800 mb-2 line-clamp-2 min-h-[40px]">
                    {product.product_title}
                  </h3>
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < Math.floor(product.product_rating || 0)
                            ? "text-[#D97534] fill-current"
                            : "text-gray-300"
                            }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-xs text-gray-600 font-inter">
                      ({product.product_num_reviews || 0})
                    </span>
                  </div>
                  <p className="font-inter font-bold text-lg text-[#8B4513]">
                    {product.offer?.price || "See offers"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>

      <Footer />

      <style jsx global>{`
        @keyframes staggerIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-staggerIn {
          animation: staggerIn 0.6s ease-out forwards;
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}
