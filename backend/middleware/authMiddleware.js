const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/supabase');

const protect = asyncHandler(async (req, res, next) => {
  // MOCK AUTH FOR VERIFICATION
  if (false) {
    req.user = {
      id: '00000000-0000-0000-0000-000000000000',
      name: 'Mock Admin',
      email: 'admin@test.com',
      isAdmin: true
    };
    next();
    return;
  }


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
        .select('*')
        .eq('id', user.id)
        .single();

      const merged = { ...user, ...profile };

      // Normalize role flags & seller profile id to camelCase while preserving originals
      req.user = {
        ...merged,
        isAdmin: merged.isAdmin ?? merged.is_admin ?? false,
        isSeller: merged.isSeller ?? merged.is_seller ?? false,
        sellerProfileId: merged.sellerProfileId ?? merged.seller_profile_id ?? null,
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
