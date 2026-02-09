"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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
    X,
    AlertTriangle,
    Minus,
    Check,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Filter
} from "lucide-react";
import useAuth from "@/utils/useAuth";
import { formatCurrency } from "@/utils/format";
import { useNavigate } from "react-router-dom";
import UploadProgress from "@/components/UploadProgress";
import { Checkbox } from "@/components/ui/checkbox";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    const [validatedData, setValidatedData] = useState([]);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadStep, setUploadStep] = useState('idle'); // 'idle' | 'validating' | 'preview' | 'uploading' | 'complete'
    const [uploadProgress, setUploadProgress] = useState({ total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, currentChunk: 0, totalChunks: 0, errors: [] });
    const fileInputRef = useRef(null);
    const CHUNK_SIZE = 50; // Products per chunk

    // Stock Management State
    const [editingStockId, setEditingStockId] = useState(null);
    const [editingStockValue, setEditingStockValue] = useState("");
    const [isStockModalOpen, setIsStockModalOpen] = useState(false);
    const [stockModalProduct, setStockModalProduct] = useState(null);
    const [stockAdjustment, setStockAdjustment] = useState(0);
    const [stockAdjustReason, setStockAdjustReason] = useState("");
    const [updatingStock, setUpdatingStock] = useState(false);

    // Low stock threshold
    const LOW_STOCK_THRESHOLD = 10;

    // Fetch Inventory
    const fetchInventory = async () => {
        try {
            const res = await fetch(`${API_URL}/api/seller/products`, {
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
            const res = await fetch(`${API_URL}/api/products/${productToDelete.id}`, {
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
        const row1 = ["Sample Product", "99.99", "Electronics", "Headphones", "BrandX", "50", "Great sound", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60", "https://img1.jpg,https://img2.jpg"];
        const row2 = ["Another Product", "49.50", "Clothing", "T-Shirts", "BrandY", "100", "Cotton t-shirt", "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60", ""];

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
            setUploadStep('validating');
            setValidatedData([]);
            setSelectedRows(new Set());

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    if (results.errors.length > 0) {
                        setUploadError(`Error parsing CSV: ${results.errors[0].message}`);
                        setUploadStep('idle');
                    } else if (results.data.length === 0) {
                        setUploadError("CSV file is empty");
                        setUploadStep('idle');
                    } else {
                        setParsedData(results.data);
                        await validateCSVData(results.data);
                        setIsUploadModalOpen(true);
                    }
                },
                error: (error) => {
                    setUploadError(`Error reading file: ${error.message}`);
                    setUploadStep('idle');
                }
            });
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    // Validate CSV data and check for duplicates
    const validateCSVData = async (data) => {
        const validated = [];
        const names = [];

        data.forEach((row, index) => {
            const name = row.name || row.Name || row.NAME || '';
            const price = parseFloat(row.price || row.Price || row.PRICE || row.cost || row.Cost || 0);
            const category = row.category || row.Category || row.CATEGORY || '';
            const stock = parseInt(row.stock || row.Stock || row.STOCK || row.count_in_stock || row.countInStock || 0);

            let status = 'valid';
            let message = '';

            if (!name.trim()) {
                status = 'error';
                message = 'Missing product name';
            } else if (!category.trim()) {
                status = 'error';
                message = 'Missing category';
            } else if (isNaN(price) || price < 0) {
                status = 'error';
                message = 'Invalid price';
            } else if (isNaN(stock) || stock < 0) {
                status = 'error';
                message = 'Invalid stock';
            }

            if (status === 'valid' && names.includes(name.toLowerCase().trim())) {
                status = 'warning';
                message = 'Duplicate in CSV';
            }

            if (name.trim()) names.push(name.toLowerCase().trim());

            let images = [];
            if (row.images || row.Images || row.IMAGES) {
                images = (row.images || row.Images || row.IMAGES).split(/[|,]/).map(s => s.trim()).filter(Boolean);
            }
            const mainImage = row.image_url || row.imageUrl || row.image || row.Image || row.IMAGE;
            if (mainImage && !images.includes(mainImage)) images.unshift(mainImage);

            validated.push({
                name: name.trim(),
                price,
                category: category.trim(),
                subcategory: row.subcategory || row.Subcategory || null,
                brand: row.brand || row.Brand || 'Generic',
                stock,
                description: row.description || row.Description || '',
                image_url: images[0] || '',
                images,
                _rowIndex: index,
                _validation: { status, message }
            });
        });

        // Check database duplicates
        const validNames = validated.filter(v => v._validation.status === 'valid').map(v => v.name);
        if (validNames.length > 0) {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/check-duplicates`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ names: validNames })
                });
                if (res.ok) {
                    const { duplicates } = await res.json();
                    const dupSet = new Set(duplicates.map(d => d.toLowerCase()));
                    validated.forEach(v => {
                        if (v._validation.status === 'valid' && dupSet.has(v.name.toLowerCase())) {
                            v._validation.status = 'warning';
                            v._validation.message = 'Already exists (skip)';
                        }
                    });
                }
            } catch (err) { console.warn('Duplicate check failed:', err); }
        }

        setValidatedData(validated);
        setSelectedRows(new Set(validated.map((v, i) => v._validation.status === 'valid' ? i : null).filter(i => i !== null)));
        setUploadStep('preview');
    };

    // Chunked upload with progress
    const handleBulkUpload = async () => {
        const toUpload = validatedData.filter((_, i) => selectedRows.has(i));
        if (toUpload.length === 0) { setUploadError('No products selected'); return; }

        setUploading(true);
        setUploadStep('uploading');
        setUploadError(null);

        const products = toUpload.map(p => ({
            name: p.name, price: p.price, category: p.category, subcategory: p.subcategory,
            brand: p.brand, stock: p.stock, description: p.description, image_url: p.image_url, images: p.images
        }));

        const totalChunks = Math.ceil(products.length / CHUNK_SIZE);
        const skippedCount = validatedData.filter(v => v._validation.status === 'warning').length;
        setUploadProgress({ total: products.length, processed: 0, succeeded: 0, failed: 0, skipped: skippedCount, currentChunk: 0, totalChunks, errors: [] });

        let totalSucceeded = 0, totalFailed = 0;
        const allErrors = [];

        for (let i = 0; i < totalChunks; i++) {
            const chunk = products.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify(chunk)
                });
                const data = await res.json();
                if (res.ok) totalSucceeded += data.count || chunk.length;
                else { totalFailed += chunk.length; allErrors.push({ row: i * CHUNK_SIZE + 1, message: data.message || 'Failed' }); }
            } catch (err) { totalFailed += chunk.length; allErrors.push({ row: i * CHUNK_SIZE + 1, message: err.message }); }

            setUploadProgress(prev => ({ ...prev, processed: Math.min((i + 1) * CHUNK_SIZE, products.length), succeeded: totalSucceeded, failed: totalFailed, currentChunk: i + 1, errors: allErrors }));
            if (i < totalChunks - 1) await new Promise(r => setTimeout(r, 100));
        }

        setUploadStep('complete');
        setUploading(false);
        if (totalSucceeded > 0) await fetchInventory();
    };

    const closeUploadModal = () => {
        setIsUploadModalOpen(false);
        setCsvFile(null);
        setParsedData([]);
        setValidatedData([]);
        setSelectedRows(new Set());
        setUploadError(null);
        setUploadStep('idle');
        setUploadProgress({ total: 0, processed: 0, succeeded: 0, failed: 0, skipped: 0, currentChunk: 0, totalChunks: 0, errors: [] });
    };

    const validationStats = useMemo(() => {
        const valid = validatedData.filter(v => v._validation?.status === 'valid').length;
        const warning = validatedData.filter(v => v._validation?.status === 'warning').length;
        const error = validatedData.filter(v => v._validation?.status === 'error').length;
        return { valid, warning, error, total: validatedData.length };
    }, [validatedData]);

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

    // Get low stock products
    const lowStockProducts = products.filter(
        p => (p.count_in_stock || p.countInStock || 0) <= LOW_STOCK_THRESHOLD
    );

    // Inline stock update
    const handleInlineStockEdit = (product) => {
        setEditingStockId(product.id);
        setEditingStockValue(String(product.count_in_stock || product.countInStock || 0));
    };

    const handleInlineStockSave = async (productId) => {
        const newStock = parseInt(editingStockValue, 10);
        if (isNaN(newStock) || newStock < 0) {
            alert("Please enter a valid stock number");
            return;
        }

        setUpdatingStock(true);
        try {
            const res = await fetch(`${API_URL}/api/products/${productId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ countInStock: newStock })
            });

            if (res.ok) {
                setProducts(products.map(p =>
                    p.id === productId
                        ? { ...p, count_in_stock: newStock, countInStock: newStock }
                        : p
                ));
                setEditingStockId(null);
            } else {
                const data = await res.json();
                alert(data.message || "Failed to update stock");
            }
        } catch (error) {
            console.error("Stock update error:", error);
            alert("Network error updating stock");
        } finally {
            setUpdatingStock(false);
        }
    };

    const handleInlineStockCancel = () => {
        setEditingStockId(null);
        setEditingStockValue("");
    };

    // Stock Adjust Modal
    const openStockModal = (product) => {
        setStockModalProduct(product);
        setStockAdjustment(0);
        setStockAdjustReason("");
        setIsStockModalOpen(true);
    };

    const handleStockAdjust = async () => {
        if (!stockModalProduct) return;

        const currentStock = stockModalProduct.count_in_stock || stockModalProduct.countInStock || 0;
        const newStock = Math.max(0, currentStock + stockAdjustment);

        setUpdatingStock(true);
        try {
            const res = await fetch(`${API_URL}/api/products/${stockModalProduct.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    countInStock: newStock,
                    // Could log reason in future
                })
            });

            if (res.ok) {
                setProducts(products.map(p =>
                    p.id === stockModalProduct.id
                        ? { ...p, count_in_stock: newStock, countInStock: newStock }
                        : p
                ));
                setIsStockModalOpen(false);
                setStockModalProduct(null);
            } else {
                const data = await res.json();
                alert(data.message || "Failed to adjust stock");
            }
        } catch (error) {
            console.error("Stock adjust error:", error);
            alert("Network error adjusting stock");
        } finally {
            setUpdatingStock(false);
        }
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

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                    <div className="mx-6 mb-4 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            <h3 className="font-semibold text-amber-800 dark:text-amber-400">
                                Low Stock Alert ({lowStockProducts.length} products)
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {lowStockProducts.slice(0, 5).map(product => (
                                <button
                                    key={product.id}
                                    onClick={() => openStockModal(product)}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 
                                               border border-amber-300 dark:border-amber-700 rounded-md text-sm 
                                               hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                                >
                                    <span className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[150px]">
                                        {product.name}
                                    </span>
                                    <Badge variant="destructive" className="text-xs">
                                        {product.count_in_stock || product.countInStock || 0} left
                                    </Badge>
                                </button>
                            ))}
                            {lowStockProducts.length > 5 && (
                                <span className="px-3 py-1.5 text-sm text-amber-700 dark:text-amber-400">
                                    +{lowStockProducts.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                                                                src={product.image || "/placeholder.jpg"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.target.src = "/placeholder.jpg";
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
                                                        {editingStockId === product.id ? (
                                                            <div className="flex items-center gap-1">
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    value={editingStockValue}
                                                                    onChange={(e) => setEditingStockValue(e.target.value)}
                                                                    className="w-20 h-8 text-sm"
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter') handleInlineStockSave(product.id);
                                                                        if (e.key === 'Escape') handleInlineStockCancel();
                                                                    }}
                                                                    autoFocus
                                                                />
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={() => handleInlineStockSave(product.id)}
                                                                    disabled={updatingStock}
                                                                >
                                                                    {updatingStock ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Check className="h-4 w-4 text-green-600" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-7 w-7"
                                                                    onClick={handleInlineStockCancel}
                                                                >
                                                                    <X className="h-4 w-4 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Badge
                                                                    variant={getStockBadgeVariant(product.count_in_stock || product.countInStock || 0)}
                                                                    className="cursor-pointer hover:opacity-80"
                                                                    onClick={() => handleInlineStockEdit(product)}
                                                                >
                                                                    {product.count_in_stock || product.countInStock || 0}
                                                                </Badge>
                                                                <Button
                                                                    size="icon"
                                                                    variant="ghost"
                                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    onClick={() => openStockModal(product)}
                                                                    title="Adjust stock"
                                                                >
                                                                    <RefreshCw className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        )}
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
                                                                src={product.image || "/placeholder.jpg"}
                                                                alt={product.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-medium">{product.name}</TableCell>
                                                    <TableCell className="text-muted-foreground text-sm font-mono">{product.sku || '-'}</TableCell>
                                                    <TableCell className="font-semibold">{formatCurrency(product.price)}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={getStockBadgeVariant(product.count_in_stock || product.countInStock || 0)}
                                                                className="cursor-pointer hover:opacity-80"
                                                                onClick={() => handleInlineStockEdit(product)}
                                                            >
                                                                {product.count_in_stock || product.countInStock || 0}
                                                            </Badge>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => openStockModal(product)}
                                                                title="Adjust stock"
                                                            >
                                                                <RefreshCw className="h-3 w-3" />
                                                            </Button>
                                                        </div>
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
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant={getStockBadgeVariant(product.count_in_stock || product.countInStock || 0)}
                                                                className="cursor-pointer hover:opacity-80"
                                                                onClick={() => handleInlineStockEdit(product)}
                                                            >
                                                                {product.count_in_stock || product.countInStock || 0}
                                                            </Badge>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={() => openStockModal(product)}
                                                                title="Adjust stock"
                                                            >
                                                                <RefreshCw className="h-3 w-3" />
                                                            </Button>
                                                        </div>
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
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Upload className="h-5 w-5" />
                            Import Products from CSV
                            {uploadStep !== 'idle' && (
                                <Badge variant={uploadStep === 'complete' ? 'default' : 'secondary'} className="ml-2">
                                    {uploadStep === 'validating' && 'Validating...'}
                                    {uploadStep === 'preview' && 'Review'}
                                    {uploadStep === 'uploading' && 'Uploading'}
                                    {uploadStep === 'complete' && 'Complete'}
                                </Badge>
                            )}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex flex-col gap-4">
                        {/* Info banner */}
                        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
                            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                            <div className="text-sm text-blue-700 dark:text-blue-300">
                                <strong>Required columns:</strong>{" "}
                                <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1.5 py-0.5 rounded">
                                    name, price, category, stock
                                </code>
                                {validatedData.length > 0 && (
                                    <span className="ml-2">• Duplicates will be skipped automatically</span>
                                )}
                            </div>
                        </div>

                        {uploadError && (
                            <div className="flex items-start gap-2 bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                <div className="text-sm text-destructive">{uploadError}</div>
                            </div>
                        )}

                        {/* Uploading/Complete: Show Progress */}
                        {(uploadStep === 'uploading' || uploadStep === 'complete') && (
                            <div className="border rounded-lg p-4">
                                <UploadProgress
                                    total={uploadProgress.total}
                                    processed={uploadProgress.processed}
                                    succeeded={uploadProgress.succeeded}
                                    failed={uploadProgress.failed}
                                    skipped={uploadProgress.skipped}
                                    currentChunk={uploadProgress.currentChunk}
                                    totalChunks={uploadProgress.totalChunks}
                                    isUploading={uploading}
                                    errors={uploadProgress.errors}
                                />
                            </div>
                        )}

                        {/* Preview: Show Validation Table */}
                        {uploadStep === 'preview' && validatedData.length > 0 && (
                            <div className="flex-1 overflow-hidden flex flex-col gap-3">
                                {/* Stats Bar */}
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex gap-1 text-sm">
                                            <Badge variant="outline" className="gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                                {validationStats.valid} valid
                                            </Badge>
                                            {validationStats.warning > 0 && (
                                                <Badge variant="outline" className="gap-1 border-yellow-300 text-yellow-600">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {validationStats.warning} skip
                                                </Badge>
                                            )}
                                            {validationStats.error > 0 && (
                                                <Badge variant="outline" className="gap-1 border-red-300 text-red-600">
                                                    <XCircle className="h-3 w-3" />
                                                    {validationStats.error} errors
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs"
                                            onClick={() => setSelectedRows(new Set(validatedData.map((v, i) => v._validation.status === 'valid' ? i : null).filter(i => i !== null)))}
                                        >
                                            Select Valid
                                        </Button>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setSelectedRows(new Set())}>
                                            Deselect All
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={closeUploadModal} className="h-7 text-xs text-destructive">
                                            <X className="h-3 w-3 mr-1" />
                                            Clear
                                        </Button>
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="text-sm text-muted-foreground">
                                    <strong>{selectedRows.size}</strong> products selected for upload
                                </div>

                                {/* Validation Table */}
                                <ScrollArea className="flex-1 border rounded-lg max-h-[350px]">
                                    <Table>
                                        <TableHeader className="bg-muted/50 sticky top-0">
                                            <TableRow>
                                                <TableHead className="w-10"></TableHead>
                                                <TableHead className="w-10">Status</TableHead>
                                                <TableHead className="w-10">#</TableHead>
                                                <TableHead>Name</TableHead>
                                                <TableHead>Price</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Stock</TableHead>
                                                <TableHead className="min-w-[120px]">Message</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {validatedData.map((row, i) => {
                                                const status = row._validation?.status || 'valid';
                                                const message = row._validation?.message || '';
                                                const isSelected = selectedRows.has(i);
                                                const isError = status === 'error';
                                                const bgClass = status === 'valid' ? 'bg-green-50/50 dark:bg-green-950/20' :
                                                    status === 'warning' ? 'bg-yellow-50/50 dark:bg-yellow-950/20' :
                                                        'bg-red-50/50 dark:bg-red-950/20';

                                                return (
                                                    <TableRow
                                                        key={i}
                                                        className={`${bgClass} ${isError ? 'opacity-60' : ''} cursor-pointer transition-colors hover:opacity-80`}
                                                        onClick={() => {
                                                            if (isError) return;
                                                            const newSet = new Set(selectedRows);
                                                            if (newSet.has(i)) newSet.delete(i);
                                                            else newSet.add(i);
                                                            setSelectedRows(newSet);
                                                        }}
                                                    >
                                                        <TableCell className="p-2">
                                                            <Checkbox
                                                                checked={isSelected}
                                                                disabled={isError}
                                                                onCheckedChange={() => {
                                                                    const newSet = new Set(selectedRows);
                                                                    if (newSet.has(i)) newSet.delete(i);
                                                                    else newSet.add(i);
                                                                    setSelectedRows(newSet);
                                                                }}
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                        </TableCell>
                                                        <TableCell className="p-2">
                                                            {status === 'valid' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                                            {status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                                                            {status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                                                        </TableCell>
                                                        <TableCell className="p-2 text-xs text-muted-foreground">{i + 1}</TableCell>
                                                        <TableCell className="text-xs max-w-[150px] truncate p-2">{row.name || '-'}</TableCell>
                                                        <TableCell className="text-xs p-2">{formatCurrency(row.price)}</TableCell>
                                                        <TableCell className="text-xs max-w-[100px] truncate p-2">{row.category || '-'}</TableCell>
                                                        <TableCell className="text-xs p-2">{row.stock}</TableCell>
                                                        <TableCell className="text-xs p-2">
                                                            {message && (
                                                                <span className={status === 'error' ? 'text-red-600' : status === 'warning' ? 'text-yellow-600' : 'text-gray-500'}>
                                                                    {message}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </div>
                        )}

                        {/* Validating State */}
                        {uploadStep === 'validating' && (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                <span className="ml-3 text-muted-foreground">Validating CSV data...</span>
                            </div>
                        )}
                    </div>

                    <Separator />

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={closeUploadModal}>
                            {uploadStep === 'complete' ? 'Close' : 'Cancel'}
                        </Button>
                        {uploadStep === 'preview' && (
                            <Button onClick={handleBulkUpload} disabled={uploading || selectedRows.size === 0}>
                                {uploading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Upload {selectedRows.size} Products
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* CSV Guide Modal */}
            <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5" />
                            CSV Format Guide
                        </DialogTitle>
                    </DialogHeader>

                    <ScrollArea className="flex-1 pr-4 max-h-[65vh]">
                        <div className="space-y-6">
                            {/* Download Sample */}
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

                            {/* Example CSV Preview */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Example CSV Format
                                </h3>
                                <div className="bg-muted/50 rounded-lg p-3 overflow-x-auto border">
                                    <pre className="text-xs font-mono whitespace-pre">
                                        {`name,price,category,stock,subcategory,brand,description,image_url
Wireless Bluetooth Headphones,79.99,Electronics,50,Audio & Headphones,SoundMax,"Premium noise-cancelling headphones",https://example.com/headphones.jpg
Cotton Crew Neck T-Shirt,24.99,Fashion,100,Men's Clothing,UrbanWear,"Comfortable everyday t-shirt",https://example.com/tshirt.jpg
Stainless Steel Water Bottle,19.99,Home & Living,200,Kitchen & Dining,EcoLife,"1L insulated bottle, keeps drinks cold 24hrs",https://example.com/bottle.jpg`}
                                    </pre>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    💡 Use commas to separate values. Wrap text in quotes if it contains commas.
                                </p>
                            </div>

                            <Separator />

                            {/* Required Columns */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    Required Columns
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="w-[120px]">Column</TableHead>
                                                <TableHead className="w-[120px]">Type</TableHead>
                                                <TableHead>Example</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-sm">
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">name</TableCell>
                                                <TableCell className="text-muted-foreground">Text</TableCell>
                                                <TableCell>Wireless Bluetooth Headphones</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">price</TableCell>
                                                <TableCell className="text-muted-foreground">Number</TableCell>
                                                <TableCell>79.99 (no currency symbol)</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">category</TableCell>
                                                <TableCell className="text-muted-foreground">Text</TableCell>
                                                <TableCell>Electronics (see valid list below)</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">stock</TableCell>
                                                <TableCell className="text-muted-foreground">Number</TableCell>
                                                <TableCell>50 (whole number only)</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            {/* Optional Columns */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    Optional Columns
                                </h3>
                                <div className="border rounded-lg overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-muted/30">
                                            <TableRow>
                                                <TableHead className="w-[120px]">Column</TableHead>
                                                <TableHead>Description</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody className="text-sm">
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">subcategory</TableCell>
                                                <TableCell>Specific sub-category (e.g., Audio & Headphones)</TableCell>
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
                                                <TableCell>Main image URL (https://...)</TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell className="font-mono font-medium">images</TableCell>
                                                <TableCell>Additional images, comma or pipe separated</TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <Separator />

                            {/* Common Mistakes */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                    Common Mistakes
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium text-red-700 dark:text-red-400">Price with currency symbol</div>
                                            <div className="text-red-600/80 dark:text-red-400/80 font-mono text-xs mt-1">
                                                ❌ $79.99 → ✅ 79.99
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium text-red-700 dark:text-red-400">Stock as decimal</div>
                                            <div className="text-red-600/80 dark:text-red-400/80 font-mono text-xs mt-1">
                                                ❌ 50.5 → ✅ 50
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium text-red-700 dark:text-red-400">Invalid category name</div>
                                            <div className="text-red-600/80 dark:text-red-400/80 font-mono text-xs mt-1">
                                                ❌ "Clothes" → ✅ "Fashion"
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                        <div className="flex-1 text-sm">
                                            <div className="font-medium text-red-700 dark:text-red-400">Unquoted text with commas</div>
                                            <div className="text-red-600/80 dark:text-red-400/80 font-mono text-xs mt-1">
                                                ❌ Red, Blue, Green → ✅ "Red, Blue, Green"
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Valid Categories */}
                            <div className="space-y-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                    Valid Categories & Subcategories
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="border rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span>📱</span> Electronics
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>• Smartphones & Accessories</div>
                                            <div>• Laptops & Computers</div>
                                            <div>• Audio & Headphones</div>
                                            <div>• Cameras & Photography</div>
                                            <div>• Gaming & Consoles</div>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span>👕</span> Fashion
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>• Men's Clothing</div>
                                            <div>• Women's Clothing</div>
                                            <div>• Kids' Clothing</div>
                                            <div>• Footwear</div>
                                            <div>• Bags & Luggage</div>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span>🏠</span> Home & Living
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>• Furniture</div>
                                            <div>• Kitchen & Dining</div>
                                            <div>• Bedding & Bath</div>
                                            <div>• Home Decor</div>
                                            <div>• Home Appliances</div>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span>💄</span> Beauty
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>• Skincare</div>
                                            <div>• Makeup & Cosmetics</div>
                                            <div>• Haircare</div>
                                            <div>• Fragrances</div>
                                            <div>• Personal Care</div>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span>⚽</span> Sports
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>• Fitness Equipment</div>
                                            <div>• Sportswear & Activewear</div>
                                            <div>• Outdoor & Camping</div>
                                            <div>• Cycling</div>
                                            <div>• Team Sports</div>
                                        </div>
                                    </div>
                                    <div className="border rounded-lg p-3 space-y-2">
                                        <div className="font-medium text-sm flex items-center gap-2">
                                            <span>📚</span> Books
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-0.5">
                                            <div>• Fiction</div>
                                            <div>• Non-Fiction</div>
                                            <div>• Children's Books</div>
                                            <div>• Educational & Textbooks</div>
                                            <div>• Self-Help & Business</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* SKU Note */}
                            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                                    <div className="text-xs text-blue-800 dark:text-blue-200">
                                        <strong>Note:</strong> SKU is auto-generated by the system and does not need to be included. Duplicate product names (for your account) will be automatically skipped during upload.
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

            {/* Stock Adjust Modal */}
            <Dialog open={isStockModalOpen} onOpenChange={setIsStockModalOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-primary" />
                            Adjust Stock
                        </DialogTitle>
                    </DialogHeader>

                    {stockModalProduct && (
                        <div className="space-y-6 py-4">
                            {/* Product Info */}
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <img
                                    src={stockModalProduct.image || "https://via.placeholder.com/60"}
                                    alt={stockModalProduct.name}
                                    className="w-12 h-12 rounded-md object-cover"
                                />
                                <div>
                                    <div className="font-medium">{stockModalProduct.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        Current stock: <span className="font-semibold">{stockModalProduct.count_in_stock || stockModalProduct.countInStock || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Adjustment Controls */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-4">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 w-12 rounded-full"
                                        onClick={() => setStockAdjustment(prev => prev - 10)}
                                    >
                                        <span className="text-lg">-10</span>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 w-12 rounded-full"
                                        onClick={() => setStockAdjustment(prev => prev - 1)}
                                    >
                                        <Minus className="h-5 w-5" />
                                    </Button>

                                    <div className="text-center min-w-[100px]">
                                        <div className={`text-3xl font-bold ${stockAdjustment > 0 ? 'text-green-600' : stockAdjustment < 0 ? 'text-red-600' : ''}`}>
                                            {stockAdjustment > 0 ? '+' : ''}{stockAdjustment}
                                        </div>
                                        <div className="text-xs text-muted-foreground">adjustment</div>
                                    </div>

                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 w-12 rounded-full"
                                        onClick={() => setStockAdjustment(prev => prev + 1)}
                                    >
                                        <Plus className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="h-12 w-12 rounded-full"
                                        onClick={() => setStockAdjustment(prev => prev + 10)}
                                    >
                                        <span className="text-lg">+10</span>
                                    </Button>
                                </div>

                                {/* New Stock Preview */}
                                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                                    <span className="text-sm text-muted-foreground">New stock level:</span>
                                    <Badge variant={
                                        Math.max(0, (stockModalProduct.count_in_stock || stockModalProduct.countInStock || 0) + stockAdjustment) <= LOW_STOCK_THRESHOLD
                                            ? "destructive"
                                            : "default"
                                    } className="text-base px-3 py-1">
                                        {Math.max(0, (stockModalProduct.count_in_stock || stockModalProduct.countInStock || 0) + stockAdjustment)}
                                    </Badge>
                                </div>

                                {/* Optional Reason */}
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground">Reason (optional)</label>
                                    <Input
                                        placeholder="e.g., Restocked, Damaged items removed..."
                                        value={stockAdjustReason}
                                        onChange={(e) => setStockAdjustReason(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsStockModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStockAdjust}
                            disabled={stockAdjustment === 0 || updatingStock}
                        >
                            {updatingStock ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Apply Adjustment
                                </>
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
