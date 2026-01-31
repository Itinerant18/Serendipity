import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const SortDropdown = ({ value, onChange, options, className = "" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white text-black font-bold text-sm hover:bg-orange-500 hover:text-white transition-colors duration-150"
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <span className="capitalize">{options.find(opt => opt.value === value)?.label || 'Sort By'}</span>
                <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDownIcon className="w-4 h-4" />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border-4 border-black shadow-[8px_8px_0_#000000] z-10">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleSelect(option)}
                            className={`w-full text-left px-4 py-2 font-bold text-sm transition-colors duration-150 ${
                                option.value === value
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-black hover:bg-pink-500 hover:text-white'
                            }`}
                            role="option"
                        >
                            <span className="capitalize">{option.label}</span>
                            {option.value === value && (
                                <i className="fas fa-check ml-2 text-orange-500"></i>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SortDropdown;