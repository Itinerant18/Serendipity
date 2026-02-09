"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EditProfilePage() {
    const navigate = useNavigate();
    const token = useAuthStore(state => state.token);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        date_of_birth: "",
        gender: "",
        avatar_url: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                if (!token) return;

                const res = await fetch(`${API_URL}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/account/signin";
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        name: data.user?.name || "",
                        mobile: data.user?.mobile || "",
                        date_of_birth: data.user?.date_of_birth ? data.user.date_of_birth.split("T")[0] : "",
                        gender: data.user?.gender || "",
                        avatar_url: data.user?.avatar_url || "",
                    });
                }
            } catch (err) {
                console.error("Failed to fetch profile", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    const fileInputRef = React.useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // basic validation
        if (file.size > 5 * 1024 * 1024) {
            setError("File size should be less than 5MB");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch(`${API_URL}/api/upload/profile-image`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }, // Content-Type handled automatically with FormData
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setFormData(prev => ({ ...prev, avatar_url: data.url }));
            } else {
                setError(data.message || "Failed to upload image");
            }
        } catch (err) {
            console.error("Upload error:", err);
            setError("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
            // reset input
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const res = await fetch(`${API_URL}/api/profile`, {
                method: "PUT",
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
                setSuccess(true);
                setTimeout(() => navigate("/profile"), 1500);
            } else {
                const data = await res.json();
                setError(data.message || "Failed to update profile");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D97534] mx-auto"></i>
                <p className="text-gray-500 mt-4">Loading profile...</p>
            </div>

        );
    }

    return (

        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate("/profile")} className="p-2 hover:bg-gray-100 rounded-lg">
                        <i className="fa-solid fa-arrow-left text-xl text-gray-600"></i>
                    </button>
                    <div>
                        <h1 className="font-playfair font-bold text-2xl text-gray-900">Edit Profile</h1>
                        <p className="text-gray-600 mt-1">Update your personal information</p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#D97534] to-[#febd69] flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                formData.name?.charAt(0).toUpperCase() || "U"
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 disabled:opacity-50"
                        >
                            {uploading ? <i className="fa-solid fa-spinner fa-spin text-[#D97534]"></i> : <i className="fa-solid fa-camera text-gray-600"></i>}
                        </button>
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">Profile Photo</p>
                        <p className="text-sm text-gray-500">JPG, PNG or GIF. Max 2MB.</p>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                        <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#D97534] focus:border-transparent"
                        >
                            <option value="">Prefer not to say</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        Profile updated successfully! Redirecting...
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => navigate("/profile")}
                        className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin w-5 h-5"></i>
                                Saving...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-floppy-disk w-5 h-5"></i>
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>

    );
}
