"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  // mobileMenuOpen removed

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    setCartCount(cart.length);

    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${params.id}`,
      );
      const data = await response.json();

      if (data) {
        // Map backend to frontend schema
        const mappedProduct = {
          product_id: data.id || params.id,
          product_title: data.name,
          product_description: data.description,
          product_photos: [data.image],
          product_rating: data.rating || 4.5,
          product_num_reviews: data.num_reviews || 0,
          offer: {
            price: `$${data.price}`,
            store_name: data.seller_store_name || "Amazon",
            store_rating: data.seller_rating || 4.8
          },
          typical_price_range: ["$50", "$500"], // Mock
          product_details: { Brand: data.brand, Category: data.category }
        };
        setProduct({ product: mappedProduct });
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingIndex = cart.findIndex(
      (item) => item.product_id === product.product.product_id,
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({
        product_id: product.product.product_id,
        title: product.product.product_title,
        price: product.product.offer?.price || "$0.00",
        image: product.product.product_photos[0],
        quantity: quantity,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setCartCount(cart.length);

    // Visual feedback
    const button = document.getElementById("add-to-cart-btn");
    if (button) {
      button.textContent = "Added!";
      setTimeout(() => {
        button.textContent = "Add to Cart";
      }, 1500);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D97534] mx-auto mb-4"></div>
          <p className="font-inter text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product || !product.product) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
        <div className="text-center">
          <p className="font-playfair text-2xl text-gray-500 mb-4">
            Product not found
          </p>
          <a
            href="/"
            className="inline-flex items-center px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-semibold rounded-full transition-colors"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const productData = product.product;

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

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <a
            href="/"
            className="text-[#A0522D] hover:text-[#D97534] font-inter text-sm"
          >
            Home
          </a>
          <span className="text-gray-400 mx-2">/</span>
          <span className="text-gray-600 font-inter text-sm">
            {productData.product_title}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
              <img
                src={productData.product_photos[selectedImage]}
                alt={productData.product_title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Thumbnail Gallery */}
            {productData.product_photos.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {productData.product_photos.slice(0, 5).map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                      ? "border-[#D97534] shadow-md"
                      : "border-gray-200 hover:border-[#D97534]/50"
                      }`}
                  >
                    <img
                      src={photo}
                      alt={`${productData.product_title} - ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-4 leading-tight">
                {productData.product_title}
              </h1>

              {/* Rating */}
              {productData.product_rating && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i < Math.floor(productData.product_rating)
                          ? "text-[#D97534] fill-current"
                          : "text-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                  <span className="ml-3 font-inter text-gray-700">
                    {productData.product_rating} (
                    {productData.product_num_reviews || 0} reviews)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <p className="font-playfair font-bold text-4xl text-[#8B4513]">
                  {productData.offer?.price || "See offers"}
                </p>
                {productData.typical_price_range && (
                  <p className="font-inter text-sm text-gray-600 mt-2">
                    Typical range: {productData.typical_price_range[0]} -{" "}
                    {productData.typical_price_range[1]}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            {productData.product_description && (
              <div className="bg-gradient-to-br from-white to-[#FAE5D3]/30 rounded-xl p-6 border border-[#FAE5D3]">
                <h2 className="font-playfair font-semibold text-xl text-[#8B4513] mb-3">
                  About this product
                </h2>
                <p className="font-inter text-gray-700 leading-relaxed">
                  {productData.product_description}
                </p>
              </div>
            )}

            {/* Product Details */}
            {productData.product_details &&
              Object.keys(productData.product_details).length > 0 && (
                <div className="bg-white rounded-xl p-6 shadow-md">
                  <h2 className="font-playfair font-semibold text-xl text-[#8B4513] mb-4">
                    Product Details
                  </h2>
                  <div className="space-y-2">
                    {Object.entries(productData.product_details).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-gray-100 pb-2"
                        >
                          <span className="font-inter text-sm text-gray-600">
                            {key}:
                          </span>
                          <span className="font-inter text-sm font-medium text-gray-800">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}

            {/* Quantity & Add to Cart */}
            <div className="bg-gradient-to-br from-[#F4E4D7] to-[#FFF8F0] rounded-xl p-6 shadow-md space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-inter font-semibold text-gray-700">
                  Quantity:
                </span>
                <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="text-[#D97534] hover:text-[#C86429] transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-inter font-semibold text-lg w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="text-[#D97534] hover:text-[#C86429] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                id="add-to-cart-btn"
                onClick={addToCart}
                className="w-full bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-bold text-lg py-4 rounded-full transition-all transform hover:scale-105 shadow-lg"
              >
                Add to Cart
              </button>

              {productData.offer?.store_name && (
                <p className="font-inter text-sm text-gray-600 text-center">
                  Sold by:{" "}
                  <span className="font-semibold text-[#8B4513]">
                    {productData.offer.store_name}
                  </span>
                  {productData.offer.store_rating && (
                    <span className="ml-2">
                      ⭐ {productData.offer.store_rating}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
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
