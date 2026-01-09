const express = require('express');
const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/supabase');

const router = express.Router();

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // For login, we directly use Supabase Auth's signInWithPassword.
  // Supabase handles the existence check and password verification internally.
  // There's no separate "MongoDB check" equivalent needed here, as Supabase is the auth provider.
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    res.status(401);
    throw new Error(error.message);
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('name, is_admin, is_seller, seller_profile_id')
    .eq('id', data.user.id)
    .single();

  res.json({
    _id: data.user.id,
    name: profile ? profile.name : data.user.email,
    email: data.user.email,
    isAdmin: profile ? profile.is_admin : false,
    isSeller: profile ? profile.is_seller : false,
    sellerProfileId: profile ? profile.seller_profile_id : null,
    token: data.session.access_token,
  });
}));

router.post('/register', asyncHandler(async (req, res) => {
  let { name, email, password } = req.body;
  console.log('Register Request Body:', req.body);
  console.log('Email Type:', typeof email, 'Length:', email ? email.length : 'N/A');

  if (email) email = email.trim();
  const userExists = await supabase.from('users').select('email').eq('email', email).single();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        isAdmin: false // Default to false
      }
    }
  });

  if (error) {
    console.error('Supabase SignUp Error:', error);
    res.status(400);
    throw new Error(error.message);
  }

  // Note: The public.users table is populated by a trigger on auth.users insert
  // But we might need to wait for it or just return the data we have.
  // Ideally, we return the user info.

  if (data.user) {
    res.status(201).json({
      _id: data.user.id,
      name: name,
      email: email,
      isAdmin: false,
      token: data.session ? data.session.access_token : null, // Session might be null if email confirmation is required
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
}));

module.exports = router;
