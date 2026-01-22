"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuth from "@/utils/useAuth";
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
        images = [],
        rating = 0,
        num_reviews = 0,
        brand,
        category,
        count_in_stock = 0,
        discount,
        compare_at_price
    } = product;

    const productId = id || _id;

    // Logic to determine display price and discount
    let displayPrice = price;
    let originalPrice = compare_at_price;
    let discountPercentage = discount;

    if (compare_at_price && compare_at_price > price) {
        originalPrice = compare_at_price;
        if (!discountPercentage) {
            discountPercentage = Math.round(((compare_at_price - price) / compare_at_price) * 100);
        }
    }

    const hasDiscount = discountPercentage && discountPercentage > 0;
    const isOutOfStock = count_in_stock === 0;

    // Image handling
    const [imgSrc, setImgSrc] = React.useState("");
    const [imgError, setImgError] = React.useState(false);

    React.useEffect(() => {
        if (image) setImgSrc(image);
        else if (images && images.length > 0) setImgSrc(images[0]);
        else setImgSrc("https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop");
    }, [image, images]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(
                    <i key={i} className="fa-solid fa-star text-xs text-[#FFA41C]"></i>
                );
            } else if (i === fullStars && hasHalfStar) {
                stars.push(
                    <i key={i} className="fa-solid fa-star text-xs text-[#FFA41C]" style={{ opacity: 0.5 }}></i>
                );
            } else {
                stars.push(
                    <i key={i} className="fa-regular fa-star text-xs text-gray-300"></i>
                );
            }
        }
        return stars;
    };

    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        <div
            className={cn(
                "group relative flex flex-col w-full h-full bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:-translate-y-1 transition-all duration-500 overflow-hidden ring-1 ring-white/50",
                className
            )}
        >
            <Link to={`/product/${productId}`} className="relative aspect-[4/5] overflow-hidden bg-gray-50">
                <img
                    src={imgSrc}
                    alt={name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={() => {
                        if (!imgError) {
                            setImgError(true);
                            setImgSrc("https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop");
                        }
                    }}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {hasDiscount && (
                        <div className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            -{discountPercentage}%
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="rounded-full bg-gray-900 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
                            No Stock
                        </div>
                    )}
                </div>

                {/* Overlay on hover (optional subtle effect) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </Link>

            {/* Content Layer */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Header */}
                <div className="mb-2">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-xs text-[#D97534] font-medium uppercase tracking-wide truncate pr-2">
                            {brand || category || "Serendipity"}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                            {renderStars(rating)}
                            <span className="text-[10px] text-gray-400">({num_reviews})</span>
                        </div>
                    </div>

                    <Link to={`/product/${productId}`} className="block">
                        <h3 className="text-base font-bold text-gray-900 line-clamp-2 hover:text-[#D97534] transition-colors leading-tight min-h-[2.5rem]">
                            {name}
                        </h3>
                    </Link>
                </div>

                {/* Price */}
                <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-gray-900">
                                {formatCurrency(displayPrice)}
                            </span>
                            {originalPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                    {originalPrice}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Add to Cart Button */}
                    {showAddToCart && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                if (!isAuthenticated) {
                                    navigate('/account/signin');
                                    return;
                                }

                                if (!isOutOfStock) onAddToCart?.(product);
                            }}
                            disabled={isOutOfStock}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm
                                ${isOutOfStock
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#D97534] hover:text-white"
                                }`}
                            title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        >
                            <i className="fa-solid fa-cart-plus text-sm"></i>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
