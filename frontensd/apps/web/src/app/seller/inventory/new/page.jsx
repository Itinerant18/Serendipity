"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { ArrowLeft, Save } from "lucide-react";

export default function AddProductPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        price: "",
        image: "",
        brand: "",
        category: "",
        countInStock: "",
        description: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // First create the product (or use a route that accepts details directly)
            // Existing route POST /api/products creates a sample product then we must edit it, or we need to update the route to accept body.
            // Let's check logic: backend productRoutes.js POST / currently ignores body and creates sample.
            // Wait! I need to fix POST / logic to accept body if provided, OR stick to "Create then Update" pattern.
            // "Create then Update" is safer refactor.

            // 1. Create Placeholder
            const createRes = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!createRes.ok) throw new Error("Failed to create product placeholder");
            const product = await createRes.json();

            // 2. Update with Form Data
            const updateRes = await fetch(`http://localhost:5000/api/products/${product._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (!updateRes.ok) throw new Error("Failed to save product details");

            navigate("/seller/inventory");
        } catch (error) {
            console.error(error);
            alert("Error saving product: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4 text-gray-500 hover:text-gray-900">
                <button onClick={() => navigate("/seller/inventory")} className="flex items-center">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back to Inventory
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <h1 className="text-2xl font-bold font-playfair mb-6 text-[#232f3e]">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Product Name</label>
                        <input type="text" name="name" required value={form.name} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                            <input type="number" name="price" required min="0" step="0.01" value={form.price} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Stock Count</label>
                            <input type="number" name="countInStock" required min="0" value={form.countInStock} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Brand</label>
                            <input type="text" name="brand" required value={form.brand} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <input type="text" name="category" required value={form.category} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Image URL</label>
                        <input type="text" name="image" required value={form.image} onChange={handleChange}
                            placeholder="https://example.com/image.jpg"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows={4} required value={form.description} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-[#febd69] hover:bg-[#d97534] hover:text-white transition-colors"
                        >
                            {loading ? "Saving..." : "Save Product"}
                            {!loading && <Save className="ml-2 w-5 h-5" />}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
