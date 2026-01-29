"use client";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuth from "@/utils/useAuth";

export default function SellerLayout({ children }) {
    const { user, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    const pathname = location.pathname;
    const isAuthPage = pathname.startsWith("/seller/login") || pathname.startsWith("/seller/signup");

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        if (isAuthPage) return;

        if (!isAuthenticated) {
            navigate("/seller/login");
        } else if (user && !user.isSeller && !pathname.includes("/seller/signup")) {
            navigate("/seller/signup");
        }
    }, [isAuthenticated, user, navigate, pathname, isAuthPage, isHydrated]);

    if (isAuthPage) {
        return <>{children}</>;
    }

    if (pathname.includes("/seller/signup")) {
        return <>{children}</>;
    }

    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white border-8 border-black">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-orange-500 animate-brutalist-jitter"></i>
            </div>
        );
    }

    if (!isAuthenticated || (user && !user.isSeller && !pathname.includes("/seller/signup"))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white border-8 border-black">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-orange-500 animate-brutalist-jitter"></i>
            </div>
        );
    }

    const navigation = [
        { name: "Dashboard", href: "/seller", icon: "fa-table-columns" },
        { name: "My Inventory", href: "/seller/inventory", icon: "fa-box" },
        { name: "Orders", href: "/seller/orders", icon: "fa-cart-shopping" },
        { name: "Profile Settings", href: "/seller/settings", icon: "fa-user" },
    ];

    if (location.pathname.includes("/seller/signup")) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-white border-8 border-black">
            {/* Top Header */}
            <header className="bg-black border-b-4 border-white sticky top-0 z-50">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-500 border-4 border-white flex items-center justify-center">
                                <i className="fa-solid fa-store text-xl text-white"></i>
                            </div>
                            <span className="font-brutalist text-xl text-white">SELLER CENTRAL</span>
                        </div>

                        {/* Right Section */}
                        <div className="flex items-center gap-4">
                            {/* Mobile menu toggle */}
                            <button 
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 text-white hover:bg-orange-500 border-2 border-white"
                            >
                                <i className="fa-solid fa-bars text-xl"></i>
                            </button>

                            {/* User Info */}
                            <div className="hidden lg:flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-white font-bold text-sm">{user?.name || "Seller"}</p>
                                    <p className="text-orange-400 text-xs">{user?.email}</p>
                                </div>
                                <div className="w-10 h-10 bg-white border-4 border-black flex items-center justify-center">
                                    <i className="fa-solid fa-user text-black"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar - Hidden on mobile unless toggled */}
                <aside className={`
                    fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-black border-r-4 border-white z-40 transform transition-transform duration-300
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}
                `}>
                    <nav className="p-4 space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 font-bold transition-all duration-100 border-4 border-black
                                        ${isActive 
                                            ? "bg-orange-500 text-white translate(-2px,-2px) shadow-[4px_4px_0_#ffffff]" 
                                            : "bg-white text-black hover:bg-pink-500 hover:text-white hover:translate(-2px,-2px)"
                                        }
                                    `}
                                >
                                    <i className={`fa-solid ${item.icon} text-xl w-6`}></i>
                                    <span className={sidebarOpen ? "block" : "lg:hidden"}>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Bottom Actions */}
                    <div className="absolute bottom-4 left-4 right-4 space-y-2">
                        <button
                            onClick={() => {
                                signOut();
                                navigate('/seller/login');
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white font-bold border-4 border-black hover:bg-red-600 hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all duration-100"
                        >
                            <i className="fa-solid fa-right-from-bracket text-xl w-6"></i>
                            <span className={sidebarOpen ? "block" : "lg:hidden"}>Sign Out</span>
                        </button>
                        <Link
                            to="/"
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-400 text-black font-bold border-4 border-black hover:bg-orange-500 hover:text-white transition-all duration-100"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            <span className={sidebarOpen ? "block" : "lg:hidden"}>Back to Market</span>
                        </Link>
                    </div>
                </aside>

                {/* Mobile overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden" 
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 p-6 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
