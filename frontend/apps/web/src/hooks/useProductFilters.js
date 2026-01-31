import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { debounce } from 'lodash-es';

export function useProductFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const getArrayParam = (key) => {
        const val = searchParams.get(key);
        return val ? val.split(',') : [];
    };

    const [selectedCategories, setSelectedCategories] = useState(() => getArrayParam('categories'));
    const [selectedSubcategories, setSelectedSubcategories] = useState(() => getArrayParam('subcategories'));
    const [selectedBrands, setSelectedBrands] = useState(() => getArrayParam('brands'));
    const [minRating, setMinRating] = useState(() => Number(searchParams.get('rating')) || 0);
    const [sortBy, setSortBy] = useState(() => searchParams.get('sort') || 'popular');
    const [inStockOnly, setInStockOnly] = useState(() => searchParams.get('stock') === 'true');
    const [onSaleOnly, setOnSaleOnly] = useState(() => searchParams.get('sale') === 'true');

    const [priceRange, setPriceRange] = useState(() => {
        const min = Number(searchParams.get('minPrice')) || 0;
        const max = Number(searchParams.get('maxPrice')) || 500000;
        return [min, max];
    });

    const updateUrl = useCallback(
        debounce((params) => {
            setSearchParams((prev) => {
                const newParams = new URLSearchParams(prev);

                const setOrDel = (key, val) => {
                    if (val) newParams.set(key, val);
                    else newParams.delete(key);
                };

                setOrDel('categories', params.categories.length ? params.categories.join(',') : null);
                setOrDel('subcategories', params.subcategories.length ? params.subcategories.join(',') : null);
                setOrDel('brands', params.brands.length ? params.brands.join(',') : null);
                setOrDel('rating', params.rating > 0 ? params.rating.toString() : null);
                setOrDel('sort', params.sort !== 'popular' ? params.sort : null);
                setOrDel('stock', params.stock ? 'true' : null);
                setOrDel('sale', params.sale ? 'true' : null);

                setOrDel('minPrice', params.price[0] > 0 ? params.price[0].toString() : null);
                setOrDel('maxPrice', params.price[1] < 500000 ? params.price[1].toString() : null);

                return newParams;
            }, { replace: true });
        }, 300),
        [setSearchParams]
    );

    useEffect(() => {
        const params = {
            categories: selectedCategories,
            subcategories: selectedSubcategories,
            brands: selectedBrands,
            rating: minRating,
            sort: sortBy,
            stock: inStockOnly,
            sale: onSaleOnly,
            price: priceRange
        };
        updateUrl(params);
    }, [
        selectedCategories, selectedSubcategories, selectedBrands,
        minRating, sortBy, inStockOnly, onSaleOnly, priceRange, updateUrl
    ]);

    const clearFilters = useCallback(() => {
        setSelectedCategories([]);
        setSelectedSubcategories([]);
        setSelectedBrands([]);
        setMinRating(0);
        setPriceRange([0, 500000]);
        setInStockOnly(false);
        setOnSaleOnly(false);
    }, []);

    return {
        selectedCategories, setSelectedCategories,
        selectedSubcategories, setSelectedSubcategories,
        selectedBrands, setSelectedBrands,
        priceRange, setPriceRange,
        minRating, setMinRating,
        sortBy, setSortBy,
        inStockOnly, setInStockOnly,
        onSaleOnly, setOnSaleOnly,
        clearFilters
    };
}
