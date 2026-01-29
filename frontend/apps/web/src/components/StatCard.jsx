"use client";

import React from "react";
import GlassCard from "@/components/ui/GlassCard";
// FontAwesome icons loaded globally

/**
 * Reusable StatCard component with trend indicator
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main display value
 * @param {string} props.icon - FontAwesome icon class name (e.g., "fa-dollar-sign")
 * @param {string} props.iconBgColor - Background color class for icon container
 * @param {string} props.iconColor - Text color class for icon
 * @param {number} [props.trend] - Percentage change (positive/negative)
 * @param {string} [props.trendLabel] - Custom trend label
 */
export default function StatCard({
    title,
    value,
    icon,
    iconBgColor = "bg-orange-100",
    iconColor = "text-orange-600",
    trend,
    trendLabel,
    loading = false
}) {
    const hasTrend = trend !== undefined && trend !== null;
    const isPositive = trend > 0;
    const TrendIcon = isPositive ? "fa-arrow-trend-up" : "fa-arrow-trend-down";

    if (loading) {
        return (
            <GlassCard className="p-6 animate-brutalist-jitter">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 border-4 border-black rounded-none"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 border-4 border-black w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 border-4 border-black w-3/4"></div>
                    </div>
                </div>
            </GlassCard>
        );
    }

    return (
        <GlassCard className="p-6 hover:translate(-2px,-2px) hover:shadow-[12px_12px_0_#000000] transition-all duration-100">
            <div className="flex items-center gap-6">
                {/* Icon Container */}
                <div className={`w-16 h-16 ${iconBgColor} border-4 border-black flex items-center justify-center group-hover:bg-yellow-300 transition-colors`}>
                    {icon && <i className={`fa-solid ${icon} text-2xl ${iconColor}`}></i>}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <p className="text-sm font-bold text-black bg-yellow-200 px-3 py-1 border-2 border-black inline-block mb-3">{title.toUpperCase()}</p>
                    <div className="flex items-baseline gap-3">
                        <h3 className="text-3xl font-brutalist font-bold text-black border-4 border-r-8 border-l-8 border-t-0 border-b-8 bg-yellow-200 px-3 py-2">
                            {value}
                        </h3>

                        {/* Trend Indicator */}
                        {hasTrend && (
                            <div className={`flex items-center px-3 py-1 border-4 border-black font-bold text-xs ${isPositive ? "bg-green-500 text-white" : "bg-red-500 text-white"
                                }`}>
                                <i className={`fa-solid ${TrendIcon} mr-1`}></i>
                                <span>{Math.abs(trend)}%</span>
                                {trendLabel && (
                                    <span className="ml-1">{trendLabel}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GlassCard>
    );
}
