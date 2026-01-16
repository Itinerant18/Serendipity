"use client";

import React from "react";
// FontAwesome icons loaded globally
import { formatCurrency } from "@/utils/format";

/**
 * Order card component for displaying order information
 * @param {Object} props
 * @param {Object} props.order - Order data
 * @param {string} props.order.id - Order ID
 * @param {string} props.order.order_number - Display order number
 * @param {number} props.order.total_amount - Order total
 * @param {string} props.order.status - Order status
 * @param {string} props.order.created_at - Creation timestamp
 * @param {boolean} [props.isNew] - Whether this is a new order (highlight)
 * @param {Function} [props.onViewDetails] - Click handler for view details
 */
export default function OrderCard({ order, isNew = false, onViewDetails }) {
    const getStatusConfig = (status) => {
        const configs = {
            pending: {
                label: "Pending",
                bgColor: "bg-yellow-100",
                textColor: "text-yellow-700",
                icon: "fa-clock"
            },
            processing: {
                label: "Processing",
                bgColor: "bg-blue-100",
                textColor: "text-blue-700",
                icon: "fa-box"
            },
            shipped: {
                label: "Shipped",
                bgColor: "bg-purple-100",
                textColor: "text-purple-700",
                icon: "fa-truck"
            },
            delivered: {
                label: "Delivered",
                bgColor: "bg-green-100",
                textColor: "text-green-700",
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
                p-4 rounded-lg border-l-4 transition-all duration-300
                ${isNew
                    ? "border-l-green-500 bg-green-50 animate-pulse"
                    : "border-l-[#D97534] bg-white hover:bg-orange-50"
                }
                hover:shadow-md cursor-pointer
            `}
            onClick={onViewDetails}
        >
            <div className="flex items-center justify-between">
                {/* Left: Order Info */}
                <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${isNew ? "bg-green-200" : "bg-blue-100"}`}>
                        <i className={`fa-solid fa-bag-shopping text-xl ${isNew ? "text-green-600" : "text-blue-600"}`}></i>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 font-inter">
                                {isNew && <span className="text-green-600">🔔 NEW - </span>}
                                Order #{order.order_number || order.id?.slice(0, 8)}
                            </p>
                        </div>
                        <p className="text-sm text-gray-500">
                            Total: <span className="text-green-600 font-bold">{formatCurrency(order.total_amount)}</span>
                        </p>
                    </div>
                </div>

                {/* Right: Status & Time */}
                <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        <i className={`fa-solid ${statusIconClass} text-xs mr-1`}></i>
                        {statusConfig.label}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                        {formatTime(order.created_at)}
                    </p>
                    {onViewDetails && (
                        <button className="text-[#D97534] text-sm font-medium hover:underline mt-1">
                            View Details →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
