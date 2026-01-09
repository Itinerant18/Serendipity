"use client";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { LayoutDashboard, Package, ShoppingCart, User, LogOut, Store } from "lucide-react";

export default function SellerLayout({ children }) {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/account/signin?redirect=/seller");
        } else if (user && !user.isSeller && !location.pathname.includes("/seller/register")) {
            // If logged in but not a seller, redirect to seller registration
            navigate("/seller/register");
        }
    }, [isAuthenticated, user, navigate, location.pathname]);

    if (!isAuthenticated || (user && !user.isSeller && !location.pathname.includes("/seller/register"))) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">Authorization checking...</div>;
    }

    const navigation = [
        { name: "Dashboard", href: "/seller", icon: LayoutDashboard },
        { name: "My Inventory", href: "/seller/inventory", icon: Package },
        { name: "Orders", href: "/seller/orders", icon: ShoppingCart },
        { name: "Profile Settings", href: "/seller/settings", icon: User },
    ];

    // If on registration page, don't show sidebar
    if (location.pathname.includes("/seller/register")) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex font-inter">
            {/* Sidebar */}
            <div className={`bg-[#232f3e] text-white w-64 flex-shrink-0 transition-all duration-300 ${sidebarOpen ? "" : "-ml-64 md:ml-0"}`}>
                <div className="p-4 flex items-center justify-center border-b border-gray-700">
                    <span className="font-playfair text-xl font-bold flex items-center gap-2">
                        <Store className="w-6 h-6 text-[#febd69]" /> Seller Central
                    </span>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <a
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive
                                        ? "bg-[#febd69] text-black"
                                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    }`}
                            >
                                <item.icon className="w-5 h-5 mr-3" />
                                {item.name}
                            </a>
                        );
                    })}
                </nav>
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
                    <button onClick={logout} className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-900 hover:text-white rounded-md transition-colors">
                        <LogOut className="w-5 h-5 mr-3" />
                        Sign Out
                    </button>
                    <a href="/" className="mt-2 block text-center text-xs text-blue-400 hover:text-blue-300">Back to Marketplace</a>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow px-6 py-4 flex justify-between items-center sm:hidden">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
                        <LayoutDashboard />
                    </button>
                    <span className="font-bold">Seller Central</span>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
