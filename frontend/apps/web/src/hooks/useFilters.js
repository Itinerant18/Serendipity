import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const useFilters = (products, defaultFilters = {}) => {
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize filters from URL params or defaults
    const [filters, setFiltersState] = useState(() => {
        const urlFilters = {
            search: searchParams.get('search') || '',
            categories: searchParams.get('category') ? [searchParams.get('category')] : [],
            subcategories: searchParams.get('subcategory') ? [searchParams.get('subcategory')] : [],
            priceRange: [
                parseInt(searchParams.get('minPrice')) || defaultFilters.minPrice || 0,
                parseInt(searchParams.get('maxPrice')) || defaultFilters.maxPrice || 500000
            ],
            brands: searchParams.get('brands') ? searchParams.get('brands').split(',') : [],
            minRating: parseInt(searchParams.get('minRating')) || defaultFilters.minRating || 0,
            inStockOnly: searchParams.get('inStock') === 'true',
            onSaleOnly: searchParams.get('onSale') === 'true',
            sortBy: searchParams.get('sortBy') || defaultFilters.sortBy || 'popular'
        };

        return {
            ...defaultFilters,
            ...urlFilters
        };
    });

    // Update URL when filters change
    const updateFilters = (newFilters) => {
        setFiltersState(newFilters);

        // Update URL parameters
        const params = new URLSearchParams();
        
        if (newFilters.search) params.set('search', newFilters.search);
        else params.delete('search');
        
        if (newFilters.categories.length > 0) params.set('category', newFilters.categories.join(','));
        else params.delete('category');
        
        if (newFilters.subcategories.length > 0) params.set('subcategory', newFilters.subcategories.join(','));
        else params.delete('subcategory');
        
        if (newFilters.priceRange[0] > 0) params.set('minPrice', newFilters.priceRange[0]);
        else params.delete('minPrice');
        
        if (newFilters.priceRange[1] < 500000) params.set('maxPrice', newFilters.priceRange[1]);
        else params.delete('maxPrice');
        
        if (newFilters.brands.length > 0) params.set('brands', newFilters.brands.join(','));
        else params.delete('brands');
        
        if (newFilters.minRating > 0) params.set('minRating', newFilters.minRating);
        else params.delete('minRating');
        
        if (newFilters.inStockOnly) params.set('inStock', 'true');
        else params.delete('inStock');
        
        if (newFilters.onSaleOnly) params.set('onSale', 'true');
        else params.delete('onSale');
        
        if (newFilters.sortBy !== 'popular') params.set('sortBy', newFilters.sortBy);
        else params.delete('sortBy');

        setSearchParams(params);
    };

    // Reset all filters
    const resetFilters = () => {
        updateFilters({
            search: '',
            categories: [],
            subcategories: [],
            priceRange: [defaultFilters.minPrice || 0, defaultFilters.maxPrice || 500000],
            brands: [],
            minRating: 0,
            inStockOnly: false,
            onSaleOnly: false,
            sortBy: defaultFilters.sortBy || 'popular'
        });
    };

    // Get available categories, subcategories, and brands from products
    const availableCategories = useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.category).filter(Boolean))];
    }, [products]);

    const availableSubcategories = useMemo(() => {
        if (!products || filters.categories.length === 0) return [];
        return [...new Set(
            products
                .filter(p => filters.categories.includes(p.category))
                .map(p => p.subcategory)
                .filter(Boolean)
        )];
    }, [products, filters.categories]);

    const availableBrands = useMemo(() => {
        if (!products) return [];
        return [...new Set(products.map(p => p.brand).filter(Boolean))];
    }, [products]);

    // Filter products based on current filters
    const filteredProducts = useMemo(() => {
        if (!products) return [];

        return products.filter(product => {
            // Search filter
            if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) && 
                !product.description?.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }

            // Category filter
            if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
                return false;
            }

            // Subcategory filter
            if (filters.subcategories.length > 0 && (!product.subcategory || !filters.subcategories.includes(product.subcategory))) {
                return false;
            }

            // Price range filter
            if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
                return false;
            }

            // Brand filter
            if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
                return false;
            }

            // Rating filter
            if ((product.rating || 0) < filters.minRating) {
                return false;
            }

            // In stock filter
            if (filters.inStockOnly && (product.count_in_stock === 0 || product.count_in_stock === undefined)) {
                return false;
            }

            // On sale filter
            if (filters.onSaleOnly && (!product.discount || product.discount <= 0)) {
                return false;
            }

            return true;
        });
    }, [products, filters]);

    // Sort filtered products
    const sortedProducts = useMemo(() => {
        return [...filteredProducts].sort((a, b) => {
            switch (filters.sortBy) {
                case 'price-asc':
                    return a.price - b.price;
                case 'price-desc':
                    return b.price - a.price;
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'discount':
                    return (b.discount || 0) - (a.discount || 0);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'popular':
                default:
                    return (b.num_reviews || 0) - (a.num_reviews || 0);
            }
        });
    }, [filteredProducts, filters.sortBy]);

    // Get active filter count
    const activeFilterCount = useMemo(() => {
        return filters.categories.length + 
               filters.subcategories.length + 
               filters.brands.length + 
               (filters.minRating > 0 ? 1 : 0) + 
               (filters.inStockOnly ? 1 : 0) + 
               (filters.onSaleOnly ? 1 : 0) + 
               (filters.search ? 1 : 0);
    }, [filters]);

    return {
        filters,
        updateFilters,
        resetFilters,
        availableCategories,
        availableSubcategories,
        availableBrands,
        filteredProducts,
        sortedProducts,
        activeFilterCount
    };
};

export default useFilters;