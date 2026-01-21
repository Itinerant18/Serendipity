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

            // STRICT CHECK: Always verify against the actual seller database
            // The is_seller flag in the main DB is just a cache/claim, the source of truth is the seller DB.
            const { data: sellerProfile, error: sellerError } = await supabaseSellerAdmin
                ?.from('seller_profiles')
                .select('id')
                .eq('user_id', req.user.id)
                .single();

            const profileExists = sellerProfile && (!sellerError || sellerError.code === 'PGRST116') && sellerProfile.id;

            if (profileExists) {
                // Profile exists! Ensure is_seller is true in main DB (Syncing)
                if (!user.is_seller || user.seller_profile_id !== sellerProfile.id) {
                    console.log(`Syncing seller status: Profile found (${sellerProfile.id}), updating user record...`);
                    const { error: updateError } = await supabaseAdmin
                        .from('users')
                        .update({
                            is_seller: true,
                            seller_profile_id: sellerProfile.id
                        })
                        .eq('id', req.user.id);

                    if (updateError) console.error('Failed to sync positive seller status:', updateError);
                }

                // Attach seller info
                req.seller = {
                    profileId: sellerProfile.id
                };
                req.user.isSeller = true;
                req.user.sellerProfileId = sellerProfile.id;

                next();
            } else {
                // Profile DOES NOT exist. 
                // Checks if we need to revoke the status in the main DB
                if (user.is_seller) {
                    console.log(`Seller profile missing for user ${req.user.id}. Revoking seller status...`);
                    const { error: revokeError } = await supabaseAdmin
                        .from('users')
                        .update({
                            is_seller: false,
                            seller_profile_id: null
                        })
                        .eq('id', req.user.id);

                    if (revokeError) console.error('Failed to revoke seller status:', revokeError);
                }

                res.status(403);
                throw new Error('Not authorized as a Seller (Profile not found)');
            }

        } catch (error) {
            console.error('protectSeller error:', error);
            res.status(403).json({ message: error.message || 'Not authorized as seller' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protectSeller };
