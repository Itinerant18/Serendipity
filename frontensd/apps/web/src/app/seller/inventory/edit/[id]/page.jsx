"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { ArrowLeft, Save, Upload, X, Image, Video, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function EditProductPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
        countInStock: "",
        description: ""
    });

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) throw new Error("Failed to fetch product");

                const product = await res.json();

                setForm({
                    name: product.name || "",
                    price: product.price || "",
                    brand: product.brand || "",
                    category: product.category || "",
                    countInStock: product.countInStock || product.count_in_stock || "",
                    description: product.description || ""
                });

                // Handle initial images (if backend returns array of image objects or strings)
                // Assuming internal structure; adjusting based on typical patterns
                if (product.image) {
                    // If it's a single string, wrap in object. If it's array, map it.
                    // The View code showed product.image as string in One component.
                    // But AddProduct component treats uploadedImages as array of objects {url}.
                    setUploadedImages([{ url: product.image }]);
                }

                if (product.video_url) {
                    setUploadedVideo({ url: product.video_url, size: 0 }); // Size unknown
                }

            } catch (error) {
                console.error("Error fetching product:", error);
                alert("Failed to load product details");
                navigate("/seller/inventory");
            } finally {
                setLoading(false);
            }
        };

        if (token && id) {
            fetchProduct();
        }
    }, [token, id, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
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
            if (!confirm("Replace existing video?")) return;
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

        setSaving(true);

        try {
            // Update product with all data
            const updateRes = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...form,
                    image: uploadedImages[0]?.url || '', // Primary image
                    // Additional images logic would go here if supported by backend schema
                    video_url: uploadedVideo?.url || null
                })
            });

            if (!updateRes.ok) throw new Error("Failed to update product");

            navigate("/seller/inventory");
        } catch (error) {
            console.error(error);
            alert("Error updating product: " + error.message);
        } finally {
            setSaving(false);
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-[#febd69]" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4 text-gray-500 hover:text-gray-900">
                <button onClick={() => navigate("/seller/inventory")} className="flex items-center">
                    <ArrowLeft className="w-5 h-5 mr-1" /> Back to Inventory
                </button>
            </div>

            <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
                <h1 className="text-2xl font-bold font-playfair mb-6 text-[#232f3e]">Edit Product</h1>

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
                            <input type="text" name="category" required value={form.category} onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-orange-500 focus:border-orange-500" />
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <span className="flex items-center gap-2">
                                <Image className="w-4 h-4" />
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
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                                    <p className="mt-2 text-sm text-gray-500">Uploading...</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-8 h-8 mx-auto text-gray-400" />
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
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
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
                                <Video className="w-4 h-4" />
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
                                        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                                        <p className="mt-2 text-sm text-gray-500">Uploading video...</p>
                                    </div>
                                ) : (
                                    <>
                                        <Video className="w-8 h-8 mx-auto text-gray-400" />
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
                                        <CheckCircle className="w-5 h-5 text-green-500" />
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
                                        <X className="w-5 h-5" />
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
                            disabled={saving || uploadedImages.length === 0}
                            className="flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-black bg-[#febd69] hover:bg-[#d97534] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    Update Product
                                    <Save className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
