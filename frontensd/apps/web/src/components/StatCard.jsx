"use client";

import React from "react";
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
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 animate-pulse">
                <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg hover:border-orange-200 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
                {/* Icon Container */}
                <div className={`p-4 rounded-full ${iconBgColor} group-hover:scale-110 transition-transform duration-300`}>
                    {icon && <i className={`fa-solid ${icon} text-2xl ${iconColor}`}></i>}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 font-inter">{title}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-bold font-inter text-gray-900">
                            {value}
                        </h3>

                        {/* Trend Indicator */}
                        {hasTrend && (
                            <div className={`flex items-center text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"
                                }`}>
                                <i className={`fa-solid ${TrendIcon} text-xs mr-0.5`}></i>
                                <span>{Math.abs(trend)}%</span>
                                {trendLabel && (
                                    <span className="text-gray-400 ml-1">{trendLabel}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
