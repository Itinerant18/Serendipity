"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useWishlistStore from "@/utils/wishlistStore";
import { formatCurrency } from "@/utils/format";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ActivityDashboard({ token }) {
    const [stats, setStats] = useState({
        recentOrders: 0,
        activeShipments: 0,
        totalSpent: 0,
        loading: true
    });

    const wishlistCount = useWishlistStore((state) => state.items?.length || 0);

    useEffect(() => {
        if (token) {
            fetchStats();
        } else {
            setStats(prev => ({ ...prev, loading: false }));
        }
    }, [token]);

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/orders/myorders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            const orders = data.orders || [];

            // Calculate stats
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentOrders = orders.filter(o =>
                new Date(o.created_at) > thirtyDaysAgo
            ).length;

            const activeShipments = orders.filter(o =>
                ['processing', 'shipped'].includes(o.payment_status?.toLowerCase() || o.status?.toLowerCase())
            ).length;

            const totalSpent = orders
                .filter(o => o.is_paid)
                .reduce((sum, o) => sum + (o.total_amount || 0), 0);

            setStats({
                recentOrders,
                activeShipments,
                totalSpent,
                loading: false
            });
        } catch (error) {
            console.error("Failed to fetch stats:", error);
            setStats(prev => ({ ...prev, loading: false }));
        }
    };

    const statCards = [
        {
            label: "Orders (30 days)",
            value: stats.recentOrders,
            icon: "fa-box",
            color: "bg-blue-200",
            link: "/orders"
        },
        {
            label: "Active Shipments",
            value: stats.activeShipments,
            icon: "fa-truck",
            color: "bg-purple-200",
            link: "/orders"
        },
        {
            label: "Wishlist Items",
            value: wishlistCount,
            icon: "fa-heart",
            color: "bg-pink-200",
            link: "/wishlist"
        },
        {
            label: "Total Spent",
            value: formatCurrency(stats.totalSpent),
            icon: "fa-wallet",
            color: "bg-green-200",
            isAmount: true
        }
    ];

    if (stats.loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-100 border-4 border-black p-4 animate-pulse h-24" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat, idx) => {
                const Content = (
                    <div
                        className={`${stat.color} border-4 border-black p-4 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all cursor-pointer group`}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="w-10 h-10 bg-white border-3 border-black flex items-center justify-center">
                                <i className={`fa-solid ${stat.icon} text-lg`} />
                            </div>
                            {stat.link && (
                                <i className="fa-solid fa-arrow-right text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                            )}
                        </div>
                        <p className={`font-brutalist text-2xl text-black ${stat.isAmount ? 'text-lg' : ''}`}>
                            {stat.value}
                        </p>
                        <p className="font-bold text-xs text-gray-700 uppercase tracking-wide">
                            {stat.label}
                        </p>
                    </div>
                );

                return stat.link ? (
                    <Link key={idx} to={stat.link} className="block">
                        {Content}
                    </Link>
                ) : (
                    <div key={idx}>{Content}</div>
                );
            })}
        </div>
    );
}
