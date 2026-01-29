"use client";

import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/format";

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
            <div className="bg-white border-4 border-black p-4">
                <div className="h-8 bg-gray-200 border-4 border-black w-1/3 mb-4 animate-pulse"></div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-3 border-2 border-gray-200">
                            <div className="w-10 h-10 bg-gray-200 border-2 border-black"></div>
                            <div className="flex-1">
                                <div className="h-4 bg-gray-200 border-4 border-black w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-200 border-4 border-black w-1/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-4 border-black overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b-4 border-black flex items-center justify-between bg-yellow-200">
                <div className="flex items-center gap-2">
                    <h3 className="font-brutalist text-lg text-black">{title}</h3>
                    {isRealTime && (
                        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500 text-white text-xs font-bold border-2 border-black">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            LIVE
                        </span>
                    )}
                </div>
                {showViewAll && (
                    <Link
                        to={viewAllLink}
                        className="text-sm font-bold text-black hover:text-orange-500 flex items-center gap-1"
                    >
                        View All
                        <i className="fa-solid fa-chevron-right text-base"></i>
                    </Link>
                )}
            </div>

            {/* Orders List */}
            <div className="divide-y-4 divide-black">
                {orders.length === 0 ? (
                    <div className="p-8 text-center">
                        <i className="fa-solid fa-box text-5xl text-gray-300 mx-auto mb-4"></i>
                        <p className="font-bold text-black">No recent orders</p>
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
                return "bg-green-200 border-green-500 text-green-800";
            case "shipped":
            case "processing":
                return "bg-blue-200 border-blue-500 text-blue-800";
            case "pending":
                return "bg-yellow-200 border-yellow-500 text-yellow-800";
            case "cancelled":
                return "bg-red-200 border-red-500 text-red-800";
            default:
                return "bg-gray-200 border-gray-500 text-gray-800";
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
            className={`block p-4 border-2 border-black hover:bg-orange-50 transition-all duration-100 ${isNew ? "bg-orange-50 animate-pulse" : ""}`}
        >
            <div className="flex items-center gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 flex items-center justify-center border-4 border-black ${isNew ? "bg-orange-500" : "bg-gray-100"}`}>
                    <i className={`fa-solid fa-box text-xl ${isNew ? "text-white" : "text-black"}`}></i>
                </div>

                {/* Order Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-brutalist text-black truncate">
                            {displayOrderNumber}
                        </p>
                        {isNew && (
                            <span className="px-1.5 py-0.5 bg-black text-white text-xs font-bold">
                                NEW
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-black mt-1">
                        <i className="fa-solid fa-clock text-xs text-gray-500"></i>
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
                    <p className="font-brutalist text-black text-lg">
                        {formatCurrency(amount)}
                    </p>
                    <span className={`inline-block px-2 py-0.5 text-xs font-bold border-2 border-black ${getStatusColor(status)}`}>
                        {status || "Pending"}
                    </span>
                </div>

                {/* Arrow */}
                <i className="fa-solid fa-eye text-xl text-black"></i>
            </div>
        </Link>
    );
}

export function RecentOrdersCompact({ orders = [], maxOrders = 3 }) {
    return (
        <div className="space-y-2">
            {orders.slice(0, maxOrders).map((order, index) => {
                const displayNumber = order.order_number || order.orderNumber || `ORD-${(order.id || order._id)?.slice(-6)}`;
                const amount = order.total_amount || order.totalAmount || 0;

                return (
                    <div
                        key={order.id || order._id || index}
                        className="flex items-center justify-between p-3 bg-white border-4 border-black hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all duration-100"
                    >
                        <span className="font-brutalist text-sm text-black">{displayNumber}</span>
                        <span className="font-brutalist text-green-600">{formatCurrency(amount)}</span>
                    </div>
                );
            })}
        </div>
    );
}
