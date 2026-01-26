"use client";

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import useAuth from "@/utils/useAuth";
// FontAwesome icons loaded globally

export default function SellerLayout({ children }) {
    const { user, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isHydrated, setIsHydrated] = useState(false);

    const pathname = location.pathname;
    const isAuthPage = pathname.startsWith("/seller/login") || pathname.startsWith("/seller/signup");

    // Wait for client-side hydration
    useEffect(() => {
        // Small delay to allow Zustand to hydrate from localStorage
        const timer = setTimeout(() => {
            setIsHydrated(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Don't redirect until hydrated
        if (!isHydrated) return;

        // Public seller auth pages should NOT be guarded or redirected
        if (isAuthPage) return;

        if (!isAuthenticated) {
            // For protected seller area, require login
            navigate("/seller/login");
        } else if (user && !user.isSeller && !pathname.includes("/seller/signup")) {
            console.log("SellerLayout: Redirecting to signup. User:", {
                id: user.id,
                email: user.email,
                isSeller: user.isSeller,
                hasProfileId: !!user.sellerProfileId
            });
            // Logged-in customer but not yet a seller → send to seller registration flow
            navigate("/seller/signup");
        }
    }, [isAuthenticated, user, navigate, pathname, isAuthPage, isHydrated]);

    // Completely bypass sidebar + guards on public seller auth routes
    if (isAuthPage) {
        return <>{children}</>;
    }

    // Seller registration page has its own layout & requires login but no sidebar
    if (pathname.includes("/seller/signup")) {
        return <>{children}</>;
    }

    // Show loading while hydrating
    if (!isHydrated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-[#D97534]"></i>
            </div>
        );
    }

    if (!isAuthenticated || (user && !user.isSeller && !pathname.includes("/seller/signup"))) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <i className="fa-solid fa-spinner fa-spin text-3xl text-[#D97534]"></i>
            </div>
        );
    }

    const navigation = [
        { name: "Dashboard", href: "/seller", icon: "fa-table-columns" },
        { name: "My Inventory", href: "/seller/inventory", icon: "fa-box" },
        { name: "Orders", href: "/seller/orders", icon: "fa-cart-shopping" },
        { name: "Profile Settings", href: "/seller/settings", icon: "fa-user" },
    ];

    // If on registration page, don't show sidebar
    if (location.pathname.includes("/seller/signup")) {
        return <>{children}</>;
    }

    return (
        <div className="h-screen bg-gray-100 flex font-inter overflow-hidden">
            {/* Sidebar */}
            <div className={`bg-[#232f3e] text-white w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? "" : "-ml-64 md:ml-0"}`}>
                <div className="p-4 flex items-center justify-center border-b border-gray-700">
                    <span className="font-playfair text-xl font-bold flex items-center gap-2">
                        <i className="fa-solid fa-store text-2xl text-[#febd69]"></i> Seller Central
                    </span>
                </div>
                <nav className="flex-1 mt-6 px-4 space-y-2 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link // Changed from <a> to <Link>
                                key={item.name}
                                to={item.href} // Changed from href to to
                                className={`flex items-center px-4 py-3 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? "bg-[#febd69] text-black"
                                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                                    }`}
                            >
                                <i className={`fa-solid ${item.icon} text-xl mr-3`}></i>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <button
                        onClick={() => {
                            signOut();
                            navigate('/seller/login');
                        }}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-red-900 hover:text-white rounded-md transition-colors"
                    >
                        <i className="fa-solid fa-right-from-bracket text-xl mr-3"></i>
                        Sign Out
                    </button>
                    <Link to="/" className="mt-2 block text-center text-xs text-blue-400 hover:text-blue-300">Back to Marketplace</Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow px-6 py-4 flex justify-between items-center sm:hidden">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-500">
                        <i className="fa-solid fa-table-columns"></i>
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
