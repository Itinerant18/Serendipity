"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
// FontAwesome icons loaded globally

export default function OrderSuccessPage() {
    // Uses react-router hooks or window.location for params in this setup? 
    // Given we are using react-router structure in app directory (likely Vite + React Router), 
    // but let's check imports used elsewhere.
    // Actually, standard URLSearchParams works everywhere.

    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen bg-green-50 border-8 border-black flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] max-w-lg w-full p-8 py-12 text-center transition-transform duration-100 hover:translate(-2px,-2px)">
                <div className="w-24 h-24 bg-green-500 border-4 border-black flex items-center justify-center mx-auto mb-6">
                    <i className="fa-solid fa-circle-check text-5xl text-white"></i>
                </div>

                <h1 className="font-brutalist text-black font-bold text-3xl mb-4 border-4 border-black bg-yellow-200 p-2">
                    ORDER PLACED SUCCESSFULLY!
                </h1>

                <p className="font-brutalist text-black mb-8 max-w-xs mx-auto">
                    Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                </p>

                {orderId && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-8 inline-block">
                        <span className="font-inter text-sm text-gray-500 block mb-1">Order ID</span>
                        <span className="font-mono text-[#D97534] font-bold">{orderId}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                        href="/orders"
                        className="inline-flex items-center justify-center px-6 py-3 border border-[#D97534] text-[#D97534] font-inter font-semibold rounded-full hover:bg-[#FFF8F0] transition-colors"
                    >
                        View My Orders
                    </a>
                    <a
                        href="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-[#D97534] text-white font-inter font-bold rounded-full hover:bg-[#C86429] transition-colors shadow-lg"
                    >
                        <i className="fa-solid fa-bag-shopping text-base mr-2"></i>
                        Continue Shopping
                    </a>
                </div>
            </div>
        </div>
    );
}
