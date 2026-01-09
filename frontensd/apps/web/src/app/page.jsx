"use client";

import React, { useState, useEffect } from "react";
import { ChevronRight, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCardSkeleton from "@/components/ProductCardSkeleton";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Electronics", query: "laptop", color: "#D97534" },
    { name: "Fashion", query: "sneakers", color: "#8B4513" },
    { name: "Home & Garden", query: "furniture", color: "#CD853F" },
    { name: "Sports", query: "running shoes", color: "#A0522D" },
    { name: "Books", query: "bestseller books", color: "#D2691E" },
    { name: "Toys", query: "toys", color: "#B8860B" },
  ];

  useEffect(() => {
    // Load cart count from localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);

    // Fetch featured products
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/products");
      const data = await response.json();

      // Map backend data to frontend components
      const mappedData = data.map(product => ({
        product_id: product._id || product.id,
        product_title: product.name,
        product_photos: [product.image],
        product_rating: product.rating || 4.5, // Default/Mock if missing
        product_num_reviews: product.num_reviews || 0,
        offer: { price: `$${product.price}` }
      }));

      setFeaturedProducts(mappedData.slice(0, 8));
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
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
        cartCount={cartCount}
      />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F4E4D7] via-[#FFF8F0] to-[#FAE5D3] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto opacity-0 animate-fadeIn">
            <h1 className="font-playfair font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[#8B4513] mb-6 leading-tight">
              Discover Amazing Products
            </h1>
            <p className="font-inter text-base sm:text-lg text-[#A0522D] mb-8 leading-relaxed">
              Shop millions of products with verified reviews and lightning-fast
              delivery
            </p>
            <a
              href="/search?q=trending"
              className="inline-flex items-center px-8 py-4 bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-semibold rounded-full transition-all transform hover:scale-105 shadow-lg"
            >
              Browse Trending
              <ChevronRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D97534] rounded-full opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#A0522D] rounded-full opacity-10 blur-3xl"></div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-8 sm:mb-12">
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <a
              key={category.name}
              href={`/search?q=${encodeURIComponent(category.query)}`}
              className="group relative overflow-hidden rounded-2xl aspect-square opacity-0 animate-staggerIn shadow-md hover:shadow-xl transition-all"
              style={{
                animationDelay: `${index * 100}ms`,
                backgroundColor: category.color,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40 group-hover:to-black/30 transition-all"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="font-playfair font-semibold text-xl sm:text-2xl md:text-3xl text-white text-center px-4 transform group-hover:scale-110 transition-transform">
                  {category.name}
                </h3>
              </div>
              <div className="absolute bottom-4 right-4 bg-white/20 rounded-full p-2 transform translate-x-12 group-hover:translate-x-0 transition-transform">
                <ChevronRight className="w-5 h-5 text-white" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8 sm:mb-12">
          <h2 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513]">
            Featured Products
          </h2>
          <a
            href="/search?q=trending"
            className="text-[#D97534] hover:text-[#C86429] font-inter font-semibold text-sm sm:text-base flex items-center transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product, index) => (
              <a
                key={product.product_id}
                href={`/product/${product.product_id}`}
                className="group card-product opacity-0 animate-staggerIn"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="aspect-square bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.product_photos[0]}
                    alt={product.product_title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Quick View Badge on Hover */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 bg-white px-4 py-2 rounded-full text-sm font-semibold text-[#D97534] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Quick View
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-inter font-medium text-sm text-gray-800 mb-2 line-clamp-2 min-h-[40px] group-hover:text-[#D97534] transition-colors">
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
                  <div className="flex items-center justify-between">
                    <p className="font-inter font-bold text-lg text-[#8B4513]">
                      {product.offer?.price || "See offers"}
                    </p>
                    <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                      <ChevronRight className="w-5 h-5 text-[#D97534]" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <Footer />

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

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

        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }

        .animate-staggerIn {
          animation: staggerIn 0.6s ease-out forwards;
        }

        .font-inter {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .font-playfair {
          font-family: 'Playfair Display', Georgia, serif;
        }
      `}</style>
    </div>
  );
}
