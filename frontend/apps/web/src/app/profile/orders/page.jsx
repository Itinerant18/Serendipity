"use client";

import { API_URL } from '@/lib/api';

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useAuthStore from "@/utils/authStore";
import { formatCurrency } from "@/utils/format";
import GlassCard from "@/components/ui/GlassCard";
import toast from "react-hot-toast";

const statusConfig = {
    pending: { icon: "fa-clock", color: "bg-yellow-200", label: "Pending" },
    confirmed: { icon: "fa-circle-check", color: "bg-blue-200", label: "Confirmed" },
    packed: { icon: "fa-box", color: "bg-indigo-200", label: "Packed" },
    shipped: { icon: "fa-truck", color: "bg-purple-200", label: "Shipped" },
    out_for_delivery: { icon: "fa-truck-fast", color: "bg-orange-200", label: "Out for Delivery" },
    delivered: { icon: "fa-circle-check", color: "bg-green-200", label: "Delivered" },
    cancelled: { icon: "fa-circle-xmark", color: "bg-red-200", label: "Cancelled" },
    returned: { icon: "fa-rotate-left", color: "bg-gray-200", label: "Returned" },
};

const BUYER_CANCELLABLE = ["pending", "confirmed"];

export default function OrdersPage() {
    const token = useAuthStore(state => state.token);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (!token) return;
                const res = await fetch(`${API_URL}/api/orders/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOrders(data.orders || data || []);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    const handleCancel = async (orderId) => {
        const reason = prompt("Why do you want to cancel this order?");
        if (reason === null) return;

        setCancellingId(orderId);
        try {
            const res = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ reason: reason || "Cancelled by buyer" })
            });

            const data = await res.json();
            if (res.ok) {
                toast.success("Order cancelled successfully");
                setOrders(prev => prev.map(o =>
                    o.id === orderId ? { ...o, status: "cancelled" } : o
                ));
            } else {
                toast.error(data.message || "Failed to cancel");
            }
        } catch (err) {
            toast.error("Error cancelling order");
        } finally {
            setCancellingId(null);
        }
    };

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-white border-8 border-black flex items-center justify-center">
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin text-6xl text-orange-500 animate-brutalist-jitter"></i>
                    <p className="font-brutalist text-xl text-black mt-4">LOADING ORDERS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white border-8 border-black">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <GlassCard className="p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="font-brutalist text-4xl text-black bg-black text-white px-6 py-2 inline-block">
                                MY ORDERS
                            </h1>
                            <p className="font-bold text-black mt-2 bg-yellow-200 border-2 border-black px-4 py-1 inline-block">
                                Track and manage your order history
                            </p>
                        </div>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_#000000] transition-all"
                        >
                            <i className="fa-solid fa-shopping-bag"></i>
                            CONTINUE SHOPPING
                        </Link>
                    </div>
                </GlassCard>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 border-4 border-black font-bold capitalize transition-all cursor-pointer ${filter === status
                                ? "bg-orange-500 text-white translate-x-[-2px] translate-y-[-2px] shadow-[4px_4px_0_#000000]"
                                : "bg-white text-black hover:bg-pink-500 hover:text-white hover:translate-x-[-2px] hover:translate-y-[-2px]"
                                }`}
                        >
                            {status === "all" ? "All" : statusConfig[status]?.label || status}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <GlassCard className="p-16 text-center">
                        <div className="w-24 h-24 bg-gray-200 border-4 border-black flex items-center justify-center mx-auto mb-6 animate-brutalist-jitter">
                            <i className="fa-solid fa-box text-5xl text-black"></i>
                        </div>
                        <h3 className="font-brutalist text-3xl text-black bg-black text-white px-6 py-2 inline-block mb-4">
                            NO ORDERS FOUND
                        </h3>
                        <p className="font-bold text-black mb-8 max-w-sm mx-auto">
                            {filter === "all"
                                ? "You haven't placed any orders yet. Start shopping now!"
                                : `You don't have any ${statusConfig[filter]?.label || filter} orders.`}
                        </p>
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[8px_8px_0_#000000] transition-all"
                        >
                            <i className="fa-solid fa-shopping-bag"></i>
                            START SHOPPING
                        </Link>
                    </GlassCard>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => {
                            const status = order.status?.toLowerCase() || "pending";
                            const config = statusConfig[status] || statusConfig.pending;
                            const canCancel = BUYER_CANCELLABLE.includes(status);
                            const items = order.items || order.order_items || [];

                            return (
                                <GlassCard key={order.id} className="overflow-hidden">
                                    {/* Order Header */}
                                    <div className="flex flex-wrap items-center justify-between p-4 bg-yellow-100 border-b-4 border-black gap-3">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${config.color} border-4 border-black flex items-center justify-center`}>
                                                <i className={`fa-solid ${config.icon} text-xl`}></i>
                                            </div>
                                            <div>
                                                <p className="font-brutalist text-xl text-black">
                                                    Order #{order.order_number || order.id?.slice(0, 8).toUpperCase()}
                                                </p>
                                                <p className="font-bold text-sm text-black">
                                                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                                                        year: "numeric", month: "long", day: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Payment method badge */}
                                            <span className={`px-3 py-1 border-2 border-black font-bold text-xs ${order.payment_method === 'COD' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                                }`}>
                                                {order.payment_method === 'COD' ? 'Cash on Delivery' : order.payment_method || 'Online'}
                                            </span>

                                            {/* Status badge */}
                                            <span className={`inline-flex items-center px-4 py-2 border-4 border-black font-bold ${config.color}`}>
                                                <i className={`fa-solid ${config.icon} mr-2`}></i>
                                                {config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="p-4">
                                        {items.slice(0, 2).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-5 py-3 first:pt-0">
                                                <div className="w-20 h-20 bg-white border-4 border-black overflow-hidden flex-shrink-0">
                                                    {(item.image || item.image_url) ? (
                                                        <img src={item.image || item.image_url} alt={item.name || item.product_title} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                                            <i className="fa-solid fa-box text-2xl text-gray-400"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-black truncate">{item.name || item.product_title}</p>
                                                    <p className="font-bold text-sm text-gray-600">Qty: {item.qty || item.quantity}</p>
                                                </div>
                                                <p className="font-brutalist text-xl text-black">{formatCurrency(item.price)}</p>
                                            </div>
                                        ))}
                                        {items.length > 2 && (
                                            <p className="font-bold text-sm text-black mt-3 pl-24">
                                                + {items.length - 2} more items
                                            </p>
                                        )}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="flex flex-wrap items-center justify-between p-4 bg-gray-100 border-t-4 border-black gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-black">TOTAL AMOUNT</p>
                                            <p className="font-brutalist text-2xl text-orange-600">
                                                {formatCurrency(order.total_amount)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancel(order.id)}
                                                    disabled={cancellingId === order.id}
                                                    className="px-4 py-3 bg-red-500 text-white font-bold border-4 border-black hover:bg-red-600 transition-all disabled:opacity-50 cursor-pointer"
                                                >
                                                    {cancellingId === order.id ? (
                                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                                    ) : (
                                                        <>
                                                            <i className="fa-solid fa-xmark mr-1"></i>
                                                            CANCEL
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
