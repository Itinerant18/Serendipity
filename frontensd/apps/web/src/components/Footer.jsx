"use client";

import React from "react";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-white mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center">
                    <div className="font-playfair font-bold text-3xl mb-4">Mercado</div>
                    <p className="font-inter text-sm text-white/80">
                        Your marketplace for everything amazing
                    </p>
                    <p className="font-inter text-xs text-white/60 mt-4">
                        © 2026 Mercado. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
