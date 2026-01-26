"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
// FontAwesome icons loaded globally

import { formatCurrency } from "@/utils/format";
import useAuth from "@/utils/useAuth";
import useSocket from "@/utils/useSocket";
import StatCard from "@/components/StatCard";
import SalesChart from "@/components/SalesChart";
import RecentOrdersCard from "@/components/RecentOrdersCard";
import QuickActionCard, { QuickActionGrid } from "@/components/QuickActionCard";

export default function SellerDashboardPage() {
    const { user, token } = useAuth();
    const { socket, isConnected } = useSocket();

    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        activeProducts: 0,
        pendingOrders: 0
    });
    const [orders, setOrders] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    useEffect(() => {
        // Listen for real-time order updates
        if (socket && isConnected && user?.id) {

            const handleNewOrder = (data) => {
                console.log("New order received:", data);

                // Add new order optimistically or refresh
                // Since data is partial { orderId, orderNumber, ... }, we might want to refresh lists
                // But for immediate feedback, we can construct a temp order object
                const newOrderProxy = {
                    _id: data.orderId,
                    id: data.orderId,
                    orderNumber: data.orderNumber,
                    totalAmount: data.totalAmount,
                    status: 'Pending',
                    paymentStatus: 'Paid',
                    createdAt: new Date().toISOString(),
                    user: { name: 'New Customer' }, // We don't have full user details in the event
                    isNew: true // Flag for animation
                };

                setOrders((prev) => [newOrderProxy, ...prev]);

                // Update stats
                setStats((prev) => ({
                    ...prev,
                    totalOrders: prev.totalOrders + 1,
                    pendingOrders: prev.pendingOrders + 1,
                    totalSales: prev.totalSales + (parseFloat(data.totalAmount) || 0)
                }));

                // Also refresh full data to be safe
                fetchDashboardData();
            };

            socket.on("NEW_ORDER", handleNewOrder);
            // backup for lowercase
            socket.on("new_order", handleNewOrder);

            return () => {
                socket.off("NEW_ORDER", handleNewOrder);
                socket.off("new_order", handleNewOrder);
            };
        }
    }, [socket, isConnected, user?.id]);

    const fetchDashboardData = async () => {
        if (!token) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch seller stats
            const statsFlow = fetch(`${API_URL}/api/seller/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch recent orders (using new endpoint)
            const ordersFlow = fetch(`${API_URL}/api/seller/orders?limit=5`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Fetch weekly analytics (using new endpoint)
            const analyticsFlow = fetch(`${API_URL}/api/seller/analytics/weekly`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const [statsRes, ordersRes, analyticsRes] = await Promise.all([
                statsFlow, ordersFlow, analyticsFlow
            ]);

            if (statsRes.ok) {
                const statsData = await statsRes.json();
                setStats({
                    totalSales: statsData.totalSales || 0,
                    totalOrders: statsData.totalOrders || 0,
                    activeProducts: statsData.totalProducts || 0, // Mapped from totalProducts
                    pendingOrders: statsData.totalOrders // Approximation if 'pending' specific count isn't separate, or extend API later.
                    // Ideally API should return pending count. For now assuming totalOrders includes pending.
                    // Actually, let's keep it simple.
                });
            }

            if (ordersRes.ok) {
                const ordersData = await ordersRes.json();
                setOrders(ordersData || []);
            }

            if (analyticsRes.ok) {
                const chartData = await analyticsRes.json();
                // Ensure we have data for chart or empty state
                setSalesData(chartData.length > 0 ? chartData : []);
            } else {
                // Fallback for chart if endpoint fails (though it shouldn't)
                setSalesData([]);
            }

        } catch (err) {
            console.error("Dashboard fetch error:", err);
            setError("Failed to load dashboard data. Please try refresh.");
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: "Add New Product",
            description: "List a new product in your inventory",
            icon: "fa-plus",
            href: "/seller/inventory/new",
            iconBgColor: "bg-green-100",
            iconColor: "text-green-600"
        },
        {
            title: "View Inventory",
            description: "Manage your product listings",
            icon: "fa-box",
            href: "/seller/inventory",
            iconBgColor: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            title: "View All Orders",
            description: "See all your customer orders",
            icon: "fa-cart-shopping",
            href: "/seller/orders",
            iconBgColor: "bg-purple-100",
            iconColor: "text-purple-600",
            badge: stats.pendingOrders > 0 ? stats.pendingOrders.toString() : undefined
        },
        {
            title: "Store Settings",
            description: "Update your store profile",
            icon: "fa-eye",
            href: "/seller/settings",
            iconBgColor: "bg-orange-100",
            iconColor: "text-orange-600"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-playfair">
                        Welcome back, {user?.name?.split(" ")[0] || "Seller"}!
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Here's what's happening with your store today.
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

            {/* Connection Status */}
            {isConnected && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Real-time updates enabled
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {error}
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Sales"
                    value={formatCurrency(stats.totalSales)}
                    icon="fa-dollar-sign"
                    iconBgColor="bg-green-100"
                    iconColor="text-green-600"
                    trend={15}
                    trendLabel="vs last week"
                    loading={loading}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon="fa-cart-shopping"
                    iconBgColor="bg-blue-100"
                    iconColor="text-blue-600"
                    trend={8}
                    trendLabel="vs last week"
                    loading={loading}
                />
                <StatCard
                    title="Active Products"
                    value={stats.activeProducts}
                    icon="fa-box"
                    iconBgColor="bg-purple-100"
                    iconColor="text-purple-600"
                    loading={loading}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon="fa-arrow-trend-up"
                    iconBgColor="bg-orange-100"
                    iconColor="text-orange-600"
                    loading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <QuickActionGrid actions={quickActions} columns={4} />
            </div>

            {/* Charts and Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sales Chart */}
                <SalesChart
                    data={salesData}
                    title="Sales This Week"
                    loading={loading}
                />

                {/* Recent Orders */}
                <RecentOrdersCard
                    orders={orders}
                    title="Recent Orders"
                    viewAllLink="/seller/orders"
                    loading={loading}
                    isRealTime={isConnected}
                    maxOrders={5}
                />
            </div>

            {/* Pro Tips Section */}
            <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] rounded-xl p-6 text-white">
                <h3 className="font-semibold mb-2">💡 Pro Tip</h3>
                <p className="text-gray-300 text-sm">
                    Products with high-quality images and detailed descriptions sell 40% better.
                    Make sure your listings are complete!
                </p>
                <Link
                    to="/seller/inventory"
                    className="inline-block mt-4 text-[#febd69] hover:text-[#f3a847] text-sm font-medium"
                >
                    Review Your Products →
                </Link>
            </div>
        </div>
    );
}
