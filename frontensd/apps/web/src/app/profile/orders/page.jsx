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
                const res = await fetch("http://localhost:5000/api/orders/myorders", {
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

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D97534] mx-auto"></i>
                <p className="text-gray-500 mt-4">Loading orders...</p>
            </div>

        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair font-bold text-2xl text-gray-900">My Orders</h1>
                    <p className="text-gray-600 mt-1">Track and manage your order history</p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#232F3E] text-white text-sm font-medium rounded-lg hover:bg-[#374151] transition-colors shadow-sm hover:shadow"
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all duration-200 ${filter === status
                            ? "bg-gradient-to-r from-[#D97534] to-[#C86429] text-white shadow-md shadow-orange-200"
                            : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-gray-300"
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                        <i className="fa-solid fa-box text-5xl text-[#D97534]"></i>
                    </div>
                    <h3 className="font-playfair font-bold text-2xl text-gray-900 mb-3">No orders found</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto text-lg leading-relaxed">
                        {filter === "all"
                            ? "Looks like you haven't placed any orders yet. Discover our premium collection today."
                            : `You don't have any ${filter} orders at the moment.`}
                    </p>
                    <Link
                        to="/"
                        className="group relative inline-flex items-center gap-3 px-8 py-3 bg-[#232F3E] text-white font-medium rounded-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-0.5"
                    >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#D97534] to-[#C86429] opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"></span>
                        <span className="relative z-10 font-semibold tracking-wide flex items-center gap-2">
                            Start Shopping <i className="fa-solid fa-chevron-right text-sm transition-transform duration-300 group-hover:translate-x-1"></i>
                        </span>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => {
                        const status = order.status?.toLowerCase() || "pending";
                        const config = statusConfig[status] || statusConfig.pending;
                        const StatusIcon = config.icon;

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-orange-100 group"
                            >
                                {/* Order Header */}
                                <div className="flex items-center justify-between p-5 bg-gray-50/50 border-b border-gray-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2.5 rounded-full ${config.bg} ring-1 ring-inset ring-black/5`}>
                                            <i className={`${config.icon} ${config.color} text-xl`}></i>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">
                                                Order #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                                                <span>{new Date(order.created_at).toLocaleDateString("en-IN", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric"
                                                })}</span>
                                                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                                <span>{new Date(order.created_at).toLocaleTimeString("en-IN", {
                                                    hour: '2-digit', minute: '2-digit'
                                                })}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${config.bg} ${config.color} ring-1 ring-inset ring-current/10`}>
                                            {config.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="p-5">
                                    {order.order_items?.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-5 py-3 first:pt-0">
                                            <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <i className="fa-solid fa-box text-2xl"></i>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-gray-900 truncate text-lg">{item.name}</p>
                                                <p className="text-gray-500 mt-1">Qty: {item.qty}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 text-lg">{formatCurrency(item.price)}</p>
                                        </div>
                                    ))}
                                    {order.order_items?.length > 2 && (
                                        <p className="text-sm text-gray-500 mt-3 font-medium pl-24">
                                            + {order.order_items.length - 2} more items included in this order
                                        </p>
                                    )}
                                </div>

                                {/* Order Footer */}
                                <div className="flex items-center justify-between p-5 bg-gray-50/30 border-t border-gray-100">
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-500 mb-1">Total Amount</span>
                                        <span className="font-playfair font-bold text-xl text-[#067D62]">
                                            {formatCurrency(order.total_amount)}
                                        </span>
                                    </div>
                                    <Link
                                        to={`/orders/${order.id}`}
                                        className="flex items-center gap-2 text-[#D97534] hover:text-[#C86429] font-semibold text-sm group/link px-4 py-2 hover:bg-orange-50 rounded-lg transition-colors"
                                    >
                                        View Order Details
                                        <i className="fa-solid fa-chevron-right text-sm transition-transform duration-200 group-hover/link:translate-x-1"></i>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
