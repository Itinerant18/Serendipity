"use client";

import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
// FontAwesome icons loaded globally
import { MAIN_CATEGORIES, getSubcategories } from "@/utils/categories";

export default function AddProductPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [uploadingVideo, setUploadingVideo] = useState(false);

    // Uploaded files state
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedVideo, setUploadedVideo] = useState(null);

    // Drag states
    const [dragActiveImage, setDragActiveImage] = useState(false);
    const [dragActiveVideo, setDragActiveVideo] = useState(false);

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [form, setForm] = useState({
        name: "",
        price: "",
        brand: "",
        category: "",
        subcategory: "",
        countInStock: "",
        description: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => {
            const newForm = { ...prev, [name]: value };
            // Reset subcategory if category changes
            if (name === "category") {
                newForm.subcategory = "";
            }
            return newForm;
        });
    };

    // Image upload handler
    const handleImageUpload = useCallback(async (files) => {
        if (!files || files.length === 0) return;

        // Check limit (max 5 images)
        const remainingSlots = 5 - uploadedImages.length;
        if (remainingSlots <= 0) {
            alert("Maximum 5 images allowed");
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        setUploadingImages(true);

        try {
            const formData = new FormData();
            filesToUpload.forEach(file => formData.append('files', file));

            const res = await fetch('http://localhost:5000/api/upload/product-images', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (data.files && data.files.length > 0) {
                setUploadedImages(prev => [...prev, ...data.files]);
            }

            if (data.errors && data.errors.length > 0) {
                alert(`Some files failed: ${data.errors.map(e => e.error).join(', ')}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload images');
        } finally {
            setUploadingImages(false);
        }
    }, [token, uploadedImages.length]);

    // Video upload handler
    const handleVideoUpload = useCallback(async (file) => {
        if (!file) return;

        // Check if already has video
        if (uploadedVideo) {
            alert("Only one video allowed. Remove the existing one first.");
            return;
        }

        setUploadingVideo(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('http://localhost:5000/api/upload/product-media', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                setUploadedVideo(data);
            } else {
                alert(data.message || 'Failed to upload video');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload video');
        } finally {
            setUploadingVideo(false);
        }
    }, [token, uploadedVideo]);

    // Remove image
    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
    };

    // Remove video
    const removeVideo = () => {
        setUploadedVideo(null);
    };

    // Drag handlers for images
    const handleDragImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActiveImage(true);
        } else if (e.type === "dragleave") {
            setDragActiveImage(false);
        }
    };

    const handleDropImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActiveImage(false);

        const files = e.dataTransfer.files;
        const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
        if (imageFiles.length > 0) {
            handleImageUpload(imageFiles);
        }
    };

    // Drag handlers for video
    const handleDragVideo = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActiveVideo(true);
        } else if (e.type === "dragleave") {
            setDragActiveVideo(false);
        }
    };

    const handleDropVideo = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActiveVideo(false);

        const files = e.dataTransfer.files;
        const videoFile = Array.from(files).find(f => f.type.startsWith('video/'));
        if (videoFile) {
            handleVideoUpload(videoFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (uploadedImages.length === 0) {
            alert("Please upload at least one product image");
            return;
        }

        if (!form.category || !form.subcategory) {
            alert("Please select both category and subcategory");
            setLoading(false);
            return;
        }

        setLoading(true);

        try {
            // Create product with all data
            const createRes = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!createRes.ok) throw new Error("Failed to create product");
            const product = await createRes.json();

            // Update with form data and uploaded media URLs
            const updateRes = await fetch(`http://localhost:5000/api/products/${product._id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    image: uploadedImages[0]?.url || '', // Primary image
                    // Additional images could be stored in a separate field if needed
                    video_url: uploadedVideo?.url || null
                })
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

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 text-gray-500 hover:text-gray-900">
                <button onClick={() => navigate("/seller/inventory")} className="flex items-center">
                    <i className="fa-solid fa-arrow-left w-5 h-5 mr-1 flex items-center justify-center"></i> Back to Inventory
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <h1 className="text-2xl font-bold font-playfair mb-6 text-[#232f3e]">Add New Product</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
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
                            <select
                                name="category"
                                required
                                value={form.category}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="">Select Category</option>
                                {MAIN_CATEGORIES.map(cat => (
                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                            <select
                                name="subcategory"
                                required
                                value={form.subcategory}
                                onChange={handleChange}
                                disabled={!form.category}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100"
                            >
                                <option value="">Select Subcategory</option>
                                {getSubcategories(form.category).map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                        <div className="opacity-0 pointer-events-none">
                            {/* Spacer */}
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="flex items-center gap-2">
                                <i className="fa-solid fa-image text-gray-500"></i>
                                Product Images <span className="text-red-500">*</span>
                                <span className="text-gray-400 font-normal">(up to 5, max 10MB each)</span>
                            </span>
                        </label>

                        {/* Upload Zone */}
                        <div
                            onDragEnter={handleDragImage}
                            onDragLeave={handleDragImage}
                            onDragOver={handleDragImage}
                            onDrop={handleDropImage}
                            onClick={() => imageInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActiveImage
                                ? 'border-orange-500 bg-orange-50'
                                : 'border-gray-300 hover:border-gray-400'
                                } ${uploadedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleImageUpload(e.target.files)}
                                disabled={uploadedImages.length >= 5}
                            />

                            {uploadingImages ? (
                                <div className="flex flex-col items-center">
                                    <i className="fa-solid fa-spinner fa-spin text-3xl text-orange-500"></i>
                                    <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                                </div>
                            ) : (
                                <>
                                    <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-400 mx-auto"></i>
                                    <p className="mt-2 text-sm text-gray-600">
                                        Drag & drop images here, or <span className="text-orange-600 font-medium">browse</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, WebP up to 10MB</p>
                                </>
                            )}
                        </div>

                        {/* Uploaded Images Preview */}
                        {uploadedImages.length > 0 && (
                            <div className="mt-4 grid grid-cols-5 gap-3">
                                {uploadedImages.map((img, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={img.url}
                                                alt={`Product ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {index === 0 && (
                                            <span className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded">
                                                Main
                                            </span>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center"
                                        >
                                            <i className="fa-solid fa-xmark text-xs"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Video Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="flex items-center gap-2">
                                <i className="fa-solid fa-video text-gray-500"></i>
                                Product Video
                                <span className="text-gray-400 font-normal">(optional, max 100MB)</span>
                            </span>
                        </label>

                        {!uploadedVideo ? (
                            <div
                                onDragEnter={handleDragVideo}
                                onDragLeave={handleDragVideo}
                                onDragOver={handleDragVideo}
                                onDrop={handleDropVideo}
                                onClick={() => videoInputRef.current?.click()}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActiveVideo
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                            >
                                <input
                                    ref={videoInputRef}
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                                />

                                {uploadingVideo ? (
                                    <div className="flex flex-col items-center">
                                        <i className="fa-solid fa-spinner fa-spin text-3xl text-purple-500"></i>
                                        <p className="mt-2 text-sm text-gray-500">Uploading video...</p>
                                    </div>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-video text-3xl text-gray-400 mx-auto"></i>
                                        <p className="mt-2 text-sm text-gray-600">
                                            Drag & drop video here, or <span className="text-purple-600 font-medium">browse</span>
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">MP4, WebM, MOV up to 100MB</p>
                                    </>
                                )}
                            </div>
                        ) : (
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <i className="fa-solid fa-circle-check text-xl text-green-500"></i>
                                        <div>
                                            <p className="text-sm font-medium text-gray-700">Video uploaded</p>
                                            <p className="text-xs text-gray-500">{formatFileSize(uploadedVideo.size)}</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={removeVideo}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <i className="fa-solid fa-xmark text-xl"></i>
                                    </button>
                                </div>
                                <video
                                    src={uploadedVideo.url}
                                    controls
                                    className="mt-3 w-full max-h-48 rounded"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea name="description" rows={4} required value={form.description} onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => navigate("/seller/inventory")}
                            className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploadedImages.length === 0}
                            className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-[#febd69] hover:bg-[#d97534] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center">
                                    <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                                    Saving...
                                </div>
                            ) : (
                                <div className="flex items-center">
                                    Save Product
                                    <i className="fa-solid fa-floppy-disk ml-2"></i>
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
