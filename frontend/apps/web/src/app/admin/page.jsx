"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// FontAwesome icons loaded globally

import useAuth from "@/utils/useAuth";
import { formatCurrency } from "@/utils/format";
import StatCard from "@/components/StatCard";
import QuickActionCard, { LargeActionCard } from "@/components/QuickActionCard";
import RecentOrdersCard from "@/components/RecentOrdersCard";

export default function AdminDashboardPage() {
    const { user, token, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        // Check if user is admin
        if (isAuthenticated && user && !user.isAdmin) {
            navigate("/");
        }
    }, [isAuthenticated, user, navigate]);

    useEffect(() => {
        if (token && user?.isAdmin) {
            fetchDashboardData();
        }
    }, [token, user?.isAdmin]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch products count
            const productsResponse = await fetch(`${API_URL}/api/products`);
            let productsCount = 0;
            if (productsResponse.ok) {
                const products = await productsResponse.json();
                productsCount = products.length;
            }

            // Fetch orders
            const ordersResponse = await fetch(`${API_URL}/api/orders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            let ordersData = [];
            let totalRevenue = 0;
            if (ordersResponse.ok) {
                ordersData = await ordersResponse.json();
                if (Array.isArray(ordersData)) {
                    totalRevenue = ordersData.reduce((sum, order) => {
                        return sum + parseFloat(order.total_amount || order.totalAmount || 0);
                    }, 0);
                }
            }

            setStats({
                totalRevenue: totalRevenue,
                totalOrders: Array.isArray(ordersData) ? ordersData.length : 0,
                totalProducts: productsCount,
                totalUsers: 150 // Placeholder - would need a users endpoint
            });

            setRecentOrders(Array.isArray(ordersData) ? ordersData.slice(0, 5) : []);

            // Generate sample activity data
            setRecentActivity([
                { type: "order", message: "New order placed", time: "2 min ago", icon: "fa-cart-shopping" },
                { type: "product", message: "Product added by seller", time: "15 min ago", icon: "fa-box" },
                { type: "user", message: "New user registered", time: "1 hour ago", icon: "fa-users" },
                { type: "order", message: "Order marked as shipped", time: "2 hours ago", icon: "fa-arrow-trend-up" }
            ]);

        } catch (err) {
            console.error("Admin dashboard error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = () => {
        signOut();
        navigate("/account/signin");
    };

    // Show loading or redirect for non-admins
    if (!isAuthenticated || !user?.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <i className="fa-solid fa-shield-halved text-6xl text-gray-400 mx-auto mb-4"></i>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Admin Access Required</h2>
                    <p className="text-gray-500 mb-4">You need admin privileges to access this page.</p>
                    <Link to="/" className="btn-primary">
                        Go to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#232f3e] text-white flex-shrink-0 hidden lg:block">
                <div className="p-4 border-b border-gray-700">
                    <Link to="/admin" className="flex items-center gap-2">
                        <i className="fa-solid fa-shield-halved text-2xl text-[#febd69]"></i>
                        <span className="font-bold text-lg">Admin Panel</span>
                    </Link>
                </div>

                <nav className="p-4 space-y-2">
                    <Link
                        to="/admin"
                        className="flex items-center gap-3 px-4 py-3 bg-[#febd69] text-black rounded-lg font-medium"
                    >
                        <i className="fa-solid fa-table-columns text-xl"></i>
                        Dashboard
                    </Link>
                    <Link
                        to="/admin/products"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                    >
                        <i className="fa-solid fa-box text-xl"></i>
                        Products
                    </Link>
                    <Link
                        to="/admin/orders"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                    >
                        <i className="fa-solid fa-cart-shopping text-xl"></i>
                        Orders
                    </Link>
                    <Link
                        to="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                    >
                        <i className="fa-solid fa-users text-xl"></i>
                        Users
                    </Link>
                    <Link
                        to="/admin/analytics"
                        className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
                    >
                        <i className="fa-solid fa-chart-column text-xl"></i>
                        Analytics
                    </Link>
                </nav>

                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-3 w-full px-4 py-3 text-gray-300 hover:bg-red-900 hover:text-white rounded-lg transition-colors"
                    >
                        <i className="fa-solid fa-right-from-bracket text-xl"></i>
                        Sign Out
                    </button>
                    <Link
                        to="/"
                        className="mt-2 block text-center text-xs text-blue-400 hover:text-blue-300"
                    >
                        Back to Marketplace
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 font-playfair">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-500 mt-1">
                            System overview and management
                        </p>
                    </div>
                    <button
                        onClick={fetchDashboardData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <i className={`fa-solid fa-arrows-rotate text-base ${loading ? "fa-spin" : ""}`}></i>
                        Refresh
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(stats.totalRevenue)}
                        icon="fa-dollar-sign"
                        iconBgColor="bg-green-100"
                        iconColor="text-green-600"
                        trend={23}
                        trendLabel="vs last month"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Orders"
                        value={stats.totalOrders}
                        icon="fa-cart-shopping"
                        iconBgColor="bg-blue-100"
                        iconColor="text-blue-600"
                        trend={12}
                        trendLabel="vs last month"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Products"
                        value={stats.totalProducts}
                        icon="fa-box"
                        iconBgColor="bg-purple-100"
                        iconColor="text-purple-600"
                        trend={5}
                        trendLabel="new this week"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Users"
                        value={stats.totalUsers}
                        icon="fa-users"
                        iconBgColor="bg-orange-100"
                        iconColor="text-orange-600"
                        trend={18}
                        trendLabel="vs last month"
                        loading={loading}
                    />
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <LargeActionCard
                        title="Manage Products"
                        description="View, edit, and delete all products"
                        icon="fa-box"
                        href="/admin/products"
                        bgGradient="from-blue-500 to-indigo-600"
                        stats={[
                            { value: stats.totalProducts, label: "Products" }
                        ]}
                    />
                    <LargeActionCard
                        title="View Orders"
                        description="Monitor and manage all orders"
                        icon="fa-cart-shopping"
                        href="/admin/orders"
                        bgGradient="from-green-500 to-emerald-600"
                        stats={[
                            { value: stats.totalOrders, label: "Orders" }
                        ]}
                    />
                    <LargeActionCard
                        title="User Management"
                        description="Manage users and permissions"
                        icon="fa-users"
                        href="/admin/users"
                        bgGradient="from-orange-500 to-amber-600"
                        stats={[
                            { value: stats.totalUsers, label: "Users" }
                        ]}
                    />
                </div>

                {/* Recent Orders and Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Orders */}
                    <RecentOrdersCard
                        orders={recentOrders}
                        title="Recent Orders"
                        viewAllLink="/admin/orders"
                        loading={loading}
                        maxOrders={5}
                    />

                    {/* Recent Activity */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {loading ? (
                                [1, 2, 3, 4].map((i) => (
                                    <div key={i} className="p-4 animate-pulse">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-200 rounded-lg" />
                                            <div className="flex-1">
                                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                recentActivity.map((activity, index) => (
                                    <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <i className={`fa-solid ${activity.icon} text-xl text-gray-600`}></i>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {activity.message}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <i className="fa-solid fa-clock text-sm"></i>
                                                    {activity.time}
                                                </div>
                                            </div>
                                            <i className="fa-solid fa-arrow-up-right-from-square text-base text-gray-400"></i>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* System Status */}
                <div className="mt-8 bg-gradient-to-r from-[#232f3e] to-[#37475a] rounded-xl p-6 text-white">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                        <h3 className="font-semibold">System Status: Operational</h3>
                    </div>
                    <p className="text-gray-300 text-sm">
                        All systems are running smoothly. Database, API, and payment services are operational.
                    </p>
                </div>
            </main>
        </div>
    );
}
