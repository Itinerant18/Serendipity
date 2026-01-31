"use client";

import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/utils/format";

export default function OrderSuccessPage() {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails();
        } else {
            setLoading(false);
        }
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            const data = await apiRequest(`/api/orders/${orderId}`);
            setOrder(data);
        } catch (error) {
            console.error("Failed to fetch order:", error);
        } finally {
            setLoading(false);
        }
    };

    // Estimated delivery: 5-7 business days from now
    const getEstimatedDelivery = () => {
        const start = new Date();
        start.setDate(start.getDate() + 5);
        const end = new Date();
        end.setDate(end.getDate() + 7);
        const options = { month: 'short', day: 'numeric' };
        return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
    };

    return (
        <div className="min-h-screen bg-green-50 border-8 border-black py-12 px-4">
            {/* Checkout Progress Stepper */}
            <CheckoutStepper currentStep={4} />

            <div className="max-w-2xl mx-auto">
                {/* Success Header */}
                <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] p-8 text-center mb-8">
                    <div className="w-20 h-20 bg-green-500 border-4 border-black flex items-center justify-center mx-auto mb-6">
                        <i className="fa-solid fa-circle-check text-4xl text-white" />
                    </div>

                    <h1 className="font-brutalist text-black font-bold text-3xl mb-4 border-4 border-black bg-yellow-200 p-2 inline-block">
                        ORDER PLACED!
                    </h1>

                    <p className="font-brutalist text-gray-700 mt-4 max-w-sm mx-auto">
                        Thank you for your purchase. Your order has been confirmed and will be shipped soon.
                    </p>

                    {orderId && (
                        <div className="bg-gray-100 border-2 border-black p-4 mt-6 inline-block">
                            <span className="text-sm text-gray-500 block mb-1">Order ID</span>
                            <span className="font-mono text-[#D97534] font-bold text-lg">{orderId}</span>
                        </div>
                    )}

                    {/* Estimated Delivery */}
                    <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 inline-flex items-center gap-3">
                        <i className="fa-solid fa-truck text-blue-500 text-xl" />
                        <div className="text-left">
                            <span className="text-sm text-blue-600 block">Estimated Delivery</span>
                            <span className="font-bold text-blue-800">{getEstimatedDelivery()}</span>
                        </div>
                    </div>
                </div>

                {/* Order Details */}
                {loading ? (
                    <div className="bg-white border-4 border-black p-6 text-center">
                        <i className="fa-solid fa-spinner fa-spin text-2xl text-gray-400" />
                        <p className="text-gray-500 mt-2">Loading order details...</p>
                    </div>
                ) : order && order.orderItems ? (
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0_#000000] p-6 mb-8">
                        <div className="inline-block bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-widest mb-4">
                            Order Details
                        </div>

                        {/* Items List */}
                        <div className="space-y-4 mb-6">
                            {order.orderItems.map((item, index) => (
                                <div key={item.id || index} className="flex gap-4 py-3 border-b border-gray-200 last:border-0">
                                    {item.image_url && (
                                        <div className="w-16 h-16 border-2 border-black overflow-hidden flex-shrink-0">
                                            <img src={item.image_url} alt={item.product_title} className="w-full h-full object-contain" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 line-clamp-1">{item.product_title}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-gray-900">{formatCurrency(item.price)}</p>
                                </div>
                            ))}
                        </div>

                        {/* Shipping Address */}
                        {order.shipping_address && (
                            <div className="border-t-2 border-dashed border-gray-300 pt-4 mb-4">
                                <p className="text-sm text-gray-500 mb-2">Shipping to:</p>
                                <p className="font-medium">{order.shipping_name}</p>
                                <p className="text-gray-600 text-sm">
                                    {order.shipping_address}, {order.shipping_city} {order.shipping_zip}
                                </p>
                            </div>
                        )}

                        {/* Total */}
                        <div className="border-t-4 border-black pt-4 flex justify-between items-center">
                            <span className="font-bold text-lg">Total Paid</span>
                            <span className="font-bold text-2xl text-green-600">{formatCurrency(order.total_amount)}</span>
                        </div>
                    </div>
                ) : null}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/orders"
                        className="inline-flex items-center justify-center px-8 py-4 border-4 border-black bg-white text-black font-bold hover:bg-gray-100 transition-all shadow-[4px_4px_0_#000000] hover:shadow-[6px_6px_0_#000000]"
                    >
                        <i className="fa-solid fa-list-check mr-2" />
                        View My Orders
                    </Link>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-8 py-4 border-4 border-black bg-orange-500 text-white font-bold hover:bg-orange-600 transition-all shadow-[4px_4px_0_#000000] hover:shadow-[6px_6px_0_#000000]"
                    >
                        <i className="fa-solid fa-bag-shopping mr-2" />
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
