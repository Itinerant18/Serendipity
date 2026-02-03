import React from "react";
import { useNavigate } from "react-router-dom";

import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";
import useAuth from "@/utils/useAuth";

export default function ProductDetails({
    product,
    isWishlisted,
    toggleWishlist,
    quantity,
    setQuantity,
    handleAddToCart,
    addedToCart
}) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    if (!product) return null;

    const handleBuyNow = () => {
        // First add to cart
        handleAddToCart();
        // Then navigate to checkout
        if (isAuthenticated) {
            navigate('/checkout/shipping');
        } else {
            navigate('/account/signin?callbackUrl=/checkout/shipping');
        }
    };

    return (
        <div className="sticky top-24 space-y-6">
            <GlassCard className="p-6 lg:p-8" variant="accent">
                {/* Brand & Wishlist */}
                <div className="mb-4 flex justify-between items-start">
                    <span className="bg-yellow-400 text-black text-xs font-bold px-4 py-2 border-4 border-black uppercase tracking-wider">
                        {product?.details?.Brand || 'BRAND'}
                    </span>
                    <button
                        onClick={toggleWishlist}
                        className="w-10 h-10 bg-white border-4 border-black text-black hover:bg-red-500 hover:text-white transition-all duration-100 hover:translate(-1px,-1px) hover:shadow-[4px_4px_0_#000000] flex items-center justify-center"
                        aria-label="Toggle Wishlist"
                    >
                        <i className={`${isWishlisted ? "fa-solid text-white" : "fa-regular"} fa-heart text-lg`}></i>
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-brutalist font-bold text-black mb-4 leading-tight border-4 border-r-8 border-l-8 border-t-0 border-b-8 bg-yellow-200 p-2">
                    {product.name}
                </h1>

                {/* Rating Row */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex text-yellow-400 text-sm gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? "" : "opacity-30"}`}></i>
                        ))}
                    </div>
                    <span className="text-sm text-black font-bold bg-orange-200 px-2 py-1 border-2 border-black">{product.num_reviews} REVIEWS</span>
                </div>

                {/* Price */}
                <div className="mb-8">
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-brutalist font-bold text-orange-500 tracking-tight border-4 border-r-8 border-l-8 border-t-0 border-b-8 bg-yellow-300 p-2">
                            {formatCurrency(product.offer.price)}
                        </span>
                        {product.offer.discount > 0 && (
                            <div className="flex flex-col mb-1">
                                <span className="text-sm font-bold bg-red-500 text-white px-3 py-1 border-4 border-black self-start">
                                    -{product.offer.discount}% OFF
                                </span>
                                <span className="text-sm text-black line-through font-bold">
                                    {formatCurrency(product.offer.original_price)}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-black font-bold bg-green-400 px-3 py-2 border-4 border-black mt-2">
                        <i className="fa-solid fa-shield-halved mr-2"></i>
                        SECURE • FREE SHIPPING
                    </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm font-bold text-black uppercase tracking-wide bg-yellow-200 px-3 py-2 border-4 border-black">QUANTITY</span>
                    <div className="flex items-center bg-white border-4 border-black">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-colors"
                        >
                            -
                        </button>
                        <span className="w-12 text-center font-bold text-black text-lg">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(product.count_in_stock, quantity + 1))}
                            className="w-12 h-12 flex items-center justify-center bg-orange-500 text-white font-bold text-lg hover:bg-orange-600 transition-colors"
                            disabled={quantity >= product.count_in_stock}
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="space-y-4">
                    <Button
                        onClick={handleAddToCart}
                        className="w-full h-16 text-lg font-bold bg-orange-500 hover:bg-orange-600 text-white border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all duration-100"
                        disabled={product.count_in_stock === 0}
                    >
                        {addedToCart ? (
                            <span className="flex items-center gap-2">
                                <i className="fa-solid fa-check animate-brutalist-jitter"></i> ADDED TO CART!
                            </span>
                        ) : (
                            product.count_in_stock === 0 ? (
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-xmark"></i> OUT OF STOCK
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-cart-shopping"></i> ADD TO CART
                                </span>
                            )
                        )}
                    </Button>
                    <Button
                        onClick={handleBuyNow}
                        disabled={product.count_in_stock === 0}
                        className="w-full h-14 text-lg font-bold bg-black hover:bg-yellow-400 text-white hover:text-black border-4 border-black hover:border-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#000000] transition-all duration-100 cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-bolt"></i> BUY NOW
                        </span>
                    </Button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t-4 border-black text-center">
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-12 h-12 bg-yellow-400 border-4 border-black flex items-center justify-center text-black group-hover:bg-yellow-300 transition-colors mb-1">
                            <i className="fa-solid fa-truck text-lg"></i>
                        </div>
                        <span className="text-xs text-black font-bold uppercase tracking-wide leading-tight">FAST<br />DELIVERY</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-12 h-12 bg-green-400 border-4 border-black flex items-center justify-center text-black group-hover:bg-green-300 transition-colors mb-1">
                            <i className="fa-solid fa-shield-halved text-lg"></i>
                        </div>
                        <span className="text-xs text-black font-bold uppercase tracking-wide leading-tight">2 YEAR<br />WARRANTY</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-12 h-12 bg-pink-400 border-4 border-black flex items-center justify-center text-black group-hover:bg-pink-300 transition-colors mb-1">
                            <i className="fa-solid fa-rotate-left text-lg"></i>
                        </div>
                        <span className="text-xs text-black font-bold uppercase tracking-wide leading-tight">30 DAY<br />RETURNS</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
