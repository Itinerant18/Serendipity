"use client";

import React from "react";
import { Link } from "react-router-dom";
import GlassCard from "./ui/GlassCard";
import Button from "./ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWandMagicSparkles, faArrowRight } from "@fortawesome/free-solid-svg-icons";

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
    backgroundClass = "bg-gradient-to-r from-blue-900 via-violet-900 to-fuchsia-900"
}) {
    return (
        <section className={`relative overflow-hidden min-h-[90vh] flex items-center ${backgroundClass}`}>
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <GlassCard className="max-w-4xl mx-auto p-8 md:p-12 text-center bg-white/10 border-white/10 shadow-2xl backdrop-blur-3xl">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-yellow-300 text-sm mb-6 animate-fadeIn border border-white/10">
                        <FontAwesomeIcon icon={faWandMagicSparkles} />
                        <span>New arrivals every day</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fadeIn tracking-tight drop-shadow-lg">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto animate-fadeIn leading-relaxed">
                        {subtitle}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeIn">
                        <Link to={ctaLink}>
                            <Button size="lg" variant="primary" className="gap-2 shadow-blue-500/50">
                                {ctaText}
                                <FontAwesomeIcon icon={faArrowRight} />
                            </Button>
                        </Link>

                        {showSecondary && (
                            <Link to={secondaryCtaLink}>
                                <Button size="lg" variant="glass" className="text-white border-white/40 hover:bg-white/20">
                                    {secondaryCtaText}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto animate-fadeIn border-t border-white/10 pt-8">
                        <div className="text-center">
                            <div className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">10K+</div>
                            <div className="text-sm text-blue-200">Products</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">500+</div>
                            <div className="text-sm text-blue-200">Sellers</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">50K+</div>
                            <div className="text-sm text-blue-200">Happy Customers</div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </section>
    );
}
