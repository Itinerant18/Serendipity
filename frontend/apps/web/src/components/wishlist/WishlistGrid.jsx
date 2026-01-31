import { motion, AnimatePresence } from "framer-motion";
import { WishlistCard } from "./WishlistCard";

export const WishlistGrid = ({ products, onRemove, onAddToCart, removingItemId = null }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center sm:place-items-stretch">
            <AnimatePresence mode="popLayout">
                {products.map((product) => (
                    <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center"
                    >
                        <WishlistCard
                            product={product}
                            onRemove={onRemove}
                            onAddToCart={onAddToCart}
                            isRemoving={removingItemId === product.id}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
