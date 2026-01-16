"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MAIN_CATEGORIES } from "@/utils/categories";
import ProductCard from "@/components/ProductCard";
// FontAwesome icons used globally
import { formatCurrency } from "@/utils/format";

export default function CategoryPage() {
    const { id: categoryNameEncoded } = useParams();
    // Helper to decode URL param (e.g. "Home%20%26%20Living" -> "Home & Living")
    const categoryName = decodeURIComponent(categoryNameEncoded || "");

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Filter States
    const [selectedSubcategories, setSelectedSubcategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 500000]); // Max price placeholder
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [sortBy, setSortBy] = useState("popular"); // popular, newest, price-asc, price-desc

    // Derived Data
    const currentCategory = MAIN_CATEGORIES.find(c => c.name === categoryName);

    useEffect(() => {
        if (categoryName) {
            fetchProducts();
        }
    }, [categoryName]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Using the 'Category > Subcategory' workaround
            // We search for products where the category string STARTS with the main category name
            const { data, error } = await supabase
                .from('products')
                .select('*, seller_profiles(store_name)')
                .ilike('category', `${categoryName}%`);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique brands from loaded products
    const availableBrands = useMemo(() => {
        const brands = new Set(products.map(p => p.brand).filter(Boolean));
        return Array.from(brands).sort();
    }, [products]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // Subcategory Filter (Parse from "Category > Subcategory" string)
            if (selectedSubcategories.length > 0) {
                const sub = product.category.split(' > ')[1];
                if (!sub || !selectedSubcategories.includes(sub)) return false;
            }

            // Price Filter
            if (product.price < priceRange[0] || product.price > priceRange[1]) return false;

            // Brand Filter
            if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

            // Rating Filter
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

    const clearFilters = () => {
        setSelectedSubcategories([]);
        setPriceRange([0, 500000]);
        setSelectedBrands([]);
        setMinRating(0);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 pb-12 px-4 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!currentCategory) {
        return (
            <div className="min-h-screen pt-32 pb-12 px-4 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Category not found</h1>
                <Link to="/" className="text-primary-600 hover:underline mt-4 block">Return Home</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link to="/" className="hover:text-primary-600 transition-colors">Home</Link>
                    <i className="fa-solid fa-chevron-right text-xs mx-2"></i>
                    <span className="font-medium text-gray-900">{currentCategory.name}</span>
                </nav>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <span className="text-4xl">{currentCategory.emoji}</span>
                            {currentCategory.name}
                        </h1>
                        <p className="text-gray-500 mt-2">
                            {filteredProducts.length} results found
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            className="md:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"
                            onClick={() => setIsMobileFiltersOpen(true)}
                        >
                            <i className="fa-solid fa-filter"></i>
                            Filters
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 hidden sm:inline">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            >
                                <option value="popular">Most Popular</option>
                                <option value="newest">Newest Arrivals</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar - Desktop */}
                    <aside className="hidden md:block w-64 flex-shrink-0 space-y-8">
                        {/* Subcategories */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Subcategories</h3>
                            <div className="space-y-2">
                                {currentCategory.subcategories.map((sub) => (
                                    <label key={sub} className="flex items-center cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedSubcategories.includes(sub)}
                                            onChange={() => toggleSubcategory(sub)}
                                            className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                                            {sub}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Min"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Brands */}
                        {availableBrands.length > 0 && (
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Brands</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                    {availableBrands.map((brand) => (
                                        <label key={brand} className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={() => toggleBrand(brand)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                                                {brand}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Rating */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-4">Rating</h3>
                            <div className="space-y-2">
                                {[4, 3, 2, 1].map((rating) => (
                                    <button
                                        key={rating}
                                        onClick={() => setMinRating(rating === minRating ? 0 : rating)}
                                        className={`flex items-center text-sm w-full py-1 ${minRating === rating ? 'text-primary-600 font-medium' : 'text-gray-600'
                                            }`}
                                    >
                                        <div className="flex items-center mr-2">
                                            {[...Array(5)].map((_, i) => (
                                                <i
                                                    key={i}
                                                    className={`fa-solid fa-star text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                ></i>
                                            ))}
                                        </div>
                                        <span>& Up</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Clear Filters */}
                        <button
                            onClick={clearFilters}
                            className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </aside>

                    {/* Product Grid */}
                    <main className="flex-1">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        showAddToCart={true}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <i className="fa-solid fa-sliders text-5xl text-gray-400 mx-auto mb-4"></i>
                                <h3 className="text-lg font-medium text-gray-900">No products found</h3>
                                <p className="text-gray-500 mt-2">Try adjusting your filters or price range.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary-600 hover:underline font-medium"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Filters Overlay */}
            {isMobileFiltersOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileFiltersOpen(false)} />
                    <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-bold">Filters</h2>
                            <button onClick={() => setIsMobileFiltersOpen(false)}>
                                <i className="fa-solid fa-xmark text-xl text-gray-500"></i>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-8">
                            {/* Re-use sidebar content here for mobile (Duplication for prototype speed) */}
                            {/* Subcategories */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Subcategories</h3>
                                <div className="space-y-2">
                                    {currentCategory.subcategories.map((sub) => (
                                        <label key={sub} className="flex items-center cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={selectedSubcategories.includes(sub)}
                                                onChange={() => toggleSubcategory(sub)}
                                                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                                                {sub}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {/* ... Include other filters ... */}
                            {/* Price Range */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-4">Price Range</h3>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={priceRange[0]}
                                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Min"
                                    />
                                    <span className="text-gray-400">-</span>
                                    <input
                                        type="number"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                        placeholder="Max"
                                    />
                                </div>
                            </div>

                            {/* Brands */}
                            {availableBrands.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-4">Brands</h3>
                                    <div className="space-y-2">
                                        {availableBrands.map((brand) => (
                                            <label key={brand} className="flex items-center cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => toggleBrand(brand)}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="ml-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                                                    {brand}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t">
                            <button
                                onClick={() => {
                                    clearFilters();
                                    setIsMobileFiltersOpen(false);
                                }}
                                className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
