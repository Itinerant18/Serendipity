"use client";

import React, { useState } from "react";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";

export default function SecurityPage() {
    const token = useAuthStore(state => state.token);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (passwordData.new_password !== passwordData.confirm_password) {
            setError("New passwords do not match");
            return;
        }

        if (passwordData.new_password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setChangingPassword(true);

        try {
            const res = await fetch("http://localhost:5000/api/profile/security/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                })
            });

            if (res.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/account/signin";
                return;
            }

            if (res.ok) {
                setSuccess("Password changed successfully!");
                setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
            } else {
                const data = await res.json();
                setError(data.message || "Failed to change password");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setChangingPassword(false);
        }
    };

    const getPasswordStrength = (password) => {
        if (!password) return { strength: 0, label: "", color: "" };
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        const labels = ["Weak", "Fair", "Good", "Strong"];
        const colors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

        return {
            strength,
            label: labels[strength - 1] || "",
            color: colors[strength - 1] || "bg-gray-200"
        };
    };

    const passwordStrength = getPasswordStrength(passwordData.new_password);

    return (

        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h1 className="font-playfair font-bold text-2xl text-gray-900">Security</h1>
                <p className="text-gray-600 mt-1">Manage your account security settings</p>
            </div>

            {/* Change Password */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <i className="fa-solid fa-key text-xl text-[#D97534]"></i>
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Change Password</h2>
                </div>

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.current ? "text" : "password"}
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                required
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.current ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.new ? "text" : "password"}
                                value={passwordData.new_password}
                                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                required
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.new ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                        {passwordData.new_password && (
                            <div className="mt-2">
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className={`h-1 flex-1 rounded ${i <= passwordStrength.strength ? passwordStrength.color : "bg-gray-200"
                                                }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Password strength: <span className="font-medium">{passwordStrength.label || "Enter password"}</span>
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <input
                                type={showPasswords.confirm ? "text" : "password"}
                                value={passwordData.confirm_password}
                                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                required
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPasswords.confirm ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="px-4 py-2 bg-[#D97534] hover:bg-[#C86429] text-white font-medium rounded-lg disabled:opacity-50"
                    >
                        {changingPassword ? "Changing..." : "Change Password"}
                    </button>
                </form>
            </div>

            {/* Two-Factor Authentication */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-mobile-screen-button text-xl text-[#D97534]"></i>
                    <h2 className="font-playfair font-bold text-lg text-gray-900">Two-Factor Authentication</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">2FA is not enabled</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 text-gray-600 font-medium rounded-lg cursor-not-allowed">
                        Coming Soon
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
                <div className="flex items-center gap-3 mb-4">
                    <i className="fa-solid fa-triangle-exclamation text-xl text-red-600"></i>
                    <h2 className="font-playfair font-bold text-lg text-red-600">Danger Zone</h2>
                </div>
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div>
                        <p className="font-medium text-gray-900">Delete Account</p>
                        <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">
                        Delete Account
                    </button>
                </div>
            </div>
        </div>

    );
}
