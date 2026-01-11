"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Store, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        shop: [
            { name: "All Products", href: "/search" },
            { name: "Electronics", href: "/search?category=Electronics" },
            { name: "Fashion", href: "/search?category=Fashion" },
            { name: "Home & Kitchen", href: "/search?category=Home%20%26%20Kitchen" },
        ],
        account: [
            { name: "My Account", href: "/account" },
            { name: "My Orders", href: "/orders" },
            { name: "Cart", href: "/cart" },
            { name: "Wishlist", href: "/wishlist" },
        ],
        sell: [
            { name: "Become a Seller", href: "/seller/signup" },
            { name: "Seller Dashboard", href: "/seller" },
            { name: "Seller Policies", href: "/seller/policies" },
        ],
        support: [
            { name: "Help Center", href: "/help" },
            { name: "Contact Us", href: "/contact" },
            { name: "Returns", href: "/returns" },
            { name: "Shipping Info", href: "/shipping" },
        ],
    };

    return (
        <footer className="bg-[#232f3e] text-white">
            {/* Back to top */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-full py-4 bg-[#37475a] hover:bg-[#485769] text-sm font-medium transition-colors"
            >
                Back to top
            </button>

            {/* Main Footer Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand Column */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 mb-8 lg:mb-0">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <Store className="w-8 h-8 text-[#febd69]" />
                            <span className="font-playfair text-2xl font-bold">Serendipity</span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4 italic">
                            "Finding something good unintentionally"
                        </p>
                        <div className="space-y-2 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>support@serendipity.com</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>1-800-SHOP-NOW</span>
                            </div>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Shop</h4>
                        <ul className="space-y-2">
                            {footerLinks.shop.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Account</h4>
                        <ul className="space-y-2">
                            {footerLinks.account.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Sell Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Sell</h4>
                        <ul className="space-y-2">
                            {footerLinks.sell.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="font-semibold text-white mb-4">Support</h4>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.name}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white text-sm transition-colors"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-gray-400 text-sm text-center md:text-left">
                            © {currentYear} Serendipity. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <Link to="/privacy" className="hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/cookies" className="hover:text-white transition-colors">
                                Cookie Policy
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

