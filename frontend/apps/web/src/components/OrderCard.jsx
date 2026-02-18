"use client";

import React from "react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/format";

const STATUS_CONFIG = {
    pending: { label: "Pending", bgColor: "bg-yellow-200", icon: "fa-clock" },
    confirmed: { label: "Confirmed", bgColor: "bg-blue-200", icon: "fa-circle-check" },
    packed: { label: "Packed", bgColor: "bg-indigo-200", icon: "fa-box" },
    shipped: { label: "Shipped", bgColor: "bg-purple-200", icon: "fa-truck" },
    out_for_delivery: { label: "Out for Delivery", bgColor: "bg-orange-200", icon: "fa-truck-fast" },
    delivered: { label: "Delivered", bgColor: "bg-green-200", icon: "fa-circle-check" },
    cancelled: { label: "Cancelled", bgColor: "bg-red-200", icon: "fa-xmark" },
    returned: { label: "Returned", bgColor: "bg-gray-200", icon: "fa-rotate-left" },
};

export default function OrderCard({ order, isNew = false, onViewDetails, showViewLink = false, linkTo }) {
    const getStatusConfig = (status) => {
        return STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.pending;
    };

    const statusConfig = getStatusConfig(order.status || order.payment_status);

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

    const cardContent = (
        <div
            className={`
                p-4 border-4 border-black transition-all duration-100
                ${isNew
                    ? "bg-green-200 animate-pulse"
                    : "bg-white hover:bg-orange-50"
                }
                hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#000000] cursor-pointer
            `}
            onClick={!showViewLink ? onViewDetails : undefined}
        >
            <div className="flex items-center justify-between">
                {/* Left: Order Info */}
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center border-4 border-black ${isNew ? "bg-green-500" : "bg-blue-500"}`}>
                        <i className={`fa-solid ${statusConfig.icon} text-xl text-white`}></i>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="font-brutalist text-black">
                                {isNew && <span className="bg-black text-white px-2 py-0.5 mr-2">NEW</span>}
                                Order #{order.orderNumber || order.order_number || order.id?.slice(0, 8)}
                            </p>
                        </div>
                        <p className="font-bold text-sm text-black">
                            Total: <span className="text-green-600">{formatCurrency(order.totalAmount || order.total_amount)}</span>
                        </p>
                        {order.user?.name && (
                            <p className="text-xs text-gray-500 mt-0.5">
                                <i className="fa-solid fa-user mr-1"></i>{order.user.name}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right: Status & Time */}
                <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-bold border-4 border-black ${statusConfig.bgColor}`}>
                        <i className={`fa-solid ${statusConfig.icon} text-xs mr-2`}></i>
                        {statusConfig.label}
                    </span>

                    {/* Payment method badge */}
                    {(order.paymentStatus || order.payment_method) && (
                        <div className="mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 border-2 border-black ${(order.paymentStatus === 'Paid' || order.is_paid)
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}>
                                {order.payment_method === 'COD' ? 'COD' : order.paymentStatus || (order.is_paid ? 'Paid' : 'Unpaid')}
                            </span>
                        </div>
                    )}

                    <p className="font-bold text-xs text-gray-500 mt-1">
                        {formatTime(order.createdAt || order.created_at)}
                    </p>

                    {(showViewLink || onViewDetails) && (
                        <span className="text-orange-500 text-sm font-bold hover:text-pink-500 mt-1 hover:underline inline-block">
                            View Details →
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    if (showViewLink && linkTo) {
        return <Link to={linkTo} className="block">{cardContent}</Link>;
    }

    return cardContent;
}
