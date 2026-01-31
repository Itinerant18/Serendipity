// Create Shop With Us Tables via REST API - Simplified Version
// Creates tables one by one with simple data

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function createPolicyCategories() {
    console.log('Creating policy_categories table...');
    
    const { data, error } = await supabase
        .from('policy_categories')
        .insert([
            { name: 'Shipping and Delivery Policies', description: 'Shipping and Delivery Policies', icon: 'fa-truck', color_code: '#10B981', sort_order: 1, is_active: true },
            { name: 'Payment Security Methods', description: 'Payment Security Methods', icon: 'fa-lock', color_code: '#059669', sort_order: 2, is_active: true },
            { name: 'Returns', description: 'Return and Refund Policies', icon: 'fa-rotate-left', color_code: '#F97316', sort_order: 3, is_active: true },
            { name: 'Trust and Safety', description: 'Trust and Safety Indicators', icon: 'fa-shield-alt', color_code: '#84CC16', sort_order: 4, is_active: true }
        ]);

    if (error) {
        console.error('Error creating policy_categories:', error);
        throw error;
    }
    
    console.log('✅ policy_categories table created');
}

async function createShippingPolicies() {
    console.log('Creating shipping_policies table...');
    
    const { data, error } = await supabase
        .from('shipping_policies')
        .insert([{
            free_shipping_threshold: 499.00,
            express_delivery: true,
            standard_delivery_days: 5,
            express_delivery_days: 2
        }]);

    if (error) {
        console.error('Error creating shipping_policies:', error);
        throw error;
    }
    
    console.log('✅ shipping_policies table created');
}

async function createPaymentMethods() {
    console.log('Creating payment_methods table...');
    
    const { data, error } = await supabase
        .from('payment_methods')
        .insert([
            { name: 'Razorpay', gateway: 'razorpay', method_type: 'credit_card', is_active: true, processing_time: 'instant', transaction_fee_percent: 2.00 },
            { name: 'UPI', gateway: 'razorpay', method_type: 'upi', is_active: true, processing_time: 'instant', transaction_fee_percent: 0.00 },
            { name: 'Credit Card', gateway: 'razorpay', method_type: 'credit_card', is_active: true, processing_time: 'instant', transaction_fee_percent: 2.50 },
            { name: 'Debit Card', gateway: 'razorpay', method_type: 'debit_card', is_active: true, processing_time: 'instant', transaction_fee_percent: 2.50 },
            { name: 'Net Banking', gateway: 'razorpay', method_type: 'net_banking', is_active: true, processing_time: '2-3_days', transaction_fee_percent: 0.00 }
        }]);

    if (error) {
        console.error('Error creating payment_methods:', error);
        throw error;
    }
    
    console.log('✅ payment_methods table created');
}

async function createReturnPolicies() {
    console.log('Creating return_policies table...');
    
    const { data, error } = await supabase
        .from('return_policies')
        .insert([{
            return_window_days: 30,
            free_return_shipping: true,
            instant_refund: true,
            refund_processing_hours: 24,
            refund_method: 'original_payment',
            exchange_policy: '7_days',
            condition_requirements: 'original_packaging_required',
            customer_support_hours: '24/7'
        }]);

    if (error) {
        console.error('Error creating return_policies:', error);
        throw error;
    }
    
    console.log('✅ return_policies table created');
}

async function createRegionalSettings() {
    console.log('Creating regional_settings table...');
    
    const { data, error } = await supabase
        .from('regional_settings')
        .insert([{
            country_code: 'IN',
            region_name: 'India',
            currency: 'INR',
            tax_inclusive: true,
            special_holidays: '2026-01-26, 2026-03-14'
        }]);

    if (error) {
        console.error('Error creating regional_settings:', error);
        throw error;
    }
    
    console.log('✅ regional_settings table created');
}

async function createPolicyDetails() {
    console.log('Creating sample policy details...');
    
    // First get the categories
    const { data: categories } = await supabase
        .from('policy_categories')
        .select('id', 'name')
        .eq('is_active', true);
    
    const shippingCategory = categories.find(cat => cat.name === 'shipping');
    const paymentCategory = categories.find(cat => cat.name === 'payment');
    const returnsCategory = categories.find(cat => cat.name === 'returns');

    const { data, error } = await supabase
        .from('policy_details')
        .insert([
            {
                category_id: shippingCategory.id,
                title: 'Free Standard Shipping',
                description: 'Enjoy complimentary standard shipping on all orders over ₹499. Track your package in real-time with live updates.',
                icon: 'fa-shipping-fast',
                content: 'Free shipping on orders over ₹499 | Express delivery available | Real-time tracking | Insurance included',
                is_featured: true,
                is_mandatory: false
            },
            {
                category_id: paymentCategory.id,
                title: 'Secure Payment Processing',
                description: '100% secure payment gateway with multi-layer security',
                icon: 'fa-lock',
                content: 'Accept Razorpay, UPI, Credit Card, Debit Card | 2FA authentication | PCI compliant',
                is_featured: true,
                is_mandatory: false
            },
            {
                category_id: returnsCategory.id,
                title: '30-Day Hassle-Free Returns',
                description: 'Return any item within 30 days | Free pickup | Instant refunds | 24/7 customer support',
                icon: 'fa-rotate-left',
                content: 'Return in original packaging with refund processing in 24 hours',
                is_featured: true,
                is_mandatory: false
            }
        ]);

    if (error) {
        console.error('Error inserting policy details:', error);
        throw error;
    }
    
    console.log('✅ Sample policy details inserted');
}

async function runMigration() {
    try {
        console.log('Starting Shop With Us database migration via REST API...');
        
        await createPolicyCategories();
        await createShippingPolicies();
        await createPaymentMethods();
        await createReturnPolicies();
        await createRegionalSettings();
        await createPolicyDetails();
        
        console.log('✅ Shop With Us database migration completed successfully!');
        console.log('Database is now ready with:');
        console.log('- Structured policy tables');
        console.log('- Sample data for testing');
        console.log('- Regional settings for India');
        console.log('- Ready for enhanced Shop With Us features');
        console.log('- Real-time policy management system');
        
        return { success: true, message: 'Migration completed successfully via REST API' };
        
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