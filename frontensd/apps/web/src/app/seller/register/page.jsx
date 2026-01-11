"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { Store, ArrowRight, AlertCircle } from "lucide-react";

export default function SellerRegisterPage() {
    const { token, user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ store_name: "", description: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!token || !user) {
            navigate("/account/signin?redirect=/seller/register");
        }
    }, [token, user, navigate]);

    // Redirect if already a seller
    useEffect(() => {
        if (user && user.isSeller) {
            navigate("/seller");
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("http://localhost:5000/api/seller/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Update local user state
            if (updateUser) {
                updateUser({ isSeller: true, sellerProfileId: data.seller.id });
            }

            // Reload to update state completely
            window.location.href = "/seller";
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <link
                href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap"
                rel="stylesheet"
            />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-[#febd69]">
                    <Store className="w-12 h-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Become a Seller
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 max-w">
                    Start selling your products on Serendipity today.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}

                        <div>
                            <label htmlFor="store_name" className="block text-sm font-medium text-gray-700">
                                Store Name
                            </label>
                            <div className="mt-1">
                                <input
                                    id="store_name"
                                    name="store_name"
                                    type="text"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={formData.store_name}
                                    onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <div className="mt-1">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#febd69] hover:bg-[#D97534] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
                            >
                                {loading ? "Creating Store..." : "Create Store"}
                                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-500">
                        <p>
                            Don't have an account?{" "}
                            <a href="/seller/signup" className="text-[#D97534] hover:text-[#C86429] font-semibold">
                                Create new seller account
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
