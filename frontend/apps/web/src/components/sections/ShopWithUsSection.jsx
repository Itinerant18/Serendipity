import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const ShopCard = ({ 
    icon, 
    title, 
    description, 
    bgColor = 'bg-white',
    iconBgColor = 'bg-green-500',
    onClick,
    className = '',
    expanded = false,
    onToggle,
    details = null
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef(null);

    const handleClick = () => {
        if (onClick) onClick();
        if (onToggle) onToggle();
    };

    return (
        <div
            ref={cardRef}
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative border-4 border-black bg-white transition-all duration-150 cursor-pointer group ${
                isHovered 
                    ? 'scale-105 rotate-1 shadow-[12px_12px_0_#000000] translate(-2px,-2px)' 
                    : 'scale-100 rotate-0 shadow-[8px_8px_0_#000000] translate(0,0)'
            } ${expanded ? 'bg-orange-500 text-white' : ''} ${className}`}
        >
            {/* Card Content */}
            <div className="p-8">
                {/* Icon Container with Enhanced Animation */}
                <div className={`relative w-16 h-16 border-4 border-black flex items-center justify-center mb-6 transition-all duration-150 ${
                    isHovered || expanded ? `${iconBgColor} text-white scale-110` : 'bg-white text-black'
                } group-hover:animate-brutalist-pulse`}>
                    <i className={`fa-solid ${icon} text-2xl ${isHovered || expanded ? 'animate-bounce' : ''}`}></i>
                </div>
                
                {/* Title */}
                <h3 className={`font-brutalist text-xl mb-3 transition-all duration-150 ${
                    expanded ? 'text-white' : 'text-black'
                }`}>
                    {title}
                </h3>
                
                {/* Description */}
                <p className={`text-sm leading-relaxed transition-all duration-150 ${
                    expanded ? 'text-white' : 'text-gray-600'
                }`}>
                    {description}
                </p>

                {/* Expandable Details */}
                {expanded && details && (
                    <div className="mt-6 pt-6 border-t-4 border-black animate-brutalist-fadeIn">
                        <div className="space-y-3">
                            {details.map((detail, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <i className={`fa-solid ${detail.icon} text-orange-500 mt-1`}></i>
                                    <div>
                                        <h4 className="font-bold text-black">Why {title}?</h4>
                                        <p className="text-sm text-gray-600">{detail.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Call to Action */}
                <div className="mt-6">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClick) onClick();
                        }}
                        className={`w-full px-6 py-3 border-2 border-black font-bold transition-all duration-150 ${
                            expanded 
                                ? 'bg-black text-white hover:bg-pink-500 hover:border-white' 
                                : 'bg-orange-500 text-white hover:bg-yellow-400 hover:text-black hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_#000000]'
                        } hover-brutalist-sm`}
                    >
                        {expanded ? (
                            <>
                                <i className="fa-solid fa-times mr-2"></i>
                                CLOSE DETAILS
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-arrow-right mr-2"></i>
                                LEARN MORE
                            </>
                        )}
                    </button>
                </div>

                {/* Hover Overlay Effects */}
                <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${isHovered ? 'animate-brutalist-jitter' : ''}`} />
            </div>
        </div>
    );
};

