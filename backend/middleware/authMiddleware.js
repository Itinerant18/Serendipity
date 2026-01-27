const asyncHandler = require('express-async-handler');
const { supabase, supabaseAdmin } = require('../config/supabase');
const { supabaseSellerAdmin } = require('../config/supabaseSeller');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new Error('Not authorized, token failed');
      }

      // Fetch user profile from public table (syncs with auth)
      const { data: profile } = await supabase
        .from('users')
        // Avoid pulling large/unused fields on every request
        .select('id, name, email, mobile, is_admin, is_seller, seller_profile_id, avatar_url')
        .eq('id', user.id)
        .single();

      const merged = { ...user, ...profile };

      // Check seller database if user doesn't have seller status set
      let isSeller = merged.isSeller ?? merged.is_seller ?? false;
      let sellerProfileId = merged.sellerProfileId ?? merged.seller_profile_id ?? null;

      if (!isSeller || !sellerProfileId) {
        // Check seller database for existing profile
        const { data: sellerProfile, error: sellerError } = await supabaseSellerAdmin
          ?.from('seller_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        // PGRST116 = no rows found (normal if not a seller)
        if (sellerProfile && (!sellerError || sellerError.code === 'PGRST116')) {
          isSeller = true;
          sellerProfileId = sellerProfile.id;

          // Sync to main database - try to set seller_profile_id, but handle foreign key constraint error
          // Since seller profiles are in a separate database, the foreign key may fail
          const { error: updateError } = await supabaseAdmin
            .from('users')
            .update({
              is_seller: true,
              seller_profile_id: sellerProfile.id
            })
            .eq('id', user.id);

          // If foreign key constraint fails (23503), just set is_seller without seller_profile_id
          if (updateError && updateError.code === '23503') {
            console.log('Foreign key constraint detected - setting is_seller only (dual database setup)');
            await supabaseAdmin
              .from('users')
              .update({
                is_seller: true
                // Don't set seller_profile_id - it exists in seller database, not main database
              })
              .eq('id', user.id);
          } else if (updateError) {
            console.error('Failed to sync seller status:', updateError);
          }
        }
      }

      // Normalize role flags & seller profile id to camelCase while preserving originals
      req.user = {
        ...merged,
        isAdmin: merged.isAdmin ?? merged.is_admin ?? false,
        isSeller: isSeller,
        sellerProfileId: sellerProfileId,
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, admin };
