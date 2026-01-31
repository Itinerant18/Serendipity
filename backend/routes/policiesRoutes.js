// Shop With Us Section Policies API
// Provides policy data for the enhanced Shop With Us section

import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Mock policy data - in production, this would come from a database
const getPolicies = async () => {
    return {
        shipping: {
            freeThreshold: 499,
            deliveryTime: '3-5 business days',
            trackingAvailable: true,
            expressDelivery: true,
            insuranceCoverage: 10000,
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
        payments: {
            supportedMethods: ['razorpay', 'upi', 'credit_card', 'debit_card', 'net_banking'],
            secureGateway: true,
            twoFactorAuth: true,
            pciCompliant: true,
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
        returns: {
            returnWindow: 30,
            freePickup: true,
            instantRefund: true,
            condition: 'original_packaging_required',
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
        },
        trust: {
            sslCertified: true,
            buyerProtection: true,
            rating: 4.8,
            totalReviews: 12500,
            testimonials: [
                {
                    name: 'Priya Sharma',
                    location: 'Mumbai, Maharashtra',
                    rating: 5,
                    comment: 'Amazing shopping experience! Fast delivery and great customer service.'
                },
                {
                    name: 'Rahul Kumar',
                    location: 'Delhi, NCR',
                    rating: 5,
                    comment: 'Best prices online and authentic products. Highly recommended!'
                },
                {
                    name: 'Anita Nair',
                    location: 'Bangalore, Karnataka',
                    rating: 4,
                    comment: 'Easy returns and secure payments. Love brutalist design!'
                }
            ]
        }
    };
};

// GET /api/policies
router.get('/', asyncHandler(async (req, res) => {
    try {
        const policies = await getPolicies();
        res.status(200).json(policies);
    } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ message: 'Failed to fetch policies' });
    }
}));

// GET /api/policies/:section
router.get('/:section', asyncHandler(async (req, res) => {
    try {
        const { section } = req.params;
        const policies = await getPolicies();
        
        if (!policies[section]) {
            return res.status(404).json({ message: 'Policy section not found' });
        }
        
        res.status(200).json(policies[section]);
    } catch (error) {
        console.error('Error fetching policy section:', error);
        res.status(500).json({ message: 'Failed to fetch policy section' });
    }
}));

export default router;