import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Removed type import since we are using JS

export const WishlistCard = ({
    product,
    onRemove,
    onAddToCart,
    isDragging = false,
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Helper to safely get image URL
    const getImageUrl = (product) => {
        if (!product) return "/placeholder-image.jpg";
        // Check various image properties based on backend schema
        return product.image || product.images?.[0] || product.thumbnail || "/placeholder-image.jpg";
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        setIsAddingToCart(true);

        // Call the provided onAddToCart function which handles the actual logic
        if (onAddToCart) {
            await onAddToCart(product.id, product);
        }

        setIsAddingToCart(false);
        setIsAdded(true);

        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        onRemove(product.id);
    };

    return (
        <>

            <motion.div
                className="relative select-none"
                style={{
                    width: "280px",
                    height: "360px",
                    borderRadius: "24px",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onHoverStart={() => setIsHovering(true)}
                onHoverEnd={() => setIsHovering(false)}
                transition={{
                    duration: 0.5,
                    ease: [0.5, 1.5, 0.5, 1],
                }}
            >


                {/* Face Layer - Main shadow and glow */}
                <div
                    className="absolute inset-0 z-10 bg-white"
                    style={{
                        borderRadius: "24px",
                        boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 0 12px rgba(0, 0, 0, 0.05)",
                    }}
                />

                {/* Edge Layer - Subtle border */}
                <div
                    className="absolute inset-0 z-20 border border-slate-100"
                    style={{
                        borderRadius: "24px",
                    }}
                />

                {/* Content Layer */}
                <div className="relative z-30 h-full flex flex-col overflow-hidden rounded-[24px]">
                    {/* Product Image */}
                    <div className="relative h-[240px] overflow-hidden bg-slate-50">
                        <img
                            src={getImageUrl(product)}
                            alt={product.title || product.name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                        />

                        {/* Hover Overlay with Actions */}
                        <AnimatePresence>
                            {isHovering && !isDragging && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="absolute inset-0 bg-black/20 backdrop-blur-sm flex flex-col items-center justify-end p-4 gap-2"
                                >
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ delay: 0.1 }}
                                        onClick={handleAddToCart}
                                        disabled={isAddingToCart || isAdded}
                                        className={cn(
                                            "w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-lg",
                                            isAdded
                                                ? "bg-green-600 text-white"
                                                : "bg-slate-900 hover:bg-black text-white"
                                        )}
                                    >
                                        {isAddingToCart ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                                            />
                                        ) : isAdded ? (
                                            <>
                                                <i className="fa-solid fa-check text-sm" />
                                                <span>Added!</span>
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-cart-plus text-sm" />
                                                <span>Add to Cart</span>
                                            </>
                                        )}
                                    </motion.button>

                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ delay: 0.15 }}
                                        onClick={handleRemove}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-red-50 text-red-600 font-medium transition-all duration-300 shadow-lg"
                                    >
                                        <i className="fa-solid fa-trash text-sm" />
                                        <span>Remove</span>
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between p-5 bg-white">
                        <div>
                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-medium">
                                {product.category || product.category_name || 'Uncategorized'}
                            </p>
                            <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
                                {product.title || product.name || 'Untitled Product'}
                            </h3>
                        </div>
                        <p className="text-xl font-bold text-sky-600">
                            ₹{(product.price || 0).toFixed(2)}
                        </p>
                    </div>
                </div>
            </motion.div>
        </>
    );
};
