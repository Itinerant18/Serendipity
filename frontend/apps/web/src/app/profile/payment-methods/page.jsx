"use client";

import React, { useState, useEffect } from "react";
import useAuthStore from "@/utils/authStore";
import GlassCard from "@/components/ui/GlassCard";

export default function PaymentMethodsPage() {
    const token = useAuthStore(state => state.token);
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchMethods();
    }, [token]);

    const fetchMethods = async () => {
        try {
            if (!token) return;

            const res = await fetch("http://localhost:5000/api/profile/payment-methods", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setMethods(data.payment_methods || []);
            }
        } catch (error) {
            console.error("Failed to fetch payment methods", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to remove this payment method?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/profile/payment-methods/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                setMethods(methods.filter(m => m.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete payment method", error);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/profile/payment-methods/${id}/set-default`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                fetchMethods();
            }
        } catch (error) {
            console.error("Failed to set default", error);
        }
    };

    const getMethodIcon = (type) => {
        switch (type) {
            case "upi": return "fa-solid fa-mobile-screen-button";
            case "wallet": return "fa-solid fa-wallet";
            default: return "fa-solid fa-credit-card";
        }
    };

    const getMethodDisplay = (method) => {
        if (method.method_type === "card") {
            return `${method.card_brand || "Card"} ending in ${method.card_last4}`;
        } else if (method.method_type === "upi") {
            return `UPI: ${method.upi_id}`;
        } else if (method.method_type === "wallet") {
            return `${method.wallet_provider} - ${method.wallet_phone}`;
        }
        return "Payment Method";
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white border-8 border-black flex items-center justify-center">
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin text-6xl text-orange-500 animate-brutalist-jitter"></i>
                    <p className="font-brutalist text-xl text-black mt-4">LOADING PAYMENT METHODS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white border-8 border-black">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <GlassCard className="p-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="font-brutalist text-4xl text-black bg-black text-white px-6 py-2 inline-block">
                                PAYMENT METHODS
                            </h1>
                            <p className="font-bold text-black mt-2 bg-yellow-200 border-2 border-black px-4 py-1 inline-block">
                                Manage your saved payment options
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all"
                        >
                            <i className="fa-solid fa-plus"></i>
                            ADD PAYMENT
                        </button>
                    </div>
                </GlassCard>

                {/* Payment Methods List */}
                {methods.length === 0 ? (
                    <GlassCard className="p-16 text-center">
                        <div className="w-24 h-24 bg-gray-200 border-4 border-black flex items-center justify-center mx-auto mb-6 animate-brutalist-jitter">
                            <i className="fa-solid fa-credit-card text-5xl text-black"></i>
                        </div>
                        <h3 className="font-brutalist text-3xl text-black bg-black text-white px-6 py-2 inline-block mb-4">
                            NO PAYMENT METHODS SAVED
                        </h3>
                        <p className="font-bold text-black mb-8">Add a payment method for faster checkout</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all"
                        >
                            <i className="fa-solid fa-plus"></i>
                            ADD PAYMENT METHOD
                        </button>
                    </GlassCard>
                ) : (
                    <div className="grid gap-4">
                        {methods.map((method) => {
                            const iconClass = getMethodIcon(method.method_type);
                            return (
                                <GlassCard key={method.id} className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 border-4 border-black flex items-center justify-center ${method.is_default ? "bg-yellow-200" : "bg-gray-200"}`}>
                                                <i className={`${iconClass} text-2xl ${method.is_default ? "text-black" : "text-gray-500"}`}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-brutalist text-xl text-black">{getMethodDisplay(method)}</h3>
                                                    {method.is_default && (
                                                        <span className="bg-yellow-200 border-2 border-black px-3 py-1 text-xs font-bold">
                                                            DEFAULT
                                                        </span>
                                                    )}
                                                </div>
                                                {method.method_type === "card" && (
                                                    <p className="font-bold text-sm text-gray-600 mt-1">
                                                        Expires {method.card_expiry_month}/{method.card_expiry_year}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!method.is_default && (
                                                <button
                                                    onClick={() => handleSetDefault(method.id)}
                                                    className="p-3 bg-yellow-200 border-4 border-black hover:bg-orange-500 hover:text-white transition-all"
                                                    title="Set as default"
                                                >
                                                    <i className="fa-solid fa-check text-lg"></i>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(method.id)}
                                                className="p-3 bg-white border-4 border-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                            >
                                                <i className="fa-solid fa-trash text-lg"></i>
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                )}

                {/* Add Payment Modal */}
                {showModal && (
                    <PaymentMethodModal
                        onSave={async (data) => {
                            const res = await fetch("http://localhost:5000/api/profile/payment-methods", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    Authorization: `Bearer ${token}`
                                },
                                body: JSON.stringify(data)
                            });
                            if (res.ok) {
                                fetchMethods();
                                setShowModal(false);
                            }
                        }}
                        onClose={() => setShowModal(false)}
                    />
                )}
            </div>
        </div>
    );
}

function PaymentMethodModal({ onSave, onClose }) {
    const [methodType, setMethodType] = useState("upi");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        upi_id: "",
        wallet_provider: "",
        wallet_phone: "",
        is_default: false,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ method_type: methodType, ...formData });
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] max-w-md w-full">
                <div className="p-6 border-b-4 border-black bg-yellow-200">
                    <h2 className="font-brutalist text-2xl text-black">ADD PAYMENT METHOD</h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Method Type Selector */}
                    <div className="flex gap-2">
                        {[
                            { type: "upi", label: "UPI", icon: "fa-solid fa-mobile-screen-button" },
                            { type: "wallet", label: "Wallet", icon: "fa-solid fa-wallet" },
                        ].map(({ type, label, icon }) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setMethodType(type)}
                                className={`flex-1 flex items-center justify-center gap-2 p-3 border-4 border-black font-bold transition-all ${methodType === type
                                    ? "bg-orange-500 text-white translate(-2px,-2px) shadow-[4px_4px_0_#000000]"
                                    : "bg-white text-black hover:bg-pink-500 hover:text-white"
                                    }`}
                            >
                                <i className={icon}></i>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* UPI Form */}
                    {methodType === "upi" && (
                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                UPI ID
                            </label>
                            <input
                                type="text"
                                value={formData.upi_id}
                                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                placeholder="yourname@upi"
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                    )}

                    {/* Wallet Form */}
                    {methodType === "wallet" && (
                        <>
                            <div>
                                <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                    WALLET PROVIDER
                                </label>
                                <select
                                    value={formData.wallet_provider}
                                    onChange={(e) => setFormData({ ...formData, wallet_provider: e.target.value })}
                                    required
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                >
                                    <option value="">Select provider</option>
                                    <option value="Paytm">Paytm</option>
                                    <option value="PhonePe">PhonePe</option>
                                    <option value="Google Pay">Google Pay</option>
                                    <option value="Amazon Pay">Amazon Pay</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                    PHONE NUMBER
                                </label>
                                <input
                                    type="tel"
                                    value={formData.wallet_phone}
                                    onChange={(e) => setFormData({ ...formData, wallet_phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    required
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="is_default_payment"
                            checked={formData.is_default}
                            onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                            className="w-5 h-5 border-4 border-black cursor-pointer accent-orange-500"
                        />
                        <label htmlFor="is_default_payment" className="ml-3 font-bold text-black cursor-pointer">
                            Set as default payment method
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t-4 border-black">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-white border-4 border-black text-black font-bold hover:bg-gray-100 transition-all"
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all disabled:opacity-50"
                        >
                            {saving ? "SAVING..." : "ADD PAYMENT"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
