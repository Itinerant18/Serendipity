"use client";

import React from "react";
import useAuth from "@/utils/useAuth";
import { Package, Users, BarChart } from "lucide-react";

export default function AdminDashboard() {
    const { token } = useAuth();
    const [stats, setStats] = React.useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/orders/admin/stats', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Failed to fetch admin stats", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchStats();
    }, [token]);

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12">
                    <h1 className="font-playfair font-bold text-4xl text-[#8B4513] mb-2">
                        Admin Dashboard
                    </h1>
                    <p className="font-inter text-gray-600">
                        Overview of your store performance.
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-[#D97534]">
                        <p className="text-gray-500 font-inter text-sm uppercase tracking-wide">Total Sales</p>
                        <h3 className="text-3xl font-bold font-playfair text-[#232f3e] mt-2">
                            ${stats.totalSales}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
                        <p className="text-gray-500 font-inter text-sm uppercase tracking-wide">Total Orders</p>
                        <h3 className="text-3xl font-bold font-playfair text-[#232f3e] mt-2">
                            {stats.totalOrders}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                        <p className="text-gray-500 font-inter text-sm uppercase tracking-wide">Products</p>
                        <h3 className="text-3xl font-bold font-playfair text-[#232f3e] mt-2">
                            {stats.totalProducts}
                        </h3>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
                        <p className="text-gray-500 font-inter text-sm uppercase tracking-wide">Users</p>
                        <h3 className="text-3xl font-bold font-playfair text-[#232f3e] mt-2">
                            {stats.totalUsers}
                        </h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Products Card */}
                    <a
                        href="/admin/products"
                        className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 block group border border-orange-100"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-inter font-bold text-2xl text-gray-800">
                                Products
                            </h2>
                            <div className="p-4 bg-orange-100 rounded-full group-hover:bg-[#D97534] transition-colors group-hover:text-white">
                                <Package className="w-8 h-8 text-[#D97534] group-hover:text-white" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-inter leading-relaxed">
                            Manage inventory. Currently {stats.totalProducts} active products.
                        </p>
                        <div className="mt-6 flex items-center text-[#D97534] font-semibold font-inter">
                            Manage Products <span className="ml-2">→</span>
                        </div>
                    </a>

                    {/* Users Card (Placeholder) */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg opacity-60 cursor-not-allowed border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">COMING SOON</div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-inter font-bold text-2xl text-gray-800">
                                Users
                            </h2>
                            <div className="p-4 bg-gray-100 rounded-full">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-inter leading-relaxed">
                            View registered users. currently {stats.totalUsers} users.
                        </p>
                    </div>

                    {/* Analytics Card (Placeholder) */}
                    <div className="bg-white p-8 rounded-2xl shadow-lg opacity-60 cursor-not-allowed border border-gray-100 relative overflow-hidden">
                        <div className="absolute top-4 right-4 bg-gray-100 text-gray-500 text-xs font-bold px-2 py-1 rounded">COMING SOON</div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-inter font-bold text-2xl text-gray-800">
                                Analytics
                            </h2>
                            <div className="p-4 bg-gray-100 rounded-full">
                                <BarChart className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <p className="text-gray-600 font-inter leading-relaxed">
                            Track sales performance.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .font-inter { font-family: 'Inter', sans-serif; }
                .font-playfair { font-family: 'Playfair Display', serif; }
            `}</style>
        </div>
    );
}
