"use client";

import React, { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function ShippingPage() {
    const { user, token, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        address: "",
        city: "",
        postalCode: "",
        country: "",
    });
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Redirect if not logged in
        if (!isAuthenticated && !localStorage.getItem("token")) {
            // window.location.href = "/account/signin?callbackUrl=/checkout/shipping";
            // Let useAuth handle it or just redirect
        }

        const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(savedCart);

        // Auto-fill if user has saved address (Mock for now)
        if (user) {
            // setFormData({ ... }) if user has address
        }
    }, [user, isAuthenticated]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const calculateTotal = () => {
        return cart
            .reduce((total, item) => {
                const price = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
                return total + price * item.quantity;
            }, 0)
            .toFixed(2);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const totalAmount = calculateTotal();

            const shippingInfo = {
                address: formData.address,
                city: formData.city,
                zip: formData.postalCode,
                country: formData.country,
                name: user?.name || "User"
            };

            // 1. Create Order in DB
            const orderRes = await fetch("http://localhost:5000/api/orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cart,
                    totalPrice: totalAmount,
                    shipping: shippingInfo,
                    paymentMethod: "Razorpay"
                })
            });

            if (!orderRes.ok) throw new Error("Failed to create order");
            const orderData = await orderRes.json();

            // 2. Create Razorpay Order
            const rzpOrderRes = await fetch("http://localhost:5000/api/payment/razorpay/order", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: totalAmount,
                    currency: "INR",
                    receipt: orderData._id || orderData.id
                })
            });

            if (!rzpOrderRes.ok) throw new Error("Failed to init payment");
            const rzpOrder = await rzpOrderRes.json();

            // 3. Open Razorpay
            const options = {
                key: "rzp_test_PLACEHOLDER", // Replace with env var if possible
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "Mercado",
                description: "Order #" + orderData.orderNumber,
                order_id: rzpOrder.id,
                handler: async function (response) {
                    // 4. Verify Payment
                    const verifyRes = await fetch("http://localhost:5000/api/payment/razorpay/verify", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: orderData._id || orderData.id
                        })
                    });

                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        // Clear cart and redirect
                        localStorage.removeItem("cart");
                        window.location.href = "/checkout/success?orderId=" + (orderData._id || orderData.id);
                    } else {
                        alert("Payment Verification Failed");
                    }
                },
                prefill: {
                    name: user?.name,
                    email: user?.email
                },
                theme: { color: "#D97534" }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert("Error processing order: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-8 text-center">
                    Shipping Address
                </h1>

                <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all hover:scale-[1.01]">
                    <form onSubmit={handlePayment} className="space-y-6">
                        <div>
                            <label className="block font-inter font-semibold text-gray-700 mb-2">Address</label>
                            <input
                                type="text"
                                name="address"
                                required
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent transition-all font-inter"
                                placeholder="123 Main St"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block font-inter font-semibold text-gray-700 mb-2">City</label>
                                <input
                                    type="text"
                                    name="city"
                                    required
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent transition-all font-inter"
                                    placeholder="New York"
                                />
                            </div>
                            <div>
                                <label className="block font-inter font-semibold text-gray-700 mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    name="postalCode"
                                    required
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent transition-all font-inter"
                                    placeholder="10001"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-inter font-semibold text-gray-700 mb-2">Country</label>
                            <input
                                type="text"
                                name="country"
                                required
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent transition-all font-inter"
                                placeholder="United States"
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-100 mt-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-playfair text-xl text-gray-600">Total Amount</span>
                                <span className="font-playfair font-bold text-2xl text-[#8B4513]">${calculateTotal()}</span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-bold text-lg py-4 rounded-full transition-all shadow-lg transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Processing..." : "Continue to Payment"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
