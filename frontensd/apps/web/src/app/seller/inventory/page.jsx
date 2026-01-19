"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import useAuth from "@/utils/useAuth";
// FontAwesome icons loaded globally
import { formatCurrency } from "@/utils/format";
import { getSubcategories as getSubcategoriesUtil, getAllCategories } from "@/utils/categories";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

export default function SellerInventoryPage() {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialog States
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Categories and subcategories from API
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [loadingSubcategories, setLoadingSubcategories] = useState(false);

    // Image upload states
    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [dragActiveImage, setDragActiveImage] = useState(false);
    const imageInputRef = useRef(null);
    const MAX_IMAGES = 7;

    // Form and Selection States
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        subcategory: "",
        brand: "",
        stock: "",
        description: "",
        image_url: "",
    });

    // CSV Upload State
    const [csvFile, setCsvFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const fileInputRef = useRef(null);

    // Fetch Inventory
    const fetchInventory = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/seller/products", {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Map backend data to frontend model if needed, but assuming direct mapping for now
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

    // Fetch categories from API on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            setLoadingCategories(true);
            try {
                const res = await fetch('http://localhost:5000/api/categories');
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
                    // Filter to ONLY show the 6 specified categories (remove any extras)
                    const allowedCategories = getAllCategories();
                    const filtered = data.categories.filter(cat => allowedCategories.includes(cat));
                    // Always ensure all 6 categories are present
                    const merged = [...new Set([...allowedCategories, ...filtered])]
                        .filter(cat => allowedCategories.includes(cat))
                        .sort();
                    setCategories(merged);
                } else {
                    // Fallback: Use categories utility
                    console.warn('No categories found in database, using fallback categories');
                    setCategories(getAllCategories());
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback: Use categories utility
                setCategories(getAllCategories());
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch subcategories when category changes
    useEffect(() => {
        const fetchSubcategories = async () => {
            if (!formData.category) {
                setSubcategories([]);
                return;
            }
            
            setLoadingSubcategories(true);
            try {
                const res = await fetch(`http://localhost:5000/api/categories/${encodeURIComponent(formData.category)}/subcategories`);
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                const data = await res.json();
                if (data.success && Array.isArray(data.subcategories) && data.subcategories.length > 0) {
                    // Merge API subcategories with our known list (ensures full list)
                    const fallbackSubcats = getSubcategoriesUtil(formData.category);
                    const merged = [...new Set([...fallbackSubcats, ...data.subcategories])].sort();
                    setSubcategories(merged);
                } else {
                    // Fallback to utility function
                    console.warn(`No subcategories found for category: ${formData.category}, using fallback`);
                    const fallbackSubcats = getSubcategoriesUtil(formData.category);
                    setSubcategories(fallbackSubcats);
                }
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                // Fallback to utility function
                const fallbackSubcats = getSubcategoriesUtil(formData.category);
                setSubcategories(fallbackSubcats);
            } finally {
                setLoadingSubcategories(false);
            }
        };
        fetchSubcategories();
    }, [formData.category]);

    // Form Handlers
    const resetForm = () => {
        setFormData({
            name: "",
            price: "",
            category: "",
            subcategory: "",
            brand: "",
            stock: "",
            description: "",
            image_url: "",
        });
        setUploadedImages([]);
    };

    // Image upload handler
    const handleImageUpload = async (files) => {
        if (!files || files.length === 0) return;

        const remainingSlots = MAX_IMAGES - uploadedImages.length;
        if (remainingSlots <= 0) {
            alert(`Maximum ${MAX_IMAGES} images allowed`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        
        // Validate file types and sizes
        const validFiles = [];
        filesToUpload.forEach(file => {
            if (!file.type.startsWith('image/')) {
                alert(`${file.name} is not an image`);
            } else if (file.size > 10 * 1024 * 1024) {
                alert(`${file.name} exceeds 10MB limit`);
            } else {
                validFiles.push(file);
            }
        });

        if (validFiles.length === 0) return;

        setUploadingImages(true);

        try {
            const formData = new FormData();
            validFiles.forEach(file => formData.append('files', file));

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
            alert('Failed to upload images. Please try again.');
        } finally {
            setUploadingImages(false);
            if (imageInputRef.current) {
                imageInputRef.current.value = '';
            }
        }
    };

    // Remove image
    const removeImage = (index) => {
        setUploadedImages(prev => prev.filter((_, i) => i !== index));
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

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            // Reset subcategory if category changes
            if (name === "category") {
                newData.subcategory = "";
            }
            return newData;
        });
    }, []);

    const handleAddProduct = async () => {
        // Backend API call to create product
        try {
            // Use uploaded images if available, otherwise fall back to image_url
            const images = uploadedImages.length > 0 
                ? uploadedImages.map(img => img.url)
                : formData.image_url ? [formData.image_url] : [];

            const res = await fetch("http://localhost:5000/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    countInStock: parseInt(formData.stock) || 0,
                    image: images[0] || formData.image_url || '',
                    images: images
                })
            });

            if (res.ok) {
                await fetchInventory(); // Refresh list
                setIsAddDialogOpen(false);
                resetForm();
            } else {
                const err = await res.json();
                alert(err.message || "Failed to add product");
            }
        } catch (error) {
            console.error("Add error", error);
            alert("Network error");
        }
    };

    const handleEditProduct = async () => {
        if (!editingProduct) return;

        try {
            // Use uploaded images if available, otherwise fall back to image_url
            const images = uploadedImages.length > 0 
                ? uploadedImages.map(img => img.url)
                : formData.image_url ? [formData.image_url] : [];

            // Backend API call to update product
            const res = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    countInStock: parseInt(formData.stock) || 0,
                    image: images[0] || formData.image_url || '',
                    images: images
                })
            });

            if (res.ok) {
                await fetchInventory(); // Refresh list
                setIsEditDialogOpen(false);
                setEditingProduct(null);
                resetForm();
            } else {
                const err = await res.json();
                alert(err.message || "Failed to update product");
            }

        } catch (error) {
            console.error("Update error", error);
            alert("Network error");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Delete error", error);
        }
    };

    const openEditDialog = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            category: product.category || "",
            subcategory: product.subcategory || "",
            brand: product.brand || "",
            stock: product.count_in_stock?.toString() || "0",
            description: product.description || "",
            image_url: product.image || "",
        });
        // Set uploaded images if product has images array
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            setUploadedImages(product.images.map(url => ({ url })));
        } else if (product.image) {
            setUploadedImages([{ url: product.image }]);
        } else {
            setUploadedImages([]);
        }
        setIsEditDialogOpen(true);
    };


    // CSV Handlers
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            setUploadError(null);
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.errors.length > 0) {
                        setUploadError(`Error parsing CSV: ${results.errors[0].message}`);
                    } else if (results.data.length === 0) {
                        setUploadError("CSV file is empty");
                    } else {
                        setParsedData(results.data);
                        setIsUploadModalOpen(true); // Open modal to show preview
                    }
                },
                error: (error) => {
                    setUploadError(`Error reading file: ${error.message}`);
                }
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleBulkUpload = async () => {
        if (!parsedData.length) return;
        setUploading(true);
        setUploadError(null);

        try {
            // Map CSV columns to backend expected format
            const mappedData = parsedData.map(row => ({
                name: row.name || row.Name || row.NAME || '',
                price: row.price || row.Price || row.PRICE || row.cost || row.Cost || 0,
                category: row.category || row.Category || row.CATEGORY || '',
                subcategory: row.subcategory || row.Subcategory || row.SUBCATEGORY || null,
                brand: row.brand || row.Brand || row.BRAND || 'Generic',
                stock: row.stock || row.Stock || row.STOCK || row.count_in_stock || row.countInStock || 0,
                description: row.description || row.Description || row.DESCRIPTION || '',
                image_url: row.image_url || row.imageUrl || row.image || row.Image || row.IMAGE || row['image url'] || ''
            }));

            // Validate required fields
            const invalidRows = mappedData.filter(p => !p.name || !p.category);
            if (invalidRows.length > 0) {
                setUploadError(`${invalidRows.length} rows missing required fields (name or category). Please check your CSV.`);
                return;
            }

            console.log('Uploading products:', mappedData);

            const res = await fetch("http://localhost:5000/api/products/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(mappedData)
            });

            const data = await res.json();

            if (res.ok) {
                const count = data.count || data.length || mappedData.length;
                alert(`Successfully uploaded ${count} products!`);
                setIsUploadModalOpen(false);
                setCsvFile(null);
                setParsedData([]);
                await fetchInventory(); // Refresh list
            } else {
                const errorMsg = data.message || data.error || "Upload failed";
                console.error('Upload error response:', data);
                setUploadError(errorMsg);
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(`Network error: ${error.message || 'Failed to upload products'}`);
        } finally {
            setUploading(false);
        }
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        setCsvFile(null);
        setParsedData([]);
        setUploadError(null);
    };


    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // ProductForm component - memoized to prevent re-renders that cause input focus loss
    const ProductForm = useMemo(() => {
        return ({ onSubmit, label }) => (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                        id="name"
                        name="name"
                        key="product-name-input"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter product name"
                        autoComplete="off"
                    />
                </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        disabled={loadingCategories}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">
                            {loadingCategories ? 'Loading categories...' : 'Select Category'}
                        </option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <select
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        disabled={!formData.category || loadingSubcategories}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <option value="">
                            {!formData.category 
                                ? 'Select category first' 
                                : loadingSubcategories 
                                    ? 'Loading subcategories...' 
                                    : subcategories.length === 0
                                        ? 'No subcategories available'
                                        : 'Select Subcategory'
                            }
                        </option>
                        {subcategories.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="Enter brand"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description"
                    rows={3}
                />
            </div>
            <div className="space-y-2">
                <Label>Product Images {uploadedImages.length > 0 && `(${uploadedImages.length}/${MAX_IMAGES})`}</Label>
                
                {uploadedImages.length < MAX_IMAGES && (
                    <div
                        onDragEnter={handleDragImage}
                        onDragLeave={handleDragImage}
                        onDragOver={handleDragImage}
                        onDrop={handleDropImage}
                        onClick={() => imageInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                            dragActiveImage
                                ? 'border-primary bg-primary/10'
                                : 'border-muted-foreground/25 hover:border-primary/50'
                        } ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files && e.target.files.length > 0) {
                                    handleImageUpload(e.target.files);
                                }
                            }}
                            disabled={uploadingImages || uploadedImages.length >= MAX_IMAGES}
                        />
                        {uploadingImages ? (
                            <div className="flex flex-col items-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                                <p className="text-sm text-muted-foreground">Uploading...</p>
                            </div>
                        ) : (
                            <>
                                <i className="fa-solid fa-cloud-arrow-up text-2xl text-muted-foreground mb-2"></i>
                                <p className="text-sm text-muted-foreground">
                                    <span className="text-primary font-medium">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB each (max {MAX_IMAGES})</p>
                            </>
                        )}
                    </div>
                )}

                {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-2">
                        {uploadedImages.map((img, index) => (
                            <div key={index} className="relative group">
                                <img
                                    src={img.url}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-md border border-border"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <i className="fa-solid fa-xmark text-xs"></i>
                                </button>
                                {index === 0 && (
                                    <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                        Main
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {uploadedImages.length === 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="image_url">Or enter Image URL</Label>
                        <Input
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                )}
            </div>
                <Button onClick={onSubmit} className="w-full">
                    {label}
                </Button>
            </div>
        );
    }, [formData, categories, subcategories, loadingCategories, loadingSubcategories, uploadedImages, uploadingImages, dragActiveImage, handleInputChange, handleDragImage, handleDropImage, handleImageUpload, removeImage, imageInputRef, MAX_IMAGES]);

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-background h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your product inventory
                    </p>
                </div>
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="gap-2"
                    >
                        <i className="fa-solid fa-upload text-base"></i>
                        Import CSV
                    </Button>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2" onClick={resetForm}>
                                <i className="fa-solid fa-plus text-base"></i>
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add New Product</DialogTitle>
                            </DialogHeader>
                            <ProductForm onSubmit={handleAddProduct} label="Add Product" />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="relative">
                <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-base text-muted-foreground"></i>
                <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-card flex-1 min-h-0 overflow-y-auto">
                <Table>
                    <TableHeader className="sticky top-0 bg-card z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Subcategory</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                                </TableCell>
                            </TableRow>
                        ) : filteredProducts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12">
                                    <div className="flex flex-col items-center space-y-2">
                                        <div className="text-4xl">📦</div>
                                        <div className="font-medium text-muted-foreground">
                                            No products found
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <img
                                            src={product.image || "https://via.placeholder.com/100"}
                                            alt={product.name}
                                            className="w-12 h-12 object-cover rounded-md"
                                            onError={(e) => {
                                                e.target.src = "https://via.placeholder.com/100";
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>{formatCurrency(product.price)}</TableCell>
                                    <TableCell>{product.category}</TableCell>
                                    <TableCell>{product.subcategory}</TableCell>
                                    <TableCell>{product.brand}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${product.count_in_stock > 100
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                : product.count_in_stock > 50
                                                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                                                }`}
                                        >
                                            {product.count_in_stock}
                                        </span>
                                    </TableCell>
                                    <TableCell className="max-w-[200px] truncate">
                                        {product.description}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => openEditDialog(product)}
                                                className="h-8 w-8 p-0"
                                            >
                                                <i className="fa-solid fa-pen-to-square text-base"></i>
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                            >
                                                <i className="fa-solid fa-trash-can text-base"></i>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Product</DialogTitle>
                    </DialogHeader>
                    <ProductForm onSubmit={handleEditProduct} label="Update Product" />
                </DialogContent>
            </Dialog>

            {/* CSV Upload Preview Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={(open) => !open && closeUploadModal()}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Import Products from CSV</DialogTitle>
                        <div className="text-sm text-muted-foreground mt-2 flex items-center gap-2 bg-blue-50 p-2 rounded text-blue-700">
                            <i className="fa-solid fa-circle-exclamation text-base"></i>
                            <span>Required columns: <code className="text-xs bg-blue-100 px-1 rounded">name, price, category, subcategory, brand, stock, description, image_url</code></span>
                        </div>
                    </DialogHeader>

                    {uploadError && (
                        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                            {uploadError}
                        </div>
                    )}

                    {!parsedData.length ? (
                        <div className="py-8 text-center text-muted-foreground">
                            Processing file...
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-sm">Preview ({parsedData.length} items)</span>
                                <Button variant="ghost" size="sm" onClick={closeUploadModal} className="text-destructive h-auto p-0 hover:bg-transparent hover:text-destructive">Clear</Button>
                            </div>
                            <div className="border rounded-md overflow-hidden max-h-[300px] overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            {Object.keys(parsedData[0] || {}).map(header => (
                                                <TableHead key={header} className="text-xs uppercase">{header}</TableHead>
                                            ))}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {parsedData.slice(0, 5).map((row, i) => (
                                            <TableRow key={i}>
                                                {Object.values(row).map((val, j) => (
                                                    <TableCell key={j} className="text-xs whitespace-nowrap max-w-[150px] truncate">{val}</TableCell>
                                                ))}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2 mt-4">
                        <Button variant="outline" onClick={closeUploadModal}>Cancel</Button>
                        <Button onClick={handleBulkUpload} disabled={uploading || !parsedData.length}>
                            {uploading ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span> Uploading...
                                </>
                            ) : (
                                "Upload Products"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
