"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import useWishlistStore from "@/utils/wishlistStore";
import useAuth from "@/utils/useAuth";

// Types
interface Product {
    id: number | string;
    name: string;
    price: number | string;
    image?: string;
    category?: string;
    rating?: number;
    reviews?: number;
}

interface FeaturedProductsProps {
    products?: Product[];
    title?: string;
    subtitle?: string;
    onAddToCart?: (product: Product) => void;
}

// Clean Product Card
const ProductCard = ({
    product,
    onAddToCart,
    index
}: {
    product: Product;
    onAddToCart: (product: Product) => void;
    index: number;
}) => {
    const [imgSrc, setImgSrc] = useState(product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop");
    const [imgLoaded, setImgLoaded] = useState(false);

    // Global State
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const isWishlisted = isInWishlist(product.id);

    useEffect(() => {
        setImgSrc(product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop");
    }, [product.image]);

    const rating = product.rating || 4.5;
    const reviews = product.reviews || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className={cn(
                "group relative bg-white rounded-2xl overflow-hidden",
                "shadow-sm hover:shadow-xl transition-all duration-300",
                "hover:-translate-y-1"
            )}
        >
            {/* Wishlist Button */}
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    if (!isAuthenticated) {
                        navigate('/account/signin');
                        return;
                    }

                    if (isWishlisted) {
                        removeFromWishlist(product.id);
                    } else {
                        addToWishlist(product);
                    }
                }}
                className={cn(
                    "absolute top-4 right-4 z-20 w-9 h-9 rounded-full",
                    "bg-white/90 backdrop-blur-sm shadow-sm",
                    "flex items-center justify-center transition-all duration-200",
                    "hover:scale-110",
                    isWishlisted ? "text-red-500" : "text-stone-400 hover:text-red-500"
                )}
            >
                <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart text-sm`}></i>
            </button>

            {/* Product Link */}
            <Link to={`/product/${product.id}`} className="block">
                {/* Image Container */}
                <div className="relative aspect-square bg-stone-50 overflow-hidden">
                    {/* Loading State */}
                    {!imgLoaded && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-stone-200 animate-pulse"></div>
                        </div>
                    )}

                    <img
                        src={imgSrc}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=400&auto=format&fit=crop")}
                        alt={product.name}
                        className={cn(
                            "w-full h-full object-contain p-6",
                            "transition-transform duration-500 group-hover:scale-105",
                            imgLoaded ? "opacity-100" : "opacity-0"
                        )}
                    />
                </div>

                {/* Product Info */}
                <div className="p-5">
                    {/* Category */}
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2">
                        {product.category || "General"}
                    </p>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-stone-900 leading-tight line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
                        {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <i
                                key={star}
                                className={cn(
                                    "text-xs",
                                    star <= Math.floor(rating)
                                        ? "fa-solid fa-star text-amber-400"
                                        : star === Math.ceil(rating) && rating % 1 >= 0.5
                                            ? "fa-solid fa-star-half-stroke text-amber-400"
                                            : "fa-regular fa-star text-stone-300"
                                )}
                            ></i>
                        ))}
                        <span className="text-xs text-stone-400 ml-1">({reviews})</span>
                    </div>

                    {/* Price & Add to Cart */}
                    <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-stone-900">
                            {typeof product.price === 'number' ? `₹${product.price.toLocaleString()}` : product.price}
                        </span>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddToCart(product);
                            }}
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                "bg-stone-900 text-white",
                                "transition-all duration-200",
                                "hover:bg-amber-500 hover:scale-110"
                            )}
                        >
                            <i className="fa-solid fa-plus text-sm"></i>
                        </button>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};


export default function FeaturedProducts({
    products = [],
    title = "Featured Products",
    subtitle = "Handpicked for you",
    onAddToCart
}: FeaturedProductsProps) {
    // Fallback products
    const displayProducts = products.length > 0 ? products : [
        { id: 101, name: "Premium Wireless Headphones", price: 2499, category: "Audio", rating: 4.5, reviews: 128 },
        { id: 102, name: "Classic Running Shoes", price: 8999, category: "Footwear", rating: 4.8, reviews: 256 },
        { id: 103, name: "Smart Portable Charger", price: 1999, category: "Tech", rating: 4.2, reviews: 89 },
        { id: 104, name: "Minimalist Watch", price: 5500, category: "Accessories", rating: 4.7, reviews: 312 }
    ];

    return (
        <section className="relative py-20 px-4 bg-gradient-to-b from-stone-50 to-stone-100">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-stone-900 mb-2"
                        >
                            {title}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-stone-500"
                        >
                            {subtitle}
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-600 font-medium transition-colors group"
                        >
                            View All
                            <i className="fa-solid fa-arrow-right text-sm group-hover:translate-x-1 transition-transform"></i>
                        </Link>
                    </motion.div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.slice(0, 8).map((product, idx) => (
                        <ProductCard
                            key={product.id || idx}
                            product={product}
                            index={idx}
                            onAddToCart={(p) => {
                                console.log("Added to cart:", p.name);
                                if (onAddToCart) onAddToCart(p);
                            }}
                        />
                    ))}
                </div>

                {/* Empty State */}
                {displayProducts.length === 0 && (
                    <div className="text-center py-20">
                        <i className="fa-solid fa-box-open text-5xl text-stone-300 mb-4"></i>
                        <p className="text-stone-500">No products available</p>
                    </div>
                )}
            </div>
        </section>
    );
}
