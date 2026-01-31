// Personalization Engine for Shop With Us Section
// Dynamically customizes policy information based on user behavior, location, and preferences

class PersonalizationEngine {
    constructor() {
        this.userSegments = {
            firstTimeShopper: {
                priority: ['shipping', 'payment'],
                messaging: 'first_time',
                trustSignals: ['ssl_certified', 'secure_payment']
            },
            returningCustomer: {
                priority: ['returns', 'tracking'],
                messaging: 'returning_customer',
                trustSignals: ['order_history', 'loyalty_benefits']
            },
            highValueShopper: {
                priority: ['premium_shipping', 'exclusive_offers'],
                messaging: 'high_value',
                trustSignals: ['vip_support', 'price_matching']
            },
            priceSensitive: {
                priority: ['discounts', 'price_comparison'],
                messaging: 'price_sensitive',
                trustSignals: ['lowest_price_guarantee', 'transparent_pricing']
            },
            mobileFirst: {
                priority: ['app_download', 'mobile_exclusive'],
                messaging: 'mobile_first',
                trustSignals: ['touch_id', 'biometric_support']
            }
        };

        this.locationBasedRules = {
            'IN': {
                currency: 'INR',
                localPaymentMethods: ['upi', 'razorpay', 'phonepe'],
                shippingPreference: 'standard',
                culturalContext: 'indian_marketplace',
                trustFactors: ['cod_available', 'local_seller_verified']
            },
            'US': {
                currency: 'USD',
                localPaymentMethods: ['stripe', 'paypal', 'apple_pay'],
                shippingPreference: 'express',
                culturalContext: 'us_marketplace',
                trustFactors: ['seller_rating', 'buyer_protection']
            },
            'UK': {
                currency: 'GBP',
                localPaymentMethods: ['stripe', 'paypal', 'klarna'],
                shippingPreference: 'royal_mail',
                culturalContext: 'uk_marketplace',
                trustFactors: ['consumer_rights', 'data_protection']
            }
        };

        this.behavioralWeights = {
            policyViews: 0.3,
            policyExpands: 0.5,
            timeOnPage: 0.2,
            clickThroughs: 0.4,
            socialShares: 0.3,
            addToCartInteractions: 0.6,
            checkoutInitiation: 0.7
        };
    }

