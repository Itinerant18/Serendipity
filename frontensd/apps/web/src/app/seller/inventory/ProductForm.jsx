import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ProductForm = ({
    formData,
    handleInputChange,
    categories,
    subcategories,
    loadingCategories,
    loadingSubcategories,
    uploadedImages,
    uploadingImages,
    dragActiveImage,
    handleDragImage,
    handleDropImage,
    handleImageUpload,
    removeImage,
    imageInputRef,
    MAX_IMAGES,
    onSubmit,
    label
}) => {
    return (
        <div className="space-y-5 py-2">
            <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">Product Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Premium Leather Jacket"
                    autoComplete="off"
                    className="bg-background border-input focus:ring-primary/20"
                />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="price" className="text-foreground font-medium">Price ($)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="bg-background border-input focus:ring-primary/20"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="stock" className="text-foreground font-medium">Stock Quantity</Label>
                    <Input
                        id="stock"
                        name="stock"
                        type="number"
                        value={formData.stock}
                        onChange={handleInputChange}
                        placeholder="0"
                        className="bg-background border-input focus:ring-primary/20"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                    <Label htmlFor="category" className="text-foreground font-medium">Category</Label>
                    <div className="relative">
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            disabled={loadingCategories}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="">
                                {loadingCategories ? 'Loading...' : 'Select Category'}
                            </option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"></i>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subcategory" className="text-foreground font-medium">Subcategory</Label>
                    <div className="relative">
                        <select
                            id="subcategory"
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleInputChange}
                            disabled={!formData.category || loadingSubcategories}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                        >
                            <option value="">
                                {!formData.category
                                    ? 'Select category first'
                                    : loadingSubcategories
                                        ? 'Loading...'
                                        : subcategories.length === 0
                                            ? 'No subcategories'
                                            : 'Select Subcategory'
                                }
                            </option>
                            {subcategories.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                        <i className="fa-solid fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none"></i>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="brand" className="text-foreground font-medium">Brand Name</Label>
                <Input
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Nike, Samsung, etc."
                    className="bg-background border-input focus:ring-primary/20"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground font-medium">Product Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your product features, material, and care instructions..."
                    rows={4}
                    className="bg-background border-input focus:ring-primary/20 resize-none"
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <Label className="text-foreground font-medium">Product Images</Label>
                    <span className="text-xs text-muted-foreground">{uploadedImages.length}/{MAX_IMAGES} images</span>
                </div>

                {uploadedImages.length < MAX_IMAGES && (
                    <div
                        onDragEnter={handleDragImage}
                        onDragLeave={handleDragImage}
                        onDragOver={handleDragImage}
                        onDrop={handleDropImage}
                        onClick={() => imageInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 group ${dragActiveImage
                            ? 'border-primary bg-primary/5 scale-[0.99] shadow-inner'
                            : 'border-border hover:border-primary/50 bg-muted/30 hover:bg-muted/50'
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
                            <div className="flex flex-col items-center py-2">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                                <p className="text-sm font-medium text-foreground">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-3 py-2">
                                <div className="p-3 rounded-full bg-background dark:bg-zinc-800 shadow-sm group-hover:scale-110 transition-transform duration-200">
                                    <i className="fa-solid fa-cloud-arrow-up text-xl text-primary"></i>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Click to upload or drag & drop</p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 10MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mt-4">
                        {uploadedImages.map((img, index) => (
                            <div key={index} className="relative group aspect-square">
                                <img
                                    src={img.url}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover rounded-lg border border-border shadow-sm"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="bg-white/90 text-destructive hover:bg-red-500 hover:text-white rounded-full p-2 transition-colors transform hover:scale-110"
                                        title="Remove image"
                                    >
                                        <i className="fa-solid fa-trash-can text-sm"></i>
                                    </button>
                                </div>
                                {index === 0 && (
                                    <span className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                        Main
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {uploadedImages.length === 0 && (
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or using URL</span>
                        </div>
                    </div>
                )}

                {uploadedImages.length === 0 && (
                    <div className="space-y-2">
                        <Label htmlFor="image_url" className="text-foreground font-medium">Image URL</Label>
                        <Input
                            id="image_url"
                            name="image_url"
                            value={formData.image_url}
                            onChange={handleInputChange}
                            placeholder="https://example.com/image.jpg"
                            className="bg-background border-input focus:ring-primary/20 font-mono text-xs"
                        />
                    </div>
                )}
            </div>

            <Button onClick={onSubmit} className="w-full h-11 text-base font-semibold mt-4 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                {label}
            </Button>
        </div>
    );
};

export default ProductForm;
