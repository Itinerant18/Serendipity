"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import useCartStore from "@/utils/cartStore";
// FontAwesome icons loaded globally via script tag in root.tsx

export default function Header() {
    const { user, isAuthenticated, signOut } = useAuth();
    const cartCount = useCartStore((state) => state.getCartCount());
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
        { name: "Shop", href: "/products" },
        { name: "Orders", href: "/orders" },
    ];

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-black border-4 border-b-4 border-white shadow-[8px_8px_0_#ffffff] animate-brutalist-fadeIn"
                : "bg-black border-4 border-b-4 border-white"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 text-white font-bold text-xl hover:bg-orange-500 px-2 py-1 -translate-x-1 -translate-y-1 border-2 border-white shadow-[4px_4px_0_#000000] hover-brutalist animate-float"
                    >
                        <i className="fa-solid fa-store text-3xl bg-orange-500 p-1 border-2 border-white"></i>
                        <span className="font-brutalist hidden sm:block">Serendipity</span>
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
                                className="w-full px-4 py-2.5 pl-4 pr-12 border-2 border-white bg-white text-black placeholder-gray-500 focus:outline-none focus:bg-yellow-200 focus:border-black transition-colors font-bold"
                            />
                            <button
                                type="submit"
                                className="absolute right-0 top-0 h-full px-4 bg-orange-500 hover:bg-pink-500 text-black font-bold border-l-2 border-white transition-all duration-300 -translate-y-1 shadow-[4px_4px_0_#000000] hover-brutalist-sm animate-brutalist-jitter"
                            >
                                <i className="fa-solid fa-magnifying-glass text-xl text-stone-900"></i>
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
                                    className={`text-sm font-bold px-3 py-1 border-4 border-black transition-colors ${location.pathname === link.href
                                        ? "bg-yellow-400 text-black"
                                        : "bg-white text-black hover:bg-orange-500 hover:text-white"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>

                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-2 text-white hover:bg-pink-500 border-2 border-white -translate-x-1 -translate-y-1 shadow-[4px_4px_0_#000000] hover-brutalist-sm animate-brutalist-pulse"
                        >
                            <i className="fa-solid fa-cart-shopping text-2xl"></i>
                            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold border-2 border-black w-5 h-5 flex items-center justify-center">
                                {cartCount || 0}
                            </span>
                        </Link>

                        {/* User Menu */}
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="flex items-center gap-2 p-2 text-white hover:bg-orange-500 border-2 border-white -translate-x-1 -translate-y-1 shadow-[4px_4px_0_#000000] hover-brutalist-sm"
                                >
                                    <i className="fa-solid fa-user text-2xl"></i>
                                    <span className="hidden sm:block text-sm font-medium">
                                        {user?.name || "Account"}
                                    </span>
                                    <i className="fa-solid fa-chevron-down text-base hidden sm:block"></i>
                                </button>

                                {/* Dropdown */}
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white border-4 border-black shadow-[8px_8px_0_#000000] animate-brutalist-fadeIn">
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                            <p className="text-xs text-gray-500">{user?.email}</p>
                                        </div>

                                        <Link
                                            to="/profile"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm font-bold border-2 border-black bg-white hover:bg-pink-500 hover:text-white hover:border-white transition-transform duration-100"
                                        >
                                            <i className="fa-solid fa-user text-base"></i>
                                            My Account
                                        </Link>

                                        <Link
                                            to="/orders"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm font-bold border-2 border-black bg-white hover:bg-orange-500 hover:text-white hover:border-white transition-transform duration-100"
                                        >
                                            <i className="fa-solid fa-box text-base"></i>
                                            My Orders
                                        </Link>

                                        <Link
                                            to="/wishlist"
                                            onClick={() => setIsUserMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2 text-sm font-bold border-2 border-black bg-white hover:bg-blue-500 hover:text-white hover:border-white transition-transform duration-100"
                                        >
                                            <i className="fa-solid fa-heart text-base"></i>
                                            My Wishlist
                                        </Link>

                                        {user?.isSeller && (
                                            <Link
                                                to="/seller"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <i className="fa-solid fa-store text-base"></i>
                                                Seller Dashboard
                                            </Link>
                                        )}

                                        {user?.isAdmin && (
                                            <Link
                                                to="/admin"
                                                onClick={() => setIsUserMenuOpen(false)}
                                                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            >
                                                <i className="fa-solid fa-gear text-base"></i>
                                                Admin Panel
                                            </Link>
                                        )}

                                        <div className="border-t border-gray-100 mt-2 pt-2">
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm font-bold border-2 border-red-600 bg-red-50 hover:bg-red-600 hover:text-white hover:border-white transition-transform duration-100"
                                            >
                                                <i className="fa-solid fa-right-from-bracket text-base"></i>
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/account/signin"
                                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-xl transition-all hover:shadow-lg hover:shadow-amber-500/25 text-sm btn-brutalist"
                            >
                                <i className="fa-solid fa-user text-base"></i>
                                <span className="hidden sm:block">Sign In</span>
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-2 text-gray-300 hover:text-white transition-colors"
                        >
                            {isMenuOpen ? <i className="fa-solid fa-xmark text-2xl"></i> : <i className="fa-solid fa-bars text-2xl"></i>}
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
                            <i className="fa-solid fa-magnifying-glass text-xl text-[#232f3e]"></i>
                        </button>
                    </div>
                </form>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="lg:hidden bg-stone-800/95 backdrop-blur-xl border-t border-stone-700/50 animate-slideInLeft">
                    <nav className="px-4 py-4 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === link.href
                                    ? "bg-amber-500 text-stone-900"
                                    : "text-stone-300 hover:bg-stone-700 hover:text-white"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {!isAuthenticated && (
                            <Link
                                to="/seller/signup"
                                onClick={() => setIsMenuOpen(false)}
                                className="block px-4 py-3 bg-yellow-400 border-4 border-black text-black font-bold hover:bg-orange-500 hover:text-white transition-colors"
                            >
                                BECOME A SELLER
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
