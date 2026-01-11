"use client";

import React, { useEffect, useState } from "react";
import useAuth from "@/utils/useAuth";
import { Plus, Edit, Trash, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/utils/format";

export default function SellerInventoryPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchInventory = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/seller/products", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setProducts(data);
            }
        } catch (error) {
            console.error("Failed to fetch inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchInventory();
    }, [token]);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setProducts(products.filter(p => p._id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold font-playfair text-[#232f3e]">My Inventory</h1>
                <Link
                    to="/seller/inventory/new"
                    className="flex items-center px-4 py-2 bg-[#febd69] text-black font-medium rounded-md hover:bg-[#d97534] hover:text-white transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Product
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-md">
                        <input
                            type="text"
                            placeholder="Search your products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                        />
                        <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No products found. Start selling!</td></tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <img className="h-10 w-10 rounded object-cover" src={product.image} alt="" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">{product.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-inter">{formatCurrency(product.price)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.count_in_stock > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                                }`}>
                                                {product.count_in_stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button className="text-blue-600 hover:text-blue-900 border border-blue-200 p-1 rounded hover:bg-blue-50">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="text-red-600 hover:text-red-900 border border-red-200 p-1 rounded hover:bg-red-50"
                                            >
                                                <Trash className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
