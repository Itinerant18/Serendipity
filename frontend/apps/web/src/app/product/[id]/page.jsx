"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

import { cn } from "@/lib/utils";
import useCartStore from "@/utils/cartStore";
import useAuth from "@/utils/useAuth";
import GlassCard from "@/components/ui/GlassCard";
import Button from "@/components/ui/Button";

// Import New Components
import ProductHero from "@/components/product/ProductHero";
import ProductDetails from "@/components/product/ProductDetails";
import RelatedProducts from "@/components/product/RelatedProducts";

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
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [activeTab, setActiveTab] = useState("description"); // description, specs, reviews

    // Scroll Animations
    const targetRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    });
    // Adjust hero fade/scale based on scroll
    const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.1]);

    const videoRef = useRef(null);

    useEffect(() => {
        fetchProduct();
        window.scrollTo(0, 0);
    }, [params.id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${params.id}`);
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
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products?limit=8`);
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
        </div>
    );

    if (!product) return <div className="text-center py-20 text-xl text-slate-500">Product not found.</div>;

    const currentMedia = product.media[activeMediaIndex];

    return (
        <div className="min-h-screen bg-[#F0F9FF]" ref={targetRef}>

            {/* --- HERO COMPONENT --- */}
            <ProductHero
                product={product}
                currentMedia={currentMedia}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                videoRef={videoRef}
                opacity={heroOpacity}
                scale={heroScale}
            />

            {/* --- MAIN CONTENT (Overlapping Hero) --- */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                    {/* Left Column: Media Gallery & Details (7 cols) */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Media Selector (Thumbnails) */}
                        <GlassCard className="p-4 flex gap-4 overflow-x-auto custom-scrollbar bg-white/60 backdrop-blur-xl border-white/50 shadow-glass">
                            {product.media.map((item, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveMediaIndex(idx); setIsPlaying(true); }}
                                    className={cn(
                                        "relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all transform hover:scale-105",
                                        activeMediaIndex === idx ? "border-sky-500 shadow-md scale-105 ring-2 ring-sky-200" : "border-transparent opacity-70 hover:opacity-100"
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
                        <GlassCard className="min-h-[400px] p-0 bg-white/80 border-white/60 shadow-xl overflow-hidden">
                            <div className="flex border-b border-slate-100">
                                {['description', 'specs', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={cn(
                                            "flex-1 py-5 text-sm font-bold uppercase tracking-wider transition-all relative",
                                            activeTab === tab
                                                ? "text-sky-600 bg-sky-50/30"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                        )}
                                    >
                                        {tab === 'specs' ? 'Specifications' : tab}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500"
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
                                    {/* Reviews would go here */}
                                    {activeTab === 'reviews' && (
                                        <motion.div
                                            key="reviews"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="text-center py-12"
                                        >
                                            <p className="text-slate-400">Review system integration pending...</p>
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
                            toggleWishlist={() => setIsWishlisted(!isWishlisted)}
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
