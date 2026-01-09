const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const protectSeller = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify token with Supabase Auth (or just trust the user ID decoded from custom JWT if consistent)
            // Since we migrated from JWT, we should stick to the existing authMiddleware pattern.
            // Let's assume authMiddleware attaches 'req.user'. 
            // We just need to check if req.user.is_seller is true.

            // However, we need to ensure req.user is populated. 
            // This middleware should run AFTER the main 'protect' middleware.

            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, no user found');
            }

            // Re-fetch user from DB to get latest is_seller status if not in token
            const { data: user, error } = await supabase
                .from('users')
                .select('is_seller, seller_profile_id')
                .eq('id', req.user.id)
                .single();

            if (error || !user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            if (!user.is_seller) {
                res.status(403);
                throw new Error('Not authorized as a Seller');
            }

            // Attach seller info
            req.seller = {
                profileId: user.seller_profile_id
            };

            next();
        } catch (error) {
            console.error(error);
            res.status(403).json({ message: error.message || 'Not authorized as seller' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protectSeller };
