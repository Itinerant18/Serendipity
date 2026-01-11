"use client";

import React from "react";
import { formatCurrency, formatCompactNumber } from "@/utils/format";

/**
 * SalesChart Component
 * Simple SVG-based bar chart for sales visualization
 * No external dependencies required
 */
export default function SalesChart({
    data = [],
    title = "Sales Overview",
    height = 200,
    loading = false,
    showLabels = true
}) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-6 animate-pulse" />
                <div className="flex items-end justify-between gap-2" style={{ height }}>
                    {[60, 80, 45, 90, 70, 85, 50].map((h, i) => (
                        <div
                            key={i}
                            className="flex-1 bg-gray-200 rounded-t animate-pulse"
                            style={{ height: `${h}%` }}
                        />
                    ))}
                </div>
            </div>
        );
    }

    // Default sample data if none provided
    const chartData = data.length > 0 ? data : [
        { label: "Mon", value: 1200 },
        { label: "Tue", value: 1800 },
        { label: "Wed", value: 1400 },
        { label: "Thu", value: 2200 },
        { label: "Fri", value: 1900 },
        { label: "Sat", value: 2500 },
        { label: "Sun", value: 2100 }
    ];

    const maxValue = Math.max(...chartData.map(d => d.value));
    const minBarHeight = 10; // Minimum bar height percentage

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded bg-[#D97534]" />
                        <span className="text-gray-500">This Week</span>
                    </span>
                </div>
            </div>

            {/* Chart */}
            <div className="relative" style={{ height }}>
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-12">
                    <span>{formatCompactNumber(maxValue)}</span>
                    <span>{formatCompactNumber(maxValue / 2)}</span>
                    <span>{formatCurrency(0, false)}</span>
                </div>

                {/* Bars Container */}
                <div className="ml-14 h-full flex items-end justify-between gap-2 pb-6 border-l border-b border-gray-200">
                    {chartData.map((item, index) => {
                        const heightPercent = maxValue > 0
                            ? Math.max((item.value / maxValue) * 100, minBarHeight)
                            : minBarHeight;

                        return (
                            <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                {/* Bar */}
                                <div
                                    className="relative w-full group"
                                    style={{ height: `calc(100% - 24px)` }}
                                >
                                    <div
                                        className="absolute bottom-0 left-1 right-1 bg-gradient-to-t from-[#D97534] to-[#F59E0B] rounded-t transition-all duration-500 hover:from-[#C86429] hover:to-[#D97534] cursor-pointer"
                                        style={{
                                            height: `${heightPercent}%`,
                                            animation: `growUp 0.5s ease-out ${index * 0.1}s both`
                                        }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
                                            {formatCurrency(item.value)}
                                        </div>
                                    </div>
                                </div>

                                {/* Label */}
                                {showLabels && (
                                    <span className="text-xs text-gray-500 font-medium">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500">Total This Week</p>
                    <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(chartData.reduce((sum, d) => sum + d.value, 0))}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Average Daily</p>
                    <p className="text-xl font-bold text-[#067D62]">
                        {formatCurrency(Math.round(chartData.reduce((sum, d) => sum + d.value, 0) / chartData.length))}
                    </p>
                </div>
            </div>

            {/* CSS for animation */}
            <style>{`
                @keyframes growUp {
                    from {
                        height: 0%;
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}

/**
 * Mini Sparkline Chart for stat cards
 */
export function SparklineChart({ data = [], color = "#D97534", height = 40, width = 120 }) {
    if (data.length < 2) return null;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const range = maxValue - minValue || 1;

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((value - minValue) / range) * (height - 10) - 5;
        return `${x},${y}`;
    }).join(" ");

    return (
        <svg width={width} height={height} className="overflow-visible">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Gradient fill */}
            <defs>
                <linearGradient id={`gradient-${color.replace("#", "")}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <polygon
                points={`0,${height} ${points} ${width},${height}`}
                fill={`url(#gradient-${color.replace("#", "")})`}
            />
        </svg>
    );
}
