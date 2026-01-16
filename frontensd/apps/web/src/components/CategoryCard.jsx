"use client";

import { Link } from 'react-router';
import { MAIN_CATEGORIES } from "@/utils/categories";

/**
 * CategoryCard Component
 * Displays a category with icon and label for quick navigation
 */
export default function CategoryCard({
    name,
    icon: Icon,
    href,
    bgColor = "bg-orange-50",
    iconColor = "text-orange-600",
    image
}) {
    return (
        <Link
            to={href || `/category/${encodeURIComponent(name)}`}
            className="group flex flex-col items-center p-4 sm:p-6 rounded-xl bg-white border border-gray-100 hover:border-[#D97534]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            {/* Icon/Image Container */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
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
            <span className="text-sm sm:text-base font-medium text-gray-800 text-center group-hover:text-[#D97534] transition-colors">
                {name}
            </span>
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
    bgColor: "bg-gray-50",
    iconColor: "text-gray-600"
}));


/**
 * CategoryGrid Component
 * Renders a grid of category cards
 */
export function CategoryGrid({ categories = defaultCategories }) {
    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
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
 * Simple Emoji Category Card (no icon import needed)
 */
export function EmojiCategoryCard({ name, emoji, bgColor = "bg-gray-50", href }) {
    return (
        <Link
            to={href || `/category/${encodeURIComponent(name)}`}
            className="group flex flex-col items-center p-4 sm:p-6 rounded-xl bg-white border border-gray-100 hover:border-[#D97534]/30 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full ${bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-3xl sm:text-4xl">{emoji}</span>
            </div>
            <span className="text-sm sm:text-base font-medium text-gray-800 text-center group-hover:text-[#D97534] transition-colors">
                {name}
            </span>
        </Link>
    );
}
