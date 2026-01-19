"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { MAIN_CATEGORIES } from "@/utils/categories";
import ProductCard from "@/components/ProductCard";
import { formatCurrency } from "@/utils/format";

// --- Components ---

const CategoryHero = ({ category, totalProducts }) => {
    // Generate a consistent gradient based on category name length/char codes to be deterministic but varied
    const getGradient = (name) => {
        const gradients = [
            "from-purple-600 to-blue-600",
            "from-orange-500 to-red-600",
            "from-green-500 to-teal-500",
            "from-pink-500 to-rose-500",
            "from-blue-500 to-cyan-500",
            "from-indigo-600 to-violet-600"
        ];
        const index = name.length % gradients.length;
        return gradients[index];
    };

    const gradientClass = getGradient(category.name);

    return (
        <div className={`relative w-full h-80 bg-gradient-to-r ${gradientClass} rounded-3xl overflow-hidden mb-12 shadow-2xl`}>
            <div className="absolute inset-0 bg-black/20" /> {/* Overlay for contrast */}

            {/* Decorative Circles */}
            <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <nav className="flex items-center text-sm font-medium text-white/80 mb-4">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <i className="fa-solid fa-chevron-right text-xs mx-3"></i>
                        <span>{category.name}</span>
                    </nav>

                    <div className="flex items-center gap-6">
                        <span className="text-6xl md:text-7xl filter drop-shadow-lg transform hover:scale-110 transition-transform duration-300 cursor-default">
                            {category.emoji}
                        </span>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-2 tracking-tight">
                                {category.name}
                            </h1>
                            <p className="text-lg text-white/90 font-light">
                                {totalProducts} premium items selected for you
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FilterSection = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-gray-100 py-6 last:border-0">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full group mb-4"
        >
            <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                {title}
            </h3>
            <i className={`fa-solid fa-chevron-down text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>

        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="space-y-3 pt-1">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

export default function CategoryPage() {
    const { id: categoryNameEncoded } = useParams();
    const categoryName = decodeURIComponent(categoryNameEncoded || "");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter States
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState("popular");

    // Filter Accordion States
    const [openSections, setOpenSections] = useState({
        subcategories: true,
        price: true,
        brands: true,
        rating: true
    });

    const currentCategory = MAIN_CATEGORIES.find(c => c.name === categoryName);

    useEffect(() => {
        if (categoryName) {
            fetchProducts();
        }
    }, [categoryName]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Fetch from backend API which handles merging Main + Seller databases
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?category=${encodeURIComponent(categoryName)}&limit=100`);
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

    const toggleSubcategory = (sub) => {
        setSelectedSubcategories(prev =>
            prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
        );
    };

    const toggleBrand = (brand) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const clearFilters = () => {
        setSelectedSubcategories([]);
        setPriceRange([0, 500000]);
        setSelectedBrands([]);
        setMinRating(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-12 px-4 flex justify-center items-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600"></div>
                    <p className="text-gray-500 font-medium animate-pulse">Curating your collection...</p>
                </div>
            </div>
        );
    }

    if (!currentCategory) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 text-center bg-gray-50 flex flex-col items-center">
                <h1 className="text-4xl font-bold text-gray-900 font-playfair mb-4">Category not found</h1>
                <p className="text-gray-500 mb-8 max-w-md">We couldn't track down that category. It might have moved or doesn't exist.</p>
                <Link to="/" className="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full font-bold shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Return Home
                </Link>
            </div>
        );
    }

    const FilterContent = () => (
        <>
            <FilterSection title="Subcategories" isOpen={openSections.subcategories} onToggle={() => toggleSection('subcategories')}>
                {currentCategory.subcategories.map((sub) => (
                    <label key={sub} className="flex items-center cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="relative flex items-center">
                            <input
                                type="checkbox"
                                checked={selectedSubcategories.includes(sub)}
                                onChange={() => toggleSubcategory(sub)}
                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-primary-600 checked:bg-primary-600 focus:ring-2 focus:ring-primary-500/20"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100">
                                <i className="fa-solid fa-check text-white text-xs"></i>
                            </div>
                        </div>
                        <span className={`ml-3 text-sm transition-colors ${selectedSubcategories.includes(sub) ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                            {sub}
                        </span>
                    </label>
                ))}
            </FilterSection>

            <FilterSection title="Price Range" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                <div className="flex items-center gap-2 p-1">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                            className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder="Min"
                        />
                    </div>
                    <span className="text-gray-300 font-light">—</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                            className="w-full pl-6 pr-2 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                            placeholder="Max"
                        />
                    </div>
                </div>
            </FilterSection>

            {availableBrands.length > 0 && (
                <FilterSection title="Brands" isOpen={openSections.brands} onToggle={() => toggleSection('brands')}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {availableBrands.map((brand) => (
                            <label key={brand} className="flex items-center cursor-pointer group p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand)}
                                        onChange={() => toggleBrand(brand)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-primary-600 checked:bg-primary-600 focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity peer-checked:opacity-100">
                                        <i className="fa-solid fa-check text-white text-xs"></i>
                                    </div>
                                </div>
                                <span className={`ml-3 text-sm transition-colors ${selectedBrands.includes(brand) ? 'text-gray-900 font-semibold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    {brand}
                                </span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}

            <FilterSection title="Rating" isOpen={openSections.rating} onToggle={() => toggleSection('rating')}>
                {[4, 3, 2, 1].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                        className={`flex items-center w-full p-2 rounded-lg transition-all ${minRating === rating ? 'bg-primary-50 ring-1 ring-primary-200' : 'hover:bg-gray-50'}`}
                    >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors ${minRating === rating ? 'border-primary-600 bg-primary-600' : 'border-gray-300'}`}>
                            {minRating === rating && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <i
                                    key={i}
                                    className={`fa-solid fa-star text-sm mr-0.5 ${i < rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                ></i>
                            ))}
                            <span className={`ml-2 text-sm ${minRating === rating ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>& Up</span>
                        </div>
                    </button>
                ))}
            </FilterSection>

            <button
                onClick={clearFilters}
                className="w-full mt-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
                Reset All Filters
            </button>
        </>
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                <CategoryHero category={currentCategory} totalProducts={filteredProducts.length} />

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-20 z-30 bg-[#F8F9FA]/95 backdrop-blur-sm py-2">
                    <button
                        className="md:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold shadow-sm active:bg-gray-50"
                        onClick={() => setIsMobileFiltersOpen(true)}
                    >
                        <i className="fa-solid fa-sliders text-primary-600"></i>
                        Filter & Sort
                    </button>

                    <div className="hidden md:block text-gray-500 font-medium">
                        Showing {filteredProducts.length} results
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 hidden sm:inline">Sort by:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                        </div>
                    </div>
                </div>

                <div className="flex gap-10">
                    {/* Sidebar - Desktop */}
                    <div className="hidden md:block w-72 flex-shrink-0">
                        <div className="sticky top-40 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[80vh] overflow-y-auto custom-scrollbar">
                            <FilterContent />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.length > 0 ? (
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                                >
                                    {filteredProducts.map((product) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2 }}
                                            key={product.id}
                                        >
                                            <ProductCard
                                                product={product}
                                                showAddToCart={true}
                                                className="h-full border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 text-center"
                                >
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-bounce-slow">
                                        <i className="fa-solid fa-magnifying-glass text-4xl text-gray-300"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">No products found</h3>
                                    <p className="text-gray-500 mb-8 max-w-sm">
                                        We couldn't find any matches for your current filters. Try adjusting your criteria.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="px-8 py-3 bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50 rounded-xl font-bold transition-colors"
                                    >
                                        Clear all filters
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            <AnimatePresence>
                {isMobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 md:hidden font-inter">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl flex flex-col h-full"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="text-xl font-bold font-playfair">Filter & Sort</h2>
                                <button
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <i className="fa-solid fa-xmark text-lg text-gray-600"></i>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <FilterContent />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
