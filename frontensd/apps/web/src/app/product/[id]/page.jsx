"use client";

import React, { useState, useEffect } from "react";
// FontAwesome icons used globally
import { formatCurrency } from "@/utils/format";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import useCartStore from "@/utils/cartStore";

export default function ProductPage({ params }) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");
    const [addedToCart, setAddedToCart] = useState(false);
    const [stockInfo, setStockInfo] = useState({ count: 0, status: "out" });
    const addToCartStore = useCartStore((state) => state.addToCart);

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
                    product_photos: [data.image],
                    product_rating: data.rating || 4.5,
                    product_num_reviews: data.num_reviews || 0,
                    count_in_stock: data.count_in_stock || 0,
                    offer: {
                        price: formatCurrency(data.price),
                        original_price: data.original_price ? formatCurrency(data.original_price) : null,
                        store_name: data.seller_store_name || "Serendipity",
                        store_rating: data.seller_rating || 4.8
                    },
                    typical_price_range: [formatCurrency(50), formatCurrency(500)],
                    product_details: { Brand: data.brand, Category: data.category }
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
        // Construct the product object expected by the store logic
        const item = {
            id: product.product.product_id,
            product: product.product.product_id, // Store expects 'product' as ID usually or checks _id/id
            name: product.product.product_title,
            price: parseFloat(product.product.offer?.price.replace(/[^0-9.]/g, '') || 0), // extract number if needed, but store might handle it. 
            // Wait, HomePage passed: { id, name, price, image } to addToCart
            // And Store does: { ...product, product: product._id || product.id, qty: 1 }
            // So we should pass a clean object
            image: product.product.product_photos[0],
            // We need to handle quantity - the store adds 1, 
            // but here we have a quantity selector.
            // The current simple store 'addToCart' adds 1 or increments 1.
            // I should modify store to accept quantity or just call it N times or fix the store.
            // For now, I will update the store to accept quantity if I can, but since I can't edit store in this turn cleanly without checking context...
            // Actually I CREATED the store. I know what it does.
            // It does: { ...item, qty: item.qty + 1 }
            // It does NOT support adding N items at once in the current implementation.
            // I will just loop for now or simple assume 1 for this turn, OR better, I'll update the store later to support quantity. 
            // Let's just call it once for now to enable the button working.
        };

        // Actually, let's fix the calls. If the user selected quantity 3, calling it 3 times is ugly but works for a quick fix.
        // A better fix is to update the store to accept quantity.
        // But for this "Real-time updates" task, simply connecting it is the step.
        // I'll implement a loop to match the quantity selected by user.

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
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

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
                    <span className="text-gray-600 font-inter text-sm">
                        {productData.product_title}
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-lg relative">
                            <img
                                src={productData.product_photos[selectedImage]}
                                alt={productData.product_title}
                                className="w-full h-full object-contain"
                            />

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
                        {productData.product_photos.length > 1 && (
                            <div className="grid grid-cols-5 gap-2">
                                {productData.product_photos.slice(0, 5).map((photo, index) => (
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
                                            className="w-full h-full object-contain"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="font-playfair font-bold text-3xl sm:text-4xl text-[#8B4513] mb-4 leading-tight">
                                {productData.product_title}
                            </h1>

                            {/* Rating */}
                            {productData.product_rating && (
                                <div className="flex items-center mb-4">
                                    <div className="flex items-center">
                                        {[...Array(5)].map((_, i) => (
                                            <i
                                                key={i}
                                                className={`fa-solid fa-star text-lg ${i < Math.floor(productData.product_rating)
                                                    ? "text-[#D97534]"
                                                    : "text-gray-300"
                                                    }`}
                                            ></i>
                                        ))}
                                    </div>
                                    <span className="ml-3 font-inter text-gray-700">
                                        {productData.product_rating} (
                                        {productData.product_num_reviews || 0} reviews)
                                    </span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-3">
                                    <p className="font-playfair font-bold text-4xl text-[#8B4513]">
                                        {productData.offer?.price || "See offers"}
                                    </p>
                                    {productData.offer?.original_price && (
                                        <p className="font-inter text-lg text-gray-400 line-through">
                                            {productData.offer.original_price}
                                        </p>
                                    )}
                                </div>
                                {productData.typical_price_range && (
                                    <p className="font-inter text-sm text-gray-600 mt-2">
                                        Typical range: {productData.typical_price_range[0]} -{" "}
                                        {productData.typical_price_range[1]}
                                    </p>
                                )}
                            </div>

                            {/* Stock Status */}
                            <div className="mb-4">
                                {stockInfo.status === "in" && (
                                    <span className="inline-flex items-center text-green-600 font-inter font-medium">
                                        <i className="fa-solid fa-check mr-2"></i>
                                        In Stock
                                    </span>
                                )}
                                {stockInfo.status === "low" && (
                                    <span className="inline-flex items-center text-orange-600 font-inter font-medium">
                                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                        Only {stockInfo.count} left - order soon!
                                    </span>
                                )}
                                {stockInfo.status === "out" && (
                                    <span className="inline-flex items-center text-red-600 font-inter font-medium">
                                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                        Currently unavailable
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {productData.product_description && (
                            <div className="bg-gradient-to-br from-white to-[#FAE5D3]/30 rounded-xl p-6 border border-[#FAE5D3]">
                                <h2 className="font-playfair font-semibold text-xl text-[#8B4513] mb-3">
                                    About this product
                                </h2>
                                <p className="font-inter text-gray-700 leading-relaxed">
                                    {productData.product_description}
                                </p>
                            </div>
                        )}

                        {/* Product Details */}
                        {productData.product_details &&
                            Object.keys(productData.product_details).length > 0 && (
                                <div className="bg-white rounded-xl p-6 shadow-md">
                                    <h2 className="font-playfair font-semibold text-xl text-[#8B4513] mb-4">
                                        Product Details
                                    </h2>
                                    <div className="space-y-2">
                                        {Object.entries(productData.product_details).map(
                                            ([key, value]) => (
                                                <div
                                                    key={key}
                                                    className="flex justify-between border-b border-gray-100 pb-2"
                                                >
                                                    <span className="font-inter text-sm text-gray-600">
                                                        {key}:
                                                    </span>
                                                    <span className="font-inter text-sm font-medium text-gray-800">
                                                        {value}
                                                    </span>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>
                            )}

                        {/* Quantity & Add to Cart */}
                        <div className="bg-gradient-to-br from-[#F4E4D7] to-[#FFF8F0] rounded-xl p-6 shadow-md space-y-4">
                            <div className="flex items-center space-x-4">
                                <span className="font-inter font-semibold text-gray-700">
                                    Quantity:
                                </span>
                                <div className="flex items-center space-x-3 bg-white rounded-full px-4 py-2 shadow-sm">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="text-[#D97534] hover:text-[#C86429] transition-colors"
                                    >
                                        <i className="fa-solid fa-minus"></i>
                                    </button>
                                    <span className="font-inter font-semibold text-lg w-8 text-center">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(Math.min(stockInfo.count || 99, quantity + 1))}
                                        className="text-[#D97534] hover:text-[#C86429] transition-colors"
                                        disabled={quantity >= stockInfo.count}
                                    >
                                        <i className="fa-solid fa-plus"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={addToCart}
                                    disabled={stockInfo.status === "out" || addedToCart}
                                    className={`py-4 rounded-full font-inter font-bold text-lg transition-all transform hover:scale-105 shadow-lg ${addedToCart
                                        ? "bg-green-500 text-white"
                                        : stockInfo.status === "out"
                                            ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100"
                                            : "bg-[#D97534] hover:bg-[#C86429] text-white"
                                        }`}
                                >
                                    {addedToCart ? (
                                        <span className="flex items-center justify-center">
                                            <i className="fa-solid fa-check mr-2"></i>
                                            Added!
                                        </span>
                                    ) : (
                                        "Add to Cart"
                                    )}
                                </button>

                                <button
                                    onClick={buyNow}
                                    disabled={stockInfo.status === "out"}
                                    className={`py-4 rounded-full font-inter font-bold text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center ${stockInfo.status === "out"
                                        ? "bg-gray-300 text-gray-500 cursor-not-allowed hover:scale-100"
                                        : "bg-[#8B4513] hover:bg-[#6B3410] text-white"
                                        }`}
                                >
                                    <i className="fa-solid fa-bolt mr-2"></i>
                                    Buy Now
                                </button>
                            </div>

                            {productData.offer?.store_name && (
                                <p className="font-inter text-sm text-gray-600 text-center">
                                    Sold by:{" "}
                                    <span className="font-semibold text-[#8B4513]">
                                        {productData.offer.store_name}
                                    </span>
                                    {productData.offer.store_rating && (
                                        <span className="ml-2">
                                            ⭐ {productData.offer.store_rating}
                                        </span>
                                    )}
                                </p>
                            )}
                        </div>

                        {/* Trust Signals */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                        <i className="fa-solid fa-truck text-green-600"></i>
                                    </div>
                                    <span className="font-inter text-xs font-medium text-gray-700">Free Delivery</span>
                                    <span className="font-inter text-xs text-gray-400">Orders over ₹499</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                        <i className="fa-solid fa-rotate-left text-blue-600"></i>
                                    </div>
                                    <span className="font-inter text-xs font-medium text-gray-700">Easy Returns</span>
                                    <span className="font-inter text-xs text-gray-400">30-day policy</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                                        <i className="fa-solid fa-shield-halved text-purple-600"></i>
                                    </div>
                                    <span className="font-inter text-xs font-medium text-gray-700">Secure Payment</span>
                                    <span className="font-inter text-xs text-gray-400">100% protected</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />

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