const ShopWithUsSection = () => {
    const [expandedCard, setExpandedCard] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    const handleCardToggle = (cardType) => {
        setIsAnimating(true);
        setTimeout(() => {
            setExpandedCard(expandedCard === cardType ? null : cardType);
            setIsAnimating(false);
        }, 300);
    };

    const handleCardClick = (action) => {
        // Handle specific card actions
        if (action === 'shipping') {
            console.log('Navigate to shipping policy');
        } else if (action === 'payment') {
            console.log('Navigate to payment methods');
        } else if (action === 'returns') {
            console.log('Navigate to return policy');
        }
    };

    const shopCards = [
        {
            id: 'shipping',
            icon: 'fa-truck',
            title: 'FREE SHIPPING',
            description: 'Free shipping on orders over ₹499. Track your package in real-time with our advanced tracking system.',
            bgColor: 'bg-green-500',
            iconBgColor: 'bg-green-500',
            details: [
                {
                    icon: 'fa-shipping-fast',
                    text: 'Lightning-fast delivery across all major cities in India. Express delivery available for metro areas.'
                },
                {
                    icon: 'fa-map-marked-alt',
                    text: 'Real-time tracking with live updates. Get SMS notifications at every delivery step.'
                },
                {
                    icon: 'fa-box-open',
                    text: 'Secure packaging with quality checks. All items inspected before shipping.'
                },
                {
                    icon: 'fa-shield-alt',
                    text: 'Insurance coverage up to ₹10,000. Your purchases are protected from damage.'
                }
            ]
        },
        {
            id: 'payment',
            icon: 'fa-lock',
            title: 'SECURE PAYMENT',
            description: '100% secure payment processing with multiple payment options and instant verification.',
            bgColor: 'bg-blue-500',
            iconBgColor: 'bg-blue-500',
            details: [
                {
                    icon: 'fa-credit-card',
                    text: 'Accept all major credit/debit cards, UPI, wallets, and bank transfers.'
                },
                {
                    icon: 'fa-fingerprint',
                    text: '2FA authentication and biometric verification for enhanced security.'
                },
                {
                    icon: 'fa-user-shield',
                    text: 'PCI DSS compliant payment gateway. Your data is encrypted and protected.'
                },
                {
                    icon: 'fa-check-circle',
                    text: 'Instant payment confirmation. Get notified immediately upon successful transaction.'
                }
            ]
        },
        {
            id: 'returns',
            icon: 'fa-rotate-left',
            title: 'EASY RETURNS',
            description: '30-day hassle-free returns with pickup service from your doorstep.',
            bgColor: 'bg-orange-500',
            iconBgColor: 'bg-orange-500',
            details: [
                {
                    icon: 'fa-clock',
                    text: '30-day return window from delivery date. No questions asked returns policy.'
                },
                {
                    icon: 'fa-truck',
                    text: 'Free pickup service. We collect returns from your home or office.'
                },
                {
                    icon: 'fa-money-bill',
                    text: 'Instant refund processing. Refunds initiated within 24 hours of pickup.'
                },
                {
                    icon: 'fa-headset',
                    text: '24/7 customer support. Call, WhatsApp, or email assistance available.'
                }
            ]
        }
    ];

    return (
        <section className="mb-16 bg-slate-50 rounded-2xl p-8 md:p-12 border-4 border-black relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-pink-500/5 to-yellow-500/5 animate-gradient-shift"></div>
            
            {/* Section Header */}
            <div className="relative z-10 text-center mb-12">
                <h2 className="font-brutalist text-4xl text-black bg-black text-white px-8 py-4 inline-block animate-brutalist-bounce">
                    SHOP WITH CONFIDENCE
                </h2>
                <p className="text-lg text-gray-700 mt-4 max-w-2xl mx-auto">
                    Experience the ultimate shopping journey with our trusted services and commitment to excellence
                </p>
            </div>

            {/* Cards Grid */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {shopCards.map((card) => (
                    <ShopCard
                        key={card.id}
                        icon={card.icon}
                        title={card.title}
                        description={card.description}
                        bgColor={card.bgColor}
                        iconBgColor={card.iconBgColor}
                        onClick={() => handleCardClick(card.id)}
                        expanded={expandedCard === card.id}
                        onToggle={() => handleCardToggle(card.id)}
                        details={card.details}
                        className={`transform transition-all duration-300 ${
                            expandedCard === card.id 
                                ? 'scale-105 z-20' 
                                : 'scale-100 z-10'
                        }`}
                    />
                ))}
            </div>

            {/* Enhanced Trust Indicators */}
            <div className="relative z-10 mt-12 text-center">
                <div className="flex items-center justify-center gap-6 mb-8">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-certificate text-2xl text-yellow-500 animate-brutalist-pulse"></i>
                        <span className="font-bold text-black">SSL Certified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-shield-alt text-2xl text-green-500 animate-brutalist-float"></i>
                        <span className="font-bold text-black">Buyer Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-star text-2xl text-orange-500 animate-brutalist-jitter"></i>
                        <span className="font-bold text-black">4.8/5 Rating</span>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                    <Link 
                        to="/products"
                        className="inline-flex items-center gap-3 px-12 py-6 bg-orange-500 border-4 border-black text-white font-bold text-lg hover:bg-pink-500 hover:text-white hover:translate(-4px,-4px) hover:shadow-[12px_12px_0_#000000] transition-all duration-150 animate-brutalist-pulse"
                    >
                        <i className="fas fa-shopping-bag text-xl"></i>
                        <span>START SHOPPING NOW</span>
                        <i className="fas fa-arrow-right text-xl ml-2"></i>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default ShopWithUsSection;