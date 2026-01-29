"use client";

import React from "react";
import { Link } from "react-router-dom";
import GlassCard from "./ui/GlassCard";
import { Button } from "./ui/button";
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
    backgroundClass = "bg-black border-b-8 border-white"
}) {
    return (
        <section className={`relative overflow-hidden min-h-[90vh] flex items-center ${backgroundClass}`}>
            {/* Decorative Brutalist Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-32 h-32 bg-yellow-400 border-4 border-black shadow-[8px_8px_0_#ffffff] animate-brutalist-jitter" />
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-pink-400 border-4 border-black shadow-[8px_8px_0_#ffffff] animate-brutalist-jitter" style={{animationDelay: '0.7s'}} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-orange-400 border-4 border-white shadow-[8px_8px_0_#000000] animate-brutalist-scale" />
            </div>

            {/* Content */}
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <GlassCard className="max-w-5xl mx-auto p-8 md:p-12 text-center" variant="accent">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-400 border-4 border-black text-black text-sm font-bold mb-6 animate-brutalist-fadeIn">
                        <FontAwesomeIcon icon={faWandMagicSparkles} />
                        <span>NEW ARRIVALS EVERY DAY</span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-7xl font-brutalist font-bold text-white mb-6 leading-tight animate-brutalist-fadeIn tracking-tight bg-black border-4 border-r-8 border-l-8 border-t-0 border-b-8 p-4">
                        {title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-lg sm:text-xl text-black mb-10 max-w-3xl mx-auto animate-brutalist-fadeIn leading-relaxed font-bold bg-yellow-200 p-4 border-4 border-black">
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
                    <div className="mt-16 grid grid-cols-3 gap-4 max-w-3xl mx-auto animate-brutalist-fadeIn border-t-8 border-black pt-8">
                        <div className="bg-yellow-400 border-4 border-black p-6 text-center">
                            <div className="text-3xl sm:text-5xl font-brutalist font-bold text-black">10K+</div>
                            <div className="text-sm font-bold text-black">PRODUCTS</div>
                        </div>
                        <div className="bg-pink-400 border-4 border-black p-6 text-center">
                            <div className="text-3xl sm:text-5xl font-brutalist font-bold text-black">500+</div>
                            <div className="text-sm font-bold text-black">SELLERS</div>
                        </div>
                        <div className="bg-orange-400 border-4 border-black p-6 text-center">
                            <div className="text-3xl sm:text-5xl font-brutalist font-bold text-black">50K+</div>
                            <div className="text-sm font-bold text-black">HAPPY CUSTOMERS</div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </section>
    );
}
