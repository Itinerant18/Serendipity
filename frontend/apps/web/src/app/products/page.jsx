
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_CATEGORIES } from "@/utils/categories";
import CollectionHero from "@/components/CollectionHero";
import ProductCard from "@/components/ProductCard";
import DualRangeSlider from "@/components/ui/DualRangeSlider";
import GlassCard from "@/components/ui/GlassCard";
import AnimatedCheckbox from "@/components/ui/AnimatedCheckbox";
import useCartStore from "@/utils/cartStore";

// --- Components ---

const FilterSection = ({ title, children, isOpen, onToggle, icon }) => (
    <div className="border-b border-sky-100 py-5 last:border-0 border-opacity-60">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full group outline-none focus:outline-none"
        >
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                {icon && (
                    <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-transform duration-100">
                        <i className={`fa-solid ${icon}`}></i>
                    </div>
                )}
                <span className="group-hover:text-sky-700 transition-colors">{title}</span>
            </h3>
            <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-8 h-8 border-2 border-black bg-black flex items-center justify-center text-white group-hover:bg-white group-hover:text-black group-hover:border-white transition-transform duration-100"
            >
                <i className="fa-solid fa-chevron-down text-xs"></i>
            </motion.span>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2"
                >
                    <div className="space-y-1 pt-2 pb-2">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
);

const ActiveFilterChip = ({ label, onRemove }) => (
    <motion.button
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        onClick={onRemove}
        className="flex items-center gap-2 px-4 py-1.5 bg-pink-500 text-white border-4 border-black text-sm font-bold hover:bg-orange-500 hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-transform duration-100"
    >
        <span>{label}</span>
        <i className="fa-solid fa-xmark text-xs opacity-60 group-hover:opacity-100"></i>
    </motion.button>
);

