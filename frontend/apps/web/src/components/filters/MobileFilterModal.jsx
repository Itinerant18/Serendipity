import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilterPanel from './FilterPanel';

const MobileFilterModal = ({
    isOpen,
    onClose,
    ...filterPanelProps // Pass through all props needed for FilterPanel
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 md:hidden"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="mobile-filters-title"
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 border-l-4 border-white"
                        onClick={onClose}
                    />

                    {/* Sliding Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="absolute inset-y-0 right-0 w-full max-w-md bg-white border-l-4 border-black flex flex-col h-full"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b-4 border-black bg-yellow-400">
                            <h2 id="mobile-filters-title" className="text-xl font-black font-brutalist text-black uppercase tracking-widest">Refine Results</h2>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 flex items-center justify-center border-4 border-black bg-white hover:bg-black hover:text-white transition-colors duration-100"
                                aria-label="Close filters"
                            >
                                <i className="fa-solid fa-xmark text-xl"></i>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto">
                            <FilterPanel
                                {...filterPanelProps}
                                className="border-0 shadow-none !p-5" // Override container styles for modal
                            />
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t-4 border-black bg-gray-50">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white border-4 border-black font-bold uppercase tracking-wider text-lg hover:border-white transition-transform duration-100 hover:translate-x-[2px] hover:translate-y-[2px] shadow-[4px_4px_0_#000000] hover:shadow-none"
                            >
                                Show Results
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MobileFilterModal;