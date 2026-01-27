"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";

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

            const res = await fetch("http://localhost:5000/api/profile/addresses", {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
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
            const res = await fetch(`http://localhost:5000/api/profile/addresses/${id}`, {
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
            const res = await fetch(`http://localhost:5000/api/profile/addresses/${id}/set-default`, {
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
            ? `http://localhost:5000/api/profile/addresses/${editingAddress.id}`
            : "http://localhost:5000/api/profile/addresses";

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
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                    <i className="fa-solid fa-spinner fa-spin text-4xl text-[#3B82F6] mx-auto"></i>
                    <p className="text-gray-500 mt-4">Loading addresses...</p>
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
                        <h1 className="font-bold text-3xl text-[#1E293B]">My Addresses</h1>
                        <p className="text-gray-600 mt-1">Manage your shipping and billing addresses</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors cursor-pointer"
                    >
                        <i className="fa-solid fa-plus"></i>
                        Add Address
                    </button>
                </div>

                {/* Address List */}
                {addresses.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-16 text-center border border-gray-200">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <i className="fa-solid fa-location-dot text-5xl text-[#3B82F6]"></i>
                        </div>
                        <h3 className="font-bold text-2xl text-[#1E293B] mb-3">No addresses saved</h3>
                        <p className="text-gray-500 mb-8">Add a new address to get started</p>
                        <button
                            onClick={() => openModal()}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg transition-colors cursor-pointer"
                        >
                            <i className="fa-solid fa-plus"></i>
                            Add Address
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className={`bg-white rounded-xl shadow-sm p-6 border transition-all duration-200 hover:shadow-md cursor-pointer ${address.is_default ? "border-[#3B82F6]" : "border-gray-200"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${address.is_default ? "bg-blue-50" : "bg-gray-50"}`}>
                                            <i className={`fa-solid fa-location-dot text-xl ${address.is_default ? "text-[#3B82F6]" : "text-gray-500"}`}></i>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-semibold text-[#1E293B]">{address.full_name}</h3>
                                                {address.is_default && (
                                                    <span className="px-2 py-0.5 bg-blue-50 text-[#3B82F6] text-xs font-medium rounded-lg">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm">
                                                {address.address_line1}
                                                {address.address_line2 && `, ${address.address_line2}`}
                                            </p>
                                            <p className="text-gray-600 text-sm">
                                                {address.city}, {address.state} {address.postal_code}
                                            </p>
                                            <p className="text-gray-600 text-sm">{address.country}</p>
                                            <p className="text-gray-500 text-sm mt-2">
                                                <i className="fa-solid fa-phone mr-1"></i>
                                                {address.phone}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!address.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(address.id)}
                                                className="p-2.5 text-gray-400 hover:text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                                title="Set as default"
                                            >
                                                <i className="fa-solid fa-check"></i>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => openModal(address)}
                                            className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                                        >
                                            <i className="fa-solid fa-pen-to-square"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
                                            className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                                        >
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="font-bold text-xl text-[#1E293B]">
                        {address ? "Edit Address" : "Add New Address"}
                    </h2>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 1</label>
                            <input
                                type="text"
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Line 2 (Optional)</label>
                            <input
                                type="text"
                                name="address_line2"
                                value={formData.address_line2}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Postal Code</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                            <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
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
                            className="w-4 h-4 text-[#3B82F6] border-gray-300 rounded focus:ring-[#3B82F6] cursor-pointer"
                        />
                        <label htmlFor="is_default" className="ml-2 text-sm text-gray-700 cursor-pointer">
                            Set as default address
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
                            {saving ? "Saving..." : "Save Address"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
