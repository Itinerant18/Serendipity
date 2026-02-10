"use client";

import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// FontAwesome icons loaded globally

import useCartStore from "@/utils/cartStore";
import { MAIN_CATEGORIES } from "@/utils/categories";

// Lazy load heavy components
const LuminaHero = lazy(() => import("@/components/ui/lumina-interactive-list").then(module => ({ default: module.Component })));
const ProductCard = lazy(() => import("@/components/ProductCard"));
const MonochromaticCategories = lazy(() => import("@/components/monochromatic-categories").then(module => ({ default: module.MonochromaticCategories })));
const FeaturedProducts = lazy(() => import("@/components/FeaturedProducts"));
const BecomeSellerSection = lazy(() => import("@/components/ui/hero-dithering-card").then(module => ({ default: module.BecomeSellerSection })));
const ShopWithUsSection = lazy(() => import("@/components/sections/ShopWithUsSection"));

export default function HomePage() {
    const addToCart = useCartStore((state) => state.addToCart);

    const { data: products = [], isLoading: loading, error } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api/products`);
            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }
            const data = await response.json();
            return data.products || [];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const handleAddToCart = (product) => {
        addToCart(product);
        // Optional: Toast notification here instead of alert
        // alert(`Added "${product.name}" to cart!`); 
    };

    // Get featured products (first 8)
    const featuredProducts = products.slice(0, 8);

    // Fallback loading component
    const LoadingSpinner = () => (
        <div className="flex items-center justify-center py-20">
            <div className="relative">
                <i className="fa-solid fa-spinner fa-spin text-5xl text-[#D97534] animate-brutalist-scale"></i>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/20 to-transparent animate-pulse"></div>
            </div>
            <span className="ml-3 text-gray-600 font-bold animate-brutalist-pulse">Loading amazing products...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-white border-8 border-black animated-gradient">
            {/* Hero Section */}
            <Suspense fallback={<div className="h-[70vh] min-h-[500px] max-h-[800px] bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-white text-4xl animate-brutalist-scale"></i></div>}>
                <LuminaHero />
            </Suspense>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Categories Section */}
                <section className="mb-16 bg-gradient-to-br from-white/50 via-transparent to-purple-50/30 py-8 animate-brutalist-fadeIn">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 font-playfair brutalist-text-gradient animate-brutalist-fadeIn">
                            Shop by Category
                        </h2>
                        <Link
                            to="/products"
                            className="text-[#D97534] hover:text-[#C86429] font-semibold text-sm flex items-center gap-1 btn-brutalist transition-all duration-300 hover-brutalist-sm"
                        >
                            View All
                            <i className="fa-solid fa-arrow-right text-base"></i>
                        </Link>
                    </div>

                    <Suspense fallback={<LoadingSpinner />}>
                        <MonochromaticCategories
                            title="Explore Categories"
                            subtitle="Discover our curated collection across diverse categories"
                            categories={MAIN_CATEGORIES.map((c) => ({
                                id: c.name,
                                name: c.name,
                                mediaUrl: c.image,
                                mediaType: "image",
                                description: `Shop ${c.name} across ${c.subcategories.length} subcategories.`,
                            }))}
                        />
                    </Suspense>
                </section>

                {/* Featured Products Section */}
                {/* Featured Products Section */}
                <Suspense fallback={<LoadingSpinner />}>
                    <FeaturedProducts
                        products={featuredProducts}
                        onAddToCart={addToCart}
                    />
                </Suspense>

                {/* Enhanced Shop With Us Section */}
                <Suspense fallback={<div className="h-[500px] bg-stone-900/50 rounded-[48px] animate-pulse" />}>
                    <ShopWithUsSection />
                </Suspense>

                {/* Become a Seller CTA */}
                <Suspense fallback={<div className="h-[500px] bg-stone-900/50 rounded-[48px] animate-pulse" />}>
                    <BecomeSellerSection />
                </Suspense>
            </main>
        </div>
    );
}
