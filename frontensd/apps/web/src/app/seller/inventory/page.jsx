"use client";

import React, { useEffect, useState, useRef } from "react";
import useAuth from "@/utils/useAuth";
// FontAwesome icons loaded globally
import { formatCurrency } from "@/utils/format";
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
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async () => {
        // Backend API call to create product
        try {
            const res = await fetch("http://localhost:5000/api/products", { // Use /api/products for creation
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    countInStock: parseInt(formData.stock), // Map stock to countInStock
                    image: formData.image_url // Map image_url to image
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
            // Backend API call to update product
            const res = await fetch(`http://localhost:5000/api/products/${editingProduct.id}`, { // Use id
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    countInStock: parseInt(formData.stock),
                    image: formData.image_url
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
            stock: product.count_in_stock?.toString() || "0", // Map count_in_stock to stock
            description: product.description || "",
            image_url: product.image || "", // Map image to image_url
        });
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
            const res = await fetch("http://localhost:5000/api/products/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(parsedData)
            });

            const data = await res.json();

            if (res.ok) {
                // alert(`Successfully uploaded ${data.length} products!`); // Optional success message
                setIsUploadModalOpen(false);
                setCsvFile(null);
                setParsedData([]);
                fetchInventory(); // Refresh list
            } else {
                setUploadError(data.message || "Upload failed");
            }
        } catch (error) {
            setUploadError("Network error during upload");
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

    const ProductForm = ({ onSubmit, label }) => (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
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
                    <Input
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        placeholder="Enter category"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subcategory">Subcategory</Label>
                    <Input
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleInputChange}
                        placeholder="Enter subcategory"
                    />
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
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                />
            </div>
            <Button onClick={onSubmit} className="w-full">
                {label}
            </Button>
        </div>
    );

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
