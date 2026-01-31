import React from 'react';

const FilterChip = ({ label, selected, onClick, icon, className = "", removable = false, onRemove }) => {
    return (
        <button
            onClick={removable ? onRemove : onClick}
            className={`inline-flex items-center gap-2 px-3 py-2 border-2 font-bold text-sm transition-all duration-150 ${
                selected
                    ? 'bg-orange-500 text-white border-black'
                    : 'bg-white text-black border-black hover:bg-pink-500 hover:text-white'
            } ${className}`}
        >
            {icon && <i className={`fas ${icon}`}></i>}
            <span className="capitalize">{label}</span>
            {removable && (
                <i className="fas fa-times ml-2 text-xs"></i>
            )}
        </button>
    );
};

export default FilterChip;