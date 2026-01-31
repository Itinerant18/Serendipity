import { useState, useEffect } from 'react';

const useShopWithUs = () => {
    const [expandedCard, setExpandedCard] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [policies, setPolicies] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch policies from backend when component mounts
    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('/api/policies', {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch policies');
            }
            
            const data = await response.json();
            setPolicies(data);
        } catch (err) {
            console.error('Error fetching policies:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCardToggle = (cardType) => {
        if (isAnimating) return; // Prevent rapid toggling
        
        setIsAnimating(true);
        
        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50); // 50ms vibration
        }
        
        setTimeout(() => {
            setExpandedCard(prev => prev === cardType ? null : cardType);
            setIsAnimating(false);
        }, 300);
    };

    const handleCardClick = (action) => {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'shop_with_us_click', {
                'action_type': action,
                'user_engagement': expandedCard ? 'expanded_card' : 'collapsed_card'
            });
        }

        // Handle navigation based on action
        switch (action) {
            case 'shipping':
                navigateToPolicy('/shipping-policy');
                break;
            case 'payment':
                navigateToPolicy('/payment-methods');
                break;
            case 'returns':
                navigateToPolicy('/return-policy');
                break;
            case 'tracking':
                navigateToPolicy('/order-tracking');
                break;
            default:
                console.log(`Unknown action: ${action}`);
        }
    };

    const navigateToPolicy = (path) => {
        // Use React Router navigation when available
        if (window.location.pathname !== path) {
            window.location.href = path;
        }
    };

    const resetExpandedCard = () => {
        setExpandedCard(null);
    };

    // Policy data helpers
    const getShippingPolicy = () => {
        return policies?.shipping || {
            freeThreshold: 499,
            deliveryTime: '3-5 business days',
            trackingAvailable: true,
            expressDelivery: true,
            insuranceCoverage: 10000
        };
    };

    const getPaymentMethods = () => {
        return policies?.payments || {
            supportedMethods: ['razorpay', 'upi', 'credit_card', 'debit_card', 'net_banking'],
            secureGateway: true,
            twoFactorAuth: true,
            pciCompliant: true
        };
    };

    const getReturnPolicy = () => {
        return policies?.returns || {
            returnWindow: 30,
            freePickup: true,
            instantRefund: true,
            condition: 'original_packaging_required'
        };
    };

    return {
        // State
        expandedCard,
        isAnimating,
        policies,
        loading,
        error,
        
        // Actions
        handleCardToggle,
        handleCardClick,
        resetExpandedCard,
        
        // Policy helpers
        getShippingPolicy,
        getPaymentMethods,
        getReturnPolicy,
        
        // Analytics
        trackShopWithUsEngagement: (action, details) => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'shop_with_us_engagement', {
                    'action': action,
                    'details': details,
                    'timestamp': new Date().toISOString()
                });
            }
        }
    };
};

export default useShopWithUs;