    analyzeUserBehavior(userId, analytics, orderHistory = []) {
        try {
            const behaviorScore = {
                engagement: 0,
                trustLevel: 0,
                priceSensitivity: 0,
                mobileUsage: 0,
                preferences: {}
            };

            // Analyze analytics for behavior patterns
            analytics.forEach(record => {
                const weights = this.behavioralWeights;
                
                switch (record.action_type) {
                    case 'view':
                        behaviorScore.engagement += weights.policyViews;
                        break;
                    case 'expand':
                        behaviorScore.engagement += weights.policyExpands;
                        break;
                    case 'click':
                        behaviorScore.engagement += weights.clickThroughs;
                        break;
                    case 'social_share':
                        behaviorScore.engagement += weights.socialShares;
                        break;
                }
            });

            // Analyze order history for preferences
            if (orderHistory && orderHistory.length > 0) {
                const recentOrders = orderHistory.slice(-10); // Last 10 orders
                const avgOrderValue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0) / recentOrders.length;
                
                // Price sensitivity analysis
                const priceVariance = Math.sqrt(
                    recentOrders.reduce((sum, order) => {
                        const mean = sum / recentOrders.length;
                        return sum + Math.pow((order.total || 0) - mean, 2);
                    }, 0) / recentOrders.length
                );
                
                behaviorScore.priceSensitivity = priceVariance > avgOrderValue * 0.2 ? 0.8 : 0.2;
                
                // Category preferences
                const categoryCounts = {};
                recentOrders.forEach(order => {
                    const category = order.category || 'unknown';
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                });
                
                behaviorScore.preferences.categoryPreferences = categoryCounts;
                
                // Mobile usage (mock data for now)
                behaviorScore.mobileUsage = 0.3; // Would come from device detection
            }

            // Determine user segment
            behaviorScore.trustLevel = behaviorScore.engagement > 0.7 ? 'high' : 
                                         behaviorScore.engagement > 0.4 ? 'medium' : 'low';
            
            let userSegment = 'firstTimeShopper';
            if (orderHistory.length > 3) userSegment = 'returningCustomer';
            if (avgOrderValue > 5000) userSegment = 'highValueShopper';
            if (behaviorScore.priceSensitivity > 0.6) userSegment = 'priceSensitive';
            if (behaviorScore.mobileUsage > 0.5) userSegment = 'mobileFirst';

            return {
                ...behaviorScore,
                userSegment,
                preferences: behaviorScore.preferences,
                avgOrderValue,
                recentOrders: recentOrders.slice(-5)
            };
        } catch (error) {
            console.error('Error analyzing user behavior:', error);
            return {
                engagement: 0,
                trustLevel: 'low',
                priceSensitivity: 0.5,
                mobileUsage: 0.3,
                preferences: {},
                userSegment: 'firstTimeShopper',
                avgOrderValue: 0,
                recentOrders: []
            };
        }
    }

    personalizePolicyContent(policy, userProfile, location = 'IN') {
        const rules = this.locationBasedRules[location] || this.locationBasedRules['IN'];
        const segment = this.userSegments[userProfile.userSegment] || this.userSegments.firstTimeShopper;
        
        const personalizedContent = {
            ...policy,
            title: this.personalizeTitle(policy.title, segment, userProfile, location),
            description: this.personalizeDescription(policy.description, segment, userProfile, location),
            content: this.personalizeContent(policy.content, segment, userProfile, location),
            callToAction: this.personalizeCallToAction(policy.title, segment, userProfile, location),
            trustSignals: this.generateTrustSignals(policy, segment, userProfile, location),
            urgencyIndicators: this.generateUrgencyIndicators(policy, segment, userProfile)
        };

        return personalizedContent;
    }

    personalizeTitle(originalTitle, segment, userProfile, location) {
        const rules = this.locationBasedRules[location] || {};
        
        switch (segment.messaging) {
            case 'first_time':
                return `Welcome to ${rules.region_name || 'Serendipity'}! ${originalTitle}`;
            case 'returning_customer':
                return `Welcome back! ${originalTitle} - Enhanced for you`;
            case 'high_value':
                return `VIP ${originalTitle} - Exclusive Benefits`;
            case 'price_sensitive':
                return `${originalTitle} - Price Match Guaranteed`;
            case 'mobile_first':
                return `${originalTitle} - Mobile Optimized`;
            default:
                return originalTitle;
        }
    }

    personalizeDescription(originalDescription, segment, userProfile, location) {
        const rules = this.locationBasedRules[location] || {};
        const preferences = userProfile.preferences || {};
        
        let personalizedDescription = originalDescription;
        
        // Add location-specific information
        if (rules.localPaymentMethods && preferences.paymentMethod) {
            const localMethod = rules.localPaymentMethods.find(method => 
                preferences.paymentMethod && preferences.paymentMethod.toLowerCase().includes(method.toLowerCase())
            );
            if (localMethod) {
                personalizedDescription += `\n\nPay with ${localMethod.toUpperCase()} for instant processing.`;
            }
        }
        
        // Add shipping preferences
        if (preferences.shippingSpeed && rules.shippingPreference) {
            personalizedDescription += `\n\n${rules.shippingPreference === 'express' ? 'Express' : 'Standard'} delivery available.`;
        }
        
        // Add value proposition based on segment
        switch (segment.messaging) {
            case 'first_time':
                personalizedDescription += `\n\nFirst-time buyer protections apply.`;
                break;
            case 'returning_customer':
                personalizedDescription += `\n\nLoyalty rewards available.`;
                break;
            case 'high_value':
                personalizedDescription += `\n\nVIP customer support guaranteed.`;
                break;
            case 'price_sensitive':
                personalizedDescription += `\n\nPrice match guarantee included.`;
                break;
        }
        
        return personalizedDescription;
    }

    personalizeContent(originalContent, segment, userProfile, location) {
        const content = typeof originalContent === 'string' ? 
            JSON.parse(originalContent) : originalContent;
        
        const personalizedContent = { ...content };
        
        // Customize based on location
        const rules = this.locationBasedRules[location] || {};
        if (rules.currency) {
            personalizedContent.currency = rules.currency;
        }
        
        // Customize based on user segment
        switch (segment.userSegment) {
            case 'high_value':
                personalizedContent.vip_benefits = true;
                personalizedContent.priority_support = true;
                break;
            case 'mobile_first':
                personalizedContent.mobile_optimized = true;
                personalizedContent.touch_friendly = true;
                break;
        }
        
        return JSON.stringify(personalizedContent);
    }

    personalizeCallToAction(policyTitle, segment, userProfile, location) {
        const preferences = userProfile.preferences || {};
        
        // Priority-based messaging
        const segmentConfig = this.userSegments[segment.userSegment] || this.userSegments.firstTimeShopper;
        const priorityPolicies = segmentConfig.priority;
        
        if (priorityPolicies.includes(policyTitle.toLowerCase().replace(/\s+/g, '_'))) {
            return 'Get Started Now - Priority Access';
        }
        
        // Location-based customization
        const rules = this.locationBasedRules[location] || {};
        if (rules.localPaymentMethods && rules.localPaymentMethods.includes('upi')) {
            return 'Pay with UPI - Instant Setup';
        }
        
        return 'Learn More - Enhanced for You';
    }

    generateTrustSignals(policy, segment, userProfile, location) {
        const rules = this.locationBasedRules[location] || {};
        const signals = [];
        
        // Base trust signals from policy
        if (policy.is_mandatory) {
            signals.push({
                icon: 'fa-shield-check',
                label: 'Required',
                description: 'Essential for all orders'
            });
        }
        
        // Segment-based signals
        const segmentConfig = this.userSegments[segment.userSegment] || this.userSegments.firstTimeShopper;
        signals.push(...(segmentConfig.trustSignals || []));
        
        // Location-based signals
        if (rules.trustFactors) {
            signals.push(...rules.trustFactors);
        }
        
        // Behavior-based signals
        if (userProfile.trustLevel === 'high') {
            signals.push({
                icon: 'fa-user-check',
                label: 'Verified Buyer',
                description: 'Excellent purchase history'
            });
        }
        
        return signals;
    }

    generateUrgencyIndicators(policy, segment, userProfile) {
        const indicators = [];
        const preferences = userProfile.preferences || {};
        
        // Time-sensitive policies
        if (policy.title.toLowerCase().includes('return')) {
            indicators.push({
                type: 'time_sensitive',
                icon: 'fa-clock',
                message: '30-day return window',
                urgency: 'medium'
            });
        }
        
        // Price-sensitive offers
        if (segment === 'priceSensitive' && policy.title.toLowerCase().includes('discount')) {
            indicators.push({
                type: 'limited_offer',
                icon: 'fa-fire',
                message: 'Limited time offer',
                urgency: 'high'
            });
        }
        
        // Location-specific urgency
        if (preferences.location === 'metro' && policy.title.toLowerCase().includes('express')) {
            indicators.push({
                type: 'fast_delivery',
                icon: 'fa-rocket',
                message: 'Same-day delivery available',
                urgency: 'medium'
            });
        }
        
        return indicators;
    }

    // Advanced personalization using machine learning concepts
    generateDynamicPersonalization(userId, currentContext = {}) {
        return {
            personalizedRanking: this.calculatePolicyRanking(userId, currentContext),
            adaptiveMessaging: this.generateAdaptiveMessaging(userId, currentContext),
            realTimeAdjustments: this.generateRealTimeAdjustments(userId, currentContext),
            predictiveOffers: this.generatePredictiveOffers(userId, currentContext)
        };
    }

    calculatePolicyRanking(userId, context) {
        // This would implement a simple scoring algorithm
        // based on user behavior, current session, and policy relevance
        return {
            algorithm: 'behavioral_scoring',
            weights: {
                user_history: 0.4,
                current_session: 0.3,
                policy_relevance: 0.3
            },
            refresh_interval: '24h'
        };
    }

    generateAdaptiveMessaging(userId, context) {
        // Dynamic message generation based on user behavior
        return {
            type: 'adaptive_content',
            approach: 'reinforcement_learning',
            message_templates: {
                high_engagement: 'Based on your shopping history...',
                price_sensitive: 'Compare with similar purchases...',
                returning_customer: 'Welcome back! As a valued customer...'
            }
        };
    }

    generateRealTimeAdjustments(userId, context) {
        // Real-time policy adjustments
        return {
            type: 'real_time_optimization',
            triggers: [
                'cart_abandonment',
                'price_comparison',
                'location_change',
                'seasonal_trends'
            ],
            adjustment_rules: {
                cart_abandonment: 'highlight_shipping_policy',
                price_comparison: 'show_price_match_guarantee',
                location_change: 'update_regional_policies',
                seasonal_trends: 'adjust_holiday_policies'
            }
        };
    }

    generatePredictiveOffers(userId, context) {
        // Predictive offer generation
        return {
            type: 'predictive_analytics',
            models: [
                'next_purchase_prediction',
                'price_sensitivity_score',
                'category_affinity',
                'optimal_discount_timing'
            ],
            confidence_threshold: 0.8
        };
    }
}

module.exports = PersonalizationEngine;