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

export default function HomePage() {
    const addToCart = useCartStore((state) => state.addToCart);

    const { data: products = [], isLoading: loading, error } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/products`);
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
            <i className="fa-solid fa-spinner fa-spin text-3xl text-[#D97534]"></i>
            <span className="ml-3 text-gray-600">Loading...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F3F3F3]">
            {/* Hero Section */}
            <Suspense fallback={<div className="h-[70vh] min-h-[500px] max-h-[800px] bg-black flex items-center justify-center"><i className="fa-solid fa-spinner fa-spin text-white/20 text-4xl"></i></div>}>
                <LuminaHero />
            </Suspense>

            {/* Main Content */}
            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Categories Section */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 font-playfair">
                            Shop by Category
                        </h2>
                        <Link
                            to="/products"
                            className="text-[#D97534] hover:text-[#C86429] font-semibold text-sm flex items-center gap-1"
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

                {/* Why Shop With Us Section */}
                <section className="mb-16 bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-100">
                    <h2 className="text-2xl font-bold text-gray-900 font-playfair text-center mb-10">
                        Why Shop With Us
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <i className="fa-solid fa-truck text-2xl text-green-600"></i>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
                            <p className="text-gray-500 text-sm">Free shipping on orders over ₹499</p>
                        </div>

                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <i className="fa-solid fa-lock text-2xl text-blue-600"></i>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
                            <p className="text-gray-500 text-sm">100% secure payment processing</p>
                        </div>

                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                                <i className="fa-solid fa-rotate-left text-2xl text-orange-600"></i>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
                            <p className="text-gray-500 text-sm">30-day hassle-free returns</p>
                        </div>
                    </div>
                </section>

                {/* Become a Seller CTA */}
                <Suspense fallback={<div className="h-[500px] bg-stone-900/50 rounded-[48px] animate-pulse" />}>
                    <BecomeSellerSection />
                </Suspense>
            </main>
        </div>
    );
}
