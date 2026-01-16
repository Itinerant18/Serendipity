"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import useSocket from "@/utils/useSocket";
// FontAwesome icons loaded globally
import { formatCurrency } from "@/utils/format";
import OrderCard from "@/components/OrderCard";

export default function SellerOrdersPage() {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [filter, setFilter] = useState("all");

    // Real-time order notifications via Socket.io
    useSocket((event, data) => {
        if (event === 'NEW_ORDER') {
            console.log('New order received:', data);

            // Play notification sound
            try {
                new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3').play();
            } catch (e) {
                console.log('Audio play failed', e);
            }

            // Add to orders list with isNew flag
            const newOrder = {
                id: data.orderId,
                order_number: data.orderNumber,
                total_amount: data.totalAmount,
                created_at: new Date().toISOString(),
                status: 'pending',
                isNew: true
            };

            setOrders(prev => [newOrder, ...prev]);

            // Remove isNew flag after 5 seconds
            setTimeout(() => {
                setOrders(prev => prev.map(o =>
                    o.id === data.orderId ? { ...o, isNew: false } : o
                ));
            }, 5000);
        }
        setIsConnected(true);
    });

    // Fetch existing orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Note: This endpoint needs to be created on the backend
                // For now, we'll show empty state and rely on real-time
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                setLoading(false);
            }
        };

        if (token) fetchOrders();
    }, [token]);

    const filteredOrders = orders.filter(order => {
        if (filter === "all") return true;
        return order.status === filter;
    });

    const filterOptions = [
        { value: "all", label: "All Orders" },
        { value: "pending", label: "Pending" },
        { value: "shipped", label: "Shipped" },
        { value: "delivered", label: "Delivered" }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold font-playfair text-[#232f3e]">Live Order Feed</h1>

                {/* Connection Status */}
                <div className={`flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all ${isConnected
                    ? "bg-green-100 text-green-700 shadow-sm"
                    : "bg-gray-100 text-gray-500"
                    }`}>
                    {isConnected ? (
                        <>
                            <span className="relative flex h-2.5 w-2.5 mr-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                            </span>
                            <i className="fa-solid fa-wifi text-base"></i>
                            REAL-TIME ACTIVE
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-wifi-slash text-base"></i>
                            Connecting...
                        </>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <i className="fa-solid fa-filter text-base text-gray-400"></i>
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filter === option.value
                            ? "bg-[#D97534] text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
                <button
                    onClick={() => window.location.reload()}
                    className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Refresh"
                >
                    <i className="fa-solid fa-arrows-rotate text-base"></i>
                </button>
            </div>

            {/* Orders Container */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#D97534] mx-auto"></div>
                        <p className="text-gray-500 mt-4">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="relative">
                            <i className="fa-solid fa-clock text-6xl text-gray-200"></i>
                            {isConnected && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="text-lg mt-4 font-medium">Waiting for new orders...</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Orders containing your products will appear here instantly.
                        </p>
                        <div className="mt-6 flex items-center text-xs text-gray-400">
                            <i className="fa-solid fa-bell text-sm"></i>
                            Sound notifications enabled
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredOrders.map((order, index) => (
                            <div key={order.id || index} className="p-4">
                                <OrderCard
                                    order={order}
                                    isNew={order.isNew}
                                    onViewDetails={() => console.log('View order:', order.id)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                    <p className="text-xs text-gray-500">Total Orders Today</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-yellow-600">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                    <p className="text-xs text-gray-500">Pending</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center border border-gray-100">
                    <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
                    </p>
                    <p className="text-xs text-gray-500">Revenue Today</p>
                </div>
            </div>
        </div>
    );
}
