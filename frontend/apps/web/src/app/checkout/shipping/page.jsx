"use client";

import React, { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import useCartStore from "@/utils/cartStore";
import { formatCurrency } from "@/utils/format";
import AddressSelection from "@/components/checkout/AddressSelection";
import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import toast from "react-hot-toast";
import { apiRequest } from "@/lib/api";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;
const IS_RAZORPAY_ENABLED = Boolean(RAZORPAY_KEY && RAZORPAY_KEY !== 'rzp_test_PLACEHOLDER');

export default function ShippingPage() {
    const { user, token, isAuthenticated } = useAuth();
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const cartItems = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);
    const removeFromCart = useCartStore((state) => state.removeFromCart);

    useEffect(() => {
        if (!isAuthenticated && !localStorage.getItem("token")) {
            window.location.href = "/account/signin?callbackUrl=/checkout/shipping";
        }
    }, [isAuthenticated]);

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => {
            const priceValue = typeof item.price === 'number'
                ? item.price
                : parseFloat(String(item.price).replace(/[^0-9.]/g, "")) || 0;
            return total + priceValue * (item.qty || item.quantity || 1);
        }, 0).toFixed(2);
    };

    const createOrder = async (method) => {
        const totalAmount = calculateTotal();
        const shippingInfo = {
            address: selectedAddress.address_line1 + (selectedAddress.address_line2 ? `, ${selectedAddress.address_line2}` : ''),
            city: selectedAddress.city,
            zip: selectedAddress.postal_code,
            country: selectedAddress.country,
            state: selectedAddress.state || '',
            name: selectedAddress.full_name || user?.name || "User",
            phone: selectedAddress.phone
        };

        // Uses apiRequest for auto-token refresh & error handling
        return await apiRequest('/api/orders', {
            method: "POST",
            body: JSON.stringify({
                items: cartItems,
                totalPrice: totalAmount,
                shipping: shippingInfo,
                paymentMethod: method
            })
        });
    };

    // Handle "Products not found" error - clean up invalid cart items
    const handleProductsNotFound = (errorMessage) => {
        const match = errorMessage.match(/Products not found:\s*([^\.]+)/);
        if (match) {
            const missingIds = match[1].split(',').map(id => id.trim());
            missingIds.forEach(id => {
                removeFromCart(id);
            });
            toast.error("Some items in your cart are no longer available and have been removed.");
            return true;
        }
        return false;
    };

    const handleCODPayment = async () => {
        try {
            const orderData = await createOrder("COD");
            clearCart();
            window.location.href = `/checkout/success?orderId=${orderData._id || orderData.id}&method=COD`;
        } catch (error) {
            // Check for "Products not found" error and clean up cart
            if (error.message && error.message.includes("Products not found")) {
                handleProductsNotFound(error.message);
            }
            // Error is already thrown by apiRequest with backend message
            throw error;
        }
    };

    const handleRazorpayPayment = async () => {
        const orderData = await createOrder("Razorpay");
        const totalAmount = calculateTotal();

        const rzpOrder = await apiRequest('/api/payment/razorpay/order', {
            method: "POST",
            body: JSON.stringify({
                amount: totalAmount,
                currency: "INR",
                receipt: orderData._id || orderData.id
            })
        });

        const options = {
            key: RAZORPAY_KEY,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            name: "Serendipity",
            description: "Order #" + orderData.orderNumber,
            order_id: rzpOrder.id,
            handler: async function (response) {
                try {
                    const verifyData = await apiRequest('/api/payment/razorpay/verify', {
                        method: "POST",
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_id: orderData._id || orderData.id
                        })
                    });

                    if (verifyData.success) {
                        clearCart();
                        window.location.href = `/checkout/success?orderId=${orderData._id || orderData.id}&method=Razorpay`;
                    } else {
                        toast.error("Payment Verification Failed");
                    }
                } catch (err) {
                    toast.error("Payment verification error: " + err.message);
                }
            },
            prefill: { name: user?.name, email: user?.email },
            theme: { color: "#D97534" }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!selectedAddress) {
                toast.error("Please select a delivery address");
                return;
            }
            if (cartItems.length === 0) {
                toast.error("Your cart is empty");
                return;
            }

            if (paymentMethod === "COD") {
                await handleCODPayment();
            } else {
                await handleRazorpayPayment();
            }
        } catch (error) {
            // Check for "Products not found" error and clean up cart
            if (error.message && error.message.includes("Products not found")) {
                handleProductsNotFound(error.message);
            }
            console.error(error);
            toast.error("Error processing order: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-pink-50 border-8 border-black py-12 px-4 sm:px-6 lg:px-8">
            <CheckoutStepper currentStep={2} />

            <div className="max-w-3xl mx-auto">
                <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-8 text-center">
                    Shipping & Payment
                </h1>

                <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] p-6 sm:p-8">
                    {/* Address Selection */}
                    <div className="inline-block bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-widest mb-6 border-2 border-black transform -rotate-1">
                        Select Delivery Address
                    </div>

                    <AddressSelection
                        selectedAddress={selectedAddress}
                        onSelect={setSelectedAddress}
                    />

                    {/* Payment Method Selection */}
                    <div className="pt-6 mt-6 border-t-4 border-black">
                        <div className="inline-block bg-black text-white px-3 py-1 text-sm font-bold uppercase tracking-widest mb-6 border-2 border-black transform rotate-1">
                            Payment Method
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* COD Option */}
                            <button
                                type="button"
                                onClick={() => setPaymentMethod("COD")}
                                className={`p-5 border-4 border-black text-left transition-all cursor-pointer group ${paymentMethod === "COD"
                                    ? "bg-green-100 shadow-[6px_6px_0_#000000] translate-x-[-2px] translate-y-[-2px]"
                                    : "bg-white hover:bg-green-50 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#000000]"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-5 h-5 border-3 border-black flex items-center justify-center ${paymentMethod === "COD" ? "bg-green-500" : "bg-white"
                                        }`}>
                                        {paymentMethod === "COD" && (
                                            <i className="fa-solid fa-check text-white text-xs"></i>
                                        )}
                                    </div>
                                    <i className="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
                                    <span className="font-brutalist font-bold text-black text-lg">Cash on Delivery</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-8">
                                    Pay when your order arrives at your doorstep
                                </p>
                            </button>

                            {/* Razorpay Option */}
                            <button
                                type="button"
                                onClick={() => IS_RAZORPAY_ENABLED && setPaymentMethod("Razorpay")}
                                disabled={!IS_RAZORPAY_ENABLED}
                                className={`p-5 border-4 border-black text-left transition-all group ${!IS_RAZORPAY_ENABLED
                                    ? "bg-gray-100 opacity-50 cursor-not-allowed"
                                    : paymentMethod === "Razorpay"
                                        ? "bg-blue-100 shadow-[6px_6px_0_#000000] translate-x-[-2px] translate-y-[-2px] cursor-pointer"
                                        : "bg-white hover:bg-blue-50 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[4px_4px_0_#000000] cursor-pointer"
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-5 h-5 border-3 border-black flex items-center justify-center ${paymentMethod === "Razorpay" ? "bg-blue-500" : "bg-white"
                                        }`}>
                                        {paymentMethod === "Razorpay" && (
                                            <i className="fa-solid fa-check text-white text-xs"></i>
                                        )}
                                    </div>
                                    <i className="fa-solid fa-credit-card text-blue-600 text-xl"></i>
                                    <span className="font-brutalist font-bold text-black text-lg">Pay Online</span>
                                </div>
                                <p className="text-sm text-gray-600 ml-8">
                                    {IS_RAZORPAY_ENABLED
                                        ? "UPI, Card, Net Banking via Razorpay"
                                        : "Coming soon — Online payment not configured yet"}
                                </p>
                            </button>
                        </div>
                    </div>

                    {/* Order Summary & Pay Button */}
                    <div className="pt-8 border-t-4 border-black mt-8">
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
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-brutalist text-lg py-4 border-4 border-black hover:border-white transition-transform duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_#000000] disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed group cursor-pointer"
                        >
                            <span className="flex items-center justify-center gap-2">
                                {loading ? (
                                    "Processing..."
                                ) : paymentMethod === "COD" ? (
                                    <>
                                        <i className="fa-solid fa-money-bill-wave"></i>
                                        Place Order (Cash on Delivery)
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-lock"></i>
                                        Pay Now with Razorpay
                                    </>
                                )}
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
