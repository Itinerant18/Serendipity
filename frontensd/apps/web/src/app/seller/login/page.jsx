"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Store, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";
import useAuth from "@/utils/useAuth";

export default function SellerLoginPage() {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const { setUser, setToken, setIsAuthenticated } = useAuth();

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!email || !password) {
            setError("Please fill in all fields");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/seller-login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Login failed");
            }

            // Update auth state
            const userData = {
                id: data._id,
                name: data.name,
                email: data.email,
                mobile: data.mobile,
                isAdmin: data.isAdmin,
                isSeller: data.isSeller,
                sellerProfileId: data.sellerProfileId,
            };

            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", data.token);

            if (setUser) setUser(userData);
            if (setToken) setToken(data.token);
            if (setIsAuthenticated) setIsAuthenticated(true);

            navigate("/seller");
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Amazon+Ember:wght@300;400;500;700&display=swap"
                rel="stylesheet"
            />

            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-3">
                    <a href="/" className="inline-flex items-center gap-2 mb-3">
                        <Store className="w-8 h-8 text-[#FF9900]" />
                        <span className="font-bold text-2xl text-[#232F3E]">Serendipity Seller Central</span>
                    </a>
                </div>

                {/* Portal badge so users know this is the seller area */}
                <div className="mb-6 flex justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 font-inter">
                        <span className="text-sm">🏪</span>
                        Seller portal
                    </span>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-[#232F3E] mb-2">
                            Sign in to Seller Central
                        </h1>
                        <p className="text-gray-600 text-sm">
                            Access your seller dashboard and manage your business
                        </p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-4">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="your@email.com"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent transition-all"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent transition-all"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-red-800">{error}</p>
                                    {error.includes("not registered as a seller") && (
                                        <a
                                            href="/seller/signup"
                                            className="text-sm text-red-600 hover:text-red-800 underline mt-1 inline-block"
                                        >
                                            Register as a seller →
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF9900] hover:bg-[#FA8900] text-white font-bold py-3 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign in
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Forgot Password */}
                    <div className="mt-4 text-center">
                        <a
                            href="/account/forgot-password"
                            className="text-sm text-[#FF9900] hover:text-[#FA8900] hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>
                </div>

                {/* Seller Benefits */}
                <div className="mt-6 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-3 text-sm">Why sell on Serendipity?</h3>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Reach millions of customers worldwide</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Real-time order notifications</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                            <span>Powerful seller tools and analytics</span>
                        </div>
                        <div className="flex items-start gap-2 text-sm text-gray-600">
                            <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                            <span>Secure payments and fraud protection</span>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-gray-50 text-gray-500">New to selling?</span>
                    </div>
                </div>

                {/* Register Link */}
                <div className="text-center">
                    <a
                        href="/seller/signup"
                        className="inline-block w-full py-3 px-4 border-2 border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 transition-all"
                    >
                        Create your seller account
                    </a>
                </div>

                {/* Customer Link */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-400">Switch portal</p>
                    <p>
                        Shopping as a customer?{" "}
                        <a
                            href="/account/signin"
                            className="text-[#FF9900] hover:text-[#FA8900] font-semibold underline-offset-2 hover:underline"
                        >
                            Go to Customer Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
