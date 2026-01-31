import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import AnimatedCheckbox from '@/components/ui/AnimatedCheckbox';
import FilterSection from './FilterSection';

// Helper for subcategory icons
const getSubcategoryIcon = (sub, categories) => {
    for (const cat of categories) {
        if (cat.subcategoryIcons && cat.subcategoryIcons[sub]) {
            return cat.subcategoryIcons[sub];
        }
    }
    return 'fa-solid fa-circle-small';
};

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

export default function FilterPanel({
    categories = [],
    subcategories = [],
    brands = [],
    priceRange = [0, 500000],
    selectedCategories = [],
    selectedSubcategories = [],
    selectedBrands = [],
    minRating = 0,
    inStockOnly = false,
    onSaleOnly = false,
    onCategoryChange,
    onSubcategoryChange,
    onBrandChange,
    onPriceRangeChange,
    onRatingChange,
    onStockChange,
    onSaleChange,
    onClearAll,
    className = ""
}) {
    // Local state for toggling sections
    const [openSections, setOpenSections] = useState({
        quickFilters: true,
        categories: true,
        subcategories: true,
        price: true,
        brands: false,
        rating: true
    });

    const [brandSearch, setBrandSearch] = useState("");

    const toggleSection = (section) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Toggle Handlers
    const toggleCategory = (cat) => {
        const newSelected = selectedCategories.includes(cat)
            ? selectedCategories.filter(c => c !== cat)
            : [...selectedCategories, cat];
        onCategoryChange(newSelected);
    };

    const toggleSubcategory = (sub) => {
        const newSelected = selectedSubcategories.includes(sub)
            ? selectedSubcategories.filter(s => s !== sub)
            : [...selectedSubcategories, sub];
        onSubcategoryChange(newSelected);
    };

    const toggleBrand = (brand) => {
        const newSelected = selectedBrands.includes(brand)
            ? selectedBrands.filter(b => b !== brand)
            : [...selectedBrands, brand];
        onBrandChange(newSelected);
    };

    const activeFiltersCount =
        selectedCategories.length +
        selectedSubcategories.length +
        selectedBrands.length +
        (minRating > 0 ? 1 : 0) +
        (priceRange[0] > 0 || priceRange[1] < 500000 ? 1 : 0) +
        (inStockOnly ? 1 : 0) +
        (onSaleOnly ? 1 : 0);

    return (
        <div className={`bg-white border-4 border-black shadow-[12px_12px_0_#000000] p-6 ${className}`}>
            {/* Quick Filters */}
            <FilterSection title="Quick Filters" icon="fa-bolt" isOpen={openSections.quickFilters} onToggle={() => toggleSection('quickFilters')}>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onSaleChange(!onSaleOnly)}
                        className={`flex items-center justify-center gap-2 p-3 border-4 border-black font-bold text-sm transition-all duration-100 cursor-pointer ${onSaleOnly
                            ? 'bg-red-500 text-white -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0_#000]'
                            : 'bg-white hover:bg-red-100'
                            }`}
                    >
                        <i className="fa-solid fa-percent"></i>
                        ON SALE
                    </button>
                    <button
                        onClick={() => onStockChange(!inStockOnly)}
                        className={`flex items-center justify-center gap-2 p-3 border-4 border-black font-bold text-sm transition-all duration-100 cursor-pointer ${inStockOnly
                            ? 'bg-green-500 text-white -translate-x-0.5 -translate-y-0.5 shadow-[4px_4px_0_#000]'
                            : 'bg-white hover:bg-green-100'
                            }`}
                    >
                        <i className="fa-solid fa-box-open"></i>
                        IN STOCK
                    </button>
                </div>
            </FilterSection>

            {/* Categories (Conditional) */}
            {categories.length > 0 && (
                <FilterSection title="Categories" icon="fa-folder-open" isOpen={openSections.categories} onToggle={() => toggleSection('categories')}>
                    {categories.map((cat) => {
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
            )}

            {/* Subcategories (Conditional) */}
            {subcategories.length > 0 && (
                <FilterSection title="Subcategories" icon="fa-list" isOpen={openSections.subcategories} onToggle={() => toggleSection('subcategories')}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                        {subcategories.map((sub) => {
                            const isSelected = selectedSubcategories.includes(sub);
                            const iconClass = getSubcategoryIcon(sub, categories);
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

            {/* Price Range */}
            <FilterSection title="Price Range" icon="fa-tag" isOpen={openSections.price} onToggle={() => toggleSection('price')}>
                <div className="space-y-4">
                    <div className="flex gap-3 items-center">
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Min</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={500000}
                                    value={priceRange[0]}
                                    onChange={(e) => {
                                        const val = Math.min(Number(e.target.value) || 0, priceRange[1] - 1);
                                        onPriceRangeChange([val, priceRange[1]]);
                                    }}
                                    className="w-full pl-7 pr-3 py-2 border-4 border-black font-bold text-sm focus:outline-none focus:border-orange-500 focus:bg-yellow-100"
                                />
                            </div>
                        </div>
                        <span className="text-gray-400 font-bold mt-5">–</span>
                        <div className="flex-1">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Max</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    max={500000}
                                    value={priceRange[1]}
                                    onChange={(e) => {
                                        const val = Math.max(Number(e.target.value) || 0, priceRange[0] + 1);
                                        onPriceRangeChange([priceRange[0], Math.min(val, 500000)]);
                                    }}
                                    className="w-full pl-7 pr-3 py-2 border-4 border-black font-bold text-sm focus:outline-none focus:border-orange-500 focus:bg-yellow-100"
                                />
                            </div>
                        </div>
                    </div>
                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { label: "< 1K", min: 0, max: 1000 },
                            { label: "1K-5K", min: 1000, max: 5000 },
                            { label: "5K-10K", min: 5000, max: 10000 },
                            { label: "10K-25K", min: 10000, max: 25000 },
                            { label: "25K+", min: 25000, max: 500000 },
                        ].map((preset) => (
                            <button
                                key={preset.label}
                                onClick={() => onPriceRangeChange([preset.min, preset.max])}
                                className={`px-2 py-2 text-xs font-bold border-2 border-black transition-all cursor-pointer ${priceRange[0] === preset.min && priceRange[1] === preset.max
                                    ? 'bg-green-500 text-white -translate-x-0.5 -translate-y-0.5 shadow-[3px_3px_0_#000]'
                                    : 'bg-white hover:bg-green-100'
                                    }`}
                            >
                                {preset.label}
                            </button>
                        ))}
                    </div>
                </div>
            </FilterSection>

            {/* Brands */}
            {brands.length > 0 && (
                <FilterSection title="Brands" icon="fa-copyright" isOpen={openSections.brands} onToggle={() => toggleSection('brands')}>
                    <div className="mb-3 relative">
                        <input
                            type="text"
                            placeholder="Search brands..."
                            value={brandSearch}
                            onChange={(e) => setBrandSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border-4 border-black text-sm font-bold focus:outline-none focus:border-pink-500 focus:bg-yellow-200"
                        />
                        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                    </div>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar pr-2 space-y-1.5">
                        {brands
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

            {/* Rating */}
            <FilterSection title="Rating" icon="fa-star" isOpen={openSections.rating} onToggle={() => toggleSection('rating')}>
                {[4, 3, 2, 1].map((rating) => (
                    <button
                        key={rating}
                        onClick={() => onRatingChange(rating === minRating ? 0 : rating)}
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

            {/* Clear All */}
            {activeFiltersCount > 0 && (
                <div className="mt-6 pt-4 border-t-2 border-black border-dashed">
                    <button
                        onClick={onClearAll}
                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white border-4 border-black text-lg font-black tracking-wide transition-all duration-100 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#000] cursor-pointer flex items-center justify-center gap-3"
                    >
                        <i className="fa-solid fa-xmark text-xl"></i>
                        CLEAR ALL ({activeFiltersCount})
                    </button>
                </div>
            )}
        </div>
    );
}