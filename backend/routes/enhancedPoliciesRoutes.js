// Enhanced Shop With Us Section Routes
// Integrates with database, personalization, and A/B testing

const express = require('express');
const asyncHandler = require('express-async-handler');
const { createClient } = require('@supabase/supabase-js');
const ShopWithUsService = require('../services/shopWithUsService');
const PersonalizationEngine = require('../services/personalizationEngine');
const ABTestingFramework = require('../services/abTestingFramework');
const ShopWithUsAnalytics = require('../services/shopWithUsAnalytics');

const router = express.Router();
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

const personalizationEngine = new PersonalizationEngine();
const abTestingFramework = new ABTestingFramework();
const analyticsService = new ShopWithUsAnalytics();

// Enhanced GET /api/policies - now with personalization
router.get('/', asyncHandler(async (req, res) => {
    try {
        const { user_id } = req.query;
        
        if (!user_id) {
            // Return default policies for non-authenticated users
            const defaultPolicies = await ShopWithUsService.getPersonalizedPolicies(null, req.headers['x-user-location']);
            return res.status(200).json({
                policies: defaultPolicies,
                userSegment: 'new',
                personalizationEnabled: false
            });
        }

        // Get personalized policies for authenticated users
        const [policies, personalization, experiments] = await Promise.all([
            ShopWithUsService.getPersonalizedPolicies(user_id, req.headers['x-user-location']),
            personalizationEngine.initializePersonalization(user_id, req.headers['user-agent'], req.headers['x-user-location']),
            ShopWithUsService.getActiveExperiments()
        ]);

        const enhancedPolicies = policies.map(policy => ({
            ...policy,
            personalizedContent: policy.personalizedContent || JSON.parse(policy.content),
            personalizationScore: personalization.personalizationScore || 0,
            abTestInfo: Object.keys(experiments).find(key => 
                experiments[key].userSegment && experiments[key].assignedVariant
            ) || null
        }));

        return res.status(200).json({
            policies: enhancedPolicies,
            userSegment: personalization.userSegment || 'new',
            personalizationEnabled: true,
            experiments,
            insights: await analyticsService.generateInsights(user_id)
        });
    } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ message: 'Failed to fetch policies' });
    }
}));

// GET /api/policies/:section - with real-time updates
router.get('/:section', asyncHandler(async (req, res) => {
    try {
        const { user_id, location = 'IN' } = req.query;
        const { section } = req.params;
        
        // Get real-time policy updates
        const policyUpdates = await ShopWithUsService.getLivePolicyUpdates(section, location);
        
        return res.status(200).json({
            section,
            policy: policyUpdates.policy,
            updates: policyUpdates.updates,
            lastUpdated: policyUpdates.lastUpdated,
            realTime: true
        });
    } catch (error) {
        console.error('Error fetching policy section:', error);
        res.status(500).json({ message: 'Failed to fetch policy section' });
    }
}));

// POST /api/policies/track - enhanced analytics tracking
router.post('/track', asyncHandler(async (req, res) => {
    try {
        const { user_id, event_type, data, experiment_info } = req.body;
        
        // Track user interaction
        const trackingResult = await analyticsService.trackEvent(user_id, event_type, data);
        
        // Track A/B test metrics if applicable
        if (experiment_info && experiment_info.experiment_name && experiment_info.variant) {
            await abTestingFramework.trackExperimentMetric(
                user_id,
                experiment_info.experiment_name,
                experiment_info.variant,
                experiment_info.metric || 'engagement',
                trackingResult.eventId,
                experiment_info.value || 1
            );
        }
        
        return res.status(200).json({
            success: true,
            trackingId: trackingResult.eventId,
            message: 'Event tracked successfully'
        });
    } catch (error) {
        console.error('Error tracking event:', error);
        res.status(500).json({ message: 'Failed to track event' });
    }
}));

