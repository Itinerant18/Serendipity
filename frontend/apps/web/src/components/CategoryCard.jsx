"use client";

import { Link } from 'react-router';
import { MAIN_CATEGORIES } from "@/utils/categories";
import GlassCard from "@/components/ui/GlassCard";

/**
 * CategoryCard Component
 * Displays a category with icon and label for quick navigation
 */
export default function CategoryCard({
    name,
    icon: Icon,
    href,
    bgColor = "bg-yellow-200",
    iconColor = "text-black",
    image
}) {
    return (
        <Link
            to={href || `/category/${encodeURIComponent(name)}`}
            className="group flex flex-col items-center p-4 sm:p-6"
        >
            <GlassCard className="hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-all duration-100">
                <div className="flex flex-col items-center">
                    {/* Icon/Image Container */}
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${bgColor} border-4 border-black flex items-center justify-center mb-3 group-hover:bg-yellow-300 transition-colors`}>
                        {image ? (
                            <img
                                src={image}
                                alt={name}
                                className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
                            />
                        ) : Icon ? (
                            <Icon className={`w-8 h-8 sm:w-10 sm:h-10 ${iconColor}`} />
                        ) : (
                            <span className={`text-2xl sm:text-3xl ${iconColor}`}>📦</span>
                        )}
                    </div>

                    {/* Category Name */}
                    <span className="text-sm sm:text-base font-bold text-black text-center group-hover:text-orange-600 transition-colors">
                        {name.toUpperCase()}
                    </span>
                </div>
            </GlassCard>
        </Link>
    );
}

/**
 * Pre-defined category configurations from shared utility
 */
export const defaultCategories = MAIN_CATEGORIES.map(cat => ({
    name: cat.name,
    emoji: cat.emoji,
    image: cat.image,
    bgColor: "bg-yellow-200",
    iconColor: "text-black"
}));


/**
 * CategoryGrid Component
 * Renders a grid of category cards
 */
export function CategoryGrid({ categories = defaultCategories }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
                <CategoryCard
                    key={category.name}
                    {...category}
                    icon={null}
                />
            ))}
        </div>
    );
}

/**
 * Emoji Category Card (no icon import needed)
 */
export function EmojiCategoryCard({ name, emoji, bgColor = "bg-yellow-200", href }) {
    return (
        <Link
            to={href || `/category/${encodeURIComponent(name)}`}
            className="group flex flex-col items-center p-4 sm:p-6"
        >
            <GlassCard className="hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-all duration-100">
                <div className="flex flex-col items-center">
                    <div className={`w-16 h-16 sm:w-20 sm:h-20 ${bgColor} border-4 border-black flex items-center justify-center mb-3 group-hover:bg-yellow-300 transition-colors`}>
                        <span className="text-3xl sm:text-4xl">{emoji}</span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-black text-center group-hover:text-orange-600 transition-colors">
                        {name.toUpperCase()}
                    </span>
                </div>
            </GlassCard>
        </Link>
    );
}
