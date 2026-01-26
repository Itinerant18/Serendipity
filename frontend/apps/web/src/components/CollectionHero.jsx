import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faLayerGroup } from "@fortawesome/free-solid-svg-icons";

export default function CollectionHero({ totalProducts, image = "https://images.unsplash.com/photo-1542060748-10c2872cdf8d?q=80&w=3456&auto=format&fit=crop" }) {
    return (
        <div className="relative w-full h-[50vh] min-h-[400px] rounded-3xl overflow-hidden mb-16 shadow-2xl shadow-sky-900/20 group">
            {/* Background Layer */}
            <div className="absolute inset-0">
                <img
                    src={image}
                    alt="Collection Background"
                    className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
            </div>

            {/* Decorative Glass Elements */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-sky-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] animate-pulse delay-1000" />

            {/* Content Container */}
            <div className="relative z-10 h-full flex flex-col justify-center px-8 md:px-16 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-2xl"
                >
                    {/* Breadcrumbs */}
                    <nav className="flex items-center text-sm font-semibold text-sky-200/80 mb-6 backdrop-blur-md bg-white/5 w-fit px-4 py-1.5 rounded-full border border-white/10">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="text-[10px] mx-3 opacity-60" />
                        <span className="text-white">All Products</span>
                    </nav>

                    {/* Main Heading */}
                    <div className="relative">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute -left-4 -top-4 w-16 h-16 bg-sky-500/20 rounded-full blur-xl" // Glow behind icon
                        />
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 backdrop-blur-md shadow-glass">
                                <FontAwesomeIcon icon={faLayerGroup} className="text-2xl text-white" />
                            </div>
                            <span className="text-sky-400 font-bold tracking-widest uppercase text-sm">Premium Selection</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-heading font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
                        Curated <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-white">Collection</span>
                    </h1>

                    <p className="text-xl text-slate-300 font-light leading-relaxed max-w-lg mb-8 border-l-2 border-orange-500 pl-6">
                        Discover <strong>{totalProducts}</strong> thoughtfully selected pieces designed to elevate your everyday experience.
                    </p>

                </motion.div>
            </div>

            {/* Scroll Indication */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
                <span className="text-[10px] uppercase tracking-widest text-white">Scroll to Explore</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
            </div>
        </div>
    );
}
