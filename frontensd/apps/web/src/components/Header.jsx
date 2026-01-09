"use client";

import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Menu, X, User } from "lucide-react";
import useAuth from "@/utils/useAuth";

export default function Header({
    searchQuery,
    setSearchQuery,
    cartCount: propCartCount
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [internalCartCount, setInternalCartCount] = useState(0);
    const { user } = useAuth();

    // Use prop if provided, otherwise local state (though mostly controlled by parent or localStorage)
    // For simplicity, let's rely on localStorage if prop is not passed, or passed as 0 initially
    useEffect(() => {
        if (propCartCount !== undefined) {
            setInternalCartCount(propCartCount);
        } else {
            const cart = JSON.parse(localStorage.getItem("cart") || "[]");
            setInternalCartCount(cart.length);
        }
    }, [propCartCount]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery?.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    // Internal search state if not provided (for pages that don't need to control it)
    const [internalSearch, setInternalSearch] = useState("");
    const activeSearch = searchQuery !== undefined ? searchQuery : internalSearch;
    const setActiveSearch = setSearchQuery || setInternalSearch;

    const onSearchSubmit = (e) => {
        e.preventDefault();
        if (activeSearch.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(activeSearch)}`;
        }
    };

    return (
        <header className="bg-gradient-to-r from-[#D97534] to-[#A0522D] sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <a href="/" className="flex items-center space-x-2">
                        <div className="font-playfair font-bold text-2xl sm:text-3xl text-white tracking-tight">
                            Mercado
                        </div>
                    </a>

                    <form
                        onSubmit={onSearchSubmit}
                        className="hidden md:flex flex-1 max-w-2xl mx-8"
                    >
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={activeSearch}
                                onChange={(e) => setActiveSearch(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full px-5 py-3 rounded-full text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFF8F0] font-inter text-sm shadow-md"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#D97534] hover:bg-[#C86429] text-white p-2 rounded-full transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:flex items-center space-x-3">
                            {user ? (
                                <div className="flex items-center space-x-3">
                                    <a href="/orders" className="text-white hover:text-orange-100 font-inter text-sm font-medium">Orders</a>
                                    {!user.is_seller && (
                                        <a href="/seller/register" className="text-white hover:text-orange-100 font-inter text-sm font-medium bg-[#8B4513] px-3 py-1.5 rounded-full hover:bg-[#7A3E0F] transition-colors">
                                            Become a Seller
                                        </a>
                                    )}
                                    {user.is_seller && (
                                        <a href="/seller/dashboard" className="text-white hover:text-orange-100 font-inter text-sm font-medium">
                                            Seller Dashboard
                                        </a>
                                    )}
                                    <a href="/account/logout" className="text-white hover:text-orange-100 font-inter text-sm font-medium flex items-center">
                                        <span className="mr-1">Hello, {user.name || "User"}</span>
                                    </a>
                                </div>
                            ) : (
                                <a href="/account/signin" className="text-white hover:text-orange-100 font-inter text-sm font-medium">Sign In</a>
                            )}
                        </div>

                        <a
                            href="/cart"
                            className="relative text-white hover:text-[#FFF8F0] transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
                            {internalCartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#8B4513] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                                    {internalCartCount}
                                </span>
                            )}
                        </a>
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-white"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search & Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="space-y-4">
                            <form onSubmit={onSearchSubmit}>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={activeSearch}
                                        onChange={(e) => setActiveSearch(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full px-4 py-2 rounded-full text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#FFF8F0] font-inter text-sm"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#D97534]"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>
                            <div className="flex flex-col space-y-2">
                                {user ? (
                                    <>
                                        <a href="/orders" className="text-white font-inter text-sm">My Orders</a>
                                        {!user.is_seller && (
                                            <a href="/seller/register" className="text-white font-inter text-sm bg-[#8B4513] px-3 py-2 rounded-full hover:bg-[#7A3E0F] transition-colors">
                                                Become a Seller
                                            </a>
                                        )}
                                        {user.is_seller && (
                                            <a href="/seller/dashboard" className="text-white font-inter text-sm">
                                                Seller Dashboard
                                            </a>
                                        )}
                                        <a href="/account/logout" className="text-white font-inter text-sm">Sign Out</a>
                                    </>
                                ) : (
                                    <a href="/account/signin" className="text-white font-inter text-sm">Sign In</a>
                                )}
                                <a href="/admin" className="text-white font-inter text-sm">Admin Dashboard</a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
