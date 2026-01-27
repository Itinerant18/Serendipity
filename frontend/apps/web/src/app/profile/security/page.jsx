"use client";

import React, { useState } from "react";
// FontAwesome icons used globally
import useAuthStore from "@/utils/authStore";

export default function SecurityPage() {
    const token = useAuthStore(state => state.token);
    const user = useAuthStore(state => state.user);
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

    // Check if user is Google OAuth user
    const isGoogleUser = user?.authProvider === 'google';

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
        <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h1 className="font-bold text-3xl text-[#1E293B]">Security</h1>
                    <p className="text-gray-600 mt-1">Manage your account security settings</p>
                </div>

                {/* Change Password */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <i className="fa-solid fa-key text-xl text-[#3B82F6]"></i>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-[#1E293B]">Change Password</h2>
                            <p className="text-sm text-gray-500">Update your password regularly to keep your account secure</p>
                        </div>
                    </div>

                    {isGoogleUser ? (
                        // Google OAuth User Warning
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <i className="fa-solid fa-info-circle text-blue-600 text-xl mt-0.5"></i>
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Google Account</h3>
                                    <p className="text-sm text-blue-800">
                                        You're signed in with Google. To change your password, please visit your{' '}
                                        <a 
                                            href="https://myaccount.google.com/security" 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="font-semibold underline hover:text-blue-600 transition-colors"
                                        >
                                            Google Account Security settings
                                        </a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Password Change Form for Email/Password Users
                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"}
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPasswords.current ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"}
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
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
                                                className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${i <= passwordStrength.strength ? passwordStrength.color : "bg-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Password strength: <span className="font-medium">{passwordStrength.label || "Enter password"}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"}
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    required
                                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPasswords.confirm ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <i className="fa-solid fa-circle-exclamation mt-0.5"></i>
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                <i className="fa-solid fa-circle-check mt-0.5"></i>
                                <span>{success}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={changingPassword}
                            className="px-5 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white font-medium rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                        >
                            {changingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                    )}
                </div>

                {/* Two-Factor Authentication */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <i className="fa-solid fa-mobile-screen-button text-xl text-[#3B82F6]"></i>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-[#1E293B]">Two-Factor Authentication</h2>
                            <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div>
                            <p className="font-medium text-[#1E293B]">2FA is not enabled</p>
                            <p className="text-sm text-gray-500 mt-1">Protect your account with two-factor authentication</p>
                        </div>
                        <button className="px-4 py-2 bg-gray-200 text-gray-600 font-medium rounded-lg cursor-not-allowed">
                            Coming Soon
                        </button>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-blue-50 rounded-lg">
                            <i className="fa-solid fa-laptop text-xl text-[#3B82F6]"></i>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-[#1E293B]">Active Sessions</h2>
                            <p className="text-sm text-gray-500">Manage devices where you're currently logged in</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <i className="fa-solid fa-desktop text-lg text-[#3B82F6]"></i>
                                </div>
                                <div>
                                    <p className="font-medium text-[#1E293B]">Current Session</p>
                                    <p className="text-sm text-gray-500">Windows • Chrome • India</p>
                                </div>
                            </div>
                            <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                                Active Now
                            </span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2.5 bg-red-50 rounded-lg">
                            <i className="fa-solid fa-triangle-exclamation text-xl text-red-600"></i>
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-red-600">Danger Zone</h2>
                            <p className="text-sm text-gray-500">Irreversible and destructive actions</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div>
                            <p className="font-medium text-[#1E293B]">Delete Account</p>
                            <p className="text-sm text-gray-500 mt-1">Permanently delete your account and all data</p>
                        </div>
                        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors cursor-pointer">
                            Delete Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
