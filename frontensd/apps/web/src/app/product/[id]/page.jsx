"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import { formatCurrency } from "@/utils/format";
import useCartStore from "@/utils/cartStore";
import useAuth from "@/utils/useAuth";
import { useNavigate } from "react-router-dom";

export default function ProductPage({ params }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [addedToCart, setAddedToCart] = useState(false);
    const [stockInfo, setStockInfo] = useState({ count: 0, status: "out" });
    const addToCartStore = useCartStore((state) => state.addToCart);
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProduct();
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            const response = await fetch(
                `http://localhost:5000/api/products/${params.id}`,
            );
            const data = await response.json();

            if (data) {
                // Map backend to frontend schema
                const mappedProduct = {
                    product_id: data.id || params.id,
                    product_title: data.name,
                    product_description: data.description,
                    product_photos: data.images && data.images.length > 0 ? data.images : [data.image],
                    product_video: data.video_url || data.videos?.[0] || null, // New field
                    product_rating: data.rating || 0,
                    product_num_reviews: data.num_reviews || 0,
                    count_in_stock: data.count_in_stock || 0,
                    offer: {
                        price: formatCurrency(data.price),
                        original_price: data.compare_at_price && data.compare_at_price > data.price ? formatCurrency(data.compare_at_price) : null,
                        store_name: data.seller_store_name || "Serendipity",
                        store_rating: data.seller_rating || 4.8
                    },
                    typical_price_range: null,
                    product_details: {
                        Brand: data.brand || 'Generic',
                        Category: data.category,
                        Subcategory: data.subcategory,
                        SKU: data.sku, // New
                        Weight: data.weight ? `${data.weight} kg` : null, // New
                        Dimensions: data.dimensions, // New
                    },
                    tags: data.tags || [] // New
                };
                setProduct({ product: mappedProduct });

                // Set stock info
                const count = data.count_in_stock || 0;
                let status = "out";
                if (count > 10) status = "in";
                else if (count > 0) status = "low";
                setStockInfo({ count, status });
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const addToCart = () => {
        if (!isAuthenticated) {
            navigate('/account/signin');
            return;
        }

        // Construct the product object expected by the store logic
        const item = {
            id: product.product.product_id,
            product: product.product.product_id,
            name: product.product.product_title,
            price: parseFloat(product.product.offer?.price.replace(/[^0-9.]/g, '') || 0),
            image: product.product.product_photos[0],
        };

        for (let i = 0; i < quantity; i++) {
            addToCartStore({
                id: product.product.product_id,
                name: product.product.product_title,
                price: parseFloat(product.product.offer?.price?.replace(/[^\d.]/g, '') || 0),
                image: product.product.product_photos[0]
            });
        }

        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const buyNow = () => {
        if (!isAuthenticated) {
            navigate('/account/signin');
            return;
        }

        addToCart();
        window.location.href = "/cart";
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#D97534] mx-auto mb-4"></div>
                    <p className="font-inter text-gray-600">Loading product...</p>
                </div>
            </div>
        );
    }

    if (!product || !product.product) {
        return (
            <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center">
                <div className="text-center">
                    <p className="font-playfair text-2xl text-gray-500 mb-4">
                        Product not found
                    </p>
                    <a
                        href="/"
                        className="inline-flex items-center px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-semibold rounded-full transition-colors"
                    >
                        Back to Home
                    </a>
                </div>
            </div>
        );
    }

    const productData = product.product;

    return (
        <div className="min-h-screen bg-[#FFF8F0]">
            {/* Product Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <div className="mb-6">
                    <a
                        href="/"
                        className="text-[#A0522D] hover:text-[#D97534] font-inter text-sm"
                    >
                        Home
                    </a>
                    <span className="text-gray-400 mx-2">/</span>
                    <a href={`/category/${productData.product_details.Category}`} className="text-[#A0522D] hover:text-[#D97534] font-inter text-sm">
                        {productData.product_details.Category}
                    </a>
                    <span className="text-gray-400 mx-2">/</span>
                    <span className="text-gray-600 font-inter text-sm">
                        {productData.product_title}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Media Gallery (Images + Video) */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg relative">
                            {/* Show Video if selected and it's the last index (or a specific video index strategy) 
                                For now, let's say if selectedImage index >= photos.length, show video?
                                Or just mix them. Let's append video to photos list for selection logic?
                                Better: If product_video is present, add a video thumbnail. 
                             */}

                            {productData.product_video && selectedImage === productData.product_photos.length ? (
                                <video
                                    src={productData.product_video}
                                    controls
                                    className="w-full h-full object-contain"
                                    poster={productData.product_photos[0]}
                                />
                            ) : (
                                <img
                                    src={productData.product_photos[selectedImage] || productData.product_photos[0]}
                                    alt={productData.product_title}
                                    className="w-full h-full object-contain"
                                />
                            )}

                            {/* Stock Badge on Image */}
                            {stockInfo.status === "low" && (
                                <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center">
                                    <i className="fa-solid fa-circle-exclamation mr-1"></i>
                                    Only {stockInfo.count} left!
                                </div>
                            )}
                            {stockInfo.status === "out" && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    Out of Stock
                                </div>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        <div className="grid grid-cols-5 gap-2">
                            {productData.product_photos.map((photo, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedImage(index)}
                                    className={`aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                        ? "border-[#D97534] shadow-md"
                                        : "border-gray-200 hover:border-[#D97534]/50"
                                        }`}
                                >
                                    <img
                                        src={photo}
                                        alt={`${productData.product_title} - ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                            {/* Video Thumbnail */}
                            {productData.product_video && (
                                <button
                                    onClick={() => setSelectedImage(productData.product_photos.length)}
                                    className={`aspect-square bg-black/5 rounded-lg overflow-hidden border-2 transition-all flex items-center justify-center ${selectedImage === productData.product_photos.length
                                        ? "border-[#D97534] shadow-md"
                                        : "border-gray-200 hover:border-[#D97534]/50"
                                        }`}
                                >
                                    <i className="fa-solid fa-play text-2xl text-[#8B4513]"></i>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            {productData.product_details.Brand && (
                                <p className="text-sm text-[#D97534] font-medium font-inter mb-1 uppercase tracking-wide">
                                    {productData.product_details.Brand}
                                </p>
                            )}
                            <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-4 leading-tight">
                                {productData.product_title}
                            </h1>

                            {/* Rating */}
                            <div className="flex items-center mb-4">
                                <div className="flex items-center text-[#FFA41C]">
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className={`fa-solid fa-star text-sm ${i < Math.floor(productData.product_rating)
                                                ? "opacity-100"
                                                : "opacity-30"
                                                }`}
                                        ></i>
                                    ))}
                                </div>
                                <span className="ml-2 font-inter text-sm text-gray-600 hover:text-[#D97534] cursor-pointer">
                                    {productData.product_rating} ratings • {productData.product_num_reviews} reviews
                                </span>
                            </div>

                            {/* Price */}
                            <div className="mb-6 p-4 bg-white/50 rounded-xl border border-[#FAE5D3]/50">
                                <div className="flex items-end gap-3">
                                    <p className="font-playfair font-bold text-4xl text-[#8B4513]">
                                        {productData.offer?.price || "See offers"}
                                    </p>
                                    {productData.offer?.original_price && (
                                        <div className="flex flex-col mb-1">
                                            <p className="font-inter text-sm text-gray-500 line-through">
                                                {productData.offer.original_price}
                                            </p>
                                            <p className="font-inter text-xs text-red-600 font-bold">
                                                SAVE {Math.round((1 - parseFloat(productData.offer.price.replace(/[^\d.]/g, '')) / parseFloat(productData.offer.original_price.replace(/[^\d.]/g, ''))) * 100)}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4">
                                {stockInfo.status === "in" && (
                                    <span className="inline-flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full font-inter font-medium text-sm border border-green-200">
                                        <i className="fa-solid fa-check mr-2"></i>
                                        In Stock
                                    </span>
                                )}
                                {stockInfo.status === "low" && (
                                    <span className="inline-flex items-center text-orange-700 bg-orange-50 px-3 py-1 rounded-full font-inter font-medium text-sm border border-orange-200">
                                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                        Only {stockInfo.count} left - order soon!
                                    </span>
                                )}
                                {stockInfo.status === "out" && (
                                    <span className="inline-flex items-center text-red-700 bg-red-50 px-3 py-1 rounded-full font-inter font-medium text-sm border border-red-200">
                                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                        Currently unavailable
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {productData.product_description && (
                            <div className="prose prose-sm text-gray-600 font-inter">
                                <h3 className="font-playfair font-bold text-lg text-[#8B4513] mb-2">Description</h3>
                                <div className="whitespace-pre-line leading-relaxed">
                                    {productData.product_description}
                                </div>
                            </div>
                        )}

                        {/* Product Specs / Details */}
                        {productData.product_details && Object.keys(productData.product_details).length > 0 && (
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
                                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                    <h3 className="font-playfair font-semibold text-[#8B4513]">Specifications</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {Object.entries(productData.product_details).map(([key, value]) => (
                                        value && (
                                            <div key={key} className="grid grid-cols-3 px-5 py-3 text-sm">
                                                <dt className="text-gray-500 font-medium">{key}</dt>
                                                <dd className="col-span-2 text-gray-800">{value}</dd>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {productData.tags && productData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                                {productData.tags.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full border border-gray-200">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="font-inter font-medium text-gray-700">Quantity</span>
                                <div className="flex items-center border border-gray-300 rounded-lg">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                                    >
                                        <i className="fa-solid fa-minus text-xs"></i>
                                    </button>
                                    <span className="px-3 py-2 font-inter font-medium text-center w-10 border-x border-gray-300">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(stockInfo.count || 99, quantity + 1))}
                                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                                        disabled={quantity >= stockInfo.count}
                                    >
                                        <i className="fa-solid fa-plus text-xs"></i>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={addToCart}
                                    disabled={stockInfo.status === "out" || addedToCart}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${addedToCart
                                        ? "bg-green-600 text-white"
                                        : stockInfo.status === "out"
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-[#D97534] text-white hover:bg-[#C86429] shadow-md hover:shadow-lg"
                                        }`}
                                >
                                    {addedToCart ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <i className="fa-solid fa-check"></i> Added
                                        </span>
                                    ) : (
                                        "Add to Cart"
                                    )}
                                </button>
                                <button
                                    onClick={buyNow}
                                    disabled={stockInfo.status === "out"}
                                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${stockInfo.status === "out"
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                        : "bg-[#8B4513] text-white hover:bg-[#6A320F] shadow-md hover:shadow-lg"
                                        }`}
                                >
                                    Buy Now
                                </button>
                            </div>
                        </div>

                        {/* Trust Signals - Kept same as before but slightly cleaner */}
                        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                            {/* ... (Keep existing trust signals or simplify) ... */}
                            <div className="flex flex-col items-center text-center">
                                <i className="fa-solid fa-truck text-[#D97534] mb-1"></i>
                                <span className="text-xs text-gray-600">Free Delivery</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <i className="fa-solid fa-rotate-left text-[#D97534] mb-1"></i>
                                <span className="text-xs text-gray-600">Easy Returns</span>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <i className="fa-solid fa-shield-halved text-[#D97534] mb-1"></i>
                                <span className="text-xs text-gray-600">Secure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            <style jsx global>{`
        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
        </div>
    );
}
