"use client";

import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const { signUpWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpWithCredentials({
        email,
        password,
        name: name || undefined,
      });

      if (result.success) {
        window.location.href = "/";
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E4D7] via-[#FFF8F0] to-[#FAE5D3] flex items-center justify-center p-4">
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair font-bold text-3xl text-[#8B4513] mb-2">
              Join Mercado
            </h1>
            <p className="font-inter text-gray-600">
              Create your account to start shopping
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
                Name (optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter"
              />
            </div>

            <div>
              <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter"
                required
              />
            </div>

            <div>
              <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97534] focus:border-transparent font-inter"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-inter text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D97534] hover:bg-[#C86429] text-white font-inter font-bold py-3 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center font-inter text-sm text-gray-600 mt-6">
            Already have an account?{" "}
            <a
              href="/account/signin"
              className="text-[#D97534] hover:text-[#C86429] font-semibold"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>

      <style jsx global>{`
        .font-inter {
          font-family: 'Inter', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }
      `}</style>
    </div>
  );
}
