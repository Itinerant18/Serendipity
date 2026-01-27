/**
 * BrutalistCard Component
 * A wrapper component that applies aggressive brutalist styling.
 * Replaces all glass morphism with thick borders and harsh shadows.
 */
import React from 'react';
import { cn } from '@/lib/utils';

export default function GlassCard({
    children,
    className = "",
    hoverEffect = false,
    variant = "default", // "default" | "elevated" | "accent" | "warning"
    ...props
}) {
    const brutalistVariants = {
        default: "bg-white border-4 border-black shadow-[8px_8px_0_#000000]",
        elevated: "bg-white border-4 border-black shadow-[12px_12px_0_#000000]",
        accent: "bg-blue-500 border-4 border-white shadow-[8px_8px_0_#000000]",
        warning: "bg-orange-500 border-4 border-black shadow-[8px_8px_0_#000000]"
    };

    const hoverVariants = {
        default: hoverEffect ? "hover:translate(-2px,-2px) shadow-[10px_10px_0_#000000] transition-transform duration-100 animate-brutalist-jitter" : "",
        elevated: hoverEffect ? "hover:translate(-3px,-3px) shadow-[15px_15px_0_#000000] transition-transform duration-100 animate-brutalist-jitter" : "",
        accent: hoverEffect ? "hover:translate(-2px,-2px) bg-blue-600 border-white shadow-[10px_10px_0_#000000] transition-transform duration-100" : "",
        warning: hoverEffect ? "hover:translate(-2px,-2px) bg-orange-600 border-black shadow-[10px_10px_0_#000000] transition-transform duration-100" : ""
    };

    return (
        <div
            className={cn(
                "rounded-none",
                brutalistVariants[variant] || brutalistVariants.default,
                hoverVariants[variant] || hoverVariants.default,
                className
            )}
            style={{
                transform: hoverEffect ? "translate(1px, 1px)" : "translate(0, 0)",
            }}
            {...props}
        >
            {children}
        </div>
    );
}