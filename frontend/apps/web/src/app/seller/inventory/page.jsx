"use client";

import React, { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Search,
    Plus,
    Upload,
    HelpCircle,
    Edit2,
    Trash2,
    Download,
    Package,
    AlertCircle,
    Loader2,
    X
} from "lucide-react";
import useAuth from "@/utils/useAuth";
import { formatCurrency } from "@/utils/format";
import { useNavigate } from "react-router-dom";

export default function SellerInventoryPage() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
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

    const handleDeleteClick = (product) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;

        try {
            const res = await fetch(`http://localhost:5000/api/products/${productToDelete.id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setProducts(products.filter(p => p.id !== productToDelete.id));
                setIsDeleteDialogOpen(false);
                setProductToDelete(null);
            } else {
                alert("Failed to delete product");
            }
        } catch (error) {
            console.error("Delete error", error);
            alert("Network error during deletion");
        }
    };

    const downloadSampleCSV = () => {
        const headers = ["name", "price", "category", "subcategory", "brand", "stock", "description", "image_url", "images"];
        const row1 = ["Sample Product", "99.99", "Electronics", "Headphones", "BrandX", "50", "Great sound", "https://via.placeholder.com/150", "https://img1.jpg,https://img2.jpg"];
        const row2 = ["Another Product", "49.50", "Clothing", "T-Shirts", "BrandY", "100", "Cotton t-shirt", "https://via.placeholder.com/150", ""];

        const csvContent = [
            headers.join(","),
            row1.join(","),
            row2.join(",")
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "sample_product_upload.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                        setIsUploadModalOpen(true);
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
            const mappedData = parsedData.map((row) => {
                // Handle multiple images: supports 'images' column (comma separated) or image1, image2, etc.
                let images = [];

                // Method 1: 'images' column with comma/pipe separation
                if (row.images || row.Images || row.IMAGES) {
                    const rawStr = row.images || row.Images || row.IMAGES;
                    images = rawStr.split(/[|,]/).map((s) => s.trim()).filter(Boolean);
                }

                // Method 2: 'image_url' or 'image' column
                const mainImage = row.image_url || row.imageUrl || row.image || row.Image || row.IMAGE || row['image url'];
                if (mainImage && !images.includes(mainImage)) {
                    images.unshift(mainImage);
                }

                // Method 3: image1, image2, etc.
                Object.keys(row).forEach(key => {
                    if (key.match(/^image\d+$/i)) {
                        const val = row[key];
                        if (val && !images.includes(val)) {
                            images.push(val);
                        }
                    }
                });

                return {
                    name: row.name || row.Name || row.NAME || '',
                    price: row.price || row.Price || row.PRICE || row.cost || row.Cost || 0,
                    category: row.category || row.Category || row.CATEGORY || '',
                    subcategory: row.subcategory || row.Subcategory || row.SUBCATEGORY || null,
                    brand: row.brand || row.Brand || row.BRAND || 'Generic',
                    stock: row.stock || row.Stock || row.STOCK || row.count_in_stock || row.countInStock || 0,
                    description: row.description || row.Description || row.DESCRIPTION || '',
                    image_url: images[0] || '',
                    images: images
                };
            });

            // Validate required fields
            const invalidRows = mappedData.filter((p) => !p.name || !p.category);
            if (invalidRows.length > 0) {
                setUploadError(`${invalidRows.length} rows missing required fields (name or category). Please check your CSV.`);
                setUploading(false);
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
                await fetchInventory();
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

    const getStockBadgeVariant = (stock) => {
        if (stock > 100) return "default";
        if (stock > 50) return "secondary";
        return "destructive";
    };

    const getStatusBadgeVariant = (status) => {
        if (status === 'active') return "default";
        if (status === 'draft') return "secondary";
        return "outline";
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6 bg-background">
            <Card className="border-none shadow-lg">
                <CardHeader className="space-y-1 pb-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-3xl font-bold flex items-center gap-2">
                                <Package className="h-8 w-8 text-primary" />
                                Inventory Management
                            </CardTitle>
                            <CardDescription className="text-base">
                                Manage your product inventory and track stock levels
                            </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsGuideOpen(true)}
                                className="gap-2"
                            >
                                <HelpCircle className="h-4 w-4" />
                                CSV Guide
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                className="gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Import CSV
                            </Button>
                            <Button size="sm" className="gap-2" onClick={() => navigate('/seller/inventory/new')}>
                                <Plus className="h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>

                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="grid w-full max-w-md grid-cols-3">
                            <TabsTrigger value="all">All Products</TabsTrigger>
                            <TabsTrigger value="active">Active</TabsTrigger>
                            <TabsTrigger value="draft">Draft</TabsTrigger>
                        </TabsList>
                        <TabsContent value="all" className="mt-6">
                            <div className="border rounded-lg bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[80px]">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Brand</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {loading ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12">
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredProducts.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="text-center py-12">
                                                    <div className="flex flex-col items-center space-y-3">
                                                        <Package className="h-12 w-12 text-muted-foreground/50" />
                                                        <div className="font-medium text-muted-foreground">
                                                            No products found
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            Try adjusting your search or add new products
                                                        </p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <TableRow key={product.id} className="group">
                                                    <TableCell>
                                                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                            <img
                                                                src={product.image || "https://via.placeholder.com/100"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = "https://via.placeholder.com/100";
                                                                }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="font-medium">{product.name}</div>
                                                            {product.description && (
                                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                                    {product.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm font-mono">
                                                        {product.sku || '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusBadgeVariant(product.status)}>
                                                            {product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'Active'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="font-semibold">
                                                        {formatCurrency(product.price)}
                                                    </TableCell>
                                                    <TableCell>{product.category}</TableCell>
                                                    <TableCell>{product.brand}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStockBadgeVariant(product.count_in_stock)}>
                                                            {product.count_in_stock}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                                onClick={() => navigate(`/seller/inventory/edit/${product.id}`)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => handleDeleteClick(product)}
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                        <TabsContent value="active" className="mt-6">
                            <div className="border rounded-lg bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[80px]">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.filter(p => p.status === 'active' || !p.status).length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    No active products
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.filter(p => p.status === 'active' || !p.status).map((product) => (
                                                <TableRow key={product.id} className="group">
                                                    <TableCell>
                                                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                            <img
                                                                src={product.image || "https://via.placeholder.com/100"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm font-mono">{product.sku || '-'}</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStockBadgeVariant(product.count_in_stock)}>{product.count_in_stock}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/seller/inventory/edit/${product.id}`)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                        <TabsContent value="draft" className="mt-6">
                            <div className="border rounded-lg bg-card overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/50">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-[80px]">Image</TableHead>
                                            <TableHead>Product</TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Stock</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredProducts.filter(p => p.status === 'draft').length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                                                    No draft products
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredProducts.filter(p => p.status === 'draft').map((product) => (
                                                <TableRow key={product.id} className="group">
                                                    <TableCell>
                                                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                                                            <img
                                                                src={product.image || "https://via.placeholder.com/100"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = "https://via.placeholder.com/100"; }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm font-mono">{product.sku || '-'}</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStockBadgeVariant(product.count_in_stock)}>{product.count_in_stock}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(`/seller/inventory/edit/${product.id}`)}>
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Upload Modal */}
            <Dialog open={isUploadModalOpen} onOpenChange={(open) => !open && closeUploadModal()}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Import Products from CSV
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col gap-4">
                        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Required columns:</strong>{" "}
                                <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                                    name, price, category, stock
                                </code>
                            </div>
                        </div>

                        {uploadError && (
                            <div className="flex items-start gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-destructive">{uploadError}</div>
                            </div>
                        )}

                        {parsedData.length > 0 && (
                            <div className="flex-1 overflow-hidden flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-sm">
                                        Preview ({parsedData.length} items)
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={closeUploadModal}
                                        className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Clear
                                    </Button>
                                </div>
                                <ScrollArea className="flex-1 border rounded-lg max-h-[300px]">
                                    <Table>
                                        <TableHeader className="bg-muted/50 sticky top-0">
                                            <TableRow>
                                                {Object.keys(parsedData[0] || {}).map(header => (
                                                    <TableHead key={header} className="text-xs uppercase font-semibold">
                                                        {header}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {parsedData.slice(0, 10).map((row, i) => (
                                                <TableRow key={i}>
                                                    {Object.values(row).map((val, j) => (
                                                        <TableCell key={j} className="text-xs max-w-[200px] truncate">
                                                            {val}
                                                        </TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeUploadModal}>
                            Cancel
                        </Button>
                        <Button onClick={handleBulkUpload} disabled={uploading || !parsedData.length}>
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Products
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CSV Guide Modal */}
            <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            CSV Format Guide
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4 max-h-[60vh]">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">
                                    Use this guide to format your CSV file correctly. The <strong>header row is required</strong>.
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadSampleCSV}
                                    className="w-full sm:w-auto gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Sample CSV
                                </Button>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Required Columns
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="w-[140px]">Column Header</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-sm">
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">name</TableCell>
                                                <TableCell>Product title</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">price</TableCell>
                                                <TableCell>Numeric value (e.g., 99.99)</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">category</TableCell>
                                                <TableCell>Main category (e.g., Electronics)</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">stock</TableCell>
                                                <TableCell>Quantity available (number)</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Optional Columns
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="w-[140px]">Column Header</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-sm">
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">subcategory</TableCell>
                                                <TableCell>Specific sub-category (e.g., Headphones)</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">brand</TableCell>
                                                <TableCell>Product brand (defaults to 'Generic')</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">description</TableCell>
                                                <TableCell>Detailed product description</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">image_url</TableCell>
                                                <TableCell>Main image URL</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">images</TableCell>
                                                <TableCell>Comma-separated list of additional image URLs</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div className="text-xs text-yellow-800 dark:text-yellow-200">
                                        <strong>Note:</strong> SKU is auto-generated by the system and does not need to be included.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>

                    <Separator />

                    <div className="flex justify-end">
                        <Button onClick={() => setIsGuideOpen(false)}>Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            Delete Product
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-muted-foreground">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold text-foreground">{productToDelete?.name}</span>?
                            This action cannot be undone.
                        </p>
                    </div>
                    <Separator />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
