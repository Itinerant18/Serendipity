"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import useSocket from "@/utils/useSocket";
import { formatCurrency } from "@/utils/format";
import OrderCard from "@/components/OrderCard";
import GlassCard from "@/components/ui/GlassCard";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SellerOrdersPage() {
    const { token, user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [filter, setFilter] = useState("all");

    useSocket((event, data) => {
        if (event === 'NEW_ORDER') {
            console.log('New order received:', data);

            try {
                new Audio('https://assets.mixkit.co/sfx/preview/mixkit-positive-notification-951.mp3').play();
            } catch (e) {
                console.log('Audio play failed', e);
            }

            const newOrder = {
                id: data.orderId,
                order_number: data.orderNumber,
                total_amount: data.totalAmount,
                created_at: new Date().toISOString(),
                status: 'pending',
                isNew: true
            };

            setOrders(prev => [newOrder, ...prev]);

            setTimeout(() => {
                setOrders(prev => prev.map(o =>
                    o.id === data.orderId ? { ...o, isNew: false } : o
                ));
            }, 5000);
        }
        setIsConnected(true);
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/api/seller/orders?status=${filter}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Failed to fetch orders');
                const data = await res.json();
                setOrders(data || []);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch orders", error);
                setLoading(false);
            }
        };

        if (token) fetchOrders();
    }, [token, filter]);

    const filteredOrders = orders.filter(order => {
        if (!order?.status) return filter === "all";
        const status = (order.status || '').toLowerCase();
        if (filter === "all") return true;
        return status === filter;
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
            <GlassCard className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="font-brutalist text-3xl text-black bg-black text-white px-6 py-2 inline-block">
                            LIVE ORDER FEED
                        </h1>
                        <p className="font-bold text-black mt-2 bg-yellow-200 border-2 border-black px-4 py-1 inline-block">
                            Real-time orders for your store
                        </p>
                    </div>

                    <div className={`flex items-center gap-2 px-4 py-2 border-4 border-black font-bold transition-all ${isConnected
                            ? "bg-green-200 animate-pulse"
                            : "bg-gray-200"
                        }`}>
                        {isConnected ? (
                            <>
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <i className="fa-solid fa-wifi text-base"></i>
                                REAL-TIME ACTIVE
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-wifi-slash text-base"></i>
                                CONNECTING...
                            </>
                        )}
                    </div>
                </div>
            </GlassCard>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-black bg-black text-white px-3 py-1 border-4 border-black">
                    <i className="fa-solid fa-filter mr-2"></i>FILTER
                </span>
                {filterOptions.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 border-4 border-black font-bold transition-all ${filter === option.value
                                ? "bg-orange-500 text-white translate(-2px,-2px) shadow-[4px_4px_0_#000000]"
                                : "bg-white text-black hover:bg-pink-500 hover:text-white hover:translate(-2px,-2px)"
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
                <button
                    onClick={() => window.location.reload()}
                    className="ml-auto p-3 bg-black border-4 border-white text-white hover:bg-orange-500 transition-all"
                    title="Refresh"
                >
                    <i className="fa-solid fa-arrows-rotate text-xl"></i>
                </button>
            </div>

            {/* Orders Container */}
            <GlassCard className="p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <i className="fa-solid fa-spinner fa-spin text-6xl text-orange-500 animate-brutalist-jitter"></i>
                        <p className="font-brutalist text-xl text-black mt-4">LOADING ORDERS...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="relative">
                            <i className="fa-solid fa-clock text-6xl text-gray-300"></i>
                            {isConnected && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                                </span>
                            )}
                        </div>
                        <p className="font-brutalist text-2xl text-black bg-black text-white px-6 py-2 mt-4">
                            WAITING FOR NEW ORDERS...
                        </p>
                        <p className="font-bold text-black mt-2">
                            Orders will appear here instantly.
                        </p>
                        <div className="mt-6 flex items-center gap-2 font-bold text-black bg-yellow-200 border-4 border-black px-4 py-2">
                            <i className="fa-solid fa-bell text-orange-500"></i>
                            Sound notifications enabled
                        </div>
                    </div>
                ) : (
                    <div className="divide-y-4 divide-black">
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
            </GlassCard>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-4 text-center">
                    <p className="font-brutalist text-3xl text-black">{orders.length}</p>
                    <p className="font-bold text-sm text-black bg-yellow-200 border-2 border-black px-2 py-1 mt-1">TOTAL ORDERS TODAY</p>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <p className="font-brutalist text-3xl text-yellow-600">
                        {orders.filter(o => o.status === 'pending').length}
                    </p>
                    <p className="font-bold text-sm text-black bg-yellow-200 border-2 border-black px-2 py-1 mt-1">PENDING</p>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <p className="font-brutalist text-3xl text-green-600">
                        {formatCurrency(orders.reduce((sum, o) => sum + (o.total_amount || 0), 0))}
                    </p>
                    <p className="font-bold text-sm text-black bg-yellow-200 border-2 border-black px-2 py-1 mt-1">REVENUE TODAY</p>
                </GlassCard>
            </div>
        </div>
    );
}
