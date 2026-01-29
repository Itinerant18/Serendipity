import React from "react";
import GlassCard from "@/components/ui/GlassCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved, faFileContract, faCookieBite, faScaleBalanced } from "@fortawesome/free-solid-svg-icons";

const icons = {
    privacy: faShieldHalved,
    terms: faFileContract,
    cookies: faCookieBite,
    legal: faScaleBalanced
};

export default function PolicyLayout({ title, lastUpdated, type = "legal", children }) {
    const icon = icons[type] || icons.legal;

    return (
        <div className="min-h-screen bg-white border-8 border-black pt-16 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Decorative Elements */}
            <div className="fixed top-20 left-10 w-24 h-24 bg-yellow-400 border-4 border-black shadow-[8px_8px_0_#000000] animate-brutalist-jitter pointer-events-none" />
            <div className="fixed bottom-20 right-10 w-32 h-32 bg-pink-400 border-4 border-black shadow-[8px_8px_0_#000000] animate-brutalist-jitter pointer-events-none" style={{animationDelay: '0.5s'}} />

            <GlassCard className="max-w-4xl mx-auto p-8 md:p-12">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 mx-auto bg-orange-500 border-4 border-black flex items-center justify-center mb-6 animate-brutalist-jitter">
                        <FontAwesomeIcon icon={icon} className="text-4xl text-white" />
                    </div>
                    <h1 className="font-brutalist text-4xl text-black bg-black text-white px-6 py-3 inline-block border-4 border-white mb-4">
                        {title.toUpperCase()}
                    </h1>
                    {lastUpdated && (
                        <p className="font-bold text-black bg-yellow-200 border-2 border-black px-4 py-2 inline-block">
                            Last Updated: {lastUpdated}
                        </p>
                    )}
                </div>

                <div className="prose prose-lg max-w-none text-black font-bold">
                    <div className="bg-white border-4 border-black p-6">
                        {children}
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all">
                        <i className="fa-solid fa-arrow-left"></i>
                        BACK TO HOME
                    </a>
                </div>
            </GlassCard>
        </div>
    );
}
