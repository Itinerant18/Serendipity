"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/utils/format";

import useCartStore from "@/utils/cartStore";

export default function CartPage() {
    const items = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeFromCart);
    const getCartTotal = useCartStore((state) => state.getCartTotal);
    const navigate = useNavigate();

    const cartTotal = getCartTotal();

    const handleQuantityChange = (productId, change) => {
        const item = items.find(i => i.product === productId);
        if (item) {
            const newQuantity = Math.max(1, item.qty + change);
            updateQuantity(productId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (items.length === 0) return;
        navigate("/checkout/shipping");
    };



    return (
        <div className="min-h-screen bg-[#F3F3F3]">
            <Header />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-8">Shopping Cart</h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                        <Link
                            to="/"
                            className="inline-flex items-center px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-medium rounded-lg transition-colors"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">Cart Items</h2>
                                <span className="text-sm text-gray-500">Price</span>
                            </div>

                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.product} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.name || item.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between mb-2">
                                                <Link to={`/product/${item.product}`} className="font-medium text-gray-900 hover:text-[#D97534] line-clamp-2">
                                                    {item.name || item.title}
                                                </Link>
                                                <p className="font-bold text-gray-900">
                                                    {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-green-600 mb-4">In Stock</p>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => handleQuantityChange(item.product, -1)}
                                                        className="p-2 hover:bg-gray-50 text-gray-600 rounded-l-lg"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-4 font-medium text-gray-900">{item.qty}</span>
                                                    <button
                                                        onClick={() => handleQuantityChange(item.product, 1)}
                                                        className="p-2 hover:bg-gray-50 text-gray-600 rounded-r-lg"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.product)}
                                                    className="text-sm text-gray-500 hover:text-red-500 underline"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:w-80 h-fit bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4 text-green-700 text-sm">
                                <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">✓</span>
                                <span>Part of your order qualifies for FREE Delivery.</span>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-lg font-semibold">
                                    <span>Subtotal ({items.reduce((a, b) => a + b.qty, 0)} items):</span>
                                    <span>{formatCurrency(cartTotal)}</span>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    className="w-full bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] py-3 rounded-lg font-medium shadow-sm active:scale-95 transition-all text-sm"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}