export default function ProductsPage() {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const addToCart = useCartStore((state) => state.addToCart);
    const handleAddToCart = (product) => {
        addToCart(product);
    };

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [brandSearch, setBrandSearch] = useState("");
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState("popular");

    const [openSections, setOpenSections] = useState({
        categories: true,
        subcategories: true,
        price: true,
        brands: true,
        rating: true
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:5000')}/api/products?limit=1000`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch products');
            setProducts(data.products || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const availableCategories = MAIN_CATEGORIES;
    const availableSubcategories = useMemo(() => {
        const constantSubcats = MAIN_CATEGORIES.flatMap(c => c.subcategories);
        const productSubcats = products.map(p => p.subcategory).filter(Boolean);
        return [...new Set([...constantSubcats, ...productSubcats])].sort();
    }, [products]);

    const availableBrands = useMemo(() => {
        const brands = new Set(products.map(p => p.brand).filter(Boolean));
        return Array.from(brands).sort();
    }, [products]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) return false;
            if (selectedSubcategories.length > 0 && (!product.subcategory || !selectedSubcategories.includes(product.subcategory))) return false;
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;
            if ((product.rating || 0) < minRating) return false;
            return true;
        }).sort((a, b) => {
            switch (sortBy) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                case "newest": return new Date(b.created_at) - new Date(a.created_at);
                case "popular":
                default: return (b.num_reviews || 0) - (a.num_reviews || 0);
            }
        });
    }, [products, selectedCategories, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy]);

    const toggleCategory = (catName) => {
        setSelectedCategories(prev => prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]);
    };

    const toggleSubcategory = (sub) => {
        setSelectedSubcategories(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
    };

    const toggleBrand = (brand) => {
        setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);
    };

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const clearFilters = () => {
        setSelectedCategories([]);
        setSelectedSubcategories([]);
        setPriceRange([0, 500000]);
        setSelectedBrands([]);
        setMinRating(0);
    };

    const activeFiltersCount = selectedCategories.length + selectedSubcategories.length + selectedBrands.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0);

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
        const map = {};
        MAIN_CATEGORIES.forEach(cat => {
            if (cat.subcategoryIcons) {
                Object.assign(map, cat.subcategoryIcons);
            }
        });
        return map;
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 flex justify-center items-center bg-[#F0F9FF]">
                <div className="flex flex-col items-center gap-6">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-sky-500"></div>
                    <p className="text-sky-800 font-bold text-lg animate-pulse">Curating your collection...</p>
                </div>
            </div>
        );
    }

    const FilterContent = () => (
        <>
            <FilterSection title="Categories" icon="fa-folder-open" isOpen={openSections.categories} onToggle={() => toggleSection('categories')}>
                {availableCategories.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.name);
                    return (
                        <motion.div
                            key={cat.name}
                            whileHover={{ x: 4 }}
                            className={`flex items-center cursor-pointer group p-3 border-2 border-black transition-transform duration-100 ${isSelected ? 'bg-orange-500 text-white shadow-[8px_8px_0_#000000]' : 'bg-white hover:bg-pink-500 hover:text-white hover:border-white'}`}
                            onClick={() => toggleCategory(cat.name)}
                        >
                            <div className="relative flex items-center">
                                <AnimatedCheckbox checked={isSelected} onChange={() => toggleCategory(cat.name)} />
                            </div>
                            <span className="ml-3 text-sm flex items-center gap-3 flex-1">
                                <span className={`w-8 h-8 flex items-center justify-center border-2 border-black text-base transition-transform duration-100 ${isSelected ? 'bg-orange-500 text-white' : 'bg-white text-black group-hover:bg-pink-500 group-hover:text-white group-hover:border-white'}`}>
                                    <i className={`${cat.icon || 'fa-solid fa-box'}`}></i>
                                </span>
                                <span className={`font-semibold transition-colors ${isSelected ? 'text-sky-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat.name}</span>
                            </span>
                        </motion.div>
                    );
                })}
            </FilterSection>

            {availableSubcategories.length > 0 && (
                <FilterSection title="Subcategories" icon="fa-list" isOpen={openSections.subcategories} onToggle={() => toggleSection('subcategories')}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                        {availableSubcategories.map((sub) => {
                            const isSelected = selectedSubcategories.includes(sub);
                            const iconClass = subcategoryIconMap[sub] || 'fa-solid fa-circle-small';
                            return (
                                <motion.div
                                    key={sub}
                                    whileHover={{ x: 4 }}
                                    className={`flex items-center cursor-pointer group p-2.5 border-2 border-black transition-transform duration-100 ${isSelected ? 'bg-blue-500 text-white' : 'bg-white hover:bg-orange-500 hover:text-white hover:border-white'}`}
                                    onClick={() => toggleSubcategory(sub)}
                                >
                                    <div className="relative flex items-center">
                                        <AnimatedCheckbox checked={isSelected} onChange={() => toggleSubcategory(sub)} />
                                    </div>
                                    <span className="ml-3 text-sm flex items-center gap-2">
                                        <i className={`${iconClass} text-gray-400 w-4 text-center text-xs`}></i>
                                        <span className={`${isSelected ? 'text-indigo-800 font-medium' : 'text-gray-600 group-hover:text-gray-900'} transition-colors`}>
                                            {sub}
                                        </span>
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </FilterSection>
            )}

            {/* ... (Price, Brands, Rating, Reset Filters - same as before) */}
            <FilterSection title="Price Range" icon="fa-tag" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                <div className="px-2 pt-2">
                    <DualRangeSlider
                        min={0}
                        max={500000}
                        value={priceRange}
                        onChange={setPriceRange}
                    />
                </div>
            </FilterSection>

            {availableBrands.length > 0 && (
                <FilterSection title="Brands" icon="fa-copyright" isOpen={openSections.brands} onToggle={() => toggleSection('brands')}>
                    <div className="mb-3 relative">
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border-4 border-black text-sm font-bold focus:outline-none focus:border-pink-500 focus:bg-yellow-200 transition-transform duration-100"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                        {availableBrands
                            .filter(brand => brand.toLowerCase().includes(brandSearch.toLowerCase()))
                            .map((brand) => {
                                const isSelected = selectedBrands.includes(brand);
                                return (
                                    <motion.div
                                        key={brand}
                                        whileHover={{ x: 4 }}
                                        className={`flex items-center cursor-pointer group p-2.5 rounded-lg transition-colors ${isSelected ? 'bg-sky-50' : 'hover:bg-slate-50'}`}
                                        onClick={() => toggleBrand(brand)}
                                    >
                                        <div className="relative flex items-center">
                                            <AnimatedCheckbox checked={isSelected} onChange={() => toggleBrand(brand)} />
                                        </div>
                                        <span className={`ml-3 text-sm font-medium transition-colors ${isSelected ? 'text-sky-700' : 'text-slate-600 group-hover:text-slate-900'}`}>{brand}</span>
                                    </motion.div>
                                );
                            })}
                    </div>
                </FilterSection>
            )}

            <FilterSection title="Customer Rating" icon="fa-star" isOpen={openSections.rating} onToggle={() => toggleSection('rating')}>
                {[4, 3, 2, 1].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                        className={`flex items-center w-full p-2.5 border-2 border-black transition-transform duration-100 ${minRating === rating ? 'bg-yellow-500 text-white' : 'bg-white hover:bg-yellow-500 hover:text-white hover:border-white'}`}
                    >
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${minRating === rating ? 'border-yellow-500 bg-yellow-500 text-white' : 'border-gray-300'}`}>
                            {minRating === rating && <i className="fa-solid fa-check text-[9px]"></i>}
                        </div>
                        <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                                <i
                                    key={i}
                                    className={`fa-solid fa-star text-sm mr-0.5 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                ></i>
                            ))}
                            <span className={`ml-2 text-sm ${minRating === rating ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>& Up</span>
                        </div>
                    </button>
                ))}
            </FilterSection>

            {activeFiltersCount > 0 && (
                <button
                    onClick={clearFilters}
                    className="w-full mt-6 py-3 bg-black hover:bg-gray-800 text-white border-4 border-white text-sm font-bold transition-transform duration-100 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#ffffff] flex items-center justify-center gap-2"
                >
                    <i className="fa-regular fa-trash-can"></i>
                    Reset Filters ({activeFiltersCount})
                </button>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-[#F0F9FF]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <CollectionHero totalProducts={filteredProducts.length} />

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-24 z-30 py-4 transition-all duration-300">
                    <button
                        className="md:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-white border-4 border-black text-sm font-bold text-black hover:bg-orange-500 hover:text-white hover:border-white transition-transform duration-100"
                        onClick={() => setIsMobileFiltersOpen(true)}
                    >
                        <i className="fa-solid fa-sliders text-indigo-600"></i>
                        Filters
                        {activeFiltersCount > 0 && (
                            <span className="ml-1 w-5 h-5 bg-indigo-600 text-white rounded-full text-xs flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    <div className="hidden md:block text-gray-600">
                        <span className="font-medium text-gray-900">{filteredProducts.length}</span> items found
                        {filteredProducts.length > itemsPerPage && (
                            <span className="text-sm text-gray-400 ml-2">
                                (Showing {((currentPage - 1) * itemsPerPage) + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)})
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 hidden sm:inline">Sort:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-9 py-2.5 bg-white border-4 border-black text-sm font-bold text-black focus:outline-none focus:ring-0 focus:border-pink-500 cursor-pointer hover:bg-pink-500 hover:text-white transition-transform duration-100"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="newest">Newest First</option>
                                <option value="price-asc">Price: Low → High</option>
                                <option value="price-desc">Price: High → Low</option>
                            </select>
                            <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none"></i>
                        </div>
                    </div>
                </div>

                {/* Active Filters Bar */}
                <AnimatePresence>
                    {activeFiltersCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-wrap gap-2 mb-6"
                        >
                            {selectedCategories.map(cat => (
                                <ActiveFilterChip key={cat} label={cat} onRemove={() => toggleCategory(cat)} />
                            ))}
                            {selectedSubcategories.map(sub => (
                                <ActiveFilterChip key={sub} label={sub} onRemove={() => toggleSubcategory(sub)} />
                            ))}
                            {selectedBrands.map(brand => (
                                <ActiveFilterChip key={brand} label={brand} onRemove={() => toggleBrand(brand)} />
                            ))}
                            {minRating > 0 && (
                                <ActiveFilterChip label={`${minRating}+ ★`} onRemove={() => setMinRating(0)} />
                            )}
                            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                                <ActiveFilterChip label={`₹${priceRange[0]} – ₹${priceRange[1]}`} onRemove={() => setPriceRange([0, 500000])} />
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-2 underline decoration-dotted"
                            >
                                Clear all
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex gap-10">
                    {/* Sidebar - Desktop */}
                    <div className="hidden md:block w-[280px] shrink-0">
                        <div className="sticky top-24 p-6 bg-white border-4 border-black shadow-[12px_12px_0_#000000] max-h-[85vh] overflow-y-auto custom-scrollbar">
                            <FilterContent />
                        </GlassCard>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {paginatedProducts.length > 0 ? (
                                <>
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5"
                                    >
                                        {paginatedProducts.map((product) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ duration: 0.25 }}
                                                key={product.id}
                                            >
                                                <ProductCard
                                                    product={product}
                                                    showAddToCart={true}
                                                    onAddToCart={handleAddToCart}
                                                    className="h-full border-4 border-black bg-white shadow-[8px_8px_0_#000000] hover:bg-pink-500 hover:text-white hover:border-white hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-transform duration-100 overflow-hidden"
                                                />
                                            </motion.div>
                                        ))}
                                    </motion.div>

                                    {/* Pagination Controls */}
                                    {totalPages > 1 && (
                                        <div className="mt-12 flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                disabled={currentPage === 1}
                                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
                                            >
                                                <i className="fa-solid fa-chevron-left"></i>
                                            </button>

                                            <div className="flex gap-1">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    const page = i + 1;
                                                    // Show first, last, and pages around current
                                                    if (
                                                        page === 1 ||
                                                        page === totalPages ||
                                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={page}
                                                                onClick={() => handlePageChange(page)}
                                                                className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${currentPage === page
                                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                                    : 'text-gray-600 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                {page}
                                                            </button>
                                                        );
                                                    } else if (
                                                        (page === currentPage - 2 && page > 2) ||
                                                        (page === currentPage + 2 && page < totalPages - 1)
                                                    ) {
                                                        return <span key={page} className="w-8 flex items-center justify-center text-gray-400">...</span>;
                                                    }
                                                    return null;
                                                })}
                                            </div>

                                            <button
                                                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                disabled={currentPage === totalPages}
                                                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500 transition-colors"
                                            >
                                                <i className="fa-solid fa-chevron-right"></i>
                                            </button>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-dashed border-gray-200 text-center"
                                >
                                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
                                        <i className="fa-solid fa-magnifying-glass text-3xl text-gray-400"></i>
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 font-playfair">No matches found</h3>
                                    <p className="text-gray-500 max-w-md px-4">
                                        Try adjusting your filters or explore our full collection.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="mt-6 px-6 py-2.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl font-semibold transition-colors"
                                    >
                                        Reset Filters
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
                    <div className="fixed inset-0 z-50 md:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 28, stiffness: 220 }}
                            className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h2 className="text-xl font-bold font-playfair text-gray-900">Refine Results</h2>
                                <button
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                                >
                                    <i className="fa-solid fa-xmark text-gray-700"></i>
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-5">
                                <FilterContent />
                            </div>
                            <div className="p-5 border-t border-gray-100 bg-gray-50">
                                <button
                                    onClick={() => setIsMobileFiltersOpen(false)}
                                    className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white border-4 border-black font-bold hover:border-white transition-transform duration-100 hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000]"
                                >
                                    Show {filteredProducts.length} Items
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}