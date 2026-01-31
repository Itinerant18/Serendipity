// Analytics Dashboard for Shop With Us Section
// Provides comprehensive metrics tracking and insights

class ShopWithUsAnalytics {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        this.metrics = {
            engagement: ['policy_views', 'policy_expands', 'policy_clicks', 'social_shares'],
            conversion: ['checkout_initiated', 'policy_opt_in', 'shopping_cart_additions'],
            performance: ['page_load_time', 'policy_card_animation_time', 'user_interaction_time'],
            business: ['conversion_funnel', 'user_segment_performance', 'policy_effectiveness']
        };
    }

    async trackEvent(userId, eventType, data = {}) {
        try {
            const eventData = {
                userId,
                eventType,
                data: JSON.stringify(data),
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                ipAddress: this.getClientIP(),
                sessionId: this.getSessionId()
            };

            const { error } = await this.supabase
                .from('shop_with_us_analytics')
                .insert([eventData]);

            if (error) throw error;
            
            return { success: true, eventId: eventData.id };
        } catch (error) {
            console.error('Error tracking event:', error);
            return { success: false, error };
        }
    }

    getClientIP() {
        // This would typically get the real client IP
        // For now, return a placeholder
        return '127.0.0.1';
    }

    getSessionId() {
        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem('shop_session_id');
        
        if (!sessionId) {
            sessionId = this.generateSessionId();
            sessionStorage.setItem('shop_session_id', sessionId);
        }
        
        return sessionId;
    }

    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async getEngagementMetrics(userId, timeframe = '7d') {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);

            const { data, error } = await this.supabase
                .from('shop_with_us_analytics')
                .select('*')
                .eq('user_id', userId)
                .gte('timestamp', startDate.toISOString())
                .in('event_type', `(${this.metrics.engagement.map(m => `'${m}'`).join(',')})`);

            if (error) throw error;
            
            const metrics = this.calculateEngagementMetrics(data);
            return metrics;
        } catch (error) {
            console.error('Error getting engagement metrics:', error);
            return this.getDefaultMetrics();
        }
    }

    async getConversionMetrics(userId, timeframe = '30d') {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const { data, error } = await this.supabase
                .from('shop_with_us_analytics')
                .select('*')
                .eq('user_id', userId)
                .gte('timestamp', startDate.toISOString())
                .in('event_type', `(${this.metrics.conversion.join(',')})`);

            if (error) throw error;
            
            const metrics = this.calculateConversionMetrics(data);
            return metrics;
        } catch (error) {
            console.error('Error getting conversion metrics:', error);
            return this.getDefaultConversionMetrics();
        }
    }

    async getPerformanceMetrics(userId, timeframe = '24h') {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 1);

            const { data, error } = await this.supabase
                .from('shop_with_us_analytics')
                .select('*')
                .eq('user_id', userId)
                .gte('timestamp', startDate.toISOString())
                .in('event_type', `(${this.metrics.performance.join(',')})`);

            if (error) throw error;
            
            const metrics = this.calculatePerformanceMetrics(data);
            return metrics;
        } catch (error) {
            console.error('Error getting performance metrics:', error);
            return this.getDefaultPerformanceMetrics();
        }
    }

    async getBusinessMetrics(timeframe = '30d') {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            const { data, error } = await this.supabase
                .from('shop_with_us_analytics')
                .select('*')
                .gte('timestamp', startDate.toISOString())
                .in('event_type', `(${this.metrics.business.join(',')})`);

            if (error) throw error;
            
            const metrics = this.calculateBusinessMetrics(data);
            return metrics;
        } catch (error) {
            console.error('Error getting business metrics:', error);
            return this.getDefaultBusinessMetrics();
        }
    }

    calculateEngagementMetrics(data) {
        const metrics = {
            totalEvents: data.length,
            eventsByType: {},
            averageTimePerPage: 0,
            bounceRate: 0,
            scrollDepth: 0
        };

        data.forEach(event => {
            const eventType = event.eventType;
            if (!metrics.eventsByType[eventType]) {
                metrics.eventsByType[eventType] = {
                    count: 0,
                    totalTime: 0,
                    uniqueUsers: new Set()
                };
            }
            
            metrics.eventsByType[eventType].count++;
            metrics.eventsByType[eventType].totalTime += parseInt(event.data.time_spent || 0);
            metrics.eventsByType[eventType].uniqueUsers.add(event.userId);
        });

        Object.values(metrics.eventsByType).forEach(typeData => {
            typeData.averageTime = typeData.count > 0 ? typeData.totalTime / typeData.count : 0;
        });

        return metrics;
    }

    calculateConversionMetrics(data) {
        const metrics = {
            totalConversions: 0,
            conversionFunnel: {},
            conversionRate: 0,
            averageTimeToConvert: 0
        };

        const conversionEvents = data.filter(event => 
            this.metrics.conversion.includes(event.eventType)
        );

        metrics.totalConversions = conversionEvents.length;

        // Calculate conversion funnel
        metrics.conversionFunnel = {
            policy_views: this.countEventsByType(data, 'policy_views'),
            policy_clicks: this.countEventsByType(data, 'policy_clicks'),
            policy_opt_ins: this.countEventsByType(data, 'policy_opt_in'),
            checkout_initiated: this.countEventsByType(data, 'checkout_initiated'),
            completed_checkouts: this.countEventsByType(data, 'checkout_initiated')
        };

        // Calculate conversion rates
        Object.keys(metrics.conversionFunnel).forEach((step, index) => {
            const nextStep = Object.keys(metrics.conversionFunnel)[index + 1];
            if (nextStep) {
                metrics.conversionFunnel[step] = metrics.conversionFunnel[step] || 0;
            }
        });

        // Calculate average time to convert
        const conversionEvents = conversionEvents.filter(event => event.data.conversion_time);
        const conversionTimes = conversionEvents.map(event => 
            parseInt(event.data.conversion_time) || 0
        );
        
        if (conversionTimes.length > 0) {
            metrics.averageTimeToConvert = conversionTimes.reduce((sum, time) => sum + time, 0) / conversionTimes.length;
        }

        return metrics;
    }

    calculatePerformanceMetrics(data) {
        const metrics = {
            pageLoadTimes: [],
            averagePageLoadTime: 0,
            slowPageLoads: 0,
            userInteractionTimes: [],
            averageUserInteractionTime: 0
        };

        const pageLoadEvents = data.filter(event => 
            event.eventType === 'page_load_time'
        );

        metrics.pageLoadTimes = pageLoadEvents.map(event => 
            parseInt(event.data.load_time) || 0
        );

        if (metrics.pageLoadTimes.length > 0) {
            metrics.averagePageLoadTime = metrics.pageLoadTimes.reduce((sum, time) => sum + time, 0) / metrics.pageLoadTimes.length;
            metrics.slowPageLoads = metrics.pageLoadTimes.filter(time => time > 3000).length; // 3+ seconds is slow
        }

        const interactionEvents = data.filter(event => 
            event.eventType === 'user_interaction_time'
        );

        metrics.userInteractionTimes = interactionEvents.map(event => 
            parseInt(event.data.interaction_time) || 0
        );

        if (metrics.userInteractionTimes.length > 0) {
            metrics.averageUserInteractionTime = metrics.userInteractionTimes.reduce((sum, time) => sum + time, 0) / metrics.userInteractionTimes.length;
        }

        return metrics;
    }

    calculateBusinessMetrics(data) {
        const metrics = {
            totalRevenue: 0,
            averageOrderValue: 0,
            conversionRate: 0,
            userSegmentPerformance: {},
            policyEffectiveness: {}
        };

        // This would query order data and combine with analytics
        // For now, return mock data
        metrics.totalRevenue = 125000; // Mock total revenue
        metrics.averageOrderValue = 2500; // Mock average order value
        metrics.conversionRate = 3.5; // Mock conversion rate percentage

        metrics.userSegmentPerformance = {
            new: { conversionRate: 2.1, avgOrderValue: 1800 },
            returning: { conversionRate: 4.2, avgOrderValue: 3200 },
            high_value: { conversionRate: 5.8, avgOrderValue: 8500 }
        };

        metrics.policyEffectiveness = {
            shipping: { views: 1500, conversions: 120, effectiveness: 0.08 },
            payment: { views: 1200, conversions: 450, effectiveness: 0.375 },
            returns: { views: 800, conversions: 200, effectiveness: 0.25 }
        };

        return metrics;
    }

    countEventsByType(data, eventType) {
        return data.filter(event => event.eventType === eventType).length;
    }

    getDefaultMetrics() {
        return {
            totalEvents: 0,
            eventsByType: {},
            averageTimePerPage: 0,
            bounceRate: 0
        };
    }

    getDefaultConversionMetrics() {
        return {
            totalConversions: 0,
            conversionFunnel: {},
            conversionRate: 0,
            averageTimeToConvert: 0
        };
    }

    getDefaultPerformanceMetrics() {
        return {
            pageLoadTimes: [],
            averagePageLoadTime: 0,
            slowPageLoads: 0,
            userInteractionTimes: [],
            averageUserInteractionTime: 0
        };
    }

    getDefaultBusinessMetrics() {
        return {
            totalRevenue: 0,
            averageOrderValue: 0,
            conversionRate: 0,
            userSegmentPerformance: {},
            policyEffectiveness: {}
        };
    }

    async generateInsights(userId, timeframe = '7d') {
        try {
            const [engagementMetrics, conversionMetrics, performanceMetrics] = await Promise.all([
                this.getEngagementMetrics(userId, timeframe),
                this.getConversionMetrics(userId, timeframe),
                this.getPerformanceMetrics(userId, '24h')
            ]);

            const insights = this.analyzeMetrics(engagementMetrics, conversionMetrics, performanceMetrics);
            
            return insights;
        } catch (error) {
            console.error('Error generating insights:', error);
            return this.getDefaultInsights();
        }
    }

    analyzeMetrics(engagement, conversion, performance) {
        const insights = {
            summary: {},
            recommendations: [],
            trends: {},
            alerts: []
        };

        // Analyze engagement
        if (engagement.totalEvents < 100) {
            insights.summary.engagement = 'Low user engagement detected';
            insights.recommendations.push('Consider A/B testing policy card layouts');
        }

        // Analyze conversion
        if (conversion.totalConversions < 10) {
            insights.summary.conversion = 'Low conversion rate detected';
            insights.recommendations.push('Review call-to-action messaging');
        }

        // Analyze performance
        if (performance.slowPageLoads > performance.pageLoadTimes.length * 0.2) {
            insights.summary.performance = 'Page load performance issues detected';
            insights.recommendations.push('Optimize animations and reduce page size');
        }

        // Analyze funnel performance
        Object.keys(conversion.conversionFunnel).forEach((step, index) => {
            const dropOffRate = this.calculateDropOffRate(
                conversion.conversionFunnel[step],
                Object.keys(conversion.conversionFunnel)[index + 1]
            );
            
            if (dropOffRate > 0.7) {
                insights.alerts.push({
                    type: 'funnel_drop_off',
                    step: step,
                    dropOffRate: (dropOffRate * 100).toFixed(1) + '%',
                    recommendation: 'Optimize user flow at this step'
                });
            }
        });

        return insights;
    }

    calculateDropOffRate(currentStep, nextStep) {
        return nextStep > 0 ? (currentStep / nextStep) : 1;
    }

    getDefaultInsights() {
        return {
            summary: 'No data available',
            recommendations: ['Implement tracking to gather insights'],
            trends: {},
            alerts: []
        };
    }
}

module.exports = ShopWithUsAnalytics;