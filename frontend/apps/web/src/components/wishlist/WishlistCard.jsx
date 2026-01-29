import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";

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
        if (!product) return "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop";
        // Check various image properties based on backend schema
        return product.image || product.images?.[0] || product.thumbnail || "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop";
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        setIsAddingToCart(true);

        // Call provided onAddToCart function which handles actual logic
        if (onAddToCart) {
            await onAddToCart(product.id, product);
        }

        setIsAddingToCart(false);
        setIsAdded(true);

        setTimeout(() => setIsAdded(false), 2000);
    };

    // Format product for consistent display
    const displayPrice = product.price || 0;
    const displayTitle = product.title || product.name || 'Untitled Product';

    const handleRemove = (e) => {
        e.stopPropagation();
        onRemove(product.id);
    };

    return (
        <motion.div
            className="relative"
            whileHover={{
                scale: 1.02,
                translateX: -2,
                translateY: -2
            }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setIsHovering(true)}
            onHoverEnd={() => setIsHovering(false)}
            transition={{
                duration: 0.1,
                ease: "easeOut",
            }}
        >
            <GlassCard className="w-full h-full relative overflow-hidden hover:shadow-[12px_12px_0_#000000] transition-all duration-100">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 border-b-4 border-black overflow-hidden">
                    <img
                        src={getImageUrl(product)}
                        alt={displayTitle}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop'; }}
                    />

                    {/* Hover Overlay with Actions */}
                    <AnimatePresence>
                        {isHovering && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-end p-4 gap-2"
                            >
                                <motion.button
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ delay: 0.05 }}
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || isAdded}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all duration-100 border-4 border-black",
                                        isAdded
                                            ? "bg-green-500 text-white hover:bg-green-600"
                                            : "bg-orange-500 text-white hover:bg-orange-600 hover:border-white"
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
                                            <i className="fa-solid fa-check text-sm"></i>
                                            <span>ADDED!</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-cart-shopping text-sm"></i>
                                            <span>ADD TO CART</span>
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ delay: 0.1 }}
                                    onClick={handleRemove}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 hover:bg-red-500 hover:text-white font-bold border-4 border-black hover:border-white transition-all duration-100"
                                >
                                    <i className="fa-solid fa-trash text-sm"></i>
                                    <span>REMOVE</span>
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Product Info */}
                <div className="p-4">
                    <p className="text-xs font-bold text-black uppercase tracking-wider bg-yellow-200 px-3 py-1 border-2 border-black inline-block mb-2">
                        {product.category || product.category_name || 'UNCATEGORIZED'}
                    </p>
                    <h3 className="text-lg font-brutalist font-bold text-black line-clamp-2 leading-tight min-h-[3rem] mb-3">
                        {displayTitle}
                    </h3>
                    <p className="text-2xl font-brutalist font-bold text-black bg-yellow-200 border-4 border-r-8 border-l-8 border-t-0 border-b-8 p-2 inline-block">
                        {formatCurrency(displayPrice)}
                    </p>
                </div>
            </GlassCard>
        </motion.div>
    );
};
