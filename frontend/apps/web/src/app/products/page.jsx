"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_CATEGORIES } from "@/utils/categories";
import CollectionHero from "@/components/CollectionHero";
import ProductCard from "@/components/ProductCard";
import useCartStore from "@/utils/cartStore";
import FilterPanel from "@/components/filters/FilterPanel";
import MobileFilterModal from "@/components/filters/MobileFilterModal";
import { useProductFilters } from "@/hooks/useProductFilters";

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

    // Use Shared Hook for Filters & URL Persistence
    const {
        selectedCategories, setSelectedCategories,
        selectedSubcategories, setSelectedSubcategories,
        selectedBrands, setSelectedBrands,
        priceRange, setPriceRange,
        minRating, setMinRating,
        sortBy, setSortBy,
        inStockOnly, setInStockOnly,
        onSaleOnly, setOnSaleOnly,
        clearFilters
    } = useProductFilters();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/products?limit=1000`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (Array.isArray(data)) {
                setProducts(data);
            } else if (data.products && Array.isArray(data.products)) {
                setProducts(data.products);
            } else {
                setProducts([]);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
            setProducts([]);
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
            if (inStockOnly && (product.count_in_stock === 0 || product.count_in_stock === undefined)) return false;
            if (onSaleOnly && (!product.discount || product.discount <= 0)) return false;
            return true;
        }).sort((a, b) => {
            switch (sortBy) {
                case "price-asc": return a.price - b.price;
                case "price-desc": return b.price - a.price;
                case "newest": return new Date(b.created_at) - new Date(a.created_at);
                case "discount": return (b.discount || 0) - (a.discount || 0);
                case "popular":
                default: return (b.num_reviews || 0) - (a.num_reviews || 0);
            }
        });
    }, [products, selectedCategories, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy, inStockOnly, onSaleOnly]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategories, selectedSubcategories, priceRange, selectedBrands, minRating, sortBy, inStockOnly, onSaleOnly]);

    const activeFiltersCount = selectedCategories.length + selectedSubcategories.length + selectedBrands.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0) + (inStockOnly ? 1 : 0) + (onSaleOnly ? 1 : 0);

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
            <div className="min-h-screen pt-32 pb-12 px-4 flex justify-center items-center bg-black border-8 border-white">
                <div className="flex flex-col items-center gap-6">
                    <div className="border-4 border-black bg-yellow-400 p-8 animate-brutalist-jitter">
                        <i className="fa-solid fa-bolt text-4xl text-black"></i>
                    </div>
                    <p className="text-white font-brutalist text-lg bg-black px-4 py-2 border-4 border-white">PROCESSING PRODUCTS...</p>
                </div>
            </div>
        );
    }

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
                                <option value="discount">Biggest Discount</option>
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
                                <ActiveFilterChip key={cat} label={cat} onRemove={() => setSelectedCategories(p => p.filter(c => c !== cat))} />
                            ))}
                            {selectedSubcategories.map(sub => (
                                <ActiveFilterChip key={sub} label={sub} onRemove={() => setSelectedSubcategories(p => p.filter(s => s !== sub))} />
                            ))}
                            {selectedBrands.map(brand => (
                                <ActiveFilterChip key={brand} label={brand} onRemove={() => setSelectedBrands(p => p.filter(b => b !== brand))} />
                            ))}
                            {minRating > 0 && (
                                <ActiveFilterChip label={`${minRating}+ ★`} onRemove={() => setMinRating(0)} />
                            )}
                            {(priceRange[0] > 0 || priceRange[1] < 500000) && (
                                <ActiveFilterChip label={`₹${priceRange[0]} – ₹${priceRange[1]}`} onRemove={() => setPriceRange([0, 500000])} />
                            )}
                            {inStockOnly && (
                                <ActiveFilterChip label="In Stock Only" onRemove={() => setInStockOnly(false)} />
                            )}
                            {onSaleOnly && (
                                <ActiveFilterChip label="On Sale" onRemove={() => setOnSaleOnly(false)} />
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
                    <div className="hidden md:block w-[280px] shrink-0 sticky top-24 h-fit">
                        <FilterPanel
                            categories={availableCategories}
                            subcategories={availableSubcategories}
                            brands={availableBrands}
                            priceRange={priceRange}
                            selectedCategories={selectedCategories}
                            selectedSubcategories={selectedSubcategories}
                            selectedBrands={selectedBrands}
                            minRating={minRating}
                            inStockOnly={inStockOnly}
                            onSaleOnly={onSaleOnly}
                            onCategoryChange={setSelectedCategories}
                            onSubcategoryChange={setSelectedSubcategories}
                            onBrandChange={setSelectedBrands}
                            onPriceRangeChange={setPriceRange}
                            onRatingChange={setMinRating}
                            onStockChange={setInStockOnly}
                            onSaleChange={setOnSaleOnly}
                            onClearAll={clearFilters}
                        />
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
                                                className="w-12 h-12 flex items-center justify-center border-4 border-black bg-white hover:bg-yellow-400 hover:text-black font-bold hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-transform duration-100 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-500"
                                            >
                                                <i className="fa-solid fa-chevron-left text-black"></i>
                                            </button>

                                            <div className="flex gap-1">
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
                                    className="flex flex-col items-center justify-center py-28 bg-black text-white border-4 border-black"
                                >
                                    <div className="w-24 h-24 bg-yellow-400 border-4 border-black flex items-center justify-center mb-5 animate-brutalist-jitter">
                                        <i className="fa-solid fa-magnifying-glass text-4xl text-black"></i>
                                    </div>
                                    <h3 className="text-3xl font-brutalist text-black mb-2 bg-yellow-200 px-4 border-4 border-black">NO MATCHES FOUND</h3>
                                    <p className="text-black max-w-md px-4 font-bold">
                                        TRY ADJUSTING FILTERS
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="mt-6 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white border-4 border-black font-bold hover:border-white hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-transform duration-100"
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
            <MobileFilterModal
                isOpen={isMobileFiltersOpen}
                onClose={() => setIsMobileFiltersOpen(false)}
                categories={availableCategories}
                subcategories={availableSubcategories}
                brands={availableBrands}
                priceRange={priceRange}
                selectedCategories={selectedCategories}
                selectedSubcategories={selectedSubcategories}
                selectedBrands={selectedBrands}
                minRating={minRating}
                inStockOnly={inStockOnly}
                onSaleOnly={onSaleOnly}
                onCategoryChange={setSelectedCategories}
                onSubcategoryChange={setSelectedSubcategories}
                onBrandChange={setSelectedBrands}
                onPriceRangeChange={setPriceRange}
                onRatingChange={setMinRating}
                onStockChange={setInStockOnly}
                onSaleChange={setOnSaleOnly}
                onClearAll={clearFilters}
            />
        </div>
    );
}