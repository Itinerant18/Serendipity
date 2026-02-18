"use client";

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { formatCurrency } from "@/utils/format";
import { API_URL } from "@/lib/api";

export default function OrderSuccessPage() {
    const [searchParams] = useSearchParams();
    const { token } = useAuth();
    const orderId = searchParams.get("orderId");
    const paymentMethod = searchParams.get("method") || "COD";

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId || !token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (err) {
                console.error("Failed to fetch order:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId, token]);

    const estimatedDelivery = () => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
    };

    return (
        <div className="min-h-screen bg-pink-50 border-8 border-black flex items-center justify-center px-4 py-12">
            <div className="max-w-lg w-full text-center">
                {/* Success Icon */}
                <div className="mb-6">
                    <div className="w-24 h-24 mx-auto bg-green-500 border-4 border-black shadow-[6px_6px_0_#000000] flex items-center justify-center">
                        <i className="fa-solid fa-check text-white text-4xl"></i>
                    </div>
                </div>

                <h1 className="font-brutalist text-3xl sm:text-4xl text-black bg-black text-white px-6 py-3 inline-block mb-4">
                    ORDER PLACED!
                </h1>

                <p className="text-gray-600 font-bold mt-4 mb-6">
                    Thank you for your order! We'll notify you when it ships.
                </p>

                {/* Payment Method Badge */}
                <div className={`inline-flex items-center gap-2 px-4 py-2 border-4 border-black font-bold text-sm mb-6 ${paymentMethod === "COD"
                        ? "bg-green-200 text-green-800"
                        : "bg-blue-200 text-blue-800"
                    }`}>
                    <i className={`fa-solid ${paymentMethod === "COD" ? "fa-money-bill-wave" : "fa-credit-card"}`}></i>
                    {paymentMethod === "COD" ? "Cash on Delivery" : "Paid via Razorpay"}
                </div>

                {/* Order ID */}
                {orderId && (
                    <div className="bg-gray-100 border-4 border-black p-4 inline-block mb-6">
                        <span className="text-sm text-gray-500 block mb-1 font-bold">Order ID</span>
                        <span className="font-mono text-[#D97534] font-bold text-lg">{orderId.slice(0, 8)}...</span>
                    </div>
                )}

                {/* Order Summary */}
                {order && (
                    <div className="bg-white border-4 border-black p-6 text-left mb-6">
                        <h3 className="font-brutalist text-lg bg-black text-white px-4 py-1 inline-block mb-4">
                            ORDER SUMMARY
                        </h3>

                        {order.orderItems?.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {order.orderItems.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm border-b border-gray-100 pb-1">
                                        <span className="text-gray-600 truncate max-w-[200px]">
                                            {item.product_title} × {item.quantity || 1}
                                        </span>
                                        <span className="font-bold">{formatCurrency(item.price * (item.quantity || 1))}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between font-bold pt-2 border-t-2 border-dashed border-gray-300">
                            <span>Total</span>
                            <span className="text-[#D97534]">{formatCurrency(order.total_amount)}</span>
                        </div>

                        {paymentMethod === "COD" && (
                            <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 text-sm text-yellow-800">
                                <i className="fa-solid fa-info-circle mr-2"></i>
                                Payment of {formatCurrency(order.total_amount)} will be collected at the time of delivery.
                            </div>
                        )}
                    </div>
                )}

                {/* Estimated Delivery */}
                <div className="bg-orange-100 border-4 border-black p-4 mb-6">
                    <p className="font-bold text-sm text-gray-500">Estimated Delivery</p>
                    <p className="font-brutalist text-lg text-black">{estimatedDelivery()}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/profile/orders"
                        className="px-6 py-3 bg-black text-white font-bold border-4 border-white hover:bg-orange-500 transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#000000]"
                    >
                        <i className="fa-solid fa-list mr-2"></i>View My Orders
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-white text-black font-bold border-4 border-black hover:bg-orange-500 hover:text-white transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#000000]"
                    >
                        <i className="fa-solid fa-cart-shopping mr-2"></i>Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
