"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import useWishlistStore from "@/utils/wishlistStore";
import useAuth from "@/utils/useAuth";
import ProductCard from "@/components/ProductCard";
import GlassCard from "@/components/ui/GlassCard";
import { formatCurrency } from "@/utils/format";

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

// Utility to format FeaturedProducts data to match ProductCard interface
const formatProductForCard = (product: Product) => ({
    id: product.id,
    _id: product.id,
    name: product.name,
    price: typeof product.price === 'number' ? product.price : parseFloat(product.price?.replace(/[^0-9.]/g, '') || '0'),
    image: product.image,
    category: product.category,
    rating: product.rating || 4.5,
    num_reviews: product.reviews || 0,
    brand: product.category || 'Featured',
    count_in_stock: 10, // Default stock for featured products
    discount: 0,
    compare_at_price: null
});

interface FeaturedProductsProps {
    products?: Product[];
    title?: string;
    subtitle?: string;
    onAddToCart?: (product: Product) => void;
}




export default function FeaturedProducts({
    products = [],
    title = "Featured Products",
    subtitle = "Handpicked for you",
    onAddToCart
}: FeaturedProductsProps) {
    // Fallback products
    const displayProducts = products.length > 0 ? products : [
        { id: 101, name: "Premium Wireless Headphones", price: 2499, category: "Audio", rating: 4.5, reviews: 128, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=600&auto=format&fit=crop" },
        { id: 102, name: "Classic Running Shoes", price: 8999, category: "Footwear", rating: 4.8, reviews: 256, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop" },
        { id: 103, name: "Smart Portable Charger", price: 1999, category: "Tech", rating: 4.2, reviews: 89, image: "https://images.unsplash.com/photo-1622956294713-33bc2385cc2f?q=80&w=600&auto=format&fit=crop" },
        { id: 104, name: "Minimalist Watch", price: 5500, category: "Accessories", rating: 4.7, reviews: 312, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop" }
    ];

    return (
        <GlassCard className="py-16 px-4 mb-8" variant="elevated">
            <div className="max-w-7xl mx-auto">

                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
                    <div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-brutalist font-bold text-black bg-black text-white px-6 py-3 border-4 border-r-8 border-l-8 border-t-0 border-b-8 mb-4 brutalist-text-gradient animate-brutalist-fadeIn"
                        >
                            {title.toUpperCase()}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-lg text-black font-bold bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 border-4 border-black inline-block animate-brutalist-fadeIn"
                        >
                            {subtitle.toUpperCase()}
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all duration-300 btn-brutalist animate-brutalist-scale"
                        >
                            VIEW ALL
                            <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                    </motion.div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayProducts.slice(0, 8).map((product, idx) => (
                        <motion.div
                            key={product.id || idx}
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.6, delay: idx * 0.15, type: "spring", stiffness: 100 }}
                            className="animate-brutalist-fadeIn"
                            style={{ animationDelay: `${idx * 150}ms` }}
                        >
                            <ProductCard
                                product={formatProductForCard(product)}
                                onAddToCart={(p: Product) => {
                                    console.log("Added to cart:", p.name);
                                    if (onAddToCart) onAddToCart(p);
                                }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {displayProducts.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-500 border-4 border-black flex items-center justify-center mx-auto mb-6 animate-brutalist-jitter">
                            <i className="fa-solid fa-box-open text-4xl text-black"></i>
                        </div>
                        <h3 className="text-3xl font-brutalist font-bold text-black bg-black text-white px-6 py-2 border-4 border-white inline-block mb-4 animate-brutalist-shake">
                            NO PRODUCTS AVAILABLE
                        </h3>
                        <p className="text-black font-bold bg-gradient-to-r from-red-400 to-pink-500 px-4 py-2 border-4 border-black inline-block animate-brutalist-pulse">
                            CHECK BACK LATER FOR AMAZING DEALS!
                        </p>
                    </div>
                )}
            </div>
        </GlassCard>
    );
}
