"use client";

import React from "react";
import { Link } from "react-router-dom";
// FontAwesome icons loaded globally

/**
 * HeroSection Component
 * Full-width hero banner with headline, subtext, and CTA
 */
export default function HeroSection({
    title = "Finding something good unintentionally",
    subtitle = "Welcome to Serendipity – your marketplace for discovering amazing products from sellers around the world.",
    ctaText = "Start Shopping",
    ctaLink = "/search",
    secondaryCtaText = "Become a Seller",
    secondaryCtaLink = "/seller/signup",
    showSecondary = true,
    backgroundClass = "bg-gradient-to-r from-[#232f3e] via-[#37475a] to-[#232f3e]"
}) {
    return (
        <section className={`relative overflow-hidden ${backgroundClass}`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#febd69]/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#FF9900]/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#febd69]/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
                <div className="text-center max-w-3xl mx-auto">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white/90 text-sm mb-6 animate-fadeIn">
                        <i className="fa-solid fa-sparkles text-base text-[#febd69]"></i>
                        <span>New arrivals every day</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight animate-fadeIn font-playfair">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-2xl mx-auto animate-fadeIn">
                        {subtitle}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
                        <Link
                            to={ctaLink}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-[#febd69] hover:bg-[#f3a847] text-[#232f3e] font-bold rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                        >
                            {ctaText}
                            <i className="fa-solid fa-arrow-right text-xl"></i>
                        </Link>

                        {showSecondary && (
                            <Link
                                to={secondaryCtaLink}
                                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 hover:border-white/60 text-white font-semibold rounded-lg transition-all duration-200 hover:bg-white/10"
                            >
                                {secondaryCtaText}
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fadeIn">
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[#febd69]">10K+</div>
                            <div className="text-sm text-gray-400">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[#febd69]">500+</div>
                            <div className="text-sm text-gray-400">Sellers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-3xl font-bold text-[#febd69]">50K+</div>
                            <div className="text-sm text-gray-400">Happy Customers</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg
                    viewBox="0 0 1440 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                >
                    <path
                        d="M0 50L48 45.8C96 41.7 192 33.3 288 35.8C384 38.3 480 51.7 576 58.3C672 65 768 65 864 58.3C960 51.7 1056 38.3 1152 33.3C1248 28.3 1344 31.7 1392 33.3L1440 35V100H1392C1344 100 1248 100 1152 100C1056 100 960 100 864 100C768 100 672 100 576 100C480 100 384 100 288 100C192 100 96 100 48 100H0V50Z"
                        fill="#F3F3F3"
                    />
                </svg>
            </div>
        </section>
    );
}
