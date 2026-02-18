"use client";

import { API_URL } from '@/lib/api';
import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_CATEGORIES } from "@/utils/categories";
import ProductCard from "@/components/ProductCard";
import GlassCard from "@/components/ui/GlassCard";
import useCartStore from "@/utils/cartStore";
import FilterPanel from "@/components/filters/FilterPanel";
import MobileFilterModal from "@/components/filters/MobileFilterModal";
import { useProductFilters } from "@/hooks/useProductFilters";

const CategoryHero = ({ category, totalProducts }) => {
    // Media handling
    const mediaSrc = category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop";
    const isVideo = category.video ? true : false;

    return (
        <div className="relative w-full h-[350px] md:h-[450px] border-4 border-black overflow-hidden mb-12 shadow-[12px_12px_0_#ffffff] bg-black group">
            {/* Background Media (Blurred) */}
            <div className="absolute inset-0 overflow-hidden">
                {isVideo ? (
                    <video
                        src={category.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover blur-xl opacity-60 scale-110"
                    />
                ) : (
                    <img
                        src={mediaSrc}
                        alt="Background"
                        className="w-full h-full object-cover blur-xl opacity-60 scale-110 transition-transform duration-1000 group-hover:scale-125"
                    />
                )}
            </div>

            {/* Overlay Gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-black/20" />

            {/* Content Content - Centered & Floating */}
            <div className="relative z-10 h-full flex flex-col justify-end pb-12 px-8 md:px-16 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                    className="flex flex-col md:flex-row items-end gap-8"
                >
                    {/* Floating Main Image (Thumbnail style) */}
                    <div className="hidden md:block w-48 h-48 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white/20 shrink-0 transform rotate-[-6deg] hover:rotate-0 transition-all duration-500">
                        <img
                            src={mediaSrc}
                            alt={category.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                    </div>

                    <div className="flex-1 mb-2">
                        <nav className="flex items-center text-xs font-bold text-white/70 mb-4 tracking-widest uppercase">
                            <Link to="/" className="hover:text-white transition-colors">Home</Link>
                            <i className="fa-solid fa-chevron-right text-[8px] mx-3 opacity-50"></i>
                            <span className="text-white text-shadow-sm">{category.name}</span>
                        </nav>

                        <div className="flex items-center gap-4 mb-2">
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: "spring" }}
                                className="text-4xl md:text-5xl filter drop-shadow-2xl"
                            >
                                {category.emoji}
                            </motion.span>
                            <h1 className="text-4xl md:text-6xl font-bold font-playfair tracking-tight leading-none drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                                {category.name}
                            </h1>
                        </div>

                        <p className="text-lg text-white/80 font-medium max-w-xl leading-relaxed text-shadow-sm border-l-2 border-sky-500/50 pl-4 mt-4">
                            Discover {totalProducts} curated products in our {category.name} collection.
                            Handpicked for quality and style.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default function CategoryPage() {
    const { id: categoryNameEncoded } = useParams();
    const categoryName = decodeURIComponent(categoryNameEncoded || "");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const addToCart = useCartStore((state) => state.addToCart);
    const handleAddToCart = (product) => {
        addToCart(product);
    };

    // Use Shared Hook for Filters & URL Persistence
    const {
        selectedSubcategories, setSelectedSubcategories,
        selectedBrands, setSelectedBrands,
        priceRange, setPriceRange,
        minRating, setMinRating,
        sortBy, setSortBy,
        clearFilters
    } = useProductFilters();

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const currentCategory = MAIN_CATEGORIES.find(c => c.name === categoryName);

    useEffect(() => {
        if (categoryName) {
            fetchProducts();
        }
    }, [categoryName]);

    // Reset page when keyword/filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryName, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/products?category=${encodeURIComponent(categoryName)}&limit=100`);
            const data = await response.json();

            if (!response.ok) throw new Error(data.message || 'Failed to fetch products');

            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const availableBrands = useMemo(() => {
        const brands = new Set(products.map(p => p.brand).filter(Boolean));
        return Array.from(brands).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (selectedSubcategories.length > 0) {
                const sub = product.subcategory;
                if (!sub || !selectedSubcategories.includes(sub)) return false;
            }
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
            if ((product.rating || 0) < minRating) return false;
            return true;
        }).sort((a, b) => {
            switch (sortBy) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                case "newest": return new Date(b.created_at) - new Date(a.created_at);
                case "popular": default: return (b.num_reviews || 0) - (a.num_reviews || 0);
            }
        });
    }, [products, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-12 px-4 flex justify-center items-center bg-[#FDFDFE]">
                <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-sky-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <i className="fa-solid fa-bolt text-sky-500 text-xl animate-pulse"></i>
                        </div>
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide animate-pulse">Curating Application...</p>
                </div>
            </div>
        );
    }

    if (!currentCategory) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 text-center bg-gray-50 flex flex-col items-center">
                <div className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-white/50">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-heart-crack text-3xl text-red-500"></i>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 font-playfair mb-4">Category not found</h1>
                    <p className="text-slate-500 mb-8 leading-relaxed">We couldn't track down that category. It might have moved or doesn't exist.</p>
                    <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 transition-all hover:scale-105 active:scale-95">
                        <i className="fa-solid fa-arrow-left"></i> Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFDFE]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

                <CategoryHero category={currentCategory} totalProducts={filteredProducts.length} />

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-24 z-30 p-2 rounded-2xl transition-all duration-300">
                    <button
                        className="md:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white/80 backdrop-blur-xl border border-white/40 rounded-xl text-sm font-bold shadow-glass active:scale-95 transition-all text-slate-700"
                        onClick={() => setIsMobileFiltersOpen(true)}
                    >
                        <i className="fa-solid fa-sliders text-sky-500"></i>
                        Filters
                    </button>

                    <GlassCard className="hidden md:flex items-center px-5 py-2.5 bg-white/70 backdrop-blur-md border-white/50 rounded-xl shadow-sm gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-slate-600 font-medium text-sm">
                            <span className="text-slate-900 font-bold">{filteredProducts.length}</span> results found
                        </span>
                    </GlassCard>

                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-3 bg-white/70 backdrop-blur-xl border border-white/50 rounded-xl text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/20 hover:bg-white transition-all shadow-sm cursor-pointer min-w-[160px]"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none group-hover:text-sky-500 transition-colors"></i>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* Sidebar - Desktop (Now using new FilterPanel but keeping layout) */}
                    <div className="hidden md:block w-[280px] shrink-0 sticky top-28 h-fit">
                        <FilterPanel
                            subcategories={currentCategory.subcategories}
                            brands={availableBrands}
                            priceRange={priceRange}
                            selectedSubcategories={selectedSubcategories}
                            selectedBrands={selectedBrands}
                            minRating={minRating}
                            onSubcategoryChange={setSelectedSubcategories}
                            onBrandChange={setSelectedBrands}
                            onPriceRangeChange={setPriceRange}
                            onRatingChange={setMinRating}
                            onClearAll={clearFilters}
                            // We don't need categories in category page
                            categories={[]}
                        />
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {paginatedProducts.length > 0 ? (
                                <>
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                                    >
                                        {paginatedProducts.map((product) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                                transition={{ duration: 0.4, ease: "backOut" }}
                                                key={product.id}
                                            >
                                                <ProductCard
                                                    product={product}
                                                    showAddToCart={true}
                                                    onAddToCart={handleAddToCart}
                                                    className="h-full border-4 border-black bg-white hover:bg-pink-500 hover:text-white hover:border-white hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-transform duration-100"
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {/* Glass Pagination */}
                                    {totalPages > 1 && (
                                        <div className="mt-16 flex justify-center items-center gap-3">
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 text-slate-500 hover:bg-white hover:text-sky-600 disabled:opacity-40 disabled:hover:bg-white/60 disabled:hover:text-slate-500 transition-all shadow-sm"
                                            >
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>

                                            <div className="flex gap-2 px-4 py-2 bg-white/40 backdrop-blur-md rounded-2xl border border-white/30">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    const page = i + 1;
                                                    if (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => handlePageChange(page)}
                                                                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold transition-all ${currentPage === page
                                                                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30 scale-110'
                                                                    : 'text-slate-500 hover:bg-white/80'
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    } else if (
                                                        (page === currentPage - 2 && page > 2) ||
                                                        (page === currentPage + 2 && page < totalPages - 1)
                                                    ) {
                                                        return <span key={page} className="w-8 flex items-center justify-center text-slate-300 font-bold">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md border border-white/40 text-slate-500 hover:bg-white hover:text-sky-600 disabled:opacity-40 disabled:hover:bg-white/60 disabled:hover:text-slate-500 transition-all shadow-sm"
                                            >
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center justify-center py-32 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border border-dashed border-slate-200 text-center"
                                >
                                    <div className="w-28 h-28 bg-white/80 rounded-full shadow-xl flex items-center justify-center mb-8 animate-bounce-slow ring-4 ring-white/50">
                                        <i className="fa-solid fa-magnifying-glass text-5xl text-sky-200"></i>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3 font-playfair">No products matches found</h3>
                                    <p className="text-slate-500 mb-10 max-w-sm text-lg leading-relaxed">
                                        We couldn't find any matches for your current filters. Try adjusting your criteria.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-10 py-4 bg-white border border-sky-100 text-sky-600 hover:bg-sky-50 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                                    >
                                        Clear all filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Filters Overlay - Now using standard Brutalist one */}
            <MobileFilterModal
                isOpen={isMobileFiltersOpen}
                onClose={() => setIsMobileFiltersOpen(false)}
                subcategories={currentCategory.subcategories}
                brands={availableBrands}
                priceRange={priceRange}
                selectedSubcategories={selectedSubcategories}
                selectedBrands={selectedBrands}
                minRating={minRating}
                onSubcategoryChange={setSelectedSubcategories}
                onBrandChange={setSelectedBrands}
                onPriceRangeChange={setPriceRange}
                onRatingChange={setMinRating}
                onClearAll={clearFilters}
            />
        </div>
    );
}
