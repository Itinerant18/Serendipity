"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";
import { formatCurrency } from "@/utils/format";

const statusConfig = {
    pending: { icon: "fa-solid fa-clock", color: "text-yellow-600", bg: "bg-yellow-50", label: "Pending" },
    processing: { icon: "fa-solid fa-box", color: "text-blue-600", bg: "bg-blue-50", label: "Processing" },
    shipped: { icon: "fa-solid fa-truck", color: "text-purple-600", bg: "bg-purple-50", label: "Shipped" },
    delivered: { icon: "fa-solid fa-circle-check", color: "text-green-600", bg: "bg-green-50", label: "Delivered" },
    cancelled: { icon: "fa-solid fa-circle-xmark", color: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
};

export default function OrdersPage() {
    const token = useAuthStore(state => state.token);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!token) return;
                const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/orders/myorders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrders(data || []);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filter);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-[#3B82F6] mx-auto"></i>
                    <p className="text-gray-500 mt-4">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="font-bold text-3xl text-[#1E293B]">My Orders</h1>
                        <p className="text-gray-600 mt-1">Track and manage your order history</p>
                    </div>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] text-white text-sm font-medium rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer"
                    >
                        <i className="fa-solid fa-bag-shopping"></i>
                        Continue Shopping
                    </Link>
                </div>

                {/* Filters */}
                <div className="flex gap-2 flex-wrap">
                    {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 cursor-pointer ${filter === status
                                ? "bg-[#3B82F6] text-white shadow-sm"
                                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-200">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <i className="fa-solid fa-box text-5xl text-[#3B82F6]"></i>
                        </div>
                        <h3 className="font-bold text-2xl text-[#1E293B] mb-3">No orders found</h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto text-lg">
                            {filter === "all"
                                ? "Looks like you haven't placed any orders yet. Start shopping now!"
                                : `You don't have any ${filter} orders at the moment.`}
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] text-white font-medium rounded-lg hover:bg-[#2563EB] transition-colors cursor-pointer"
                        >
                            Start Shopping
                            <i className="fa-solid fa-chevron-right text-sm"></i>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const status = order.status?.toLowerCase() || "pending";
                            const config = statusConfig[status] || statusConfig.pending;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md cursor-pointer"
                                >
                                    {/* Order Header */}
                                    <div className="flex items-center justify-between p-5 bg-gray-50 border-b border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2.5 rounded-lg ${config.bg}`}>
                                                <i className={`${config.icon} ${config.color} text-xl`}></i>
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#1E293B]">
                                                    Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-0.5">
                                                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold uppercase ${config.bg} ${config.color}`}>
                                            {config.label}
                                        </span>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-5">
                                        {order.order_items?.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-5 py-3 first:pt-0">
                                                <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                            <i className="fa-solid fa-box text-2xl"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-[#1E293B] truncate">{item.name}</p>
                                                    <p className="text-gray-500 text-sm mt-1">Qty: {item.qty}</p>
                                                </div>
                                                <p className="font-bold text-[#1E293B]">{formatCurrency(item.price)}</p>
                                            </div>
                                        ))}
                                        {order.order_items?.length > 2 && (
                                            <p className="text-sm text-gray-500 mt-3 pl-24">
                                                + {order.order_items.length - 2} more items
                                            </p>
                                        )}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="flex items-center justify-between p-5 bg-gray-50 border-t border-gray-200">
                                        <div>
                                            <span className="text-sm text-gray-500">Total Amount</span>
                                            <p className="font-bold text-xl text-[#3B82F6] mt-1">
                                                {formatCurrency(order.total_amount)}
                                            </p>
                                        </div>
                                        <Link
                                            to={`/orders/${order.id}`}
                                            className="flex items-center gap-2 text-[#3B82F6] hover:text-[#2563EB] font-semibold text-sm px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                        >
                                            View Details
                                            <i className="fa-solid fa-chevron-right text-sm"></i>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
