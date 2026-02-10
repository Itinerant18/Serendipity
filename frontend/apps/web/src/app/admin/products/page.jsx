"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import { useNavigate } from "react-router";
import useAuth from "@/utils/useAuth";

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000';

export default function ProductList() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        if (token) {
            fetchProducts();
        }
    }, [token]);

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_URL}/api/products`);
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
                const response = await fetch(`${API_URL}/api/products/${id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    fetchProducts();
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
        try {
            const response = await fetch(`${API_URL}/api/products`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
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

    // Get unique categories
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

    // Filter products
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    // Stock status helper
    const getStockStatus = (stock) => {
        if (!stock || stock === 0) {
            return { label: "Out of Stock", bg: "bg-red-100", text: "text-red-700" };
        } else if (stock < 10) {
            return { label: "Low Stock", bg: "bg-yellow-100", text: "text-yellow-700" };
        }
        return { label: "In Stock", bg: "bg-green-100", text: "text-green-700" };
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center">
                        <a
                            href="/admin"
                            className="mr-4 p-2 rounded-full hover:bg-orange-100 transition-colors"
                        >
                            <i className="fa-solid fa-arrow-left text-xl text-[#8B4513]"></i>
                        </a>
                        <div>
                            <h1 className="font-playfair font-bold text-3xl text-[#8B4513]">
                                Products
                            </h1>
                            <p className="text-sm text-gray-500 font-inter">
                                {filteredProducts.length} of {products.length} products
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={createHandler}
                        className="flex items-center px-5 py-3 bg-[#D97534] hover:bg-[#C86429] text-white rounded-lg font-inter font-medium transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        <i className="fa-solid fa-plus mr-2"></i>
                        Create Product
                    </button>
                </div>

                {/* Search & Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <input
                                type="text"
                                placeholder="Search products by name or brand..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter text-sm transition-all"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <i className="fa-solid fa-filter absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter text-sm appearance-none bg-white min-w-[160px]"
                            >
                                <option value="all">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Products Table */}
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D97534]"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg font-inter">{error}</div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
                        <i className="fa-solid fa-box text-6xl text-gray-200 mx-auto mb-4"></i>
                        <p className="text-gray-500 font-inter text-lg">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-orange-100">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gradient-to-r from-[#FFF8F0] to-[#FAE5D3]">
                                    <tr>
                                        <th className="p-4 font-inter text-xs font-bold text-[#8B4513] uppercase tracking-wider">Product</th>
                                        <th className="p-4 font-inter text-xs font-bold text-[#8B4513] uppercase tracking-wider">Price</th>
                                        <th className="p-4 font-inter text-xs font-bold text-[#8B4513] uppercase tracking-wider">Stock</th>
                                        <th className="p-4 font-inter text-xs font-bold text-[#8B4513] uppercase tracking-wider">Category</th>
                                        <th className="p-4 font-inter text-xs font-bold text-[#8B4513] text-right uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredProducts.map((product) => {
                                        const stockStatus = getStockStatus(product.count_in_stock);
                                        return (
                                            <tr key={product._id} className="hover:bg-orange-50/50 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4">
                                                        {/* Product Image */}
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 ring-2 ring-transparent group-hover:ring-[#D97534]/30 transition-all">
                                                            {product.image ? (
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <i className="fa-solid fa-box"></i>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-inter text-sm font-medium text-gray-800 line-clamp-1">
                                                                {product.name}
                                                            </p>
                                                            <p className="font-inter text-xs text-gray-400">
                                                                {product.brand || "No brand"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-inter text-sm font-semibold text-[#D97534]">
                                                        ${product.price}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.text}`}>
                                                        {product.count_in_stock || 0} - {stockStatus.label}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                                                        {product.category || "Uncategorized"}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end space-x-2 opacity-70 group-hover:opacity-100 transition-opacity">
                                                        <a
                                                            href={`/admin/products/${product._id}/edit`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <i className="fa-solid fa-pen-to-square"></i>
                                                        </a>
                                                        <button
                                                            onClick={() => deleteHandler(product._id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <i className="fa-solid fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Placeholder */}
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                            <p className="text-sm text-gray-500 font-inter">
                                Showing {filteredProducts.length} products
                            </p>
                            <div className="flex gap-2">
                                <button className="px-3 py-1 rounded border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                                    Previous
                                </button>
                                <button className="px-3 py-1 rounded bg-[#D97534] text-white text-sm">
                                    1
                                </button>
                                <button className="px-3 py-1 rounded border border-gray-200 text-sm text-gray-400 cursor-not-allowed">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
