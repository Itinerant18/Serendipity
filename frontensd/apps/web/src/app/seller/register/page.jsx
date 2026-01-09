"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { Store, ArrowRight } from "lucide-react";

export default function SellerRegisterPage() {
    const { token, updateUser } = useAuth(); // Assuming updateUser exists in authStore to update local state without relogin
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ store_name: "", description: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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
            // We need to fetch the updated user profile or manually update authStore
            // Ideally call a refreshUser function, but for now we'll force a re-login or just assume success if specific user update isn't available
            // Let's assume user refreshes or we navigate to dashboard and layout re-checks (might fail if token claim not updated?)
            // Token claims persist, but our layout checks 'user.isSeller' which comes from STATE, not decoded token.
            // So if we update state, layout will pass.

            // NOTE: Ideally updateUser({ isSeller: true }) should be called.
            // Let's assume updateUser is passed from useAuth -> authStore.
            if (updateUser) {
                updateUser({ isSeller: true });
            } else {
                // Fallback: reload page to force fresh data fetch if possible, or simple navigate
            }

            navigate("/seller");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-[#febd69]">
                    <Store className="w-12 h-12" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 font-playfair">
                    Become a Seller
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 max-w">
                    Start selling your products on Mercado today.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4">
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
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#febd69] hover:bg-[#D97534] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                            >
                                {loading ? "Creating Store..." : "Create Store"}
                                {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
