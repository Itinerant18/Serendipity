import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


export default function ProductHero({
    product,
    currentMedia,
    isPlaying,
    togglePlay,
    videoRef,
    opacity,
    scale
}) {
    if (!product || !currentMedia) return null;

    return (
        <div className="relative h-[70vh] w-full overflow-hidden bg-gray-900 border-b-4 border-sky-500/20">
            <motion.div style={{ opacity, scale }} className="absolute inset-0">
                {currentMedia.type === 'video' ? (
                    <video
                        ref={videoRef}
                        src={currentMedia.src}
                        className="w-full h-full object-contain bg-black"
                        autoPlay
                        muted
                        loop
                        poster={currentMedia.poster}
                        playsInline
                    />
                ) : (
                    <>
                        {/* Blurred Background for Ambience */}
                        <div className="absolute inset-0 overflow-hidden">
                            <img
                                src={currentMedia.src}
                                alt="background blur"
                                className="w-full h-full object-cover blur-2xl opacity-50 scale-110"
                                onError={(e) => { e.target.style.display = 'none'; }}
                            />
                        </div>

                        {/* Main Image Contained */}
                        <img
                            src={currentMedia.src}
                            alt={product.name}
                            className="relative w-full h-full object-contain z-10 drop-shadow-2xl"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=800&auto=format&fit=crop"; }}
                        />
                    </>
                )}
                {/* Modern Gradient Overlay: Linear top-down + Radial for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-sky-50 via-transparent to-black/30 z-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent z-20 pointer-events-none" />
            </motion.div>

            {/* Hero Controls (Play/Pause for Video) */}
            {currentMedia.type === 'video' && (
                <button
                    onClick={togglePlay}
                    className="absolute bottom-24 right-8 z-20 w-14 h-14 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white border border-white/30 hover:bg-white/20 hover:scale-105 transition-all shadow-glass"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
                </button>
            )}

            {/* Breadcrumbs (Absolute Top) */}
            <div className="absolute top-24 left-0 w-full z-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-white/90 font-medium tracking-wide drop-shadow-md">
                    <Link to="/" className="hover:text-sky-300 transition-colors">Home</Link>
                    <i className="fa-solid fa-chevron-right text-[10px] opacity-70"></i>
                    <Link to={`/category/${product.category}`} className="hover:text-sky-300 transition-colors uppercase">{product.category}</Link>
                    <i className="fa-solid fa-chevron-right text-[10px] opacity-70"></i>
                    <span className="text-white truncate max-w-[200px] font-bold">{product.name}</span>
                </div>
            </div>


        </div>
    );
}
