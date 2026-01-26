"use client";

import React from "react";
import { Link } from "react-router-dom";
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
            <div className={`p-3 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
                {icon && <i className={`fa-solid ${icon} text-2xl ${iconColor}`}></i>}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#D97534] transition-colors">
                        {title}
                    </h4>
                    {badge && (
                        <span className={`px-2 py-0.5 text-xs font-bold text-white rounded-full ${badgeColor}`}>
                            {badge}
                        </span>
                    )}
                </div>
                {description && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                        {description}
                    </p>
                )}
            </div>

            {/* Arrow */}
            <i className="fa-solid fa-chevron-right text-xl text-gray-400 group-hover:text-[#D97534] group-hover:translate-x-1 transition-all"></i>
        </>
    );

    const baseClasses = `group flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-[#D97534]/30 hover:shadow-lg transition-all duration-300 ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
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
    bgGradient = "from-orange-500 to-amber-500"
}) {
    return (
        <Link
            to={href}
            className={`group block relative overflow-hidden rounded-2xl bg-gradient-to-br ${bgGradient} p-6 text-white hover:shadow-xl transition-all duration-300`}
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white" />
                <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full bg-white" />
            </div>

            {/* Content */}
            <div className="relative">
                <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                        {icon && <i className={`fa-solid ${icon} text-3xl`}></i>}
                    </div>
                    <i className="fa-solid fa-chevron-right text-2xl opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></i>
                </div>

                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-white/80 text-sm mb-4">{description}</p>

                {stats && (
                    <div className="flex items-center gap-4 pt-4 border-t border-white/20">
                        {stats.map((stat, index) => (
                            <div key={index}>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-xs text-white/70">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
