import React from "react";
import { cn } from "@/lib/utils";

/**
 * GlassCard Component
 * A wrapper component that applies premium Glassmorphism effect.
 * Uses the glass utilities defined in global.css.
 */
export default function GlassCard({
    children,
    className = "",
    hoverEffect = false,
    variant = "default", // "default" | "elevated" | "subtle"
    ...props
}) {
    const variants = {
        default: "bg-white/90 backdrop-blur-lg border border-stone-200/50 shadow-sm",
        elevated: "bg-white/95 backdrop-blur-xl border border-stone-100 shadow-lg",
        subtle: "bg-white/70 backdrop-blur-md border border-stone-100/30"
    };

    return (
        <div
            className={cn(
                "rounded-2xl overflow-hidden transition-all duration-300",
                variants[variant] || variants.default,
                hoverEffect && "hover:-translate-y-1 hover:shadow-xl hover:bg-white/95 hover:border-amber-200/30 cursor-pointer",
                className
            )}
            style={{
                boxShadow: hoverEffect ? undefined : "0 4px 6px -1px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.6)"
            }}
            {...props}
        >
            {children}
        </div>
    );
}

