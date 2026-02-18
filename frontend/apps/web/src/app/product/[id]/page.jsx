"use client";

import { API_URL } from '@/lib/api';

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";
import useCartStore from "@/utils/cartStore";
import useWishlistStore from "@/utils/wishlistStore";
import useAuth from "@/utils/useAuth";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";

// Import New Components
import ProductHero from "@/components/product/ProductHero";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";
import ReviewSection from "@/components/reviews/ReviewSection";

const getValidImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return url.startsWith("/") ? url : `/${url}`;
};

export default function ProductPage() {
    const params = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const addToCartStore = useCartStore((state) => state.addToCart);

    // Data State
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [activeTab, setActiveTab] = useState("description"); // description, specs, reviews

    // Wishlist integration - use global store
    const { isInWishlist, addToWishlist, removeFromWishlist, fetchWishlist } = useWishlistStore();
    const isWishlisted = product ? isInWishlist(product?.id || params.id) : false;

    const toggleWishlist = () => {
        if (!isAuthenticated) {
            navigate('/account/signin');
            return;
        }
        if (!product) return;
        const productId = product.id || params.id;
        if (isInWishlist(productId)) {
            removeFromWishlist(productId);
        } else {
            // Add full product data to wishlist
            addToWishlist({
                id: productId,
                name: product.name,
                price: product.offer?.price || product.price,
                image: product.image,
                category: product.category,
                brand: product.brand
            });
        }
    };

    // Simplified scroll effect
    const targetRef = useRef(null);

    const videoRef = useRef(null);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
        // Fetch wishlist to sync heart icon state
        if (isAuthenticated) {
            fetchWishlist();
        }
    }, [params.id, isAuthenticated, fetchWishlist]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/products/${params.id}`);
            const data = await response.json();

            if (data && !data.error) {
                // Determine media list: Video first (if any), then images
                const media = [];
                if (data.video_url || data.videos?.[0]) {
                    media.push({ type: 'video', src: getValidImageUrl(data.video_url || data.videos[0]), poster: getValidImageUrl(data.image) });
                }
                const images = data.images && data.images.length > 0 ? data.images : [data.image];
                images.forEach(img => media.push({ type: 'image', src: getValidImageUrl(img) }));

                const mappedProduct = {
                    ...data,
                    product_id: data.id || params.id,
                    media: media,
                    image: getValidImageUrl(data.image), // Ensure main image is valid too
                    offer: {
                        price: data.price,
                        original_price: data.compare_at_price,
                        discount: data.compare_at_price > data.price
                            ? Math.round(((data.compare_at_price - data.price) / data.compare_at_price) * 100)
                            : 0
                    },
                    rating: data.rating || 4.5, // Fallback for aesthetic demo
                    num_reviews: data.num_reviews || 86,
                    details: {
                        Brand: data.brand || 'LuxuryBrand',
                        Category: data.category,
                        SKU: data.sku || 'N/A',
                        Weight: data.weight ? `${data.weight} kg` : null,
                        ...data.dimensions
                    }
                };
                setProduct(mappedProduct);
                setActiveMediaIndex(0); // Reset to first media
                fetchRelated(data.category, data.id);
            } else {
                setProduct(null);
            }
        } catch (error) {
            console.error("Error fetching product:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelated = async (category, currentId) => {
        try {
            const res = await fetch(`${API_URL}/api/products?limit=8`);
            const data = await res.json();
            if (data.products) {
                setRelatedProducts(data.products.filter(p => p.category === category && p.id !== currentId).slice(0, 4));
            }
        } catch (err) { console.error(err); }
    };

    const handleAddToCart = () => {
        if (!isAuthenticated) return navigate('/account/signin');

        const activeImg = product.media.find(m => m.type === 'image')?.src || product.image;
        const priceVal = typeof product.offer.price === 'string'
            ? parseFloat(product.offer.price.replace(/[^0-9.]/g, ''))
            : product.offer.price;

        for (let i = 0; i < quantity; i++) {
            addToCartStore({
                id: product.product_id,
                name: product.name,
                price: priceVal,
                image: activeImg
            });
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause();
            else videoRef.current.play();
            setIsPlaying(!isPlaying);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-white border-8 border-black">
            <div className="text-center">
                <div className="w-16 h-16 bg-yellow-400 border-4 border-black animate-brutalist-jitter mx-auto mb-4 flex items-center justify-center">
                    <i className="fa-solid fa-bolt text-2xl text-black"></i>
                </div>
                <p className="text-black font-bold bg-black px-4 py-2 border-4 border-white">LOADING PRODUCT...</p>
            </div>
        </div>
    );

    if (!product) return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white border-8 border-white">
            <div className="text-center">
                <div className="w-24 h-24 bg-red-500 border-4 border-black mb-4 mx-auto flex items-center justify-center">
                    <i className="fa-solid fa-exclamation-triangle text-4xl text-white"></i>
                </div>
                <h2 className="text-3xl font-bold bg-white text-black px-6 py-2 border-4 border-black mb-4">PRODUCT NOT FOUND</h2>
                <p className="text-lg text-white mb-6">The product you're looking for doesn't exist.</p>
                <a href="/products" className="inline-block px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all">
                    <i className="fa-solid fa-arrow-left mr-2"></i>
                    Back to Products
                </a>
            </div>
        </div>
    );

    const currentMedia = product.media[activeMediaIndex];

    return (
        <div className="min-h-screen bg-white border-8 border-black" ref={targetRef}>

            {/* --- HERO COMPONENT --- */}
            <ProductHero
                product={product}
                currentMedia={currentMedia}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                videoRef={videoRef}
            />

            {/* --- MAIN CONTENT --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Media Gallery & Details (7 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Media Selector (Thumbnails) */}
                        <GlassCard className="p-4 flex gap-4 overflow-x-auto custom-scrollbar" variant="elevated">
                            {product.media.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveMediaIndex(idx); setIsPlaying(true); }}
                                    className={cn(
                                        "relative shrink-0 w-24 h-24 overflow-hidden border-4 border-black transition-transform duration-100 hover:translate(-1px,-1px) hover:shadow-[4px_4px_0_#000000]",
                                        activeMediaIndex === idx ? "bg-yellow-400 border-black" : "bg-white border-black opacity-70 hover:opacity-100"
                                    )}
                                >
                                    {item.type === 'video' ? (
                                        <div className="w-full h-full bg-black/90 flex items-center justify-center">
                                            <i className="fa-solid fa-play text-white"></i>
                                        </div>
                                    ) : (
                                        <img src={item.src} alt="Thumbnail" className="w-full h-full object-cover" />
                                    )}
                                </button>
                            ))}
                        </GlassCard>

                        {/* Product Info Tabs */}
                        <GlassCard className="min-h-[400px] p-0 overflow-hidden" variant="elevated">
                            <div className="flex border-b-4 border-black">
                                {['description', 'specs', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-all relative border-4 border-black border-r-0 last:border-r-4",
                                            activeTab === tab
                                                ? "bg-yellow-400 text-black"
                                                : "bg-white text-black hover:bg-orange-500 hover:text-white"
                                        )}
                                    >
                                        {tab === 'specs' ? 'Specifications' : tab}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-1 bg-black"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>

                            <div className="p-8 lg:p-10">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'description' && (
                                        <motion.div
                                            key="desc"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="prose prose-sky max-w-none text-slate-600 leading-relaxed font-sans"
                                        >
                                            <h3 className="text-2xl font-heading font-bold text-slate-900 mb-6">{product.name}</h3>
                                            <div className="whitespace-pre-line text-lg">{product.description}</div>
                                        </motion.div>
                                    )}
                                    {activeTab === 'specs' && (
                                        <motion.div
                                            key="specs"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4"
                                        >
                                            {product.details && Object.entries(product.details).map(([key, val]) => val && (
                                                <div key={key} className="flex justify-between border-b border-slate-100 py-3">
                                                    <span className="font-medium text-slate-500">{key}</span>
                                                    <span className="font-semibold text-slate-900">{val}</span>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                    {/* Reviews */}
                                    {activeTab === 'reviews' && (
                                        <motion.div
                                            key="reviews"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                        >
                                            <ReviewSection
                                                productId={product.id || params.id}
                                                productTitle={product.name}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </GlassCard>
                    </div>

                    {/* Right Column: Sticky Product Details & Actions (5 cols) */}
                    <div className="lg:col-span-4 relative">
                        <ProductDetails
                            product={product}
                            isWishlisted={isWishlisted}
                            toggleWishlist={toggleWishlist}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            handleAddToCart={handleAddToCart}
                            addedToCart={addedToCart}
                        />
                    </div>

                </div>
            </div>

            {/* --- RELATED PRODUCTS --- */}
            <RelatedProducts products={relatedProducts} category={product.category} />

        </div>
    );
}
