"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Package, Clock, Eye, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/utils/format";

/**
 * RecentOrdersCard Component
 * Displays recent orders in a compact card format for dashboards
 */
export default function RecentOrdersCard({
    orders = [],
    title = "Recent Orders",
    viewAllLink = "/seller/orders",
    loading = false,
    showViewAll = true,
    maxOrders = 5,
    isRealTime = false
}) {
    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                <div className="flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                                </div>
                                <div className="h-6 bg-gray-200 rounded w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    {isRealTime && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                            Live
                        </span>
                    )}
                </div>
                {showViewAll && (
                    <Link
                        to={viewAllLink}
                        className="text-sm text-[#D97534] hover:text-[#C86429] font-medium flex items-center gap-1"
                    >
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                )}
            </div>

            {/* Orders List */}
            <div className="divide-y divide-gray-100">
                {orders.length === 0 ? (
                    <div className="p-8 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No recent orders</p>
                    </div>
                ) : (
                    orders.slice(0, maxOrders).map((order, index) => (
                        <OrderRow
                            key={order.id || order._id || index}
                            order={order}
                            isNew={index === 0 && isRealTime}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

/**
 * Single Order Row
 */
function OrderRow({ order, isNew = false }) {
    const {
        id,
        _id,
        order_number,
        orderNumber,
        total_amount,
        totalAmount,
        status,
        created_at,
        createdAt,
        items = []
    } = order;

    const orderId = id || _id;
    const displayOrderNumber = order_number || orderNumber || `ORD-${orderId?.slice(-8)}`;
    const amount = total_amount || totalAmount || 0;
    const orderDate = created_at || createdAt;
    const itemCount = items?.length || order.item_count || 0;

    const getStatusColor = (status) => {
        const statusLower = (status || "pending").toLowerCase();
        switch (statusLower) {
            case "delivered":
            case "completed":
                return "bg-green-100 text-green-700";
            case "shipped":
            case "processing":
                return "bg-blue-100 text-blue-700";
            case "pending":
                return "bg-yellow-100 text-yellow-700";
            case "cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatTimeAgo = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <Link
            to={`/seller/orders?id=${orderId}`}
            className={`block p-4 hover:bg-gray-50 transition-colors ${isNew ? "bg-orange-50/50 animate-pulse-subtle" : ""
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isNew ? "bg-orange-100" : "bg-gray-100"
                    }`}>
                    <Package className={`w-5 h-5 ${isNew ? "text-orange-600" : "text-gray-600"}`} />
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm truncate">
                            {displayOrderNumber}
                        </p>
                        {isNew && (
                            <span className="px-1.5 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                                NEW
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(orderDate)}</span>
                        {itemCount > 0 && (
                            <>
                                <span>•</span>
                                <span>{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Amount & Status */}
                <div className="text-right">
                    <p className="font-semibold text-gray-900 text-sm">
                        {formatCurrency(amount)}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
                        {status || "Pending"}
                    </span>
                </div>

                {/* Arrow */}
                <Eye className="w-4 h-4 text-gray-400" />
            </div>
        </Link>
    );
}

/**
 * Compact variant for smaller spaces
 */
export function RecentOrdersCompact({ orders = [], maxOrders = 3 }) {
    return (
        <div className="space-y-2">
            {orders.slice(0, maxOrders).map((order, index) => {
                const displayNumber = order.order_number || order.orderNumber || `ORD-${(order.id || order._id)?.slice(-6)}`;
                const amount = order.total_amount || order.totalAmount || 0;

                return (
                    <div
                        key={order.id || order._id || index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                        <span className="text-sm font-medium text-gray-700">{displayNumber}</span>
                        <span className="text-sm font-semibold text-[#067D62]">{formatCurrency(amount)}</span>
                    </div>
                );
            })}
        </div>
    );
}
