"use client";

import React, { useState } from "react";
import useAuthStore from "@/utils/authStore";
import GlassCard from "@/components/ui/GlassCard";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
            const res = await fetch(`${API_URL}/api/profile/security/change-password`, {
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
        const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];

        return {
            strength,
            label: labels[strength - 1] || "",
            color: colors[strength - 1] || "bg-gray-200"
        };
    };

    const passwordStrength = getPasswordStrength(passwordData.new_password);

    return (
        <div className="min-h-screen bg-white border-8 border-black">
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <GlassCard className="p-6">
                    <h1 className="font-brutalist text-4xl text-black bg-black text-white px-6 py-2 inline-block">
                        SECURITY
                    </h1>
                    <p className="font-bold text-black mt-2 bg-yellow-200 border-2 border-black px-4 py-1 inline-block">
                        Manage your account security settings
                    </p>
                </GlassCard>

                {/* Change Password */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-orange-500 border-4 border-black flex items-center justify-center">
                            <i className="fa-solid fa-key text-2xl text-white"></i>
                        </div>
                        <div>
                            <h2 className="font-brutalist text-2xl text-black">CHANGE PASSWORD</h2>
                            <p className="font-bold text-black">Update your password regularly to stay secure</p>
                        </div>
                    </div>

                    {isGoogleUser ? (
                        <div className="bg-blue-200 border-4 border-black p-4">
                            <div className="flex items-start gap-3">
                                <i className="fa-brands fa-google text-2xl text-black mt-1"></i>
                                <div>
                                    <h3 className="font-brutalist text-lg text-black bg-black text-white px-3 py-1 inline-block mb-2">
                                        GOOGLE ACCOUNT
                                    </h3>
                                    <p className="font-bold text-black">
                                        You're signed in with Google. To change your password, please visit your{' '}
                                        <a
                                            href="https://myaccount.google.com/security"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-orange-500 hover:text-pink-500 underline"
                                        >
                                            Google Account Security settings
                                        </a>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                            <div>
                                <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                    CURRENT PASSWORD
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        value={passwordData.current_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 pr-12 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 border-2 border-black hover:bg-orange-500 hover:text-white transition-all"
                                    >
                                        {showPasswords.current ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                    NEW PASSWORD
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.new ? "text" : "password"}
                                        value={passwordData.new_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 pr-12 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 border-2 border-black hover:bg-orange-500 hover:text-white transition-all"
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
                                                    className={`h-3 flex-1 border-2 border-black transition-colors ${i <= passwordStrength.strength ? passwordStrength.color : "bg-white"}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="font-bold text-sm text-black mt-1">
                                            Password strength: <span className="font-brutalist">{passwordStrength.label || "Enter password"}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                    CONFIRM NEW PASSWORD
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        value={passwordData.confirm_password}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 pr-12 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 border-2 border-black hover:bg-orange-500 hover:text-white transition-all"
                                    >
                                        {showPasswords.confirm ? <i className="fa-solid fa-eye-slash"></i> : <i className="fa-solid fa-eye"></i>}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500 text-white border-4 border-black p-4 font-bold flex items-start gap-2">
                                    <i className="fa-solid fa-circle-exclamation text-xl mt-0.5"></i>
                                    <span>{error}</span>
                                </div>
                            )}
                            {success && (
                                <div className="bg-green-500 text-white border-4 border-black p-4 font-bold flex items-start gap-2">
                                    <i className="fa-solid fa-circle-check text-xl mt-0.5"></i>
                                    <span>{success}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={changingPassword}
                                className="px-8 py-4 bg-orange-500 border-4 border-black text-white font-brutalist text-lg hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all disabled:opacity-50"
                            >
                                {changingPassword ? "CHANGING..." : "CHANGE PASSWORD"}
                            </button>
                        </form>
                    )}
                </GlassCard>

                {/* Two-Factor Authentication */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-500 border-4 border-black flex items-center justify-center">
                            <i className="fa-solid fa-shield-halved text-2xl text-white"></i>
                        </div>
                        <div>
                            <h2 className="font-brutalist text-2xl text-black">TWO-FACTOR AUTHENTICATION</h2>
                            <p className="font-bold text-black">Add an extra layer of security to your account</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-100 border-4 border-black">
                        <div>
                            <p className="font-bold text-black">2FA is not enabled</p>
                            <p className="font-bold text-sm text-gray-600">Protect your account with two-factor authentication</p>
                        </div>
                        <button className="px-6 py-2 bg-gray-300 border-4 border-black font-bold text-black cursor-not-allowed">
                            COMING SOON
                        </button>
                    </div>
                </GlassCard>

                {/* Active Sessions */}
                <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-blue-500 border-4 border-black flex items-center justify-center">
                            <i className="fa-solid fa-laptop text-2xl text-white"></i>
                        </div>
                        <div>
                            <h2 className="font-brutalist text-2xl text-black">ACTIVE SESSIONS</h2>
                            <p className="font-bold text-black">Manage devices where you're currently logged in</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-100 border-4 border-black">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-yellow-200 border-4 border-black flex items-center justify-center">
                                    <i className="fa-solid fa-desktop text-2xl text-black"></i>
                                </div>
                                <div>
                                    <p className="font-brutalist text-lg text-black">CURRENT SESSION</p>
                                    <p className="font-bold text-sm text-gray-600">Windows • Chrome • India</p>
                                </div>
                            </div>
                            <span className="bg-green-500 text-white border-4 border-black px-4 py-1 font-bold text-sm">
                                ACTIVE NOW
                            </span>
                        </div>
                    </div>
                </GlassCard>

                {/* Danger Zone */}
                <GlassCard className="p-6 border-red-500">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-red-500 border-4 border-black flex items-center justify-center">
                            <i className="fa-solid fa-triangle-exclamation text-2xl text-white"></i>
                        </div>
                        <div>
                            <h2 className="font-brutalist text-2xl text-red-600">DANGER ZONE</h2>
                            <p className="font-bold text-black">Irreversible and destructive actions</p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-red-100 border-4 border-red-500">
                        <div>
                            <p className="font-brutalist text-lg text-black">DELETE ACCOUNT</p>
                            <p className="font-bold text-sm text-gray-600">Permanently delete your account and all data</p>
                        </div>
                        <button className="px-6 py-3 bg-red-500 border-4 border-black text-white font-bold hover:bg-red-600 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all">
                            DELETE ACCOUNT
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
