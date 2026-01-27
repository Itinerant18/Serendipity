import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const ShareModal = ({ isOpen, onClose, productCount }) => {
    const [isCopied, setIsCopied] = useState(false);

    // Generate shareable URL
    const shareUrl = `${window.location.origin}/wishlist/shared/${Math.random().toString(36).substring(7)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleShare = async (platform) => {
        const text = `Check out my wishlist with ${productCount} amazing items!`;
        const urls = {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`,
        };

        if (urls[platform]) {
            window.open(urls[platform], "_blank", "width=600,height=400");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.3, ease: [0.5, 1.5, 0.5, 1] }}
                            className="relative w-full max-w-md"
                        >
                            {/* Glass Card Structure */}
                            <div className="relative rounded-3xl overflow-hidden">
                                {/* Bend Layer */}
                                <div
                                    className="absolute inset-0 backdrop-blur-2xl z-0"
                                />

                                {/* Face Layer */}
                                <div
                                    className="absolute inset-0 z-10"
                                    style={{
                                        boxShadow:
                                            "0 4px 4px rgba(0, 0, 0, 0.15), 0 0 12px rgba(0, 0, 0, 0.08), 0 0 48px rgba(255, 255, 255, 0.25)",
                                    }}
                                />

                                {/* Edge Layer */}
                                <div
                                    className="absolute inset-0 z-20 border border-white/20"
                                    style={{
                                        boxShadow:
                                            "inset 6px 6px 6px 0 rgba(255, 255, 255, 0.55), inset -6px -6px 6px 0 rgba(255, 255, 255, 0.55)",
                                    }}
                                />

                                {/* Content */}
                                <div className="relative z-30 p-8 bg-white/5">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                <i className="fa-solid fa-share-nodes text-white text-lg" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-white">Share Wishlist</h2>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-300"
                                        >
                                            <i className="fa-solid fa-xmark text-sm" />
                                        </button>
                                    </div>

                                    <p className="text-white/70 mb-6">
                                        Share your wishlist with {productCount} {productCount === 1 ? "item" : "items"} with friends and family!
                                    </p>

                                    {/* URL Display and Copy */}
                                    <div className="mb-6">
                                        <label className="block text-sm text-white/60 mb-2">Shareable Link</label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white/90 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                                {shareUrl}
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                className={cn(
                                                    "px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition-all duration-300",
                                                    isCopied
                                                        ? "bg-green-500 text-white"
                                                        : "bg-white/90 hover:bg-white text-black"
                                                )}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <i className="fa-solid fa-check text-sm" />
                                                        <span className="hidden sm:inline">Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-regular fa-copy text-sm" />
                                                        <span className="hidden sm:inline">Copy</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Social Share Buttons */}
                                    <div className="space-y-2">
                                        <label className="block text-sm text-white/60 mb-2">Share on Social</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={() => handleShare("twitter")}
                                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all duration-300"
                                            >
                                                Twitter
                                            </button>
                                            <button
                                                onClick={() => handleShare("facebook")}
                                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all duration-300"
                                            >
                                                Facebook
                                            </button>
                                            <button
                                                onClick={() => handleShare("whatsapp")}
                                                className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium transition-all duration-300"
                                            >
                                                WhatsApp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
};
