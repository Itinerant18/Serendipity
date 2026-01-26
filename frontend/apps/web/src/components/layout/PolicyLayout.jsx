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
        <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 bg-slate-900/5">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <GlassCard className="max-w-4xl mx-auto p-8 md:p-12 shadow-2xl border-white/40 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl">
                <div className="text-center mb-12">
                    <div className="w-16 h-16 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400">
                        <FontAwesomeIcon icon={icon} className="text-3xl" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-violet-700 dark:from-blue-400 dark:to-violet-400 mb-4">
                        {title}
                    </h1>
                    {lastUpdated && (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            Last Updated: {lastUpdated}
                        </p>
                    )}
                </div>

                <div className="prose prose-slate dark:prose-invert lg:prose-lg mx-auto">
                    {children}
                </div>
            </GlassCard>
        </div>
    );
}
