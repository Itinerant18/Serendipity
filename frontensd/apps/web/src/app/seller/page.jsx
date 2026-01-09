"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { DollarSign, Package, ShoppingBag, TrendingUp } from "lucide-react";

export default function SellerDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = useState({ totalSales: 0, totalOrders: 0, totalProducts: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/seller/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
    }, [token]);

    const items = [
        { title: "Total Sales", value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: "bg-green-100 text-green-600" },
        { title: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-100 text-blue-600" },
        { title: "Active Products", value: stats.totalProducts, icon: Package, color: "bg-orange-100 text-orange-600" },
        { title: "Growth", value: "+12%", icon: TrendingUp, color: "bg-purple-100 text-purple-600" }, // Mock data
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold font-playfair text-[#232f3e]">Seller Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item) => (
                    <div key={item.title} className="bg-white rounded-lg shadow-sm p-6 flex items-center space-x-4 border border-gray-100 hover:shadow-md transition-shadow">
                        <div className={`p-4 rounded-full ${item.color}`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{item.title}</p>
                            <h3 className="text-2xl font-bold font-inter text-[#232f3e]">{loading ? "..." : item.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#232f3e] mb-4">Recent Activity</h2>
                    <div className="text-gray-500 text-sm italic">
                        Real-time order feed coming soon...
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-[#232f3e] mb-4">Inventory Status</h2>
                    <div className="text-gray-500 text-sm italic">
                        Low stock alerts will appear here.
                    </div>
                </div>
            </div>
        </div>
    );
}
