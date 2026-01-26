import React from "react";
import { cn } from "@/lib/utils";

/**
 * Button Component (Rich Styling)
 * Supports variants: primary, secondary, outline, ghost, glass
 */
export default function Button({
    children,
    className = "",
    variant = "primary",
    size = "md",
    ...props
}) {
    const baseStyles = "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";

    const variants = {
        primary: "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-lg hover:shadow-blue-500/30 hover:brightness-110 border border-transparent",
        secondary: "bg-white text-slate-800 border border-slate-200 shadow-sm hover:bg-slate-50",
        outline: "bg-transparent border-2 border-slate-300 text-slate-700 hover:border-slate-800 hover:text-slate-900",
        ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        glass: "glass-button text-white shadow-glass hover:bg-white/30",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-md",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-3.5 text-base",
        icon: "w-10 h-10 p-2 flex items-center justify-center",
    };

    return (
        <button
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            {...props}
        >
            {children}
        </button>
    );
}
