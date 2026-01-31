// Enhanced Shop With Us Policies Service
// Integrates with Supabase database for real policy management

const { createClient } = require('@supabase/supabase-js');
const PersonalizationEngine = require('./personalizationEngine');
const ABTestingFramework = require('./abTestingFramework');

class ShopWithUsService {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        this.personalizationEngine = new PersonalizationEngine();
        this.abTestingFramework = new ABTestingFramework();
    }

    async getActivePolicies(userId = null, userLocation = 'IN') {
        try {
            let query = `
                SELECT 
                    pc.id,
                    pc.name,
                    pc.description,
                    pc.icon,
                    pc.color_code,
                    pd.title,
                    pd.description,
                    pd.icon,
                    pd.content,
                    pd.is_featured,
                    pd.is_mandatory,
                    COALESCE(upp.preferences, '{}'::jsonb) as user_preferences,
                    COALESCE(rs.*, '{}'::jsonb) as regional_settings
                FROM policy_categories pc
                LEFT JOIN policy_details pd ON pc.id = pd.category_id AND pd.is_active = true
                LEFT JOIN user_policy_preferences upp ON pc.id = upp.policy_category_id AND upp.user_id = $1 AND upp.is_opted_out = false
                CROSS JOIN lateral (
                    SELECT jsonb_build_object(
                        'country_code', country_code,
                        'currency', currency,
                        'tax_inclusive', tax_inclusive
                    ) as regional_settings
                ) rs ON true
                WHERE pc.is_active = true
                ORDER BY pc.sort_order, pd.is_featured DESC, pd.created_at DESC
            `;

            if (userId) {
                const { data, error } = await this.supabase
                    .rpc('get_active_policies_for_user', {
                        p_user_id: userId
                    });

                if (error) throw error;
                return data;
            }

            // Default policies for non-logged in users
            const { data: policies } = await this.supabase
                .from('policy_details')
                .select(`
                    id,
                    category_id,
                    title,
                    description,
                    icon,
                    content,
                    is_featured,
                    is_mandatory
                `)
                .eq('is_active', true)
                .order('sort_order', { ascending: false });

            const { data: categories } = await this.supabase
                .from('policy_categories')
                .select('id, name, description, icon, color_code')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            // Merge categories with policies
            const mergedPolicies = categories.map(category => ({
                id: category.id,
                category_name: category.name,
                category_description: category.description,
                category_icon: category.icon,
                category_color: category.color_code,
                policies: policies.filter(policy => policy.category_id === category.id)
            }));

            return mergedPolicies;

        } catch (error) {
            console.error('Error fetching policies:', error);
            throw error;
        }
    }

    async trackUserInteraction(userId, policyId, actionType, userAgent, ipAddress) {
        try {
            const { error } = await this.supabase.rpc('track_policy_interaction', {
                p_user_id: userId,
                p_policy_id: policyId,
                p_action_type: actionType,
                p_user_agent: userAgent,
                p_ip_address: ipAddress
            });

            if (error) console.error('Error tracking interaction:', error);
        } catch (error) {
            console.error('Error in trackUserInteraction:', error);
        }
    }

    async getUserPolicyPreferences(userId) {
        try {
            const { data, error } = await this.supabase
                .from('user_policy_preferences')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return data || {};
        } catch (error) {
            console.error('Error fetching user preferences:', error);
            return {};
        }
    }

    async updateUserPolicyPreferences(userId, preferences) {
        try {
            const { error } = await this.supabase
                .from('user_policy_preferences')
                .upsert({
                    user_id: userId,
                    policy_category_id: preferences.policy_category_id,
                    preferences: preferences.preferences,
                    location_code: preferences.location_code,
                    notification_preferences: preferences.notification_preferences
                })
                .eq('user_id', userId);

            if (error) throw error;
            return { success: !error };
        } catch (error) {
            console.error('Error updating user preferences:', error);
            return { success: false, error };
        }
    }

    async getShippingPolicy(userLocation = 'IN') {
        try {
            const { data, error } = await this.supabase
                .from('shipping_policies')
                .select('*')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching shipping policy:', error);
            return {
                free_shipping_threshold: 499,
                express_delivery: true,
                standard_delivery_days: 5,
                express_delivery_days: 2,
                tracking_available: true,
                insurance_available: true
            };
        }
    }

    async getPaymentMethods() {
        try {
            const { data, error } = await this.supabase
                .from('payment_methods')
                .select('*')
                .eq('is_active', true)
                .order('sort_order', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error fetching payment methods:', error);
            return [];
        }
    }

    async getReturnPolicy() {
        try {
            const { data, error } = await this.supabase
                .from('return_policies')
                .select('*')
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error fetching return policy:', error);
            return {
                return_window_days: 30,
                free_return_shipping: true,
                instant_refund: true,
                refund_processing_hours: 24,
                condition_requirements: 'original_packaging_required',
                customer_support_hours: '24/7'
            };
        }
    }

    // Advanced Personalization Methods
    async getPersonalizedPolicies(userId, userLocation = 'IN') {
        try {
            const [userBehavior, userProfile] = await Promise.all([
                this.analyzeUserBehavior(userId),
                this.getUserProfile(userId)
            ]);

            const policies = await this.getActivePolicies(userId, userLocation);
            
            // Apply personalization engine to each policy
            const personalizedPolicies = policies.map(policy => ({
                ...policy,
                personalizedContent: this.personalizationEngine.personalizePolicyContent(
                    policy,
                    userProfile,
                    userLocation
                ),
                personalizationScore: this.calculatePersonalizationScore(
                    policy,
                    userBehavior,
                    userProfile
                )
            }));

            // Sort by personalization score
            personalizedPolicies.sort((a, b) => b.personalizationScore - a.personalizationScore);
            
            return personalizedPolicies;
        } catch (error) {
            console.error('Error getting personalized policies:', error);
            return [];
        }
    }

    async initializePersonalization(userId, userAgent, ipAddress) {
        try {
            // Initialize A/B testing for this user
            const experiments = await this.abTestingFramework.initializeUserExperiment(
                userId, 
                userAgent, 
                ipAddress
            );

            // Track personalization initialization
            await this.trackPersonalizationEvent(userId, 'personalization_initialized', experiments);

            return {
                experiments,
                personalizationScore: 0.5, // Initial score
                recommendations: this.generatePersonalizationRecommendations(experiments)
            };
        } catch (error) {
            console.error('Error initializing personalization:', error);
            return { error };
        }
    }

    async trackPersonalizationEvent(userId, eventType, data) {
        try {
            // Track personalization events for analytics
            const eventData = {
                userId,
                eventType,
                data,
                timestamp: new Date().toISOString(),
                personalizationVersion: '1.0'
            };

            // Store in analytics database
            console.log('Tracking personalization event:', eventData);
            
            return eventData;
        } catch (error) {
            console.error('Error tracking personalization event:', error);
            return { error };
        }
    }

    calculatePersonalizationScore(policy, userBehavior, userProfile) {
        let score = 0;
        
        // Factor in user engagement with policy type
        if (userBehavior.preferences && userBehavior.preferences[policy.category_name]) {
            score += 20;
        }
        
        // Factor in user segment
        if (userBehavior.userSegment === 'high_value') {
            score += 15;
        } else if (userBehavior.userSegment === 'returning_customer') {
            score += 10;
        }
        
        // Factor in user behavior score
        score += userBehavior.trustLevel * 10;
        
        // Factor in average order value
        if (userBehavior.avgOrderValue > 1000) {
            score += 15;
        }
        
        // Factor in price sensitivity
        if (userBehavior.priceSensitivity > 0.6) {
            score += 10;
        }
        
        return Math.min(score, 100);
    }

    generatePersonalizationRecommendations(experiments) {
        const recommendations = [];
        
        // Analyze active experiments
        Object.keys(experiments).forEach(experimentKey => {
            const experiment = experiments[experimentKey];
            
            if (experiment.userSegment === 'high_value') {
                recommendations.push({
                    type: 'experiment_optimization',
                    experiment: experimentKey,
                    recommendation: 'Use high-value personalization features',
                    priority: 'high'
                });
            }
        });
        
        // General recommendations based on experiments
        if (recommendations.length === 0) {
            recommendations.push({
                type: 'general',
                recommendation: 'Implement A/B testing for better optimization',
                priority: 'medium'
            });
        }
        
        return recommendations;
    }

    // Advanced A/B Testing Methods
    async createABTest(testConfig) {
        try {
            const experiment = this.abTestingFramework.createExperiment(
                testConfig.name,
                testConfig.variants,
                testConfig.trafficSplit,
                testConfig.targetMetric
            );

            console.log('Created A/B test:', experiment);
            return { success: true, experiment };
        } catch (error) {
            console.error('Error creating A/B test:', error);
            return { success: false, error };
        }
    }

    async getABTestResults(testName) {
        try {
            const results = await this.abTestingFramework.getExperimentResults(testName);
            const optimization = await this.abTestingFramework.optimizeExperiment(testName);
            const report = this.abTestingFramework.generateExperimentReport(testName);

            return {
                results,
                optimization,
                report,
                recommendations: optimization ? 
                    `Continue with ${optimization.recommendation} variant` : 
                    'No clear winner identified'
            };
        } catch (error) {
            console.error('Error getting A/B test results:', error);
            return { error };
        }
    }

    // Machine Learning Integration
    async getPredictiveOffers(userId, currentContext = {}) {
        try {
            // This would integrate with a machine learning service
            // For now, implement basic predictive logic
            const userBehavior = await this.analyzeUserBehavior(userId);
            const userProfile = await this.getUserProfile(userId);
            
            const predictions = this.personalizationEngine.generateDynamicPersonalization(userId, currentContext);
            
            return {
                predictions,
                confidence: 0.7,
                nextBestAction: predictions.adaptiveMessaging.message_templates?.[0] || 'Continue Shopping',
                riskFactors: this.calculateChurnRisk(userBehavior, userProfile)
            };
        } catch (error) {
            console.error('Error getting predictive offers:', error);
            return { error };
        }
    }

    calculateChurnRisk(userBehavior, userProfile) {
        let riskScore = 0;
        
        // Low engagement score increases churn risk
        if (userBehavior.engagement < 0.3) {
            riskScore += 30;
        }
        
        // No recent orders increases churn risk
        if (userBehavior.recentOrders.length === 0 && userProfile.userAge > 30) {
            riskScore += 20;
        }
        
        // High price sensitivity increases churn risk
        if (userBehavior.priceSensitivity > 0.7) {
            riskScore += 15;
        }
        
        return Math.min(riskScore, 100);
    }

    // Real-time Policy Updates
    async getLivePolicyUpdates(policyId, userLocation = 'IN') {
        try {
            // This would integrate with real-time policy update system
            // For now, return mock data
            return {
                policyId,
                updates: [
                    {
                        type: 'shipping_delay',
                        message: 'Due to high demand, delivery may take 1-2 extra days',
                        urgency: 'medium',
                        timestamp: new Date().toISOString()
                    }
                ],
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error getting live policy updates:', error);
            return { error };
        }
    }

    // Integration Methods
    async integrateAllServices(userId, userLocation = 'IN') {
        try {
            const [
                policies,
                personalization,
                experiments,
                predictiveOffers
            ] = await Promise.all([
                this.getPersonalizedPolicies(userId, userLocation),
                this.initializePersonalization(userId, navigator.userAgent, '127.0.0.1'),
                this.getPredictiveOffers(userId, { location: userLocation })
            ]);

            return {
                policies,
                personalization,
                experiments,
                predictiveOffers,
                integrationScore: this.calculateIntegrationScore(policies, personalization, experiments, predictiveOffers)
            };
        } catch (error) {
            console.error('Error integrating services:', error);
            return { error };
        }
    }

    calculateIntegrationScore(policies, personalization, experiments, predictiveOffers) {
        let score = 0;
        
        // Personalization increases score
        if (personalization && personalization.recommendations) {
            score += 25;
        }
        
        // Active experiments increase score
        if (experiments && Object.keys(experiments).length > 0) {
            score += 20;
        }
        
        // Predictive offers increase score
        if (predictiveOffers && predictiveOffers.confidence > 0.8) {
            score += 30;
        }
        
        // Policy coverage increases score
        if (policies && policies.length >= 4) {
            score += 25;
        }
        
        return Math.min(score, 100);
    }
}

module.exports = ShopWithUsService;