-- Supabase SQL Schema for Shop With Us Section Policies
-- This schema provides structured storage for shipping, payment, and return policies
-- that can be dynamically managed through admin panel and personalized for users

-- Policy Categories Table
CREATE TABLE IF NOT EXISTS policy_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color_code VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Details Table
CREATE TABLE IF NOT EXISTS policy_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES policy_categories(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    content JSONB, -- Store structured content for different policy types
    conditions TEXT,
    is_featured BOOLEAN DEFAULT false,
    is_mandatory BOOLEAN DEFAULT false,
    valid_from TIMESTAMPTZ DEFAULT NOW(),
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Policy Preferences Table
CREATE TABLE IF NOT EXISTS user_policy_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_category_id UUID REFERENCES policy_categories(id) ON DELETE CASCADE,
    preferences JSONB, -- Store user-specific policy choices
    location_code VARCHAR(10), -- User's location for regional policies
    notification_preferences JSONB, -- Email, SMS, push notifications
    is_opted_out BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipping Policies
CREATE TABLE IF NOT EXISTS shipping_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    free_shipping_threshold DECIMAL(10,2) DEFAULT 0.00,
    express_delivery BOOLEAN DEFAULT false,
    standard_delivery_days INTEGER DEFAULT 5,
    express_delivery_days INTEGER DEFAULT 2,
    international_shipping BOOLEAN DEFAULT false,
    tracking_available BOOLEAN DEFAULT true,
    insurance_available BOOLEAN DEFAULT true,
    max_insurance_amount DECIMAL(10,2) DEFAULT 10000.00,
    cash_on_delivery BOOLEAN DEFAULT false,
    pickup_available BOOLEAN DEFAULT false,
    return_pickup BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment Methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    gateway VARCHAR(50),
    method_type VARCHAR(50), -- 'credit_card', 'upi', 'wallet', 'net_banking'
    is_active BOOLEAN DEFAULT true,
    requires_verification BOOLEAN DEFAULT false,
    processing_time VARCHAR(50), -- 'instant', '2-3_days'
    transaction_fee_percent DECIMAL(5,2) DEFAULT 0.00,
    min_amount DECIMAL(10,2) DEFAULT 0.00,
    max_amount DECIMAL(10,2) DEFAULT 0.00,
    supported_countries TEXT[], -- Array of country codes
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Return Policies
CREATE TABLE IF NOT EXISTS return_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_window_days INTEGER DEFAULT 30,
    free_return_shipping BOOLEAN DEFAULT true,
    instant_refund BOOLEAN DEFAULT false,
    refund_processing_hours INTEGER DEFAULT 24,
    refund_method VARCHAR(50), -- 'original_payment', 'store_credit', 'bank_transfer'
    exchange_policy VARCHAR(50), -- '7_days', '14_days', 'no_exchange'
    condition_requirements TEXT, -- 'original_packaging', 'tags_attached', 'unused_condition'
    customer_support_hours VARCHAR(50), -- '24/7', 'business_hours'
    restocking_fee BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Regional Settings
CREATE TABLE IF NOT EXISTS regional_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code VARCHAR(10) PRIMARY KEY,
    region_name VARCHAR(100),
    currency VARCHAR(10),
    shipping_provider VARCHAR(100),
    tax_inclusive BOOLEAN DEFAULT true,
    special_holidays JSONB, -- Regional holidays affecting delivery times
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Policy Analytics
CREATE TABLE IF NOT EXISTS policy_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policy_details(id) ON DELETE CASCADE,
    action_type VARCHAR(50), -- 'view', 'expand', 'click', 'share'
    engagement_time INTEGER, -- Time spent on policy
    conversion_event VARCHAR(100), -- 'checkout', 'register', 'inquire'
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_policy_categories_active ON policy_categories(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_policy_details_category ON policy_details(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_policy_preferences_user ON user_policy_preferences(user_id, is_opted_out);
CREATE INDEX IF NOT EXISTS idx_policy_analytics_user_action ON policy_analytics(user_id, action_type, created_at);
CREATE INDEX IF NOT EXISTS idx_regional_settings_country ON regional_settings(country_code);

-- Insert initial data
INSERT INTO policy_categories (name, description, icon, color_code, sort_order) VALUES
('shipping', 'Shipping and Delivery Policies', 'fa-truck', '#10B981', 1, true),
('payment', 'Payment Security Methods', 'fa-lock', '#059669', 2, true),
('returns', 'Return and Refund Policies', 'fa-rotate-left', '#F97316', 3, true),
('trust', 'Trust and Safety Indicators', 'fa-shield-alt', '#84CC16', 4, true);

-- Insert initial shipping policy
INSERT INTO shipping_policies (free_shipping_threshold, express_delivery, standard_delivery_days, express_delivery_days) VALUES
(499.00, true, 5, 2);

-- Insert initial payment methods
INSERT INTO payment_methods (name, gateway, method_type, is_active, processing_time, transaction_fee_percent, supported_countries) VALUES
('Razorpay', 'razorpay', 'credit_card', true, 'instant', 2.00, '["IN"]'),
('UPI', 'razorpay', 'upi', true, 'instant', 0.00, '["IN"]'),
('Credit Card', 'razorpay', 'credit_card', true, 'instant', 2.50, '["IN"]'),
('Debit Card', 'razorpay', 'debit_card', true, 'instant', 2.50, '["IN"]'),
('Net Banking', 'razorpay', 'net_banking', true, '2-3_days', 0.00, '["IN"]');

-- Insert initial return policy
INSERT INTO return_policies (return_window_days, free_return_shipping, instant_refund, refund_processing_hours, condition_requirements, customer_support_hours) VALUES
(30, true, true, 24, 'original_packaging_required', '24/7', false);

-- Insert regional settings for India
INSERT INTO regional_settings (country_code, region_name, currency, tax_inclusive, special_holidays) VALUES
('IN', 'India', 'INR', true, '["2026-01-26", "2026-03-14"]');

-- Insert sample policy details
INSERT INTO policy_details (category_id, title, description, icon, content, is_featured, is_mandatory) VALUES
((SELECT id FROM policy_categories WHERE name = 'shipping'), 'Free Standard Shipping', 'Enjoy complimentary standard shipping on all orders over ₹499. Track your package in real-time with live updates.', 'fa-shipping-fast', '{"threshold": 499, "delivery_time": "5-7 business days", "tracking": true, "insurance": true}', true, true),
((SELECT id FROM policy_categories WHERE name = 'payment'), 'Secure Payment Processing', '100% secure payment gateway with multi-layer security. Accept all major payment methods including UPI, credit cards, and net banking.', 'fa-lock', '{"methods": ["razorpay", "upi", "credit_card", "debit_card"], "2fa": true, "pci_compliant": true}', true, true),
((SELECT id FROM policy_categories WHERE name = 'returns'), '30-Day Hassle-Free Returns', 'Return any item within 30 days of delivery. Free pickup service available from your home. Instant refund processing within 24 hours.', 'fa-rotate-left', '{"window": 30, "free_pickup": true, "instant_refund": true, "condition": "original_packaging_required"}', true, true);

-- Row Level Security (RLS) Policies
ALTER TABLE policy_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE policy_analytics ENABLE ROW LEVEL SECURITY;

-- Function to get active policies with user preferences
CREATE OR REPLACE FUNCTION get_active_policies_for_user(p_user_id UUID)
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR(100),
    category_description TEXT,
    category_icon VARCHAR(50),
    category_color VARCHAR(20),
    policy_title VARCHAR(200),
    policy_description TEXT,
    policy_icon VARCHAR(50),
    policy_content JSONB,
    is_featured BOOLEAN,
    is_mandatory BOOLEAN,
    user_preferences JSONB,
    regional_settings JSONB
) AS $$
BEGIN
    RETURN QUERY
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
    LEFT JOIN user_policy_preferences upp ON pc.id = upp.policy_category_id AND upp.user_id = p_user_id AND upp.is_opted_out = false
    CROSS JOIN lateral (
        SELECT jsonb_build_object(
            'country_code', country_code,
            'currency', currency,
            'tax_inclusive', tax_inclusive
        ) as regional_settings
    ) rs ON true
    WHERE pc.is_active = true
    ORDER BY pc.sort_order, pd.is_featured DESC, pd.created_at DESC;
END;
$$;

-- Function to track policy interactions
CREATE OR REPLACE FUNCTION track_policy_interaction(
    p_user_id UUID,
    p_policy_id UUID,
    p_action_type VARCHAR(50),
    p_engagement_time INTEGER DEFAULT 0,
    p_conversion_event VARCHAR(100),
    p_user_agent TEXT,
    p_ip_address INET
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO policy_analytics (
        user_id, 
        policy_id, 
        action_type, 
        engagement_time,
        conversion_event,
        user_agent,
        ip_address
    ) VALUES (
        p_user_id,
        p_policy_id,
        p_action_type,
        p_engagement_time,
        p_conversion_event,
        p_user_agent,
        p_ip_address
    );
END;
$$;