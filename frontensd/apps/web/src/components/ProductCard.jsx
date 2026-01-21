"use client";

import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
// FontAwesome icons loaded globally
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
        images = [], // New field
        rating = 0,
        num_reviews = 0,
        brand,
        category,
        count_in_stock = 0,
        discount,
        compare_at_price // New field
    } = product;

    const productId = id || _id;

    // Logic to determine display price and discount
    let displayPrice = price;
    let originalPrice = compare_at_price;
    let discountPercentage = discount;

    // If we have a compare_at_price that is higher than price, that's a sale
    if (compare_at_price && compare_at_price > price) {
        originalPrice = compare_at_price;
        if (!discountPercentage) {
            discountPercentage = Math.round(((compare_at_price - price) / compare_at_price) * 100);
        }
    }

    const hasDiscount = discountPercentage && discountPercentage > 0;

    // If explicit discount is provided but no compare_at_price, calculate original (reverse logic for display if needed, but usually we just show price as discounted)
    // Actually, widespread convention: 'price' is the selling price.
    // If 'compare_at_price' exists, it's the crossed-out price.

    const isOutOfStock = count_in_stock === 0;
    const finalImage = image || (images && images.length > 0 ? images[0] : "/images/sample.jpg");

    const cardRef = React.useRef(null);
    const [style, setStyle] = React.useState({});

    // --- MOUSE MOVE HANDLER ---
    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const x = e.clientX - left;
        const y = e.clientY - top;

        const rotateX = (y - height / 2) / (height / 2) * -4; // Max rotation 4deg
        const rotateY = (x - width / 2) / (width / 2) * 4;   // Max rotation 4deg

        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1, 1, 1)`,
            transition: "transform 0.1s ease-out",
        });
    };

    // --- MOUSE LEAVE HANDLER ---
    const handleMouseLeave = () => {
        setStyle({
            transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            transition: "transform 0.4s ease-in-out",
        });
    };

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
                    <i key={i} className="fa-regular fa-star text-xs text-white/50"></i>
                );
            }
        }
        return stars;
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
            className={cn(
                "group relative w-full aspect-[9/12] rounded-3xl bg-card shadow-lg cursor-pointer transform-style-3d",
                className
            )}
        >
            <Link to={`/product/${productId}`} className="absolute inset-0 z-10" />

            {/* Background Image */}
            <img
                src={image || "/images/sample.jpg"}
                alt={name}
                className="absolute inset-0 h-full w-full object-cover rounded-3xl transition-transform duration-300 group-hover:scale-110"
                style={{ transform: "translateZ(-20px) scale(1.1)" }}
                onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop";
                }}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent rounded-3xl pointer-events-none" />

            {/* Content Layer */}
            <div
                className="absolute inset-0 p-5 flex flex-col pointer-events-none z-20"
                style={{ transform: "translateZ(40px)" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                    <div className="flex flex-col w-full">
                        <h3 className="text-lg font-bold text-white line-clamp-1">{name}</h3>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-white/70">{brand || category}</p>
                            <div className="flex items-center gap-1">
                                {renderStars(rating)}
                                <span className="text-[10px] text-white/50">({num_reviews})</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Badges */}
                <div className="absolute top-[110px] left-5 flex flex-col gap-2 pointer-events-auto">
                    {hasDiscount && (
                        <div className="rounded-full bg-red-500/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                            -{discount}%
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="rounded-full bg-gray-800/80 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                            No Stock
                        </div>
                    )}
                </div>

                {/* Price Tag */}
                <div className="absolute top-[108px] right-5 pointer-events-auto">
                    <div className="rounded-full bg-black/40 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm shadow-sm border border-white/10">
                        {formatCurrency(displayPrice)}
                    </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto pointer-events-auto w-full relative z-50">
                    {showAddToCart && (
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (!isOutOfStock) onAddToCart?.(product);
                            }}
                            disabled={isOutOfStock}
                            className={`w-full py-3 rounded-xl font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md border border-white/20
                                ${isOutOfStock
                                    ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                                    : "bg-white/10 text-white hover:bg-white/20 hover:scale-[1]"
                                }`}
                        >
                            <i className="fa-solid fa-cart-shopping"></i>
                            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
