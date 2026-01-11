"use client";

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus } from "lucide-react";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { formatCurrency } from "@/utils/format";

export default function CartPage() {
    const [cart, setCart] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);
        calculateTotal(savedCart);
    }, []);

    const calculateTotal = (cartItems) => {
        const total = cartItems.reduce((sum, item) => {
            // Price might be string "$10.00" or number
            const price = typeof item.price === 'string'
                ? parseFloat(item.price.replace(/[^0-9.]/g, ""))
                : item.price;
            return sum + (price * item.quantity);
        }, 0);
        setCartTotal(total);
    };

    const updateQuantity = (productId, change) => {
        const updatedCart = cart.map((item) => {
            if (item.product_id === productId) {
                const newQuantity = Math.max(1, item.quantity + change);
                return { ...item, quantity: newQuantity };
            }
            return item;
        });
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
        // Trigger storage event for Header update if needed (though Header polls or needs context)
        window.dispatchEvent(new Event("storage"));
    };

    const removeItem = (productId) => {
        const updatedCart = cart.filter((item) => item.product_id !== productId);
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        calculateTotal(updatedCart);
        window.dispatchEvent(new Event("storage"));
    };

    const handleCheckout = () => {
        if (cart.length === 0) return;
        navigate("/checkout/shipping");
    };

    return (
        <div className="min-h-screen bg-[#F3F3F3]">
            <Header cartCount={cart.length} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-8">Shopping Cart</h1>

                {cart.length === 0 ? (
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
                                {cart.map((item) => (
                                    <div key={item.product_id} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                                        <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden">
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex justify-between mb-2">
                                                <Link to={`/product/${item.product_id}`} className="font-medium text-gray-900 hover:text-[#D97534] line-clamp-2">
                                                    {item.title}
                                                </Link>
                                                <p className="font-bold text-gray-900">
                                                    {typeof item.price === 'string' ? item.price : formatCurrency(item.price)}
                                                </p>
                                            </div>
                                            <p className="text-sm text-green-600 mb-4">In Stock</p>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center border border-gray-200 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, -1)}
                                                        className="p-2 hover:bg-gray-50 text-gray-600 rounded-l-lg"
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                    </button>
                                                    <span className="px-4 font-medium text-gray-900">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, 1)}
                                                        className="p-2 hover:bg-gray-50 text-gray-600 rounded-r-lg"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.product_id)}
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
                                    <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} items):</span>
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
