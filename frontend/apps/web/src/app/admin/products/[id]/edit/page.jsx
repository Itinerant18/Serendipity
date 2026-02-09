"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import { useParams, useNavigate } from "react-router";
import useAuth from "@/utils/useAuth";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function ProductEdit() {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [name, setName] = useState("");
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState("");
    const [brand, setBrand] = useState("");
    const [category, setCategory] = useState("");
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (productId) {
            fetchProduct(productId);
        }
    }, [productId]);

    const fetchProduct = async (id) => {
        try {
            const response = await fetch(`${API_URL}/api/products/${id}`);
            const data = await response.json();
            if (response.ok) {
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.count_in_stock);
                setDescription(data.description);
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name,
                    price,
                    image,
                    brand,
                    category,
                    description,
                    countInStock,
                }),
            });

            if (response.ok) {
                navigate("/admin/products");
            } else {
                const data = await response.json();
                throw new Error(data.message);
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF8F0] p-8">
            <div className="max-w-3xl mx-auto">
                <a
                    href="/admin/products"
                    className="inline-flex items-center text-[#8B4513] hover:underline mb-6"
                >
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Products
                </a>

                <h1 className="font-playfair font-bold text-3xl text-[#8B4513] mb-8">
                    Edit Product
                </h1>

                {loading ? (
                    <div>Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : (
                    <div className="bg-white rounded-xl shadow-md p-6 sm:p-10">
                        <form onSubmit={submitHandler} className="space-y-6">
                            <div>
                                <label className="block font-inter font-medium text-gray-700 mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-inter font-medium text-gray-700 mb-2">Price</label>
                                    <input
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block font-inter font-medium text-gray-700 mb-2">Count In Stock</label>
                                    <input
                                        type="number"
                                        value={countInStock}
                                        onChange={(e) => setCountInStock(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-inter font-medium text-gray-700 mb-2">Image URL</label>
                                <input
                                    type="text"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-inter font-medium text-gray-700 mb-2">Brand</label>
                                <input
                                    type="text"
                                    value={brand}
                                    onChange={(e) => setBrand(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-inter font-medium text-gray-700 mb-2">Category</label>
                                <input
                                    type="text"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block font-inter font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97534] focus:border-transparent outline-none"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-bold py-3 rounded-lg transition-colors flex items-center justify-center"
                            >
                                <i className="fa-solid fa-floppy-disk mr-2"></i>
                                Update Product
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
