const express = require('express');
const asyncHandler = require('express-async-handler');
const { supabase, supabaseAdmin } = require('../config/supabase');

const router = express.Router();

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    res.status(401);
    throw new Error(error.message);
  }

  // Fetch user profile from users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name, mobile, is_admin, is_seller, seller_profile_id, avatar_url')
    .eq('id', data.user.id)
    .single();

  res.json({
    _id: data.user.id,
    name: profile ? profile.name : data.user.email,
    email: data.user.email,
    mobile: profile ? profile.mobile : null,
    isAdmin: profile ? profile.is_admin : false,
    isSeller: profile ? profile.is_seller : false,
    sellerProfileId: profile ? profile.seller_profile_id : null,
    avatar: profile ? profile.avatar_url : null,
    token: data.session.access_token,
  });
}));

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
  let { name, email, password, mobile } = req.body;

  // Validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  email = email.trim().toLowerCase();
  name = name.trim();
  mobile = mobile ? mobile.trim() : null;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address');
  }

  // Validate password strength
  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Validate mobile if provided
  if (mobile) {
    const mobileRegex = /^[0-9]{10,15}$/;
    if (!mobileRegex.test(mobile.replace(/[+\-\s]/g, ''))) {
      res.status(400);
      throw new Error('Please provide a valid mobile number');
    }
  }

  // Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('email')
    .eq('email', email)
    .single();

  if (existingUser) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  // Create user with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        mobile: mobile,
        isAdmin: false
      }
    }
  });

  if (error) {
    console.error('Supabase SignUp Error:', error);
    res.status(400);
    throw new Error(error.message);
  }

  // Update the users table with mobile number (if trigger doesn't handle it)
  if (data.user && mobile) {
    await supabaseAdmin
      .from('users')
      .update({ mobile: mobile, name: name })
      .eq('id', data.user.id);
  }

  if (data.user) {
    res.status(201).json({
      _id: data.user.id,
      name: name,
      email: email,
      mobile: mobile,
      isAdmin: false,
      isSeller: false,
      token: data.session ? data.session.access_token : null,
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
}));

// @route   POST /api/auth/seller-login
// @desc    Login seller (same as login but validates seller status)
// @access  Public
router.post('/seller-login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  // Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    res.status(401);
    throw new Error(error.message);
  }

  // Fetch user profile from users table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name, mobile, is_admin, is_seller, seller_profile_id, avatar_url')
    .eq('id', data.user.id)
    .single();

  // Check if user is a seller
  if (!profile || !profile.is_seller) {
    res.status(403);
    throw new Error('This account is not registered as a seller. Please register as a seller first.');
  }

  res.json({
    _id: data.user.id,
    name: profile.name || data.user.email,
    email: data.user.email,
    mobile: profile.mobile || null,
    isAdmin: profile.is_admin || false,
    isSeller: true,
    sellerProfileId: profile.seller_profile_id,
    avatar: profile.avatar_url || null,
    token: data.session.access_token,
  });
}));

module.exports = router;
