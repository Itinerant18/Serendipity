import React, { useState, useEffect } from 'react';

const BrandSearchFilter = ({ brands, selected, onChange, placeholder = "Search brands..." }) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredBrands = brands.filter(brand =>
        brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const uniqueBrands = [...new Set(brands)].filter(Boolean).sort();
    }, [brands]);

    const toggleBrand = (brand) => {
        const newSelected = selected.includes(brand)
            ? selected.filter(b => b !== brand)
            : [...selected, brand];
        onChange(newSelected);
    };

    return (
        <div className="border-4 border-black bg-white p-4">
            <h4 className="font-bold text-black mb-3 uppercase text-sm">Brands</h4>
            
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full px-3 py-2 border-2 border-black font-bold text-black focus:bg-yellow-200 focus:border-black focus:outline-none mb-4"
                aria-label="Search brands"
            />

            <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredBrands.map((brand, index) => (
                    <label
                        key={index}
                        className="flex items-center gap-3 p-2 hover:bg-yellow-100 cursor-pointer transition-colors duration-150"
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 border-2 border-black focus:ring-2 focus:ring-orange-500"
                            aria-label={`Select ${brand}`}
                        />
                        <span className="font-bold text-black text-sm capitalize">{brand}</span>
                    </label>
                ))}
            </div>

            {filteredBrands.length === 0 && (
                <p className="text-center text-gray-500 font-bold text-sm py-4">
                    No brands found
                </p>
            )}
        </div>
    );
};

export default BrandSearchFilter;