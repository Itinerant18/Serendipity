"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "@/utils/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";

export default function SignInPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { isAuthenticated, hasHydrated, signInWithCredentials, signInWithGoogle } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      navigate(redirect, { replace: true });
    }
  }, [hasHydrated, isAuthenticated, navigate]);

  // Show loading while checking auth state
  if (!hasHydrated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-solid fa-spinner fa-spin text-4xl text-orange-500"></i>
          <span className="font-bold text-black">Loading...</span>
        </div>
      </div>
    );
  }

  // If authenticated, show nothing (redirect will happen)
  if (isAuthenticated) {
    return null;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const result = await signInWithCredentials({
        email: email.trim().toLowerCase(),
        password,
      });

      if (result.success) {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/';
        window.location.href = redirect;
      } else {
        setError(result.error || "Invalid email or password");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white border-8 border-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <a href="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-500 border-4 border-black flex items-center justify-center">
              <i className="fa-solid fa-bag-shopping text-2xl text-white"></i>
            </div>
            <span className="font-brutalist text-3xl text-black">SERENDIPITY</span>
          </a>
        </div>

        {/* Portal badge */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-2 bg-emerald-200 border-2 border-black px-4 py-1 text-xs font-bold text-emerald-800">
            <span>🛒</span> CUSTOMER ACCOUNT
          </span>
        </div>

        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="font-brutalist text-3xl text-black bg-yellow-200 border-2 border-black inline-block px-4 py-2 mb-2">
              WELCOME BACK
            </h1>
            <p className="font-bold text-black">Sign in to your account</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="pl-10 border-4 border-black font-bold"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-bold text-black border-2 border-black inline-block px-3 py-1">
                  PASSWORD
                </label>
                <a
                  href="/account/forgot-password"
                  className="text-sm font-bold text-orange-500 hover:text-pink-500 underline"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 border-4 border-black font-bold"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl text-gray-400`}></i>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-5 w-5 border-4 border-black text-orange-500 focus:ring-orange-500 cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-3 block font-bold text-black cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 text-white border-4 border-black p-4 font-bold flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-xl"></i>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-pink-500 text-white font-brutalist font-bold py-4 border-4 border-black shadow-[8px_8px_0_#000000] hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] transition-all duration-100 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xl"></i> SIGNING IN...
                </>
              ) : (
                <>
                  SIGN IN <i className="fa-solid fa-arrow-right text-xl"></i>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-4 border-black"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-white text-black font-bold border-2 border-black">OR</span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 border-4 border-black bg-white text-black font-bold hover:bg-blue-500 hover:text-white hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all duration-100"
              onClick={async () => {
                const result = await signInWithGoogle('customer');
                if (!result.success) {
                  setError(result.error);
                }
              }}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center font-bold text-black mt-6">
            Don't have an account?{" "}
            <a href="/account/signup" className="text-orange-500 hover:text-pink-500 underline">
              CREATE ACCOUNT
            </a>
          </p>

          {/* Seller Portal Link */}
          <div className="mt-6 pt-4 border-t-4 border-black">
            <div className="flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-bold text-xs uppercase tracking-wide text-gray-500">
                  Sell on Serendipity
                </p>
                <p className="font-bold text-sm text-black">
                  Manage products & orders
                </p>
              </div>
              <a
                href="/seller/login"
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 border-4 border-black font-bold hover:bg-orange-500 hover:translate(-2px,-2px) transition-all duration-100"
              >
                SELLER PORTAL <i className="fa-solid fa-arrow-right text-xs"></i>
              </a>
            </div>
          </div>
        </GlassCard>

        {/* Trust Badges */}
        <div className="mt-6 flex justify-center gap-6 text-sm font-bold text-black">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-lock text-orange-500"></i>
            SECURE LOGIN
          </div>
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping text-orange-500"></i>
            TRUSTED
          </div>
        </div>
      </div>
    </div>
  );
}
