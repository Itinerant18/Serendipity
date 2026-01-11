"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import {
    Search,
    ShoppingCart,
    User,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Package,
    Store,
    Settings
} from "lucide-react";

export default function Header({ cartCount }) {
    const { user, isAuthenticated, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Handle scroll for sticky header effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };

    const handleSignOut = () => {
        signOut();
        setIsUserMenuOpen(false);
        navigate("/");
    };

    const navLinks = [
        { name: "Shop", href: "/search" },
        { name: "Orders", href: "/orders" },
    ];

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-[#232f3e] shadow-lg"
                : "bg-[#232f3e]"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white font-bold text-xl hover:text-[#febd69] transition-colors"
                    >
                        <Store className="w-7 h-7 text-[#febd69]" />
                        <span className="font-playfair hidden sm:block">Serendipity</span>
                    </Link>

                    {/* Search Bar - Desktop */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex flex-1 max-w-xl mx-8"
                    >
                        <div className="relative w-full">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full px-4 py-2.5 pl-4 pr-12 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#febd69] transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-full px-4 bg-[#febd69] hover:bg-[#f3a847] rounded-r-lg transition-colors"
                            >
                                <Search className="w-5 h-5 text-[#232f3e]" />
                            </button>
                        </div>
                    </form>

                    {/* Right Section */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Nav Links - Desktop */}
                        <nav className="hidden lg:flex items-center gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={`text-sm font-medium transition-colors ${location.pathname === link.href
                                        ? "text-[#febd69]"
                                        : "text-gray-300 hover:text-white"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            <ShoppingCart className="w-6 h-6" />
                            <span className="absolute -top-1 -right-1 bg-[#febd69] text-[#232f3e] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {cartCount || 0}
                            </span>
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <User className="w-6 h-6" />
                                    <span className="hidden sm:block text-sm font-medium">
                                        {user?.name || "Account"}
                                    </span>
                                    <ChevronDown className="w-4 h-4 hidden sm:block" />
                                </button>

                                {/* Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2 animate-fadeIn">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/orders"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Package className="w-4 h-4" />
                                            My Orders
                                        </Link>

                                        {user?.isSeller && (
                                            <Link
                                                to="/seller"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Store className="w-4 h-4" />
                                                Seller Dashboard
                                            </Link>
                                        )}

                                        {user?.isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <Settings className="w-4 h-4" />
                                                Admin Panel
                                            </Link>
                                        )}

                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/account/signin"
                                className="flex items-center gap-2 px-4 py-2 bg-[#febd69] hover:bg-[#f3a847] text-[#232f3e] font-semibold rounded-lg transition-colors text-sm"
                            >
                                <User className="w-4 h-4" />
                                <span className="hidden sm:block">Sign In</span>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <form
                    onSubmit={handleSearch}
                    className="md:hidden pb-4"
                >
                    <div className="relative">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full px-4 py-2.5 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#febd69]"
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 h-full px-4 bg-[#febd69] hover:bg-[#f3a847] rounded-r-lg transition-colors"
                        >
                            <Search className="w-5 h-5 text-[#232f3e]" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-[#37475A] border-t border-gray-600 animate-slideInLeft">
                    <nav className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${location.pathname === link.href
                                    ? "bg-[#febd69] text-[#232f3e]"
                                    : "text-gray-300 hover:bg-gray-600 hover:text-white"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {!isAuthenticated && (
                            <Link
                                to="/seller/signup"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 rounded-lg text-sm font-medium text-[#febd69] hover:bg-gray-600 transition-colors"
                            >
                                Become a Seller
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
