"use client";

import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStore, faEnvelope, faPhone, faArrowUp } from "@fortawesome/free-solid-svg-icons";
import { faFacebook, faTwitter, faInstagram, faLinkedin } from "@fortawesome/free-brands-svg-icons";
import GlassCard from "./ui/GlassCard";
import { MAIN_CATEGORIES } from "@/utils/categories";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        shop: [
            { name: "All Products", href: "/products" },
            ...MAIN_CATEGORIES.map(cat => ({
                name: cat.name,
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
        ],
        support: [
            { name: "Help Center", href: "/help" },
            { name: "Contact Us", href: "/contact" },
            { name: "Returns", href: "/returns" },
            { name: "Shipping Info", href: "/shipping" },
        ],
    };

    return (
        <footer className="relative mt-20">
            {/* Background Gradient Extension */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-slate-900/50 pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Back to top - Soft Floating Pill */}
                <div className="flex justify-center -translate-y-1/2 mb-8">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="group flex items-center gap-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-500 backdrop-blur-md text-white rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1"
                    >
                        <span className="text-sm font-semibold">Back to Top</span>
                        <FontAwesomeIcon icon={faArrowUp} className="group-hover:-translate-y-1 transition-transform duration-300" />
                    </button>
                </div>

                <GlassCard className="p-10 md:p-16 bg-slate-900/40 border-white/5 backdrop-blur-md shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                        {/* Brand Column */}
                        <div className="col-span-1 md:col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-3 mb-6 group">
                                <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg group-hover:rotate-6 transition-transform duration-300">
                                    <FontAwesomeIcon icon={faStore} className="text-xl text-white" />
                                </div>
                                <span className="font-playfair text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                    Serendipity
                                </span>
                            </Link>
                            <p className="text-blue-200/80 text-base mb-8 max-w-xs leading-relaxed font-light">
                                "Finding something good unintentionally" – Your destination for curated global treasures.
                            </p>

                            <div className="space-y-4 text-sm text-blue-200/70">
                                <div className="flex items-center gap-3 group cursor-pointer hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </div>
                                    <span>support@serendipity.com</span>
                                </div>
                                <div className="flex items-center gap-3 group cursor-pointer hover:text-white transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <FontAwesomeIcon icon={faPhone} />
                                    </div>
                                    <span>1-800-SHOP-NOW</span>
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="flex gap-4 mt-8">
                                {[faFacebook, faTwitter, faInstagram, faLinkedin].map((icon, idx) => (
                                    <a key={idx} href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-blue-200 hover:bg-white hover:text-blue-600 transition-all duration-300">
                                        <FontAwesomeIcon icon={icon} />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Link Columns */}
                        {[
                            { title: "Shop", links: footerLinks.shop },
                            { title: "Account", links: footerLinks.account },
                            { title: "Sell", links: footerLinks.sell },
                        ].map((section) => (
                            <div key={section.title}>
                                <h4 className="font-semibold text-white text-lg mb-6 tracking-wide border-b border-white/10 pb-2 inline-block">
                                    {section.title}
                                </h4>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.href}
                                                className="text-blue-200/60 hover:text-white hover:translate-x-1 inline-block transition-all duration-200 text-sm"
                                            >
                                                {link.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Bar */}
                    <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-blue-200/40 text-sm text-center md:text-left">
                            © {currentYear} Serendipity Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-blue-200/40">
                            {[
                                { name: "Privacy Policy", href: "/privacy" },
                                { name: "Terms of Service", href: "/terms" },
                                { name: "Cookie Policy", href: "/cookies" },
                                { name: "Seller Policy", href: "/seller/policies" }
                            ].map((item) => (
                                <Link key={item.name} to={item.href} className="hover:text-white transition-colors">
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </GlassCard>
            </div>
        </footer>
    );
}
