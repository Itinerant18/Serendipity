"use client";

import React from "react";
import { Link } from "react-router-dom";
import { MAIN_CATEGORIES } from "@/utils/categories";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        shop: [
            { name: "ALL PRODUCTS", href: "/products" },
            ...MAIN_CATEGORIES.map(cat => ({
                name: cat.name.toUpperCase(),
                href: `/category/${encodeURIComponent(cat.name)}`
            }))
        ],
        account: [
            { name: "My Account", href: "/profile" },
            { name: "My Orders", href: "/profile/orders" },
            { name: "Addresses", href: "/profile/addresses" },
            { name: "Cart", href: "/cart" },
        ],
        sell: [
            { name: "Become a Seller", href: "/seller/signup" },
            { name: "Seller Dashboard", href: "/seller" },
            { name: "Seller Policies", href: "/seller/policies" },
        ]
    };

    const socialLinks = [
        { icon: "fa-brands fa-facebook-f", href: "#", label: "Facebook" },
        { icon: "fa-brands fa-x-twitter", href: "#", label: "Twitter" },
        { icon: "fa-brands fa-instagram", href: "#", label: "Instagram" },
        { icon: "fa-brands fa-linkedin-in", href: "#", label: "LinkedIn" },
    ];

    return (
        <footer className="relative mt-20">
            {/* Brutalist Background */}
            <div className="absolute inset-0 bg-black border-t-8 border-orange-500 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Back to Top - Brutalist Horizontal Button */}
                <div className="flex justify-center -translate-y-1/2 mb-8">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="group flex items-center gap-3 px-8 py-4 bg-orange-500 border-4 border-black text-white font-bold shadow-[8px_8px_0_#000000] hover:bg-yellow-400 hover:text-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0_#000000] transition-all duration-150 cursor-pointer"
                        aria-label="Back to top"
                    >
                        <span className="text-sm font-bold uppercase tracking-widest">Back To Top</span>
                        <i className="fa-solid fa-arrow-up text-xl group-hover:animate-bounce"></i>
                    </button>
                </div>

                {/* Main Footer Content */}
                <div className="p-8 md:p-12 lg:p-16 bg-black border-4 border-white shadow-[12px_12px_0_#ffffff]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">

                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-3 mb-6 group cursor-pointer">
                                <div className="w-10 h-10 bg-orange-500 border-4 border-black flex items-center justify-center shadow-[4px_4px_0_#000000] group-hover:bg-yellow-400 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-150">
                                    <i className="fa-solid fa-store text-white group-hover:text-black text-lg"></i>
                                </div>
                                <span className="font-brutalist text-2xl md:text-3xl text-white border-4 border-white px-3 py-1 bg-black group-hover:bg-white group-hover:text-black transition-colors duration-150">
                                    SERENDIPITY
                                </span>
                            </Link>

                            <p className="text-stone-400 text-sm mb-8 max-w-xs leading-relaxed italic">
                                "Finding something good unintentionally" – Your destination for curated global treasures.
                            </p>

                            {/* Contact Info */}
                            <div className="space-y-3 mb-8">
                                <a href="mailto:support@serendipity.com" className="flex items-center gap-3 group cursor-pointer p-2 -ml-2 hover:bg-white transition-colors duration-150">
                                    <div className="w-9 h-9 border-2 border-white bg-black flex items-center justify-center group-hover:bg-black group-hover:border-black">
                                        <i className="fa-solid fa-envelope text-white text-sm"></i>
                                    </div>
                                    <span className="text-white font-bold text-sm group-hover:text-black">support@serendipity.com</span>
                                </a>
                                <a href="tel:1-800-SHOP-NOW" className="flex items-center gap-3 group cursor-pointer p-2 -ml-2 hover:bg-white transition-colors duration-150">
                                    <div className="w-9 h-9 border-2 border-white bg-black flex items-center justify-center group-hover:bg-black group-hover:border-black">
                                        <i className="fa-solid fa-phone text-white text-sm"></i>
                                    </div>
                                    <span className="text-white font-bold text-sm group-hover:text-black">1-800-SHOP-NOW</span>
                                </a>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-3">
                                {socialLinks.map((social, idx) => (
                                    <a
                                        key={idx}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 border-3 border-white bg-black flex items-center justify-center text-white hover:bg-orange-500 hover:border-orange-500 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#ffffff] transition-all duration-150 cursor-pointer"
                                    >
                                        <i className={`${social.icon} text-lg`}></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Shop Links */}
                        <div>
                            <h4 className="inline-block font-brutalist text-black text-lg mb-6 tracking-wider bg-white border-4 border-black px-4 py-2 shadow-[6px_6px_0_#ffffff]">
                                Shop
                            </h4>
                            <ul className="space-y-2">
                                {footerLinks.shop.slice(0, 7).map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="inline-block text-white text-sm font-bold hover:text-black hover:bg-yellow-400 px-2 py-1 -ml-2 transition-all duration-150 cursor-pointer"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Account Links */}
                        <div>
                            <h4 className="inline-block font-brutalist text-black text-lg mb-6 tracking-wider bg-white border-4 border-black px-4 py-2 shadow-[6px_6px_0_#ffffff]">
                                Account
                            </h4>
                            <ul className="space-y-2">
                                {footerLinks.account.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="inline-block text-white text-sm font-bold hover:text-black hover:bg-yellow-400 px-2 py-1 -ml-2 transition-all duration-150 cursor-pointer"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Sell Links */}
                        <div>
                            <h4 className="inline-block font-brutalist text-black text-lg mb-6 tracking-wider bg-white border-4 border-black px-4 py-2 shadow-[6px_6px_0_#ffffff]">
                                Sell
                            </h4>
                            <ul className="space-y-2">
                                {footerLinks.sell.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            to={link.href}
                                            className="inline-block text-white text-sm font-bold hover:text-black hover:bg-yellow-400 px-2 py-1 -ml-2 transition-all duration-150 cursor-pointer"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="mt-12 mb-8 h-1 bg-white"></div>

                    {/* Bottom Bar */}
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                        <p className="text-white font-bold text-sm text-center lg:text-left uppercase tracking-wide">
                            © {currentYear} Serendipity Inc. All Rights Reserved.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {[
                                { name: "Privacy Policy", href: "/privacy" },
                                { name: "Terms of Service", href: "/terms" },
                                { name: "Cookie Policy", href: "/cookies" },
                                { name: "Seller Policy", href: "/seller/policies" }
                            ].map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className="bg-white text-black text-xs font-bold uppercase px-4 py-2 border-4 border-black hover:bg-orange-500 hover:text-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#ffffff] transition-all duration-150 cursor-pointer"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
