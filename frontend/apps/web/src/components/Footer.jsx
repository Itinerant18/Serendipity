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
            {/* Brutalist Background Pattern */}
            <div className="absolute inset-0 bg-black border-t-8 border-white pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Back to top - Brutalist Button */}
                <div className="flex justify-center -translate-y-1/2 mb-8">
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="group flex items-center gap-2 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold shadow-[8px_8px_0_#000000] hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-transform duration-100 animate-brutalist-jitter"
                    >
                        <span className="text-sm font-bold">BACK TO TOP</span>
                        <FontAwesomeIcon icon={faArrowUp} className="group-hover:animate-brutalist-glitch" />
                    </button>
                </div>

                <div className="p-10 md:p-16 bg-black border-4 border-white shadow-[12px_12px_0_#ffffff]">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
                        {/* Brand Column */}
                         <div className="col-span-1 md:col-span-2 lg:col-span-2">
                            <Link to="/" className="flex items-center gap-3 mb-6 group">
                                <div className="p-2 bg-orange-500 border-4 border-black text-white font-bold shadow-[8px_8px_0_#000000] group-hover:bg-pink-500 group-hover:translate(-1px,-1px) transition-transform duration-100">
                                    <FontAwesomeIcon icon={faStore} className="text-xl" />
                                </div>
                                <span className="font-brutalist text-3xl text-black bg-white border-2 border-black p-1">
                                    SERENDIPITY
                                </span>
                            </Link>
                            <p className="text-stone-300 text-base mb-8 max-w-xs leading-relaxed font-light">
                                "Finding something good unintentionally" – Your destination for curated global treasures.
                            </p>

                            <div className="space-y-4 text-sm text-white">
                                <div className="flex items-center gap-3 group cursor-pointer hover:bg-white hover:text-black transition-transform duration-100">
                                    <div className="w-8 h-8 border-2 border-white bg-black flex items-center justify-center text-white group-hover:bg-white group-hover:text-black">
                                        <FontAwesomeIcon icon={faEnvelope} />
                                    </div>
                                    <span className="font-bold">support@serendipity.com</span>
                                </div>
                                <div className="flex items-center gap-3 group cursor-pointer hover:bg-white hover:text-black transition-transform duration-100">
                                    <div className="w-8 h-8 border-2 border-white bg-black flex items-center justify-center text-white group-hover:bg-white group-hover:text-black">
                                        <FontAwesomeIcon icon={faPhone} />
                                    </div>
                                    <span className="font-bold">1-800-SHOP-NOW</span>
                                </div>
                            </div>

                            {/* Socials */}
                            <div className="flex gap-4 mt-8">
                                {[faFacebook, faTwitter, faInstagram, faLinkedin].map((icon, idx) => (
                                    <a key={idx} href="#" className="w-9 h-9 border-2 border-white bg-black flex items-center justify-center text-white hover:bg-white hover:text-black hover:translate(-1px,-1px) hover:shadow-[4px_4px_0_#ffffff] transition-transform duration-100">
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
                                <h4 className="font-brutalist text-white text-lg mb-6 tracking-wide border-4 border-black bg-black p-2 inline-block shadow-[8px_8px_0_#000000]">
                                    {section.title}
                                </h4>
                                <ul className="space-y-3">
                                    {section.links.map((link) => (
                                        <li key={link.name}>
                                            <Link
                                                to={link.href}
                                                className="text-white hover:text-pink-500 hover:bg-pink-500 hover:border-white font-bold px-4 py-2 transition-all duration-100 hover:translate(-1px,-1px) border-2 border-black"
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
                    <div className="mt-16 pt-8 border-t-4 border-white flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-white font-bold text-sm text-center md:text-left">
                            © {currentYear} SERENDIPITY INC. ALL RIGHTS RESERVED.
                        </p>
                        <div className="flex items-center gap-6 text-sm text-white">
                            {[
                                { name: "PRIVACY POLICY", href: "/privacy" },
                                { name: "TERMS OF SERVICE", href: "/terms" },
                                { name: "COOKIE POLICY", href: "/cookies" },
                                { name: "SELLER POLICY", href: "/seller/policies" }
                            ].map((item) => (
                                <Link key={item.name} to={item.href} className="border-2 border-black bg-white hover:bg-orange-500 hover:text-white hover:border-white font-bold px-4 py-2 transition-transform duration-100 hover:translate(-1px,-1px)">
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
