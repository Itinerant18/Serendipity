"use client";

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import useAuth from "@/utils/useAuth";
import useWishlistStore from "@/utils/wishlistStore";
import { formatCurrency } from "@/utils/format";
import GlassCard from "./ui/GlassCard";
import { Button } from "./ui/button";

/**
 * ProductCard Component
 * Displays a product with image, title, price, rating, and add to cart functionality
 * Uses GlassCard for consistent UI and FontAwesome <i> tags.
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
        media = [],
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

    // Category-specific fallback images from Unsplash
    const categoryFallbacks = React.useMemo(() => ({
        'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop',
        'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400&auto=format&fit=crop',
        'Home & Living': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=400&auto=format&fit=crop',
        'Beauty': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
        'Sports': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=400&auto=format&fit=crop',
        'Books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=400&auto=format&fit=crop',
        'default': 'https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop'
    }), []);

    const getFallbackImage = React.useCallback(() => {
        return categoryFallbacks[category] || categoryFallbacks['default'];
    }, [category, categoryFallbacks]);

    const getValidImageUrl = React.useCallback((url) => {
        if (!url) return "";
        if (url.startsWith("http") || url.startsWith("https")) return url;

        // Prepend API URL for relative paths
        const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000');

        // Ensure no double slashes
        const cleanUrl = url.startsWith("/") ? url.substring(1) : url;
        const cleanApiUrl = apiUrl.endsWith("/") ? apiUrl.substring(0, apiUrl.length - 1) : apiUrl;

        return `${cleanApiUrl}/${cleanUrl}`;
    }, []);

    // Compute stable image URL using useMemo to prevent flickering
    const computedImageUrl = React.useMemo(() => {
        let primaryImage = image;
        if (!primaryImage && images && images.length > 0) primaryImage = images[0];
        if (!primaryImage && media && media.length > 0) {
            const imgMedia = media.find(m => m.type === 'image');
            primaryImage = imgMedia ? imgMedia.src : media[0].src;
        }

        if (primaryImage) {
            return getValidImageUrl(primaryImage);
        }
        return getFallbackImage();
    }, [image, images, media, getValidImageUrl, getFallbackImage]);

    // Image state - only track errors now, not loading
    const [imgSrc, setImgSrc] = React.useState(computedImageUrl);
    const [imgError, setImgError] = React.useState(false);
    const [imgLoaded, setImgLoaded] = React.useState(false);

    // Update imgSrc when computedImageUrl changes, but don't reset loaded state unnecessarily
    React.useEffect(() => {
        if (computedImageUrl !== imgSrc && !imgError) {
            setImgSrc(computedImageUrl);
            setImgLoaded(false);
        }
    }, [computedImageUrl]);

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
                    <i key={i} className="fa-solid fa-star-half-stroke text-xs text-[#FFA41C]"></i>
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
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id || product._id)) {
            removeFromWishlist(product.id || product._id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <GlassCard
            className={cn("group flex flex-col w-full h-full", className)}
            hoverEffect={true}
        >
            <Link to={`/product/${productId}`} className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 block">
                {/* Background skeleton loader - only visible while loading */}
                {!imgLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                        <i className="fa-solid fa-image text-gray-300 text-3xl"></i>
                    </div>
                )}
                {/* Image with smooth fade-in */}
                <img
                    src={imgSrc}
                    alt={name}
                    loading="lazy"
                    className={cn(
                        "absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105",
                        imgLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onLoad={() => setImgLoaded(true)}
                    onError={() => {
                        if (!imgError) {
                            setImgError(true);
                            setImgSrc(getFallbackImage());
                        }
                    }}
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
                    {hasDiscount && (
                        <div className="rounded-full bg-red-500/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm border border-white/20">
                            -{discountPercentage}%
                        </div>
                    )}
                    {isOutOfStock && (
                        <div className="rounded-full bg-slate-900/90 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm border border-white/20">
                            No Stock
                        </div>
                    )}
                </div>

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </Link>

            {/* Content Layer */}
            <div className="p-4 flex flex-col flex-grow">
                {/* Header */}
                <div className="mb-2">
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-xs text-amber-600 font-medium uppercase tracking-wide truncate pr-2">
                            {brand || category || "Serendipity"}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                            {renderStars(rating)}
                            <span className="text-[10px] text-gray-400">({num_reviews})</span>
                        </div>
                    </div>

                    <Link to={`/product/${productId}`} className="block">
                        <h3 className="text-base font-bold text-stone-900 line-clamp-2 hover:text-amber-600 transition-colors leading-tight min-h-[2.5rem]">
                            {name}
                        </h3>
                    </Link>
                </div>

                {/* Price */}
                <div className="mt-auto pt-3 border-t border-stone-100/50 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-stone-900">
                                {formatCurrency(displayPrice)}
                            </span>
                            {originalPrice && (
                                <span className="text-xs text-stone-400 line-through">
                                    {originalPrice}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Add to Cart & Wishlist Buttons */}
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (!isAuthenticated) {
                                        navigate('/account/signin');
                                        return;
                                    }
                                    toggleWishlist(product);
                                }}
                                className={cn(
                                    "rounded-full hover:bg-red-50 hover:text-red-500 transition-colors",
                                    isInWishlist(productId) ? "text-red-500" : "text-gray-400"
                                )}
                                title={isInWishlist(productId) ? "Remove from Wishlist" : "Add to Wishlist"}
                            >
                                <i className={cn("fa-heart text-sm", isInWishlist(productId) ? "fa-solid" : "fa-regular")}></i>
                            </Button>
                        </div>

                        {showAddToCart && (
                            <Button
                                size="icon"
                                variant={isOutOfStock ? "ghost" : "default"}
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
                                className={cn(
                                    "rounded-full shadow-lg transition-transform active:scale-95",
                                    isOutOfStock && "opacity-50 cursor-not-allowed"
                                )}
                                title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                            >
                                <i className="fa-solid fa-cart-shopping text-sm"></i>
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
