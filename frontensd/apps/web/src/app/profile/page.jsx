"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, MapPin, CreditCard, Settings, User, LogOut, Shield, ShoppingBag, Heart, Star, Loader2 } from "lucide-react";
import useAuthStore from "@/utils/authStore";
import { formatCurrency } from "@/utils/format";

export default function ProfileOverviewPage() {
    const navigate = useNavigate();
    const { user, token, logout } = useAuthStore();
    const [profile, setProfile] = useState(null); // Re-adding profile state as it's used later
    const [recentOrders, setRecentOrders] = useState([]); // Re-adding recentOrders state as it's used later
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!token) {
                    navigate("/account/signin"); // Use navigate instead of window.location.href
                    return;
                }

                const headers = { Authorization: `Bearer ${token}` };

                const [profileRes, ordersRes] = await Promise.all([
                    fetch("http://localhost:5000/api/profile", { headers }),
                    fetch("http://localhost:5000/api/orders/myorders", { headers }),
                ]);

                if (profileRes.status === 401 || ordersRes.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/account/signin";
                    return;
                }

                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData);
                }

                if (ordersRes.ok) {
                    const ordersData = await ordersRes.json();
                    setRecentOrders(ordersData.slice(0, 3));
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#D97534] mx-auto" />
                <p className="text-gray-500 mt-4">Loading your profile...</p>
            </div>
        );
    }

    const stats = profile?.stats || { orders: 0, wishlist: 0, reviews: 0, addresses: 0 };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-playfair font-bold text-2xl text-gray-900">My Account</h1>
                    <p className="text-gray-600 mt-1">Overview of your account activity and quick links.</p>
                </div>
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#232F3E] text-white text-sm font-medium rounded-lg hover:bg-[#374151] transition-colors shadow-sm hover:shadow"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Start Shopping
                </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={ShoppingBag} label="Orders" value={stats.orders} href="/profile/orders" />
                <StatCard icon={Heart} label="Wishlist" value={stats.wishlist} href="/profile/wishlist" />
                <StatCard icon={Star} label="Reviews" value={stats.reviews} href="/profile/reviews" />
                <StatCard icon={MapPin} label="Addresses" value={stats.addresses} href="/profile/addresses" />
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Personal Information</h2>
                    <Link to="/profile/edit" className="text-[#D97534] hover:underline text-sm font-medium">
                        Edit →
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <InfoRow label="Name" value={profile?.user?.name || "Not set"} />
                    <InfoRow label="Email" value={profile?.user?.email || "Not set"} />
                    <InfoRow label="Phone" value={profile?.user?.mobile || "Not set"} />
                    <InfoRow label="Member Since" value={formatDate(profile?.user?.created_at)} />
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Recent Orders</h2>
                    <Link to="/profile/orders" className="text-[#D97534] hover:underline text-sm font-medium">
                        View All →
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                        <p>No orders yet. Start shopping!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {recentOrders.map((order) => (
                            <Link
                                key={order.id}
                                to={`/orders/${order.id}`}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div>
                                    <p className="font-medium text-gray-900">Order #{order.order_number || order.id.slice(0, 8)}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-[#067D62]">{formatCurrency(order.total_amount)}</p>
                                    <p className="text-xs text-gray-500 capitalize">{order.status || "Processing"}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, href }) {
    return (
        <Link
            to={href}
            className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-all group"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
                    <Icon className="w-5 h-5 text-[#D97534]" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                </div>
            </div>
        </Link>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex justify-between py-2 border-b border-gray-100 last:border-b-0">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-medium">{value}</span>
        </div>
    );
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}
