"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
// FontAwesome icons loaded globally

const navItems = [
    { href: "/profile", label: "Overview", icon: "fa-user" },
    { href: "/profile/edit", label: "Edit Profile", icon: "fa-user" },
    { href: "/profile/addresses", label: "Addresses", icon: "fa-location-dot" },
    { href: "/profile/payment-methods", label: "Payment Methods", icon: "fa-credit-card" },
    { href: "/profile/orders", label: "My Orders", icon: "fa-bag-shopping" },
    { href: "/profile/wishlist", label: "Wishlist", icon: "fa-heart" },
    { href: "/profile/reviews", label: "My Reviews", icon: "fa-star" },
    { href: "/profile/settings", label: "Settings", icon: "fa-gear" },
    { href: "/profile/security", label: "Security", icon: "fa-shield-halved" },
];

export default function ProfileSidebar({ user }) {
    const location = useLocation();

    return (
        <aside className="w-full md:w-64 flex-shrink-0">
            {/* User Card */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D97534] to-[#febd69] flex items-center justify-center text-white text-2xl font-bold">
                        {user?.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={user.name}
                                className="w-full h-full rounded-full object-cover"
                            />
                        ) : (
                            user?.name?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-playfair font-bold text-lg text-gray-900 truncate">
                            {user?.name || "Guest"}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                            {user?.email || ""}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {navItems.map((item) => {
                    const iconClass = item.icon;
                    const isActive = location.pathname === item.href ||
                        (item.href !== "/profile" && location.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 transition-all ${isActive
                                ? "bg-orange-50 text-[#D97534] border-l-4 border-l-[#D97534]"
                                : "text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <i className={`fa-solid ${iconClass} text-xl ${isActive ? "text-[#D97534]" : "text-gray-400"}`}></i>
                            <span className="font-inter text-sm font-medium flex-1">{item.label}</span>
                            <i className={`fa-solid fa-chevron-right text-base ${isActive ? "text-[#D97534]" : "text-gray-300"}`}></i>
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
