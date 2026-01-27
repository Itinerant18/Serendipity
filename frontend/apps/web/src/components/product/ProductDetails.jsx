import React from "react";

import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/utils/format";

export default function ProductDetails({
    product,
    isWishlisted,
    toggleWishlist,
    quantity,
    setQuantity,
    handleAddToCart,
    addedToCart
}) {
    if (!product) return null;

    return (
        <div className="sticky top-24 space-y-6">
            <GlassCard className="p-6 lg:p-8 bg-white/75 backdrop-blur-xl border-white/60 shadow-2xl shadow-sky-900/5">
                {/* Brand & Wishlist */}
                <div className="mb-4 flex justify-between items-start">
                    <span className="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {product?.details?.Brand || 'Brand'}
                    </span>
                    <button
                        onClick={toggleWishlist}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        aria-label="Toggle Wishlist"
                    >
                        <i className={`${isWishlisted ? "fa-solid" : "fa-regular"} fa-heart text-xl`}></i>
                    </button>
                </div>

                {/* Title */}
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-slate-900 mb-2 leading-tight">
                    {product.name}
                </h1>

                {/* Rating Row */}
                <div className="flex items-center gap-2 mb-6">
                    <div className="flex text-[#F59E0B] text-sm gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fa-solid fa-star ${i < Math.floor(product.rating) ? "" : "opacity-30"}`}></i>
                        ))}
                    </div>
                    <span className="text-sm text-slate-500 font-medium">{product.num_reviews} reviews</span>
                </div>

                {/* Price */}
                <div className="mb-8">
                    <div className="flex items-end gap-3">
                        <span className="text-5xl font-bold text-sky-600 tracking-tight">
                            {formatCurrency(product.offer.price)}
                        </span>
                        {product.offer.discount > 0 && (
                            <div className="flex flex-col mb-1">
                                <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md self-start">
                                    -{product.offer.discount}%
                                </span>
                                <span className="text-sm text-slate-400 line-through">
                                    {formatCurrency(product.offer.original_price)}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5 font-medium">
                        <i className="fa-solid fa-shield-halved text-emerald-500"></i>
                        Secure transaction • Free Shipping
                    </p>
                </div>

                {/* Quantity */}
                <div className="flex items-center gap-4 mb-8">
                    <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Quantity</span>
                    <div className="flex items-center bg-slate-100 rounded-full p-1 border border-slate-200">
                        <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-slate-600 transition-all shadow-sm font-bold text-lg"
                        >
                            -
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900">{quantity}</span>
                        <button
                            onClick={() => setQuantity(Math.min(product.count_in_stock, quantity + 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white text-slate-600 transition-all shadow-sm font-bold text-lg"
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
                        className="w-full h-14 text-lg font-bold shadow-lg shadow-sky-500/20 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 border-none"
                        disabled={product.count_in_stock === 0}
                    >
                        {addedToCart ? (
                            <span className="flex items-center gap-2">
                                <i className="fa-solid fa-share-nodes animate-ping text-xs"></i> Added!
                            </span>
                        ) : (
                            product.count_in_stock === 0 ? 'Out of Stock' : (
                                <span className="flex items-center gap-2">
                                    <i className="fa-solid fa-cart-shopping"></i> Add to Cart
                                </span>
                            )
                        )}
                    </Button>
                    <Button variant="outline" className="w-full h-12 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-semibold">
                        Buy Now
                    </Button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 mt-8 pt-8 border-t border-slate-100/50 text-center">
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-sky-50 group-hover:bg-sky-100 transition-colors flex items-center justify-center text-sky-600 mb-0.5">
                            <i className="fa-solid fa-truck"></i>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-tight">Fast<br />Delivery</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 group-hover:bg-emerald-100 transition-colors flex items-center justify-center text-emerald-600 mb-0.5">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-tight">2 Year<br />Warranty</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 group cursor-default">
                        <div className="w-10 h-10 rounded-full bg-orange-50 group-hover:bg-orange-100 transition-colors flex items-center justify-center text-orange-600 mb-0.5">
                            <i className="fa-solid fa-rotate-left"></i>
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide leading-tight">30 Day<br />Returns</span>
                    </div>
                </div>
            </GlassCard>
        </div>
    );
}
