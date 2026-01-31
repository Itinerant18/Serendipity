import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WishlistCarousel } from "@/components/wishlist/WishlistCarousel";
import { ShareModal } from "@/components/wishlist/ShareModal";
import { WishlistGrid } from "@/components/wishlist/WishlistGrid";
import { WishlistSkeleton } from "@/components/wishlist/WishlistSkeleton";
import useWishlistStore from "@/utils/wishlistStore";
import useCartStore from "@/utils/cartStore";
import { Toaster, toast } from "sonner";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";

export default function WishlistPage() {
    const navigate = useNavigate();
    const { user, isAuthenticated, hasHydrated } = useAuth();
    const { 
        items: wishlistItems, 
        fetchWishlist, 
        removeFromWishlist, 
        reorderWishlist, 
        isLoading, 
        removingItemId,
        operationCount,
        getWishlistCount
    } = useWishlistStore();
    const { addToCart } = useCartStore();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "carousel"

    // Fetch wishlist on mount if authenticated (wait for hydration first)
    useEffect(() => {
        if (!hasHydrated) return; // Wait for auth state to be restored from storage

        if (isAuthenticated) {
            fetchWishlist();
        } else {
            // Redirect if not logged in
            navigate("/account/signin?redirect=/wishlist");
        }
    }, [hasHydrated, isAuthenticated, fetchWishlist, navigate]);

    const handleRemove = (id) => {
        removeFromWishlist(id);
        // toast handled in store with undo option
    };

    const handleAddToCart = async (id, product) => {
        try {
            await addToCart(product, 1);
            toast.success(`${product.title} added to cart!`);
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    const handleReorder = (newOrder) => {
        reorderWishlist(newOrder);
    };

    const handleShare = () => {
        if (wishlistItems.length === 0) {
            toast.error("Add items to your wishlist first!");
            return;
        }
        setIsShareModalOpen(true);
    };



    // Wait for hydration or show nothing if not authenticated
    if (!hasHydrated || !isAuthenticated) return null;

    return (
        <div className="min-h-screen relative overflow-hidden bg-white border-8 border-black">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: '#ffffff',
                        border: '4px solid #000000',
                        boxShadow: '8px 8px 0 #000000',
                        color: '#000000',
                        fontWeight: 'bold',
                        padding: '16px',
                    },
                }}
            />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.5, 1.5, 0.5, 1] }}
                    className="mb-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-red-500 border-4 border-black shadow-[8px_8px_0_#000000] flex items-center justify-center animate-brutalist-jitter">
                            <i className="fa-solid fa-heart text-3xl text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-brutalist font-bold text-black mb-2 bg-black text-white px-4 py-2 border-4 border-white">
                                MY WISHLIST
                            </h1>
                            <p className="text-black font-bold bg-yellow-200 px-4 py-2 border-4 border-black inline-block text-lg">
                                {isLoading
                                    ? "LOADING..."
                                    : `${getWishlistCount()} ${getWishlistCount() === 1 ? "ITEM" : "ITEMS"} SAVED`
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* View Toggle */}
                        <div className="bg-white border-4 border-black flex">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`px-4 py-2 font-bold transition-all ${viewMode === "grid" ? "bg-yellow-400 text-black" : "bg-white text-black hover:bg-orange-500 hover:text-white"}`}
                                title="Grid View"
                            >
                                <i className="fa-solid fa-table-cells text-lg" />
                            </button>
                            <button
                                onClick={() => setViewMode("carousel")}
                                className={`px-4 py-2 font-bold transition-all ${viewMode === "carousel" ? "bg-yellow-400 text-black" : "bg-white text-black hover:bg-orange-500 hover:text-white"}`}
                                title="Carousel View"
                            >
                                <i className="fa-solid fa-list-ul text-lg" />
                            </button>
                        </div>



                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] flex items-center gap-2 transition-all duration-100"
                        >
                            <i className="fa-solid fa-share-nodes text-lg" />
                            <span className="hidden sm:inline">SHARE</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Operation Status Banner */}
                <AnimatePresence>
                    {operationCount > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 bg-orange-400 border-4 border-black shadow-[8px_8px_0_#000000] px-4 py-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-6 h-6 border-4 border-black border-t-transparent"
                                />
                                <span className="font-brutalist font-bold text-black text-lg uppercase">
                                    {operationCount} {operationCount === 1 ? 'operation' : 'operations'} in progress
                                </span>
                            </div>
                            <span className="text-sm font-bold text-black uppercase bg-white border-2 border-black px-3 py-1">
                                Check notifications to undo
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.5, 1.5, 0.5, 1] }}
                    className="min-h-[400px]"
                >
                    {isLoading && operationCount === 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 place-items-center sm:place-items-stretch">
                            {[...Array(4)].map((_, i) => (
                                <WishlistSkeleton key={i} />
                            ))}
                        </div>
                    ) : wishlistItems.length > 0 ? (
                        viewMode === "carousel" ? (
                            <WishlistCarousel
                                products={wishlistItems}
                                onRemove={handleRemove}
                                onAddToCart={handleAddToCart}
                                onReorder={handleReorder}
                                removingItemId={removingItemId}
                            />
                        ) : (
                            <WishlistGrid
                                products={wishlistItems}
                                onRemove={handleRemove}
                                onAddToCart={handleAddToCart}
                                removingItemId={removingItemId}
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-32 h-32 bg-yellow-400 border-4 border-black flex items-center justify-center mb-6 animate-brutalist-jitter">
                                <i className="fa-regular fa-heart text-6xl text-black" />
                            </div>
                            <h3 className="text-3xl font-brutalist font-bold text-black mb-4 bg-black text-white px-6 py-2 border-4 border-white">YOUR WISHLIST IS EMPTY</h3>
                            <p className="text-black mb-8 max-w-md text-center font-bold text-lg bg-yellow-200 px-4 py-2 border-4 border-black">
                                LOOKS LIKE YOU HAVEN'T ADDED ANYTHING YET. EXPLORE OUR COLLECTION AND FIND SOMETHING SPECIAL!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/products')}
                                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all duration-100"
                            >
                                <i className="fa-solid fa-shopping-bag mr-2"></i>
                                START SHOPPING
                            </motion.button>
                        </div>
                    )}
                </motion.div>

            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                productCount={getWishlistCount()}
            />
        </div>
    );
}
