"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { formatCurrency } from "@/utils/format";

/**
 * ProductCard Component
 * Displays a product with image, title, price, rating, and add to cart functionality
 */
export default function ProductCard({
    product,
    onAddToCart,
    showAddToCart = true,
    className = ""
}) {
    const {
        id,
        _id,
        name,
        price,
        image,
        rating = 0,
        num_reviews = 0,
        brand,
        category,
        count_in_stock = 0,
        discount
    } = product;

    const productId = id || _id;
    const hasDiscount = discount && discount > 0;
    const discountedPrice = hasDiscount ? price * (1 - discount / 100) : price;
    const isOutOfStock = count_in_stock === 0;

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <Star key={i} className="w-4 h-4 fill-[#FFA41C] text-[#FFA41C]" />
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <Star key={i} className="w-4 h-4 fill-[#FFA41C]/50 text-[#FFA41C]" />
                );
            } else {
                stars.push(
                    <Star key={i} className="w-4 h-4 text-gray-300" />
                );
            }
        }
        return stars;
    };

    return (
        <div className={`group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 ${className}`}>
            {/* Image Container */}
            <Link to={`/product/${productId}`} className="block relative overflow-hidden">
                <div className="aspect-square bg-gray-50 p-4">
                    <img
                        src={image || "/images/sample.jpg"}
                        alt={name}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/300x300?text=No+Image";
                        }}
                    />
                </div>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {hasDiscount && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            -{discount}%
                        </span>
                    )}
                    {isOutOfStock && (
                        <span className="px-2 py-1 bg-gray-800 text-white text-xs font-bold rounded">
                            Out of Stock
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110"
                    onClick={(e) => {
                        e.preventDefault();
                        // TODO: Add to wishlist
                    }}
                >
                    <Heart className="w-4 h-4 text-gray-600 hover:text-red-500 transition-colors" />
                </button>
            </Link>

            {/* Content */}
            <div className="p-4">
                {/* Brand */}
                {brand && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {brand}
                    </p>
                )}

                {/* Title */}
                <Link to={`/product/${productId}`}>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-[#D97534] transition-colors mb-2 min-h-[2.5rem]">
                        {name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    <div className="flex">
                        {renderStars(rating)}
                    </div>
                    <span className="text-xs text-gray-500 ml-1">
                        ({num_reviews})
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-xl font-bold text-[#067D62]">
                        {formatCurrency(discountedPrice)}
                    </span>
                    {hasDiscount && (
                        <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(price)}
                        </span>
                    )}
                </div>

                {/* Add to Cart Button */}
                {showAddToCart && (
                    <button
                        onClick={() => onAddToCart?.(product)}
                        disabled={isOutOfStock}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${isOutOfStock
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] active:scale-95"
                            }`}
                    >
                        <ShoppingCart className="w-4 h-4" />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                    </button>
                )}
            </div>
        </div>
    );
}
