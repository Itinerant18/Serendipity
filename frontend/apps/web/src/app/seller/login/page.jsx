"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";

export default function SellerLoginPage() {
    const navigate = useNavigate();
    const { signInAsSeller, signInWithGoogle } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signInAsSeller({ email, password });
            if (result.success) {
                navigate("/seller");
            } else {
                setError(result.error || "Login failed");
            }
        } catch (err) {
            setError(err.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        const result = await signInWithGoogle('seller');
        if (!result.success) {
            setError(result.error || "Google login failed");
        }
    };

    return (
        <div className="min-h-screen bg-white border-8 border-black flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-3">
                        <div className="w-14 h-14 bg-orange-500 border-4 border-black flex items-center justify-center">
                            <i className="fa-solid fa-store text-3xl text-white"></i>
                        </div>
                        <span className="font-brutalist text-3xl text-black">SELLER CENTRAL</span>
                    </a>
                </div>

                <GlassCard className="p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-brutalist text-3xl text-black bg-black text-white px-6 py-2 inline-block">
                            SELLER LOGIN
                        </h1>
                        <p className="font-bold text-black mt-2">Sign in to manage your store</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="bg-red-500 text-white border-4 border-black p-4 font-bold flex items-center gap-2">
                                <i className="fa-solid fa-circle-exclamation text-xl"></i>
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="seller@example.com"
                                    className="w-full pl-10 pr-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                PASSWORD
                            </label>
                            <div className="relative">
                                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-200 transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-500 hover:bg-pink-500 text-white font-brutalist font-bold py-4 border-4 border-black shadow-[8px_8px_0_#000000] hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-all duration-100 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin text-xl"></i> SIGNING IN...
                                </>
                            ) : (
                                <>SIGN IN <i className="fa-solid fa-arrow-right text-xl"></i></>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-4 border-black"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-black font-bold border-2 border-black">OR</span>
                        </div>
                    </div>

                    {/* Google Login */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full flex items-center justify-center gap-3 py-3 border-4 border-black bg-white text-black font-bold hover:bg-blue-500 hover:text-white hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all duration-100"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Sign Up Link */}
                    <div className="mt-6 pt-6 border-t-4 border-black text-center">
                        <p className="font-bold text-black">
                            New seller?{" "}
                            <a href="/seller/signup" className="text-orange-500 hover:text-pink-500 underline">
                                CREATE ACCOUNT
                            </a>
                        </p>
                        <p className="font-bold text-black mt-2">
                            Want to shop instead?{" "}
                            <a href="/account/signin" className="text-orange-500 hover:text-pink-500 underline">
                                CUSTOMER LOGIN
                            </a>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
