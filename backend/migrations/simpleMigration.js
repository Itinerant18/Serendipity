// Database Migration Script for Shop With Us Section
// Creates tables one by one

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function createTable(tableName, createSql) {
    try {
        console.log(`Creating table: ${tableName}`);
        const { error } = await supabase.rpc('sql', { sql: createSql });
        
        if (error) {
            console.error(`Error creating ${tableName}:`, error);
            throw error;
        }
        
        console.log(`✅ ${tableName} created successfully`);
    } catch (error) {
        console.error(`Failed to create ${tableName}:`, error);
        throw error;
    }
}

async function insertData(tableName, insertSql) {
    try {
        console.log(`Inserting data into ${tableName}`);
        const { error } = await supabase.rpc('sql', { sql: insertSql });
        
        if (error) {
            console.error(`Error inserting into ${tableName}:`, error);
            throw error;
        }
        
        console.log(`✅ Data inserted into ${tableName} successfully`);
    } catch (error) {
        console.error(`Failed to insert into ${tableName}:`, error);
        throw error;
    }
}

async function runMigration() {
    try {
        console.log('Starting Shop With Us database migration...');
        
        // Create tables
        await createTable('policy_categories', `
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
            )
        `);
        
        await createTable('policy_details', `
            CREATE TABLE IF NOT EXISTS policy_details (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category_id UUID REFERENCES policy_categories(id) ON DELETE CASCADE,
                title VARCHAR(200) NOT NULL,
                description TEXT,
                icon VARCHAR(50),
                content JSONB,
                conditions TEXT,
                is_featured BOOLEAN DEFAULT false,
                is_mandatory BOOLEAN DEFAULT false,
                valid_from TIMESTAMPTZ DEFAULT NOW(),
                valid_until TIMESTAMPTZ,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        
        await createTable('user_policy_preferences', `
            CREATE TABLE IF NOT EXISTS user_policy_preferences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
                policy_category_id UUID REFERENCES policy_categories(id) ON DELETE CASCADE,
                preferences JSONB,
                location_code VARCHAR(10),
                notification_preferences JSONB,
                is_opted_out BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        
        await createTable('shipping_policies', `
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
            )
        `);
        
        await createTable('payment_methods', `
            CREATE TABLE IF NOT EXISTS payment_methods (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(100) NOT NULL UNIQUE,
                gateway VARCHAR(50),
                method_type VARCHAR(50),
                is_active BOOLEAN DEFAULT true,
                requires_verification BOOLEAN DEFAULT false,
                processing_time VARCHAR(50),
                transaction_fee_percent DECIMAL(5,2) DEFAULT 0.00,
                min_amount DECIMAL(10,2) DEFAULT 0.00,
                max_amount DECIMAL(10,2) DEFAULT 0.00,
                supported_countries TEXT[],
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        
        await createTable('return_policies', `
            CREATE TABLE IF NOT EXISTS return_policies (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                return_window_days INTEGER DEFAULT 30,
                free_return_shipping BOOLEAN DEFAULT true,
                instant_refund BOOLEAN DEFAULT false,
                refund_processing_hours INTEGER DEFAULT 24,
                refund_method VARCHAR(50),
                exchange_policy VARCHAR(50),
                condition_requirements TEXT,
                customer_support_hours VARCHAR(50),
                restocking_fee BOOLEAN DEFAULT false,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        
        await createTable('regional_settings', `
            CREATE TABLE IF NOT EXISTS regional_settings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                country_code VARCHAR(10) PRIMARY KEY,
                region_name VARCHAR(100),
                currency VARCHAR(10),
                shipping_provider VARCHAR(100),
                tax_inclusive BOOLEAN DEFAULT true,
                special_holidays JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            )
        `);
        
        // Insert initial data
        await insertData('policy_categories', `
            INSERT INTO policy_categories (name, description, icon, color_code, sort_order) VALUES
            ('shipping', 'Shipping and Delivery Policies', 'fa-truck', '#10B981', 1, true),
            ('payment', 'Payment Security Methods', 'fa-lock', '#059669', 2, true),
            ('returns', 'Return and Refund Policies', 'fa-rotate-left', '#F97316', 3, true),
            ('trust', 'Trust and Safety Indicators', 'fa-shield-alt', '#84CC16', 4, true)
        `);
        
        await insertData('shipping_policies', `
            INSERT INTO shipping_policies (free_shipping_threshold, express_delivery, standard_delivery_days, express_delivery_days) VALUES
            (499.00, true, 5, 2)
        `);
        
        await insertData('payment_methods', `
            INSERT INTO payment_methods (name, gateway, method_type, is_active, processing_time, transaction_fee_percent, supported_countries) VALUES
            ('Razorpay', 'razorpay', 'credit_card', true, 'instant', 2.00, '["IN"]'),
            ('UPI', 'razorpay', 'upi', true, 'instant', 0.00, '["IN"]'),
            ('Credit Card', 'razorpay', 'credit_card', true, 'instant', 2.50, '["IN"]'),
            ('Debit Card', 'razorpay', 'debit_card', true, 'instant', 2.50, '["IN"]'),
            ('Net Banking', 'razorpay', 'net_banking', true, '2-3_days', 0.00, '["IN"]')
        `);
        
        await insertData('return_policies', `
            INSERT INTO return_policies (return_window_days, free_return_shipping, instant_refund, refund_processing_hours, condition_requirements, customer_support_hours) VALUES
            (30, true, true, true, 24, 'original_packaging_required', '24/7', false)
        `);
        
        await insertData('regional_settings', `
            INSERT INTO regional_settings (country_code, region_name, currency, tax_inclusive, special_holidays) VALUES
            ('IN', 'India', 'INR', true, '["2026-01-26", "2026-03-14"]')
        `);
        
        // Insert sample policy details
        await insertData('policy_details', `
            SELECT id FROM policy_categories WHERE name = 'shipping'
        `, `
            INSERT INTO policy_details (category_id, title, description, icon, content, is_featured, is_mandatory) VALUES
            ('$1', 'Free Standard Shipping', 'Enjoy complimentary standard shipping on all orders over ₹499. Track your package in real-time with live updates.', 'fa-shipping-fast', '{"threshold": 499, "delivery_time": "5-7 business days", "tracking": true, "insurance": true}', true, true)
        `);
        
        await insertData('policy_details', `
            SELECT id FROM policy_categories WHERE name = 'payment'
        `, `
            INSERT INTO policy_details (category_id, title, description, icon, content, is_featured, is_mandatory) VALUES
            ('$2', 'Secure Payment Processing', '100% secure payment gateway with multi-layer security. Accept all major payment methods including UPI, credit cards, and net banking.', 'fa-lock', '{"methods": ["razorpay", "upi", "credit_card", "debit_card"], "2fa": true, "pci_compliant": true}', true, true)
        `);
        
        await insertData('policy_details', `
            SELECT id FROM policy_categories WHERE name = 'returns'
        `, `
            INSERT INTO policy_details (category_id, title, description, icon, content, is_featured, is_mandatory) VALUES
            ('$3', '30-Day Hassle-Free Returns', 'Return any item within 30 days of delivery. Free pickup service available from your home. Instant refund processing within 24 hours of pickup.', 'fa-rotate-left', '{"window": 30, "free_pickup": true, "instant_refund": true, "condition": "original_packaging_required"}', true, true)
        `);
        
        console.log('✅ Shop With Us database migration completed successfully!');
        console.log('Database is now ready with:');
        console.log('- Structured policy tables');
        console.log('- Sample data for testing');
        console.log('- Regional settings for India');
        console.log('- Ready for enhanced Shop With Us features');
        
        return { success: true, message: 'Migration completed successfully' };
        
    } catch (error) {
        console.error('Migration failed:', error);
        return { success: false, error };
    }
}

// Run migration if called directly
if (require.main === module) {
    runMigration();
}

module.exports = { runMigration };