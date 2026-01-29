"use client";

import React, { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { formatCurrency } from "@/utils/format";
import GlassCard from "@/components/ui/GlassCard";

const statusConfig = {
    pending: { icon: "fa-clock", color: "bg-yellow-200", text: "text-black", border: "border-black", label: "Pending" },
    processing: { icon: "fa-box", color: "bg-blue-200", text: "text-black", border: "border-black", label: "Processing" },
    shipped: { icon: "fa-truck", color: "bg-purple-200", text: "text-black", border: "border-black", label: "Shipped" },
    delivered: { icon: "fa-circle-check", color: "bg-green-200", text: "text-black", border: "border-black", label: "Delivered" },
    cancelled: { icon: "fa-circle-xmark", color: "bg-red-200", text: "text-black", border: "border-black", label: "Cancelled" },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const { user, token, isAuthenticated } = useAuth();

    useEffect(() => {
        if (token) {
            fetchOrders();
        } else if (!loading && !isAuthenticated) {
            window.location.href = "/account/signin?callbackUrl=/orders";
        }
    }, [token, isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/orders/history", {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.orders) {
                setOrders(data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredOrders = filter === "all"
        ? orders
        : orders.filter(o => o.status?.toLowerCase() === filter);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

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
                                Track and manage your orders
                            </p>
                        </div>
                        <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all">
                            <i className="fa-solid fa-shopping-bag"></i>
                            CONTINUE SHOPPING
                        </a>
                    </div>
                </GlassCard>

                {/* Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 border-4 border-black font-bold capitalize transition-all ${
                                filter === status
                                    ? "bg-orange-500 text-white translate(-2px,-2px) shadow-[4px_4px_0_#000000]"
                                    : "bg-white text-black hover:bg-pink-500 hover:text-white hover:translate(-2px,-2px)"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <GlassCard className="p-16 text-center">
                        <div className="w-24 h-24 bg-gray-200 border-4 border-black flex items-center justify-center mx-auto mb-6 animate-brutalist-jitter">
                            <i className="fa-solid fa-box text-5xl text-black"></i>
                        </div>
                        <h2 className="font-brutalist text-3xl text-black bg-black text-white px-6 py-2 inline-block mb-4">
                            NO ORDERS FOUND
                        </h2>
                        <p className="font-bold text-black mb-8 max-w-md mx-auto">
                            {filter === "all"
                                ? "You haven't placed any orders yet. Start shopping now!"
                                : `You don't have any ${filter} orders.`}
                        </p>
                        <a href="/" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all">
                            <i className="fa-solid fa-shopping-bag"></i>
                            START SHOPPING
                        </a>
                    </GlassCard>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map((order) => {
                            const status = order.status?.toLowerCase() || order.payment_status?.toLowerCase() || "pending";
                            const config = statusConfig[status] || statusConfig.pending;

                            return (
                                <GlassCard key={order.id} className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-4 border-b-4 border-black">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 ${config.color} border-4 border-black flex items-center justify-center`}>
                                                <i className={`fa-solid ${config.icon} text-xl`}></i>
                                            </div>
                                            <div>
                                                <p className="font-brutalist text-xl text-black">
                                                    Order #{order.order_number}
                                                </p>
                                                <p className="font-bold text-sm text-black">
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                                            <span className={`inline-flex items-center px-4 py-2 border-4 border-black font-bold ${config.color}`}>
                                                <i className={`fa-solid ${config.icon} mr-2`}></i>
                                                {order.payment_status?.charAt(0).toUpperCase() + order.payment_status?.slice(1) || config.label}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Order Items */}
                                    <div className="space-y-4">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex gap-4 items-center">
                                                <div className="w-20 h-20 bg-white border-4 border-black overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.product_title}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-black truncate">{item.product_title}</p>
                                                    <p className="font-bold text-sm text-gray-600">
                                                        Quantity: {item.quantity} × {typeof item.price === "string" ? item.price : formatCurrency(item.price)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Order Footer */}
                                    <div className="mt-4 pt-4 border-t-4 border-black flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-black">TOTAL AMOUNT</p>
                                            <p className="font-brutalist text-2xl text-black bg-yellow-200 border-4 border-black px-4 py-1">
                                                {formatCurrency(order.total_amount)}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center px-4 py-2 border-4 border-black font-bold ${config.color}`}>
                                            {config.label}
                                        </span>
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
