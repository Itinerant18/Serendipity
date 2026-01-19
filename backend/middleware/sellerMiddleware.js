const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseKey);

// Import seller database clients
const { supabaseSellerAdmin } = require('../config/supabaseSeller');

const protectSeller = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // This middleware should run AFTER the main 'protect' middleware
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, no user found');
            }

            // Re-fetch user from DB to get latest is_seller status
            const { data: user, error } = await supabaseAdmin
                .from('users')
                .select('is_seller, seller_profile_id')
                .eq('id', req.user.id)
                .single();

            if (error || !user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            let isSeller = user.is_seller || false;
            let sellerProfileId = user.seller_profile_id || null;

            // If not marked as seller in main DB, check seller database
            if (!isSeller || !sellerProfileId) {
                console.log(`Checking seller database for user ${req.user.id}...`);
                
                // Check seller database for existing profile
                const { data: sellerProfile, error: sellerError } = await supabaseSellerAdmin
                    ?.from('seller_profiles')
                    .select('id')
                    .eq('user_id', req.user.id)
                    .single();

                // PGRST116 = no rows found (normal if not a seller)
                if (sellerProfile && (!sellerError || sellerError.code === 'PGRST116')) {
                    console.log(`Found seller profile ${sellerProfile.id} for user ${req.user.id}`);
                    isSeller = true;
                    sellerProfileId = sellerProfile.id;

                    // Sync to main database - try to set seller_profile_id, but handle foreign key constraint error
                    const { error: updateError } = await supabaseAdmin
                        .from('users')
                        .update({
                            is_seller: true,
                            seller_profile_id: sellerProfile.id
                        })
                        .eq('id', req.user.id);

                    // If foreign key constraint fails (23503), just set is_seller without seller_profile_id
                    if (updateError && updateError.code === '23503') {
                        console.log('Foreign key constraint detected - setting is_seller only (dual database setup)');
                        const { error: fallbackError } = await supabaseAdmin
                            .from('users')
                            .update({
                                is_seller: true
                                // Don't set seller_profile_id - it exists in seller database, not main database
                            })
                            .eq('id', req.user.id);
                        
                        if (fallbackError) {
                            console.error('Failed to sync seller status (fallback):', fallbackError);
                        } else {
                            console.log('Successfully synced seller status (is_seller only)');
                        }
                    } else if (updateError) {
                        console.error('Failed to sync seller status:', updateError);
                    } else {
                        console.log('Successfully synced seller status to main database');
                    }
                }
            }

            if (!isSeller) {
                res.status(403);
                throw new Error('Not authorized as a Seller');
            }

            // Attach seller info
            req.seller = {
                profileId: sellerProfileId
            };

            // Also update req.user for consistency
            req.user.isSeller = true;
            req.user.sellerProfileId = sellerProfileId;

            next();
        } catch (error) {
            console.error('protectSeller error:', error);
            res.status(403).json({ message: error.message || 'Not authorized as seller' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protectSeller };
