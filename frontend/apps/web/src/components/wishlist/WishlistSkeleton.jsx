import { motion } from "framer-motion";

export const WishlistSkeleton = () => {
    return (
        <div className="relative w-[280px] h-[360px] bg-white border-4 border-black shadow-[8px_8px_0_#000000]">
            {/* Image Placeholder */}
            <div className="aspect-square bg-gray-200 border-b-4 border-black animate-pulse" />

            {/* Content Placeholder */}
            <div className="p-4 flex flex-col gap-3">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-300 border-2 border-black animate-pulse" />
                    <div className="h-5 w-3/4 bg-gray-300 border-2 border-black animate-pulse" />
                </div>
                <div className="h-8 w-1/3 bg-yellow-200 border-4 border-black animate-pulse" />
            </div>
        </div>
    );
};
