"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { User, Store, FileText, Save, X, Camera, Star, Calendar, Mail, Loader2 } from "lucide-react";

export default function SellerSettings() {
    const { token, user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Profile data
    const [profile, setProfile] = useState(null);
    const [storeName, setStoreName] = useState("");
    const [description, setDescription] = useState("");
    const [logoUrl, setLogoUrl] = useState("");

    // Fetch profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/seller/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setStoreName(data.store_name || "");
                    setDescription(data.description || "");
                    setLogoUrl(data.logo_url || "");
                } else {
                    const errData = await res.json();
                    setError(errData.message || "Failed to load profile");
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
                setError("Failed to load profile. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProfile();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const res = await fetch('http://localhost:5000/api/seller/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    store_name: storeName,
                    description: description,
                    logo_url: logoUrl
                })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || "Failed to update profile");
            } else {
                setSuccess("Profile updated successfully!");
                setProfile(data.profile);
                // Clear success message after 3 seconds
                setTimeout(() => setSuccess(null), 3000);
            }
        } catch (err) {
            console.error("Failed to update profile", err);
            setError("Failed to update profile. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // Reset to original values
        if (profile) {
            setStoreName(profile.store_name || "");
            setDescription(profile.description || "");
            setLogoUrl(profile.logo_url || "");
        }
        setError(null);
        setSuccess(null);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#D97534]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold font-playfair text-[#232f3e] mb-6">Profile Settings</h1>

            {/* Success Message */}
            {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center text-green-700">
                    <Save className="w-5 h-5 mr-2" />
                    {success}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
                    <X className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-[#232f3e] mb-6 flex items-center">
                            <Store className="w-5 h-5 mr-2 text-[#D97534]" />
                            Store Information
                        </h2>

                        {/* Store Logo */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Logo
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                                    {logoUrl ? (
                                        <img src={logoUrl} alt="Store logo" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-8 h-8 text-gray-400" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="url"
                                        value={logoUrl}
                                        onChange={(e) => setLogoUrl(e.target.value)}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Enter a URL for your store logo</p>
                                </div>
                            </div>
                        </div>

                        {/* Store Name */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={storeName}
                                onChange={(e) => setStoreName(e.target.value)}
                                placeholder="My Amazing Store"
                                required
                                minLength={2}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">This is how customers will see your store</p>
                        </div>

                        {/* Store Description */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Store Description
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Tell customers about your store and what products you offer..."
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-[#D97534] hover:bg-[#C86429] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>

                {/* Sidebar - Account Info */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-[#232f3e] mb-4 flex items-center">
                            <User className="w-5 h-5 mr-2 text-[#D97534]" />
                            Account Info
                        </h2>

                        <div className="space-y-4">
                            {/* Email */}
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <Mail className="w-4 h-4 mr-1" />
                                    Email
                                </div>
                                <p className="text-sm font-medium text-gray-900">{user?.email || "—"}</p>
                            </div>

                            {/* Member Since */}
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Member Since
                                </div>
                                <p className="text-sm font-medium text-gray-900">
                                    {profile?.created_at
                                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })
                                        : "—"
                                    }
                                </p>
                            </div>

                            {/* Rating */}
                            <div>
                                <div className="flex items-center text-sm text-gray-500 mb-1">
                                    <Star className="w-4 h-4 mr-1" />
                                    Seller Rating
                                </div>
                                <div className="flex items-center">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-4 h-4 ${star <= (profile?.rating || 0)
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-gray-300"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-900">
                                        {profile?.rating?.toFixed(1) || "0.0"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="mt-4 bg-gradient-to-br from-[#232f3e] to-[#1a222e] rounded-xl p-6 text-white">
                        <h3 className="font-medium text-gray-300 mb-3">Store ID</h3>
                        <p className="text-xs font-mono bg-black/20 rounded px-2 py-1 break-all">
                            {profile?.id || "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
