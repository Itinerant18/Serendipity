"use client";

import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/format";

export default function OrderCard({ order, isNew = false, onViewDetails }) {
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: "Pending",
                bgColor: "bg-yellow-200",
                icon: "fa-clock"
            },
            processing: {
                label: "Processing",
                bgColor: "bg-blue-200",
                icon: "fa-box"
            },
            shipped: {
                label: "Shipped",
                bgColor: "bg-purple-200",
                icon: "fa-truck"
            },
            delivered: {
                label: "Delivered",
                bgColor: "bg-green-200",
                icon: "fa-circle-check"
            }
        };
        return configs[status?.toLowerCase()] || configs.pending;
    };

    const statusConfig = getStatusConfig(order.status || order.payment_status);
    const statusIconClass = statusConfig.icon;

    const formatTime = (timestamp) => {
        if (!timestamp) return "Just now";
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hr ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            className={`
                p-4 border-4 border-black transition-all duration-100
                ${isNew
                    ? "bg-green-200 animate-pulse"
                    : "bg-white hover:bg-orange-50"
                }
                hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] cursor-pointer
            `}
            onClick={onViewDetails}
        >
            <div className="flex items-center justify-between">
                {/* Left: Order Info */}
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center border-4 border-black ${isNew ? "bg-green-500" : "bg-blue-500"}`}>
                        <i className={`fa-solid ${statusIconClass} text-xl text-white`}></i>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-brutalist text-black">
                                {isNew && <span className="bg-black text-white px-2 py-0.5 mr-2">NEW</span>}
                                Order #{order.order_number || order.id?.slice(0, 8)}
                            </p>
                        </div>
                        <p className="font-bold text-sm text-black">
                            Total: <span className="text-green-600">{formatCurrency(order.total_amount)}</span>
                        </p>
                    </div>
                </div>

                {/* Right: Status & Time */}
                <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-bold border-4 border-black ${statusConfig.bgColor}`}>
                        <i className={`fa-solid ${statusIconClass} text-xs mr-2`}></i>
                        {statusConfig.label}
                    </span>
                    <p className="font-bold text-xs text-gray-500 mt-1">
                        {formatTime(order.created_at)}
                    </p>
                    {onViewDetails && (
                        <button className="text-orange-500 text-sm font-bold hover:text-pink-500 mt-1 hover:underline">
                            View Details →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
