"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_CATEGORIES } from "@/utils/categories";
import ProductCard from "@/components/ProductCard";
import GlassCard from "@/components/ui/GlassCard";
import useCartStore from "@/utils/cartStore";

// --- Components ---

const CategoryHero = ({ category, totalProducts }) => {
    // Media handling
    const mediaSrc = category.image || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop";
    const isVideo = category.video ? true : false;

    return (
        <div className="relative w-full h-[350px] md:h-[450px] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl ring-1 ring-white/20 bg-gray-900 group">
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

const FilterSection = ({ title, children, isOpen, onToggle }) => (
    <div className="border-b border-gray-100/50 py-5 last:border-0">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full group py-2"
        >
            <h3 className="font-bold text-slate-800 text-base group-hover:text-sky-600 transition-colors">
                {title}
            </h3>
            <span className={`w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-all ${isOpen ? 'bg-sky-100 text-sky-600 rotate-180' : 'text-slate-400'}`}>
                <i className="fa-solid fa-chevron-down text-xs"></i>
            </span>
        </button>

        <AnimatePresence initial={false}>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "circOut" }}
                    className="overflow-hidden"
                >
                    <div className="space-y-3 pt-3 pb-1">
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

    const addToCart = useCartStore((state) => state.addToCart);
    const handleAddToCart = (product) => {
        addToCart(product);
    };

    // Filter States
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState("popular");

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

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

    // Reset page when keyword/filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [categoryName, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
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

    // Subcategory Icon Lookup
    const subcategoryIconMap = useMemo(() => {
        return currentCategory?.subcategoryIcons || {};
    }, [currentCategory]);

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

    const FilterContent = () => (
        <>
            <FilterSection title="Subcategories" isOpen={openSections.subcategories} onToggle={() => toggleSection('subcategories')}>
                {currentCategory.subcategories.map((sub) => {
                    const iconClass = subcategoryIconMap[sub] || 'fa-solid fa-circle-small';
                    return (
                        <label key={sub} className="flex items-center cursor-pointer group p-3 hover:bg-slate-50/80 rounded-xl transition-all duration-200">
                            <div className="relative flex items-center justify-center w-5 h-5">
                                <input
                                    type="checkbox"
                                    checked={selectedSubcategories.includes(sub)}
                                    onChange={() => toggleSubcategory(sub)}
                                    className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-sky-500 checked:border-sky-500 transition-all"
                                />
                                <i className="fa-solid fa-check text-white text-[10px] absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                            </div>
                            <span className="ml-3 text-sm flex items-center gap-3 flex-1">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${selectedSubcategories.includes(sub) ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:scale-110'}`}>
                                    <i className={`${iconClass} text-xs`}></i>
                                </span>
                                <span className={`font-medium transition-colors ${selectedSubcategories.includes(sub) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
                                    {sub}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </FilterSection>

            <FilterSection title="Price Range" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                <div className="px-1 py-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1 group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all group-hover:bg-white"
                                placeholder="Min"
                            />
                        </div>
                        <span className="text-slate-300 font-medium">-</span>
                        <div className="relative flex-1 group">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
                            <input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                className="w-full pl-7 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all group-hover:bg-white"
                                placeholder="Max"
                            />
                        </div>
                    </div>
                    {/* Visual Range Indicator (Simulated) */}
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500/30 w-full" />
                    </div>
                </div>
            </FilterSection>

            {availableBrands.length > 0 && (
                <FilterSection title="Brands" isOpen={openSections.brands} onToggle={() => toggleSection('brands')}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 -mr-1">
                        {availableBrands.map((brand) => (
                            <label key={brand} className="flex items-center cursor-pointer group p-2.5 hover:bg-slate-50/80 rounded-xl transition-all">
                                <div className="relative flex items-center justify-center w-5 h-5">
                                    <input
                                        type="checkbox"
                                        checked={selectedBrands.includes(brand)}
                                        onChange={() => toggleBrand(brand)}
                                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-md checked:bg-sky-500 checked:border-sky-500 transition-all"
                                    />
                                    <i className="fa-solid fa-check text-white text-[10px] absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></i>
                                </div>
                                <span className={`ml-3 text-sm font-medium transition-colors ${selectedBrands.includes(brand) ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>
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
                        className={`flex items-center w-full p-2.5 rounded-xl transition-all mb-1 ${minRating === rating ? 'bg-amber-50 ring-1 ring-amber-200 shadow-sm' : 'hover:bg-slate-50'}`}
                    >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 transition-colors ${minRating === rating ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                            <div className={`w-2 h-2 bg-white rounded-full transition-transform ${minRating === rating ? 'scale-100' : 'scale-0'}`} />
                        </div>
                        <div className="flex items-center flex-1">
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <i
                                        key={i}
                                        className={`fa-solid fa-star text-xs ${i < rating ? 'text-amber-400' : 'text-slate-200'}`}
                                    ></i>
                                ))}
                            </div>
                            <span className={`ml-2 text-xs font-semibold uppercase tracking-wide ${minRating === rating ? 'text-amber-700' : 'text-slate-400'}`}>& Up</span>
                        </div>
                    </button>
                ))}
            </FilterSection>

            <button
                onClick={clearFilters}
                className="w-full mt-8 py-3.5 bg-slate-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-slate-900/10 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-95 flex items-center justify-center gap-2"
            >
                <i className="fa-solid fa-rotate-right"></i> Reset All Filters
            </button>
        </>
    );

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
                    {/* Sidebar - Desktop Glass Panel */}
                    <div className="hidden md:block w-[280px] shrink-0">
                        <div className="sticky top-28 bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-glass border border-white/40 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
                            <FilterContent />
                        </div>
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
                                                    className="h-full border-white/40 bg-white/60 backdrop-blur-lg hover:bg-white/80 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
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

            {/* Mobile Filters Overlay - Glassmorphism */}
            <AnimatePresence>
                {isMobileFiltersOpen && (
                    <div className="fixed inset-0 z-50 md:hidden font-sans">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="absolute inset-y-0 right-0 w-full max-w-sm bg-white/90 backdrop-blur-2xl shadow-2xl flex flex-col h-full border-l border-white/50"
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
                                <h2 className="text-2xl font-bold font-playfair text-slate-900">Filter & Sort</h2>
                                <button
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-red-50 hover:text-red-500 transition-all font-bold"
                                >
                                    <i className="fa-solid fa-xmark text-lg"></i>
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8">
                                <FilterContent />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