// GET /api/policies/analytics/engagement - detailed engagement metrics
router.get('/analytics/engagement', asyncHandler(async (req, res) => {
    try {
        const { user_id, timeframe = '7d' } = req.query;
        
        const metrics = await analyticsService.getEngagementMetrics(user_id, timeframe);
        
        return res.status(200).json({
            metrics,
            timeframe,
            insights: analyticsService.analyzeMetrics(metrics, null, null),
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting engagement metrics:', error);
        res.status(500).json({ message: 'Failed to get engagement metrics' });
    }
}));

// GET /api/policies/analytics/conversion - conversion funnel analysis
router.get('/analytics/conversion', asyncHandler(async (req, res) => {
    try {
        const { user_id, timeframe = '30d' } = req.query;
        
        const metrics = await analyticsService.getConversionMetrics(user_id, timeframe);
        
        return res.status(200).json({
            metrics,
            timeframe,
            insights: analyticsService.analyzeMetrics(null, metrics, null),
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting conversion metrics:', error);
        res.status(500).json({ message: 'Failed to get conversion metrics' });
    }
}));

// GET /api/policies/analytics/performance - performance monitoring
router.get('/analytics/performance', asyncHandler(async (req, res) => {
    try {
        const { user_id, timeframe = '24h' } = req.query;
        
        const metrics = await analyticsService.getPerformanceMetrics(user_id, timeframe);
        
        return res.status(200).json({
            metrics,
            timeframe,
            insights: analyticsService.analyzeMetrics(null, null, metrics),
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting performance metrics:', error);
        res.status(500).json({ message: 'Failed to get performance metrics' });
    }
}));

// GET /api/policies/analytics/business - business intelligence
router.get('/analytics/business', asyncHandler(async (req, res) => {
    try {
        const { timeframe = '30d' } = req.query;
        
        const metrics = await analyticsService.getBusinessMetrics(timeframe);
        
        return res.status(200).json({
            metrics,
            timeframe,
            insights: analyticsService.analyzeMetrics(null, null, null),
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error getting business metrics:', error);
        res.status(500).json({ message: 'Failed to get business metrics' });
    }
}));

// POST /api/policies/personalize - dynamic personalization
router.post('/personalize', asyncHandler(async (req, res) => {
    try {
        const { user_id, preferences, location = 'IN' } = req.body;
        
        // Update user personalization preferences
        const result = await ShopWithUsService.updateUserPolicyPreferences(user_id, {
            policy_category_id: 'all',
            preferences,
            location_code: location,
            notification_preferences: {
                email: true,
                sms: preferences.email_enabled !== false,
                push: preferences.push_enabled !== false
            }
        });
        
        return res.status(200).json({
            success: result.success,
            message: result.success ? 'Personalization updated' : 'Failed to update personalization',
            preferences
        });
    } catch (error) {
        console.error('Error updating personalization:', error);
        res.status(500).json({ message: 'Failed to update personalization' });
    }
}));

// POST /api/policies/abtest - A/B testing management
router.post('/abtest', asyncHandler(async (req, res) => {
    try {
        const { user_id, test_config, action_type } = req.body;
        
        let result;
        
        switch (action_type) {
            case 'create':
                result = await abTestingFramework.createABTest(test_config);
                break;
            case 'results':
                result = await abTestingFramework.getABTestResults(test_config.name);
                break;
            case 'optimize':
                result = await abTestingFramework.optimizeExperiment(test_config.name);
                break;
            default:
                result = { error: 'Invalid action type' };
        }
        
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error in A/B testing:', error);
        res.status(500).json({ message: 'Failed to process A/B test' });
    }
}));

// WebSocket integration for real-time updates
router.ws('/realtime', asyncHandler(async (ws, req) => {
    // Handle real-time policy updates via WebSocket
    console.log('WebSocket connection established for real-time updates');
    
    ws.on('message', async (message) => {
        try {
            const { type, data, user_id } = JSON.parse(message);
            
            switch (type) {
                case 'subscribe':
                    // Subscribe to real-time policy updates
                    console.log(`User ${user_id} subscribed to policy updates`);
                    ws.send(JSON.stringify({
                        type: 'subscribed',
                        message: 'Successfully subscribed to real-time updates',
                        timestamp: new Date().toISOString()
                    }));
                    break;
                    
                case 'policy_update':
                    // Handle real-time policy updates
                    const updates = await ShopWithUsService.getLivePolicyUpdates(data.policy_id, data.location);
                    ws.send(JSON.stringify({
                        type: 'policy_update',
                        data: updates,
                        timestamp: new Date().toISOString()
                    }));
                    break;
                    
                case 'tracking_event':
                    // Real-time analytics tracking
                    await analyticsService.trackEvent(user_id, data.event_type, data);
                    break;
            }
        } catch (error) {
            console.error('Error in WebSocket message handling:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: error.message
            }));
        }
    });
    
    return ws;
}));

export default router;