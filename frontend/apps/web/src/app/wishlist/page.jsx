import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    const { user, isAuthenticated } = useAuth();
    const { items: wishlistItems, fetchWishlist, removeFromWishlist, reorderWishlist, clearWishlist, isLoading } = useWishlistStore();
    const { addToCart } = useCartStore();
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "carousel"

    // Fetch wishlist on mount if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchWishlist();
        } else {
            // Redirect if not logged in
            navigate("/account/signin?redirect=/wishlist");
        }
    }, [isAuthenticated, fetchWishlist, navigate]);

    const handleRemove = (id) => {
        removeFromWishlist(id);
        // toast handled in store
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

    const handleClearAll = () => {
        if (wishlistItems.length === 0) return;

        // Simple confirmation toast with action
        toast("Are you sure?", {
            action: {
                label: "Clear All",
                onClick: () => clearWishlist(),
            },
            cancel: {
                label: "Cancel",
            },
        });
    };

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#F3F3F3]">
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 0, 0, 0.05)',
                        color: '#18181b',
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
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                            <i className="fa-solid fa-heart text-2xl text-red-500" />
                        </div>
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2 font-playfair">
                                My Wishlist
                            </h1>
                            <p className="text-gray-500 text-lg">
                                {isLoading
                                    ? "Loading..."
                                    : `${wishlistItems.length} ${wishlistItems.length === 1 ? "item" : "items"} saved`
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* View Toggle */}
                        <div className="bg-white border border-gray-100 rounded-xl p-1 flex shadow-sm">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                                title="Grid View"
                            >
                                <i className="fa-solid fa-table-cells text-lg" />
                            </button>
                            <button
                                onClick={() => setViewMode("carousel")}
                                className={`p-2 rounded-lg transition-all ${viewMode === "carousel" ? "bg-gray-100 text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}`}
                                title="Carousel View"
                            >
                                <i className="fa-solid fa-list-ul text-lg" />
                            </button>
                        </div>

                        {wishlistItems.length > 0 && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleClearAll}
                                className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-semibold flex items-center gap-2 transition-all duration-300"
                            >
                                <i className="fa-solid fa-trash-can text-lg" />
                                <span className="hidden sm:inline">Clear</span>
                            </motion.button>
                        )}

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleShare}
                            className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-900 font-semibold flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <i className="fa-solid fa-share-nodes text-lg" />
                            <span className="hidden sm:inline">Share</span>
                        </motion.button>
                    </div>
                </motion.div>

                {/* Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.5, 1.5, 0.5, 1] }}
                    className="min-h-[400px]"
                >
                    {isLoading ? (
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
                            />
                        ) : (
                            <WishlistGrid
                                products={wishlistItems}
                                onRemove={handleRemove}
                                onAddToCart={handleAddToCart}
                            />
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-6">
                                <i className="fa-regular fa-heart text-5xl text-gray-300" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Your wishlist is empty</h3>
                            <p className="text-gray-500 mb-8 max-w-md text-center">
                                Looks like you haven't added anything yet. Explore our collection and find something special!
                            </p>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate('/products')}
                                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                            >
                                Start Shopping
                            </motion.button>
                        </div>
                    )}
                </motion.div>

                {/* Decorative Elements (Subtle for Light Mode) */}
                <div className="fixed top-20 left-10 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply" />
                <div className="fixed bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl pointer-events-none mix-blend-multiply" />
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                productCount={wishlistItems.length}
            />
        </div>
    );
}
