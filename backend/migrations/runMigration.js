// Database Migration Script for Shop With Us Section
// Runs the database schema creation

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

async function runMigration() {
    try {
        console.log('Starting Shop With Us database migration...');
        
        // Read and execute the schema
        const fs = require('fs');
        const path = require('path');
        const schemaPath = path.join(__dirname, 'clean_shop_schema.sql');
        
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('Executing schema:', schemaSql.substring(0, 100) + '...');
        
        // Execute each SQL statement separately
        const statements = schemaSql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`Executing statement ${i + 1}:`, statement.substring(0, 50) + '...');
            
            const { error } = await supabase.rpc('execute_sql', {
                sql: statement
            });
            
            if (error) {
                console.error('Error executing statement:', error);
                throw error;
            }
            
            console.log(`✅ Statement ${i + 1} executed successfully`);
        }
        
        console.log('✅ Shop With Us database migration completed successfully!');
        console.log('Tables created:');
        console.log('- policy_categories');
        console.log('- policy_details');
        console.log('- user_policy_preferences');
        console.log('- shipping_policies');
        console.log('- payment_methods');
        console.log('- return_policies');
        console.log('- regional_settings');
        console.log('- policy_analytics');
        console.log('- Row Level Security enabled');
        
        console.log('Sample data inserted for testing');
        
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