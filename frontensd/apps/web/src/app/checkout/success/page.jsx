"use client";

import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle, ShoppingBag } from "lucide-react";

export default function OrderSuccessPage() {
    // Uses react-router hooks or window.location for params in this setup? 
    // Given we are using react-router structure in app directory (likely Vite + React Router), 
    // but let's check imports used elsewhere.
    // Actually, standard URLSearchParams works everywhere.

    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");

    return (
        <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-8 py-12 text-center transform transition-all hover:scale-[1.01]">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>

                <h1 className="font-playfair font-bold text-3xl text-[#8B4513] mb-4">
                    Order Placed Successfully!
                </h1>

                <p className="font-inter text-gray-600 mb-8 max-w-xs mx-auto">
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
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Continue Shopping
                    </a>
                </div>
            </div>
        </div>
    );
}
