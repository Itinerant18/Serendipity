import React, { useState, useEffect } from 'react';

const ShopWithUsBackground = ({ children, className = '' }) => {
    const [particlePositions, setParticlePositions] = useState([]);

    // Generate floating particles for background
    useEffect(() => {
        const particles = Array.from({ length: 8 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 40 + 20,
            duration: Math.random() * 20 + 10,
            delay: Math.random() * 5
        }));
        setParticlePositions(particles);
    }, []);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {/* Main background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-yellow-500/10 animate-gradient-shift"></div>
            
            {/* Floating geometric shapes */}
            <div className="absolute inset-0 pointer-events-none">
                {particlePositions.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute border-2 border-black animate-brutalist-float"
                        style={{
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            animationDuration: `${particle.duration}s`,
                            animationDelay: `${particle.delay}s`,
                            transform: `rotate(${particle.id * 45}deg)`,
                            opacity: 0.1
                        }}
                    >
                        {/* Different shapes based on particle ID */}
                        {particle.id % 3 === 0 && (
                            <div className="w-full h-full bg-yellow-400"></div>
                        )}
                        {particle.id % 3 === 1 && (
                            <div className="w-full h-full bg-pink-400 rounded-full"></div>
                        )}
                        {particle.id % 3 === 2 && (
                            <div className="w-full h-full bg-orange-400 transform rotate-45"></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Grid pattern overlay */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};

export default ShopWithUsBackground;