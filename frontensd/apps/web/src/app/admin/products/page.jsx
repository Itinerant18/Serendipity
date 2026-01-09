"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import useAuth from "@/utils/useAuth";

export default function ProductList() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            fetchProducts();
        } else {
            // Optional: Handle redirection or waiting state
        }
    }, [token]);

    const fetchProducts = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/products");
            const data = await response.json();
            if (response.ok) {
                setProducts(data);
            } else {
                throw new Error(data.message || "Failed to fetch products");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const deleteHandler = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    fetchProducts(); // Refresh list
                } else {
                    const data = await response.json();
                    alert(data.message);
                }
            } catch (err) {
                alert(err.message);
            }
        }
    };

    const createHandler = async () => {
        // Create sample product
        try {
            const response = await fetch(`http://localhost:5000/api/products`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({})
            });
            const data = await response.json();
            if (response.ok) {
                navigate(`/admin/products/${data._id}/edit`);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <a
                            href="/admin"
                            className="mr-4 p-2 rounded-full hover:bg-orange-100 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6 text-[#8B4513]" />
                        </a>
                        <h1 className="font-playfair font-bold text-3xl text-[#8B4513]">
                            Products
                        </h1>
                    </div>
                    <button
                        onClick={createHandler}
                        className="flex items-center px-4 py-2 bg-[#D97534] hover:bg-[#C86429] text-white rounded-lg font-inter font-medium transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create Product
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97534]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-[#FFF8F0]">
                                    <tr>
                                        <th className="p-4 font-inter text-sm font-bold text-[#8B4513] tracking-wider">ID</th>
                                        <th className="p-4 font-inter text-sm font-bold text-[#8B4513] tracking-wider">NAME</th>
                                        <th className="p-4 font-inter text-sm font-bold text-[#8B4513] tracking-wider">PRICE</th>
                                        <th className="p-4 font-inter text-sm font-bold text-[#8B4513] tracking-wider">CATEGORY</th>
                                        <th className="p-4 font-inter text-sm font-bold text-[#8B4513] tracking-wider">BRAND</th>
                                        <th className="p-4 font-inter text-sm font-bold text-[#8B4513] text-right tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {products.map((product) => (
                                        <tr key={product._id} className="hover:bg-orange-50/50 transition-colors">
                                            <td className="p-4 font-mono text-xs text-gray-400">{product._id.substring(0, 8)}...</td>
                                            <td className="p-4 font-inter text-sm font-medium text-gray-800">{product.name}</td>
                                            <td className="p-4 font-inter text-sm font-semibold text-[#D97534]">${product.price}</td>
                                            <td className="p-4 font-inter text-sm text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded-md text-xs">{product.category}</span>
                                            </td>
                                            <td className="p-4 font-inter text-sm text-gray-600">{product.brand}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end space-x-2">
                                                    <a
                                                        href={`/admin/products/${product._id}/edit`}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </a>
                                                    <button
                                                        onClick={() => deleteHandler(product._id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
