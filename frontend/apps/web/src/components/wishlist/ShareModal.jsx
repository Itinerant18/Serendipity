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
                        className="fixed inset-0 bg-black/80 z-40"
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
                            {/* Neo-Brutalism Card */}
                            <div className="relative bg-white border-4 border-black shadow-[12px_12px_0_#000000] overflow-hidden">
                                {/* Content */}
                                <div className="p-8">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-blue-500 border-4 border-black shadow-[4px_4px_0_#000000] flex items-center justify-center">
                                                <i className="fa-solid fa-share-nodes text-white text-xl" />
                                            </div>
                                            <h2 className="text-2xl font-brutalist font-bold text-black">SHARE WISHLIST</h2>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="w-10 h-10 bg-red-500 border-4 border-black shadow-[4px_4px_0_#000000] flex items-center justify-center text-white font-bold hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000000] transition-all duration-100"
                                        >
                                            <i className="fa-solid fa-xmark text-lg" />
                                        </button>
                                    </div>

                                    <p className="text-black font-bold mb-6 bg-yellow-100 border-2 border-black p-3">
                                        Share your wishlist with {productCount} {productCount === 1 ? "item" : "items"} with friends and family!
                                    </p>

                                    {/* URL Display and Copy */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-black uppercase mb-2 border-2 border-black inline-block px-2 py-1 bg-gray-100">
                                            Shareable Link
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 px-4 py-3 bg-gray-50 border-4 border-black text-black font-bold text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                                {shareUrl}
                                            </div>
                                            <button
                                                onClick={handleCopy}
                                                className={cn(
                                                    "px-4 py-3 border-4 border-black font-bold flex items-center gap-2 transition-all duration-100 uppercase tracking-wider hover:-translate-y-0.5",
                                                    isCopied
                                                        ? "bg-green-500 text-white shadow-[4px_4px_0_#000000]"
                                                        : "bg-white text-black shadow-[4px_4px_0_#000000] hover:bg-gray-100 hover:shadow-[6px_6px_0_#000000]"
                                                )}
                                            >
                                                {isCopied ? (
                                                    <>
                                                        <i className="fa-solid fa-check text-sm" />
                                                        <span className="hidden sm:inline">COPIED</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-regular fa-copy text-sm" />
                                                        <span className="hidden sm:inline">COPY</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Social Share Buttons */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-black uppercase mb-2 border-2 border-black inline-block px-2 py-1 bg-gray-100">
                                            Share on Social
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                onClick={() => handleShare("twitter")}
                                                className="px-4 py-3 bg-blue-400 border-4 border-black text-black font-bold uppercase tracking-wider transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000]"
                                            >
                                                <i className="fa-brands fa-twitter mb-1"></i>
                                                <div className="text-xs">Twitter</div>
                                            </button>
                                            <button
                                                onClick={() => handleShare("facebook")}
                                                className="px-4 py-3 bg-blue-600 border-4 border-black text-white font-bold uppercase tracking-wider transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000]"
                                            >
                                                <i className="fa-brands fa-facebook mb-1"></i>
                                                <div className="text-xs">Facebook</div>
                                            </button>
                                            <button
                                                onClick={() => handleShare("whatsapp")}
                                                className="px-4 py-3 bg-green-500 border-4 border-black text-black font-bold uppercase tracking-wider transition-all duration-100 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000000]"
                                            >
                                                <i className="fa-brands fa-whatsapp mb-1"></i>
                                                <div className="text-xs">WhatsApp</div>
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
