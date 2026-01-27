import { motion } from "framer-motion";

export const WishlistSkeleton = () => {
    return (
        <div className="relative w-[280px] h-[360px] rounded-[24px] overflow-hidden bg-white border border-slate-100 shadow-sm">
            {/* Image Placeholder */}
            <div className="h-[240px] bg-slate-100 animate-pulse" />

            {/* Content Placeholder */}
            <div className="p-5 flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="h-3 w-20 bg-slate-100 rounded-full animate-pulse" />
                    <div className="h-5 w-3/4 bg-slate-100 rounded animate-pulse" />
                </div>
                <div className="h-8 w-1/3 bg-slate-100 rounded animate-pulse" />
            </div>
        </div>
    );
};
