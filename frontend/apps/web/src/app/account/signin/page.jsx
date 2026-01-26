"use client";

import { useState } from "react";
// FontAwesome icons loaded globally
import useAuth from "@/utils/useAuth";

export default function SignInPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const { signInWithCredentials, signInWithGoogle } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    // Basic email validation
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
        // Check if there's a redirect URL
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
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D7] via-[#FFF8F0] to-[#FAE5D3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-2">
          <a href="/" className="inline-flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping text-3xl text-[#D97534]"></i>
            <span className="font-playfair font-bold text-2xl text-[#8B4513]">Serendipity</span>
          </a>
        </div>

        {/* Portal badge so users know this is the customer area */}
        <div className="mb-4 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 font-inter">
            <span className="text-sm">🛒</span>
            Customer account
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair font-bold text-3xl text-[#8B4513] mb-2">
              Welcome Back
            </h1>
            <p className="font-inter text-gray-600">
              Sign in to your Serendipity account
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-envelope text-xl text-gray-400"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter transition-all"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-inter font-semibold text-sm text-gray-700">
                  Password
                </label>
                <a
                  href="/account/forgot-password"
                  className="text-xs text-[#D97534] hover:text-[#C86429] font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fa-solid fa-lock text-xl text-gray-400"></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter transition-all"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye-slash text-xl text-gray-400 hover:text-gray-600 transition-colors"></i>
                  ) : (
                    <i className="fa-solid fa-eye text-xl text-gray-400 hover:text-gray-600 transition-colors"></i>
                  )}
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
                className="h-4 w-4 text-[#D97534] focus:ring-[#D97534] border-gray-300 rounded cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 font-inter cursor-pointer">
                Keep me signed in
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-inter text-sm flex items-center gap-2">
                <i className="fa-solid fa-circle-exclamation text-base flex-shrink-0"></i>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-bold py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <i className="fa-solid fa-arrow-right text-xl"></i>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500 font-inter">or</span>
            </div>
          </div>

          {/* Social Login Buttons (Placeholders) */}
          <div className="space-y-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-inter font-medium hover:bg-gray-50 transition-colors"
              onClick={async () => {
                const result = await signInWithGoogle('customer');
                if (!result.success) {
                  setError(result.error);
                }
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="text-center font-inter text-sm text-gray-600 mt-6">
            Don't have an account?{" "}
            <a
              href="/account/signup"
              className="text-[#D97534] hover:text-[#C86429] font-semibold"
            >
              Create account
            </a>
          </p>

          {/* Seller Portal Link */}
          <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
            <div className="flex items-center justify-between gap-4">
              <div className="text-left">
                <p className="font-inter text-[11px] uppercase tracking-wide text-gray-400">
                  Sell on Serendipity
                </p>
                <p className="font-inter text-sm text-gray-600">
                  Manage products, orders & analytics in Seller Central.
                </p>
              </div>
              <a
                href="/seller/login"
                className="inline-flex items-center rounded-full bg-[#232F3E] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#1b2430] transition-colors"
              >
                Seller portal
                <i className="fa-solid fa-arrow-right text-xs ml-1"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-lock text-xs"></i>
            Secure Login
          </div>
          <div className="flex items-center gap-1">
            <i className="fa-solid fa-bag-shopping text-xs"></i>
            Trusted by millions
          </div>
        </div>
      </div>

    </div>
  );
}
