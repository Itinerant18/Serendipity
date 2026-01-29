"use client";

import React from "react";
import { Link } from "react-router-dom";
import GlassCard from "@/components/ui/GlassCard";
// FontAwesome icons loaded globally

/**
 * QuickActionCard Component
 * Action buttons/cards for admin and seller dashboards
 */
export default function QuickActionCard({
    title,
    description,
    icon,
    href,
    onClick,
    iconBgColor = "bg-orange-100",
    iconColor = "text-orange-600",
    badge,
    badgeColor = "bg-red-500",
    disabled = false,
    variant = "default" // "default" | "compact" | "large"
}) {
    const content = (
        <>
            {/* Icon */}
            <div className={`p-4 ${iconBgColor} border-4 border-black group-hover:bg-yellow-300 transition-colors`}>
                {icon && <i className={`fa-solid ${icon} text-2xl ${iconColor}`}></i>}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-brutalist font-bold text-black group-hover:text-orange-600 transition-colors">
                        {title.toUpperCase()}
                    </h4>
                    {badge && (
                        <span className={`px-3 py-1 text-xs font-bold text-white border-2 border-black ${badgeColor}`}>
                            {badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-black mt-1 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {/* Arrow */}
            <i className="fa-solid fa-chevron-right text-xl text-black group-hover:text-orange-600 group-hover:translate-x-1 transition-all"></i>
        </>
    );

    const baseClasses = `group flex items-center gap-4 p-4 bg-white border-4 border-black hover:translate(-2px,-2px) hover:shadow-[12px_12px_0_#000000] transition-all duration-100 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`;

    if (href && !disabled) {
        return (
            <Link to={href} className={baseClasses}>
                {content}
            </Link>
        );
    }

    return (
        <button
            onClick={disabled ? undefined : onClick}
            className={`${baseClasses} w-full text-left`}
            disabled={disabled}
        >
            {content}
        </button>
    );
}

/**
 * QuickActionGrid Component
 * Grid layout for multiple quick action cards
 */
export function QuickActionGrid({ actions = [], columns = 2 }) {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    };

    return (
        <div className={`grid ${gridCols[columns] || gridCols[2]} gap-4`}>
            {actions.map((action, index) => (
                <QuickActionCard key={index} {...action} />
            ))}
        </div>
    );
}

/**
 * Large Action Card for featured actions
 */
export function LargeActionCard({
    title,
    description,
    icon: Icon,
    href,
    stats,
    bgGradient = "from-orange-500 to-pink-500"
}) {
    return (
        <Link
            to={href}
            className="group block relative overflow-hidden border-4 border-black"
        >
            <GlassCard className="bg-gradient-to-br from-orange-500 to-pink-500 text-white p-6 hover:translate(-2px,-2px) hover:shadow-[12px_12px_0_#000000] transition-all duration-100">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-yellow-400 border-4 border-black" />
                    <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-pink-400 border-4 border-black" />
                </div>

                {/* Content */}
                <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/20 backdrop-blur-sm border-4 border-black">
                            {icon && <i className={`fa-solid ${icon} text-3xl`}></i>}
                        </div>
                        <i className="fa-solid fa-chevron-right text-2xl opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                    </div>

                    <h3 className="text-2xl font-brutalist font-bold mb-2">{title.toUpperCase()}</h3>
                    <p className="text-white/90 text-sm mb-4">{description}</p>

                    {stats && (
                        <div className="flex items-center gap-4 pt-4 border-t-4 border-white/20">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-2xl font-brutalist font-bold">{stat.value}</div>
                                    <div className="text-xs text-white/90 font-bold">{stat.label.toUpperCase()}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </GlassCard>
        </Link>
    );
}
