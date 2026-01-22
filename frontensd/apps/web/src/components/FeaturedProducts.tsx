"use client";

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "motion/react";
// Icons replaced with FontAwesome
import { cn } from "../lib/utils";

// --- Types ---
interface Product {
    id: number | string;
    name: string;
    price: number | string;
    image?: string;
    category?: string;
    rating?: number;
    reviews?: number;
}

interface FeaturedProductsProps {
    products?: Product[];
    title?: string;
    subtitle?: string;
    onAddToCart?: (product: Product) => void;
}

// --- Components ---

/**
 * Holographic 3D Tilt Card
 */
const HolographicCard = ({ product, isDestined, onAddToCart }: { product: Product; isDestined?: boolean; onAddToCart: (product: Product) => void }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const [imgSrc, setImgSrc] = useState(product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop");

    useEffect(() => {
        setImgSrc(product.image || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop");
    }, [product.image]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className={cn(
                "relative group h-[420px] w-full rounded-2xl p-6 flex flex-col justify-between transition-colors duration-500 cursor-pointer overflow-hidden",
                isDestined
                    ? "bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-purple-600/20 border-2 border-amber-400/50 shadow-[0_0_50px_-12px_rgba(251,191,36,0.5)]"
                    : "bg-white/5 border border-white/10 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/10"
            )}
        >
            {/* Holographic Sheen Layer */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.1) 25%, transparent 30%)",
                    filter: "blur(5px)",
                    transform: "translateZ(10px)"
                }}
            />

            {/* Destined Badge */}
            {isDestined && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-amber-400/90 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                >
                    <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                    DESTINY MATCH
                </motion.div>
            )}

            {/* Clickable Area for Navigation */}
            <Link to={`/product/${product.id}`} className="contents">
                {/* Product Image Area */}
                <div
                    className="relative flex-1 flex items-center justify-center -mt-6"
                    style={{ transform: "translateZ(30px)" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-cyan-500/5 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity" />
                    <img
                        src={imgSrc}
                        onError={() => setImgSrc("https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop")}
                        alt={product.name}
                        className="w-48 h-48 object-contain drop-shadow-xl group-hover:scale-110 transition-transform duration-500"
                    />
                </div>

                {/* Product Info Part 1 (Title/Category) */}
                <div style={{ transform: "translateZ(20px)" }}>
                    <div className="text-xs font-medium text-white/50 mb-1">{product.category || "General"}</div>
                    <h3 className="text-xl font-bold text-white leading-tight group-hover:text-purple-200 transition-colors">
                        {product.name}
                    </h3>
                </div>
            </Link>

            {/* Product Info Part 2 (Price & Action) */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10" style={{ transform: "translateZ(20px)" }}>
                <span className="text-2xl font-light text-white tracking-wide">
                    {typeof product.price === 'number' ? `₹${product.price}` : product.price}
                </span>
                <button
                    onClick={(e) => {
                        e.preventDefault(); // Prevent navigation when clicking 'Add to Cart'
                        e.stopPropagation();
                        onAddToCart(product);
                    }}
                    className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all z-20"
                >
                    <i className="fa-solid fa-cart-shopping text-sm"></i>
                </button>
            </div>
        </motion.div>
    );
};

/**
 * Matrix/Cyberpunk inspired "Destiny Scanner" Overlay
 */
const DestinyScanner = ({ active, onComplete }: { active: boolean; onComplete: () => void }) => {
    useEffect(() => {
        if (active) {
            const timer = setTimeout(onComplete, 3000); // 3 second scan
            return () => clearTimeout(timer);
        }
    }, [active, onComplete]);

    if (!active) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
        >
            <div className="text-center relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-4 border-t-purple-500 border-r-transparent border-b-cyan-500 border-l-transparent rounded-full mx-auto mb-8"
                />
                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse">
                    ANALYZING PREFERENCES...
                </h2>
                <div className="mt-4 text-cyan-500 font-mono text-sm tracking-widest">
                    SEARCHING FOR YOUR PERFECT MATCH
                </div>
            </div>

            {/* Scanlines */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[10%] w-full"
                animate={{ top: ["0%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
        </motion.div>
    );
};


export default function FeaturedProducts({ products = [], title = "The Serendipity Collection", subtitle = "Discover what the universe has chosen for you.", onAddToCart }: FeaturedProductsProps) {
    const [scanning, setScanning] = useState(false);
    const [destinyProduct, setDestinyProduct] = useState<number | string | null>(null);

    // Use a fallback set of products if the prop is empty or loading
    const displayProducts = products.length > 0 ? products : [
        { id: 101, name: "Quantum Headset X", price: 2499, category: "Audio", image: "" },
        { id: 102, name: "Neon Runner 2049", price: 8999, category: "Footwear", image: "" },
        { id: 103, name: "Cyberdeck Portable", price: 45000, category: "Tech", image: "" },
        { id: 104, name: "Holo-Lens V2", price: 32500, category: "Accessories", image: "" }
    ];

    const handleScan = () => {
        setScanning(true);
        setDestinyProduct(null); // Reset
    };

    const handleScanComplete = () => {
        setScanning(false);
        // Pick a random product as "Destiny"
        const randomId = displayProducts[Math.floor(Math.random() * displayProducts.length)].id;
        setDestinyProduct(randomId);

        // Smooth scroll to the destined product
        // In a real implementation this might use refs for more precision
    };

    return (
        <section className="relative py-24 px-4 overflow-hidden bg-zinc-950 min-h-[800px] flex flex-col justify-center">
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(76,29,149,0.2),rgba(9,9,11,1))]" />
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[100px] mix-blend-screen" />

            {/* Scanner Overlay */}
            <AnimatePresence>
                {scanning && <DestinyScanner active={scanning} onComplete={handleScanComplete} />}
            </AnimatePresence>

            <div className="max-w-[1600px] mx-auto w-full relative z-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-semibold tracking-wider mb-4"
                        >
                            <i className="fa-solid fa-wand-magic-sparkles text-xs"></i>
                            CURATED FOR THE CURIOUS
                        </motion.div>
                        <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6 leading-tight">
                            {title}
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-lg leading-relaxed">
                            {subtitle} Connect with rare finds and exclusive drops that aren't just bought, but discovered.
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleScan}
                            disabled={scanning}
                            className="relative group overflow-hidden px-8 py-4 bg-white text-black font-bold text-lg rounded-xl shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative flex items-center gap-3 z-10 group-hover:text-white transition-colors">
                                <i className="fa-solid fa-qrcode text-lg"></i>
                                {scanning ? "SCANNING..." : "FIND YOUR DESTINY"}
                            </span>
                        </motion.button>
                        <Link to="/products" className="text-sm font-medium text-white/50 hover:text-white flex items-center gap-2 transition-colors">
                            View Collection <i className="fa-solid fa-arrow-right text-sm"></i>
                        </Link>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayProducts.map((product, idx) => (
                        <HolographicCard
                            key={product.id || idx}
                            product={product}
                            isDestined={destinyProduct === product.id}
                            onAddToCart={(p) => {
                                console.log("Added to cart:", p.name);
                                if (onAddToCart) onAddToCart(p);
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}
