"use client";

import React, { useState, useEffect } from "react";
import useAuthStore from "@/utils/authStore";
import GlassCard from "@/components/ui/GlassCard";
import { API_URL } from "@/lib/api";

export default function AddressesPage() {
    const token = useAuthStore(state => state.token);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    useEffect(() => {
        fetchAddresses();
    }, [token]);

    const fetchAddresses = async () => {
        try {
            if (!token) return;

            const res = await fetch(`${API_URL}/api/addresses`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setAddresses(Array.isArray(data) ? data : (data.addresses || []));
            }
        } catch (error) {
            console.error("Failed to fetch addresses", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;

        try {
            const res = await fetch(`${API_URL}/api/addresses/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                setAddresses(addresses.filter(a => a.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete address", error);
        }
    };

    const handleSetDefault = async (id) => {
        try {
            const res = await fetch(`${API_URL}/api/addresses/${id}/set-default`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                fetchAddresses();
            }
        } catch (error) {
            console.error("Failed to set default", error);
        }
    };

    const openModal = (address = null) => {
        setEditingAddress(address);
        setShowModal(true);
    };

    const closeModal = () => {
        setEditingAddress(null);
        setShowModal(false);
    };

    const handleSave = async (formData) => {
        const url = editingAddress
            ? `${API_URL}/api/addresses/${editingAddress.id}`
            : `${API_URL}/api/addresses`;

        const res = await fetch(url, {
            method: editingAddress ? "PUT" : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (res.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/account/signin";
            return;
        }

        if (res.ok) {
            fetchAddresses();
            closeModal();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white border-8 border-black flex items-center justify-center">
                <div className="text-center">
                    <i className="fa-solid fa-spinner fa-spin text-6xl text-orange-500 animate-brutalist-jitter"></i>
                    <p className="font-brutalist text-xl text-black mt-4">LOADING ADDRESSES...</p>
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
                                MY ADDRESSES
                            </h1>
                            <p className="font-bold text-black mt-2 bg-yellow-200 border-2 border-black px-4 py-1 inline-block">
                                Manage your shipping addresses
                            </p>
                        </div>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all"
                        >
                            <i className="fa-solid fa-plus"></i>
                            ADD ADDRESS
                        </button>
                    </div>
                </GlassCard>

                {/* Address List */}
                {addresses.length === 0 ? (
                    <GlassCard className="p-16 text-center">
                        <div className="w-24 h-24 bg-gray-200 border-4 border-black flex items-center justify-center mx-auto mb-6 animate-brutalist-jitter">
                            <i className="fa-solid fa-location-dot text-5xl text-black"></i>
                        </div>
                        <h3 className="font-brutalist text-3xl text-black bg-black text-white px-6 py-2 inline-block mb-4">
                            NO ADDRESSES SAVED
                        </h3>
                        <p className="font-bold text-black mb-8">Add a new address to get started</p>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all"
                        >
                            <i className="fa-solid fa-plus"></i>
                            ADD ADDRESS
                        </button>
                    </GlassCard>
                ) : (
                    <div className="grid gap-4">
                        {addresses.map((address) => (
                            <GlassCard key={address.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 border-4 border-black flex items-center justify-center ${address.is_default ? "bg-yellow-200" : "bg-gray-200"}`}>
                                            <i className={`fa-solid fa-location-dot text-xl ${address.is_default ? "text-black" : "text-gray-500"}`}></i>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-brutalist text-xl text-black">{address.full_name}</h3>
                                                {address.is_default && (
                                                    <span className="bg-yellow-200 border-2 border-black px-3 py-1 text-xs font-bold">
                                                        DEFAULT
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-bold text-black">
                                                {address.address_line1}
                                                {address.address_line2 && `, ${address.address_line2}`}
                                            </p>
                                            <p className="font-bold text-black">
                                                {address.city}, {address.state} {address.postal_code}
                                            </p>
                                            <p className="font-bold text-black">{address.country}</p>
                                            <p className="font-bold text-sm text-gray-600 mt-2">
                                                <i className="fa-solid fa-phone mr-2"></i>
                                                {address.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!address.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="p-3 bg-yellow-200 border-4 border-black hover:bg-orange-500 hover:text-white transition-all"
                                                title="Set as default"
                                            >
                                                <i className="fa-solid fa-check text-lg"></i>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openModal(address)}
                                            className="p-3 bg-white border-4 border-black hover:bg-pink-500 hover:text-white hover:border-pink-500 transition-all"
                                        >
                                            <i className="fa-solid fa-pen-to-square text-lg"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="p-3 bg-white border-4 border-black hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                                        >
                                            <i className="fa-solid fa-trash text-lg"></i>
                                        </button>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <AddressModal
                        address={editingAddress}
                        onSave={handleSave}
                        onClose={closeModal}
                    />
                )}
            </div>
        </div>
    );
}

function AddressModal({ address, onSave, onClose }) {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        full_name: address?.full_name || "",
        phone: address?.phone || "",
        address_line1: address?.address_line1 || "",
        address_line2: address?.address_line2 || "",
        city: address?.city || "",
        state: address?.state || "",
        postal_code: address?.postal_code || "",
        country: address?.country || "India",
        is_default: address?.is_default || false,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave(formData);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b-4 border-black bg-yellow-200">
                    <h2 className="font-brutalist text-2xl text-black">
                        {address ? "EDIT ADDRESS" : "ADD NEW ADDRESS"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                FULL NAME
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                PHONE NUMBER
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                ADDRESS LINE 1
                            </label>
                            <input
                                type="text"
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                ADDRESS LINE 2 (OPTIONAL)
                            </label>
                            <input
                                type="text"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                CITY
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                STATE
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                POSTAL CODE
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                COUNTRY
                            </label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center pt-2">
                        <input
                            type="checkbox"
                            id="is_default"
                            name="is_default"
                            checked={formData.is_default}
                            onChange={handleChange}
                            className="w-5 h-5 border-4 border-black cursor-pointer accent-orange-500"
                        />
                        <label htmlFor="is_default" className="ml-3 font-bold text-black cursor-pointer">
                            Set as default address
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
                            {saving ? "SAVING..." : "SAVE ADDRESS"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
