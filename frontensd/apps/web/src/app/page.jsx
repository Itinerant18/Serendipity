"use client";

import React, { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
// FontAwesome icons loaded globally

import useCartStore from "@/utils/cartStore";
import { MAIN_CATEGORIES } from "@/utils/categories";

// Lazy load heavy components
const EcommerceHero = lazy(() => import("@/components/ecommerce-hero").then(module => ({ default: module.EcommerceHero })));
const ProductCard = lazy(() => import("@/components/ProductCard"));
const MonochromaticCategories = lazy(() => import("@/components/monochromatic-categories").then(module => ({ default: module.MonochromaticCategories })));

export default function HomePage() {
    const heroSlides = [
        {
            id: "1",
            type: "image",
            src: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070&auto=format&fit=crop",
            title: "Discover Premium Sound",
            subtitle: "Unexpected Finds",
            description: "Stumble upon the perfect audio experience you didn't know you needed",
            category: "Electronics",
            discount: "30% OFF",
            ctaText: "Explore Now",
            ctaLink: "/category/Electronics",
            overlay: true,
        },
        {
            id: "2",
            type: "image",
            src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop",
            title: "Your Style Awaits",
            subtitle: "Serendipitous Fashion",
            description: "Let us surprise you with styles you'll love by chance",
            category: "Fashion",
            discount: "Up to 50% OFF",
            ctaText: "Find Your Look",
            ctaLink: "/category/Fashion",
            overlay: true,
        },
        {
            id: "3",
            type: "image",
            src: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=2070&auto=format&fit=crop",
            title: "Home Treasures",
            subtitle: "Discover by Chance",
            description: "Find that perfect piece that makes your house a home",
            category: "Home & Living",
            discount: "25% OFF",
            ctaText: "Discover More",
            ctaLink: "/category/Home%20%26%20Living",
            overlay: true,
        },
        {
            id: "4",
            type: "image",
            src: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=2080&auto=format&fit=crop",
            title: "Beauty By Chance",
            subtitle: "Happy Discoveries",
            description: "Uncover beauty products you'll wonder how you lived without",
            category: "Beauty",
            discount: "Buy 2 Get 1 Free",
            ctaText: "Explore Beauty",
            ctaLink: "/category/Beauty",
            overlay: true,
        },
        {
            id: "5",
            type: "image",
            src: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=2070&auto=format&fit=crop",
            title: "Gear Up for Action",
            subtitle: "Athletic Discoveries",
            description: "Find the perfect equipment to fuel your next adventure",
            category: "Sports",
            discount: "20% OFF",
            ctaText: "Shop Sports",
            ctaLink: "/category/Sports",
            overlay: true,
        },
        {
            id: "6",
            type: "image",
            src: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?q=80&w=2070&auto=format&fit=crop",
            title: "Stories Await",
            subtitle: "Literary Treasures",
            description: "Discover your next favorite read in our curated collection",
            category: "Books",
            discount: "15% OFF",
            ctaText: "Browse Books",
            ctaLink: "/category/Books",
            overlay: true,
        }
    ];

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
            <Suspense fallback={<div className="h-[600px] bg-gray-200 animate-pulse"></div>}>
                <EcommerceHero
                    slides={heroSlides}
                    autoplayDelay={4000}
                    showCategories={false}
                    showDots={true}
                />
            </Suspense>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 font-playfair">
                            Featured Products
                        </h2>
                        <Link
                            to="/products"
                            className="text-[#D97534] hover:text-[#C86429] font-semibold text-sm flex items-center gap-1"
                        >
                            View All
                            <i className="fa-solid fa-arrow-right text-base"></i>
                        </Link>
                    </div>

                    {loading ? (
                        <LoadingSpinner />
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-gray-500 mb-4">{error.message || "Something went wrong"}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn-primary"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : featuredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl">
                            <p className="text-gray-500 mb-4">No products available yet.</p>
                            <Link to="/seller/signup" className="btn-primary inline-flex items-center gap-2">
                                Become a Seller
                                <i className="fa-solid fa-arrow-right text-base"></i>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <Suspense fallback={<LoadingSpinner />}>
                                {featuredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id || product._id}
                                        product={product}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </Suspense>
                        </div>
                    )}
                </section>

                {/* Why Shop With Us Section */}
                <section className="mb-16 bg-slate-50 rounded-2xl p-8 md:p-12 border border-slate-100">
                    <h2 className="text-2xl font-bold text-gray-900 font-playfair text-center mb-10">
                        Why Shop With Us
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">🚚</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Free Shipping</h3>
                            <p className="text-gray-500 text-sm">Free shipping on orders over ₹499</p>
                        </div>

                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">🔒</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Secure Payment</h3>
                            <p className="text-gray-500 text-sm">100% secure payment processing</p>
                        </div>

                        <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="text-3xl">↩️</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Easy Returns</h3>
                            <p className="text-gray-500 text-sm">30-day hassle-free returns</p>
                        </div>
                    </div>
                </section>

                {/* Become a Seller CTA */}
                <section className="mb-8">
                    <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] rounded-2xl p-8 md:p-12 text-center text-white">
                        <h2 className="text-2xl md:text-3xl font-bold mb-4 font-playfair">
                            Start Selling Today
                        </h2>
                        <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                            Join thousands of sellers and reach millions of customers. Set up your store in minutes and start earning.
                        </p>
                        <Link
                            to="/seller/signup"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#febd69] hover:bg-[#f3a847] text-[#232f3e] font-bold rounded-lg transition-all duration-200 hover:shadow-lg"
                        >
                            Become a Seller
                            <i className="fa-solid fa-arrow-right text-xl"></i>
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
