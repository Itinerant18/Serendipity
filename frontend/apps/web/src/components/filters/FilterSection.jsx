import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FilterSection = ({ title, children, isOpen, onToggle, icon }) => {
    // Generate a simple ID for accessibility association
    const sectionId = `filter-section-${title ? title.toLowerCase().replace(/\s+/g, '-') : 'default'}`;

    return (
        <div className="border-b border-sky-100 py-5 last:border-0 border-opacity-60">
            <button
                onClick={onToggle}
                className="flex items-center justify-between w-full group outline-none focus:outline-none"
                aria-expanded={isOpen}
                aria-controls={sectionId}
            >
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-3">
                    {icon && (
                        <div className="w-8 h-8 border-2 border-black bg-white flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-transform duration-100">
                            <i className={`fa-solid ${icon}`}></i>
                        </div>
                    )}
                    <span className="group-hover:text-sky-700 transition-colors uppercase font-brutalist tracking-wide text-base">{title}</span>
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
                        id={sectionId}
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
};

export default FilterSection;