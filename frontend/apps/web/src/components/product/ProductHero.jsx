import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";


export default function ProductHero({
    product,
    currentMedia,
    isPlaying,
    togglePlay,
    videoRef,
}) {
    if (!product || !currentMedia) return null;

    return (
        <div className="relative h-[60vh] w-full overflow-hidden bg-black border-b-8 border-white">
            <div className="absolute inset-0">
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
                        {/* Main Image */}
                        <img
                            src={currentMedia.src}
                            alt={product.name}
                            className="w-full h-full object-contain p-8"
                            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1560343076-ec343e42ac6e?q=80&w=800&auto=format&fit=crop"; }}
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
                {/* Brutalist Overlay Pattern */}
                <div className="absolute inset-0 bg-gradient-to-b from-yellow-400/20 via-transparent to-pink-500/20 z-20 pointer-events-none" />
            </div>

            {/* Hero Controls (Play/Pause for Video) */}
            {currentMedia.type === 'video' && (
                <button
                    onClick={togglePlay}
                    className="absolute bottom-8 right-8 z-20 w-16 h-16 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white border-4 border-black hover:border-white hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all duration-100"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                    <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'} text-xl`}></i>
                </button>
            )}

            {/* Breadcrumbs (Absolute Top) */}
            <div className="absolute top-8 left-0 w-full z-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-white font-bold bg-black border-4 border-white inline-block p-2">
                    <Link to="/" className="hover:text-yellow-400 transition-colors">HOME</Link>
                    <i className="fa-solid fa-chevron-right text-xs mx-2"></i>
                    <Link to={`/category/${product.category}`} className="hover:text-yellow-400 transition-colors uppercase">{product.category}</Link>
                    <i className="fa-solid fa-chevron-right text-xs mx-2"></i>
                    <span className="text-yellow-400 truncate max-w-[200px]">{product.name}</span>
                </div>
            </div>


        </div>
    );
}
