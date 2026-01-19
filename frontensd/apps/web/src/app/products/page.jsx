
"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_CATEGORIES } from "@/utils/categories";
import ProductCard from "@/components/ProductCard";

// --- Components ---

const AllProductsHero = ({ totalProducts }) => {
    return (
        <div className="relative w-full h-80 bg-gradient-to-br from-gray-900 via-indigo-900/30 to-gray-900 rounded-3xl overflow-hidden mb-12 shadow-xl">
            <div className="absolute inset-0 bg-black/10" />
            {/* Decorative Blobs */}
            <div className="absolute top-[-15%] left-[-10%] w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-15%] w-96 h-96 bg-cyan-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 text-white">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <nav className="flex items-center text-sm font-medium text-indigo-200 mb-4">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <i className="fa-solid fa-chevron-right text-xs mx-3"></i>
                        <span className="text-white">All Products</span>
                    </nav>
                    <div className="flex items-start gap-6">
                        <div className="mt-1">
                            <i className="fa-solid fa-layer-group text-5xl text-indigo-300 drop-shadow-lg" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold font-playfair mb-2 tracking-tight">
                                Curated Collection
                            </h1>
                            <p className="text-lg text-indigo-100 font-light">
                                {totalProducts} thoughtfully selected pieces
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

const FilterSection = ({ title, children, isOpen, onToggle, icon }) => (
    <div className="border-b border-gray-100 py-5 last:border-0 border-opacity-40">
        <button
            onClick={onToggle}
            className="flex items-center justify-between w-full group outline-none focus:outline-none"
        >
            <h3 className="font-semibold text-gray-800 text-lg flex items-center gap-2.5">
                {icon && <i className={`fa-solid ${icon} text-indigo-600`}></i>}
                {title}
            </h3>
            <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400"
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
                    className="overflow-hidden mt-3"
                >
                    <div className="space-y-2.5 pt-1 pb-2">
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
        className="flex items-center gap-2 px-4 py-2 bg-indigo-900 text-white rounded-full text-sm font-medium hover:bg-indigo-800 transition-all shadow-md"
    >
        <span>{label}</span>
        <i className="fa-solid fa-xmark text-xs opacity-80"></i>
    </motion.button>
);

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter States
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 500000]);
    const [selectedBrands, setSelectedBrands] = useState([]);
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
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?limit=1000`);
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

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-12 px-4 flex justify-center items-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                    <p className="text-gray-600 font-medium">Curating your collection...</p>
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
                        <label key={cat.name} className={`flex items-center cursor-pointer group p-3 rounded-xl transition-all ${isSelected ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'}`}>
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleCategory(cat.name)}
                                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                    <i className="fa-solid fa-check text-white text-[10px]"></i>
                                </div>
                            </div>
                            <span className="ml-3 text-sm flex items-center gap-2 flex-1">
                                <span className={`w-6 h-6 flex items-center justify-center bg-white rounded-full shadow-sm text-base transition-all ${isSelected ? '' : 'opacity-70'}`}>
                                    <i className={`${cat.icon || 'fa-solid fa-box'} text-gray-700`}></i>
                                </span>
                                <span className={`font-medium ${isSelected ? 'text-indigo-900' : 'text-gray-700'}`}>{cat.name}</span>
                            </span>
                        </label>
                    );
                })}
            </FilterSection>

            {availableSubcategories.length > 0 && (
                <FilterSection title="Subcategories" icon="fa-list" isOpen={openSections.subcategories} onToggle={() => toggleSection('subcategories')}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                        {availableSubcategories.map((sub) => {
                            const isSelected = selectedSubcategories.includes(sub);
                            return (
                                <label key={sub} className={`flex items-center cursor-pointer group p-2.5 rounded-lg transition-all ${isSelected ? 'bg-indigo-50/60' : 'hover:bg-gray-50'}`}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleSubcategory(sub)}
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <i className="fa-solid fa-check text-white text-[9px]"></i>
                                        </div>
                                    </div>
                                    <span className={`ml-3 text-sm ${isSelected ? 'text-indigo-800 font-medium' : 'text-gray-600'}`}>
                                        {sub}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </FilterSection>
            )}

            <FilterSection title="Price Range" icon="fa-tag" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                <div className="flex items-center gap-2 p-1">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                        <input
                            type="number"
                            value={priceRange[0]}
                            onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                            className="w-full pl-6 pr-2 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
                        />
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₹</span>
                        <input
                            type="number"
                            value={priceRange[1]}
                            onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                            className="w-full pl-6 pr-2 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all bg-white"
                        />
                    </div>
                </div>
            </FilterSection>

            {availableBrands.length > 0 && (
                <FilterSection title="Brands" icon="fa-copyright" isOpen={openSections.brands} onToggle={() => toggleSection('brands')}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                        {availableBrands.map((brand) => {
                            const isSelected = selectedBrands.includes(brand);
                            return (
                                <label key={brand} className={`flex items-center cursor-pointer group p-2.5 rounded-lg transition-colors ${isSelected ? 'bg-indigo-50 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}>
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleBrand(brand)}
                                            className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                                        />
                                        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                            <i className="fa-solid fa-check text-white text-[9px]"></i>
                                        </div>
                                    </div>
                                    <span className="ml-3 text-sm">{brand}</span>
                                </label>
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
                        className={`flex items-center w-full p-2.5 rounded-lg transition-all ${minRating === rating ? 'bg-yellow-50 ring-1 ring-yellow-200' : 'hover:bg-gray-50'}`}
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
                    className="w-full mt-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <i className="fa-regular fa-trash-can"></i>
                    Reset Filters ({activeFiltersCount})
                </button>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <AllProductsHero totalProducts={filteredProducts.length} />

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sticky top-20 z-30 bg-gray-50/90 backdrop-blur-sm py-3">
                    <button
                        className="md:hidden flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold shadow-sm text-gray-800"
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
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 hidden sm:inline">Sort:</span>
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-9 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm cursor-pointer"
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

                <div className="flex gap-8">
                    {/* Sidebar - Desktop */}
                    <div className="hidden md:block w-72 flex-shrink-0">
                        <div className="sticky top-32 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            <FilterContent />
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1 min-h-[500px]">
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.length > 0 ? (
                                <motion.div
                                    layout
                                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-7"
                                >
                                    {filteredProducts.map((product) => (
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
                                                className="h-full border border-gray-100 bg-white rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>
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
                                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-md transition-colors"
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