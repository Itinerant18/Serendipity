"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function SettingsPage() {
    const token = useAuthStore(state => state.token);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    const [preferences, setPreferences] = useState({
        email_notifications: true,
        sms_notifications: false,
        order_updates: true,
        promotional_emails: true,
        language: "en",
        currency: "INR",
        theme: "light",
        show_profile_public: false,
        show_order_history: false,
    });

    useEffect(() => {
        const fetchPreferences = async () => {
            try {
                if (!token) return;

                const res = await fetch(`${API_URL}/api/profile/preferences`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/account/signin";
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    if (data.preferences) {
                        setPreferences(prev => ({ ...prev, ...data.preferences }));
                    }
                }
            } catch (error) {
                console.error("Failed to fetch preferences", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreferences();
    }, []);

    const handleChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);

        try {
            const res = await fetch(`${API_URL}/api/profile/preferences`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(preferences)
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (error) {
            console.error("Failed to save preferences", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (

            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <i className="fa-solid fa-spinner fa-spin text-4xl text-[#D97534] mx-auto"></i>
                <p className="text-gray-500 mt-4">Loading settings...</p>
            </div>

        );
    }

    return (

        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h1 className="font-playfair font-bold text-2xl text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Manage your preferences and privacy</p>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-regular fa-bell text-xl text-[#D97534]"></i>
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Notifications</h2>
                </div>
                <div className="space-y-4">
                    <Toggle
                        label="Email Notifications"
                        description="Receive order updates via email"
                        checked={preferences.email_notifications}
                        onChange={(v) => handleChange("email_notifications", v)}
                    />
                    <Toggle
                        label="SMS Notifications"
                        description="Get delivery updates via SMS"
                        checked={preferences.sms_notifications}
                        onChange={(v) => handleChange("sms_notifications", v)}
                    />
                    <Toggle
                        label="Order Updates"
                        description="Notifications about order status changes"
                        checked={preferences.order_updates}
                        onChange={(v) => handleChange("order_updates", v)}
                    />
                    <Toggle
                        label="Promotional Emails"
                        description="Receive deals and offers"
                        checked={preferences.promotional_emails}
                        onChange={(v) => handleChange("promotional_emails", v)}
                    />
                </div>
            </div>

            {/* Display Preferences */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-palette text-xl text-[#D97534]"></i>
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Display</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                            value={preferences.language}
                            onChange={(e) => handleChange("language", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534]"
                        >
                            <option value="en">English</option>
                            <option value="hi">Hindi</option>
                            <option value="ta">Tamil</option>
                            <option value="te">Telugu</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                        <select
                            value={preferences.currency}
                            onChange={(e) => handleChange("currency", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534]"
                        >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                    <div className="flex gap-4">
                        {["light", "dark", "system"].map((theme) => (
                            <label key={theme} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="theme"
                                    checked={preferences.theme === theme}
                                    onChange={() => handleChange("theme", theme)}
                                    className="w-4 h-4 text-[#D97534]"
                                />
                                <span className="text-sm text-gray-700 capitalize">{theme}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-lock text-xl text-[#D97534]"></i>
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Privacy</h2>
                </div>
                <div className="space-y-4">
                    <Toggle
                        label="Public Profile"
                        description="Allow others to see your profile"
                        checked={preferences.show_profile_public}
                        onChange={(v) => handleChange("show_profile_public", v)}
                    />
                    <Toggle
                        label="Show Order History"
                        description="Display order history on public profile"
                        checked={preferences.show_order_history}
                        onChange={(v) => handleChange("show_order_history", v)}
                    />
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
                {success && (
                    <span className="text-green-600 font-medium self-center">Settings saved!</span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-bold rounded-lg disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <i className="fa-solid fa-spinner fa-spin w-5 h-5"></i>
                            Saving...
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-floppy-disk w-5 h-5"></i>
                            Save Preferences
                        </>
                    )}
                </button>
            </div>
        </div>

    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-2">
            <div>
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#D97534]" : "bg-gray-200"
                    }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-1"
                        }`}
                />
            </button>
        </div>
    );
}
