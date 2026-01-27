"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-[#3B82F6] mx-auto"></i>
                    <p className="text-gray-500 mt-4">Loading payment methods...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="font-bold text-3xl text-[#1E293B]">Payment Methods</h1>
                        <p className="text-gray-600 mt-1">Manage your saved payment options</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Add Payment
                    </button>
                </div>

                {/* Payment Methods List */}
                {methods.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-200">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <i className="fa-solid fa-credit-card text-5xl text-[#3B82F6]"></i>
                        </div>
                        <h3 className="font-bold text-2xl text-[#1E293B] mb-3">No payment methods saved</h3>
                        <p className="text-gray-500 mb-8">Add a payment method for faster checkout</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-plus"></i>
                            Add Payment Method
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {methods.map((method) => {
                            const iconClass = getMethodIcon(method.method_type);
                            return (
                                <div
                                    key={method.id}
                                    className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 hover:shadow-md cursor-pointer ${method.is_default ? "border-[#3B82F6]" : "border-gray-200"
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-lg ${method.is_default ? "bg-blue-50" : "bg-gray-50"}`}>
                                                <i className={`${iconClass} text-2xl ${method.is_default ? "text-[#3B82F6]" : "text-gray-500"}`}></i>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-[#1E293B]">{getMethodDisplay(method)}</h3>
                                                    {method.is_default && (
                                                        <span className="px-2 py-0.5 bg-blue-50 text-[#3B82F6] text-xs font-medium rounded-lg">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                {method.method_type === "card" && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Expires {method.card_expiry_month}/{method.card_expiry_year}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!method.is_default && (
                                                <button
                                                    onClick={() => handleSetDefault(method.id)}
                                                    className="p-2.5 text-gray-400 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                    title="Set as default"
                                                >
                                                    <i className="fa-solid fa-check"></i>
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(method.id)}
                                                className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                            >
                                                <i className="fa-solid fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Add Payment Modal */}
                {showModal && (
                    <PaymentMethodModal
                        onSave={async (data) => {
                            const token = localStorage.getItem("token");
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="font-bold text-xl text-[#1E293B]">Add Payment Method</h2>
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
                                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${methodType === type
                                    ? "border-[#3B82F6] bg-blue-50 text-[#3B82F6]"
                                    : "border-gray-200 text-gray-600 hover:border-gray-300"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">UPI ID</label>
                            <input
                                type="text"
                                value={formData.upi_id}
                                onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
                                placeholder="yourname@upi"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                    )}

                    {/* Wallet Form */}
                    {methodType === "wallet" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Wallet Provider</label>
                                <select
                                    value={formData.wallet_provider}
                                    onChange={(e) => setFormData({ ...formData, wallet_provider: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors cursor-pointer"
                                >
                                    <option value="">Select provider</option>
                                    <option value="Paytm">Paytm</option>
                                    <option value="PhonePe">PhonePe</option>
                                    <option value="Google Pay">Google Pay</option>
                                    <option value="Amazon Pay">Amazon Pay</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                <input
                                    type="tel"
                                    value={formData.wallet_phone}
                                    onChange={(e) => setFormData({ ...formData, wallet_phone: e.target.value })}
                                    placeholder="+91 98765 43210"
                                    required
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
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
                            className="w-4 h-4 text-[#3B82F6] border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor="is_default_payment" className="ml-2 text-sm text-gray-700 cursor-pointer">
                            Set as default payment method
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {saving ? "Saving..." : "Add Payment Method"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
