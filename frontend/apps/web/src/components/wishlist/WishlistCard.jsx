import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/format";

export const WishlistCard = ({
    product,
    onRemove,
    onAddToCart,
    isDragging = false,
    isRemoving = false,
}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAdded, setIsAdded] = useState(false);

    // Helper to safely get image URL
    const getImageUrl = (product) => {
        if (!product) return "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop";
        return product.image || product.images?.[0] || product.thumbnail || "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop";
    };

    const handleAddToCart = async (e) => {
        e.stopPropagation();
        setIsAddingToCart(true);

        if (onAddToCart) {
            await onAddToCart(product.id, product);
        }

        setIsAddingToCart(false);
        setIsAdded(true);

        setTimeout(() => setIsAdded(false), 2000);
    };

    const displayPrice = product.price || 0;
    const displayTitle = product.title || product.name || 'Untitled Product';

    const handleRemove = (e) => {
        e.stopPropagation();
        onRemove(product.id);
    };

    return (
        <motion.div
            className="relative"
            whileHover={!isRemoving ? {
                scale: 1.02,
                translateX: -2,
                translateY: -2
            } : {}}
            whileTap={!isRemoving ? { scale: 0.98 } : {}}
            onHoverStart={() => !isRemoving && setIsHovering(true)}
            onHoverEnd={() => !isRemoving && setIsHovering(false)}
            transition={{
                duration: 0.1,
                ease: "easeOut",
            }}
        >
            <div className={cn(
                "w-full h-full relative overflow-hidden bg-white border-4 border-black transition-all duration-100",
                isRemoving ? "opacity-75" : "hover:shadow-[12px_12px_0_#000000]"
            )}>
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100 border-b-4 border-black overflow-hidden">
                    <img
                        src={getImageUrl(product)}
                        alt={displayTitle}
                        className={cn(
                            "w-full h-full object-cover transition-all duration-300",
                            isRemoving && "grayscale blur-sm"
                        )}
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=400&auto=format&fit=crop'; }}
                    />

                    {/* Removing Overlay - Always visible when removing */}
                    <AnimatePresence>
                        {isRemoving && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-red-500 border-4 border-black flex flex-col items-center justify-center p-4"
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-10 h-10 border-4 border-white border-t-transparent mb-3"
                                />
                                <p className="text-white font-brutalist font-bold text-lg">REMOVING...</p>
                                <p className="text-white/80 text-xs mt-1 font-bold">Click undo in toast to cancel</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hover Overlay with Actions - Only when not removing */}
                    <AnimatePresence>
                        {isHovering && !isRemoving && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 bg-black/90 flex flex-col items-center justify-end p-4 gap-2"
                            >
                                <motion.button
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 10, opacity: 0 }}
                                    transition={{ delay: 0.05 }}
                                    onClick={handleAddToCart}
                                    disabled={isAddingToCart || isAdded}
                                    className={cn(
                                        "w-full flex items-center justify-center gap-2 px-4 py-3 font-bold transition-all duration-100 border-4 border-black uppercase tracking-wider",
                                        isAdded
                                            ? "bg-green-500 text-white"
                                            : "bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000]"
                                    )}
                                >
                                    {isAddingToCart ? (
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white border-t-transparent"
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
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-red-600 hover:bg-red-500 hover:text-white font-bold border-4 border-black uppercase tracking-wider transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000]"
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
                    <h3 className={cn(
                        "text-lg font-brutalist font-bold text-black line-clamp-2 leading-tight min-h-[3rem] mb-3",
                        isRemoving && "opacity-50"
                    )}>
                        {displayTitle}
                    </h3>
                    <p className={cn(
                        "text-2xl font-brutalist font-bold text-black bg-yellow-200 border-4 border-r-8 border-l-8 border-t-0 border-b-8 p-2 inline-block",
                        isRemoving && "opacity-50"
                    )}>
                        {formatCurrency(displayPrice)}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
