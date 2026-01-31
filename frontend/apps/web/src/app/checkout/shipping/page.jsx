"use client";

import React, { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import useCartStore from "@/utils/cartStore";
import { formatCurrency } from "@/utils/format";
import AddressSelection from "@/components/checkout/AddressSelection";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import toast from "react-hot-toast";
import { API_URL } from "@/lib/api";

export default function ShippingPage() {
    const { user, token, isAuthenticated } = useAuth();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(false);

    // Get cart from Zustand store
    const cartItems = useCartStore((state) => state.items);
    const getCartTotal = useCartStore((state) => state.getCartTotal);
    const clearCart = useCartStore((state) => state.clearCart);

    useEffect(() => {
        // Redirect if not logged in
        if (!isAuthenticated && !localStorage.getItem("token")) {
            window.location.href = "/account/signin?callbackUrl=/checkout/shipping";
        }
    }, [isAuthenticated]);

    // Calculate total using the store's method or manually
    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const priceValue = typeof item.price === 'number'
                ? item.price
                : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
            return total + priceValue * (item.qty || item.quantity || 1);
        }, 0).toFixed(2);
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!selectedAddress) {
                toast.error("Please select a delivery address");
                setLoading(false);
                return;
            }

            if (cartItems.length === 0) {
                toast.error("Your cart is empty");
                setLoading(false);
                return;
            }

            const totalAmount = calculateTotal();

            const shippingInfo = {
                address: selectedAddress.address_line1 + (selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''),
                city: selectedAddress.city,
                zip: selectedAddress.postal_code,
                country: selectedAddress.country,
                name: selectedAddress.full_name || user?.name || "User",
                phone: selectedAddress.phone
            };

            // 1. Create Order in DB
            const orderRes = await fetch(`${API_URL}/api/orders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    items: cartItems,
                    totalPrice: totalAmount,
                    shipping: shippingInfo,
                    paymentMethod: "Razorpay"
                })
            });

            if (!orderRes.ok) throw new Error("Failed to create order");
            const orderData = await orderRes.json();

            // 2. Create Razorpay Order
            const rzpOrderRes = await fetch(`${API_URL}/api/payment/razorpay/order`, {
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
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_PLACEHOLDER",
                amount: rzpOrder.amount,
                currency: rzpOrder.currency,
                name: "Serendipity",
                description: "Order #" + orderData.orderNumber,
                order_id: rzpOrder.id,
                handler: async function (response) {
                    // 4. Verify Payment
                    const verifyRes = await fetch(`${API_URL}/api/payment/razorpay/verify`, {
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
                        clearCart();
                        window.location.href = "/checkout/success?orderId=" + (orderData._id || orderData.id);
                    } else {
                        toast.error("Payment Verification Failed");
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
            toast.error("Error processing order: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 border-8 border-black py-12 px-4 sm:px-6 lg:px-8">
            {/* Checkout Progress Stepper */}
            <CheckoutStepper currentStep={2} />

            <div className="max-w-3xl mx-auto">
                <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-8 text-center">
                    Shipping Address
                </h1>

                {/* Address Selection Component */}
                <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] p-6 sm:p-8 transition-transform duration-100 hover:translate(-2px,-2px) hover:shadow-[14px_14px_0_#000000]">
                    {/* Visual Header Strip */}
                    <div className="inline-block bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-widest mb-6 border-2 border-black transform -rotate-1">
                        Select Delivery Address
                    </div>

                    <AddressSelection
                        selectedAddress={selectedAddress}
                        onSelect={setSelectedAddress}
                    />

                    {/* Continue Button */}
                    <div className="pt-8 border-t-4 border-black mt-8">
                        {/* Cart Summary */}
                        <div className="mb-6 space-y-2">
                            {cartItems.map((item, index) => (
                                <div key={item.product || index} className="flex justify-between text-sm">
                                    <span className="text-gray-600 truncate max-w-[200px]">{item.name} × {item.qty || 1}</span>
                                    <span className="font-medium">{formatCurrency((item.price || 0) * (item.qty || 1))}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mb-6 pt-4 border-t-2 border-dashed border-gray-300">
                            <span className="font-playfair text-xl text-gray-600">Total Amount</span>
                            <span className="font-playfair font-bold text-2xl text-[#8B4513]">
                                {formatCurrency(calculateTotal())}
                            </span>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={loading || !selectedAddress || cartItems.length === 0}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-brutalist text-lg py-4 border-4 border-black hover:border-white transition-transform duration-100 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? "Processing..." : "Continue to Payment"}
                                {!loading && <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>}
                            </span>
                        </button>

                        {!selectedAddress && (
                            <p className="text-red-500 font-bold text-center mt-3 animate-pulse">
                                * Please select an address to continue
                            </p>
                        )}

                        {cartItems.length === 0 && (
                            <p className="text-red-500 font-bold text-center mt-3 animate-pulse">
                                * Your cart is empty
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
