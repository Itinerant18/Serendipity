"use client";

import { useState, useEffect } from "react";
// FontAwesome icons loaded globally
import useAuth from "@/utils/useAuth";

export default function SignUpPage() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Validation states
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
  const [touched, setTouched] = useState({});

  const { signUpWithCredentials } = useAuth();

  // Password strength calculator
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: "", color: "" });
      return;
    }

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;

    const strengthLevels = [
      { score: 0, label: "", color: "" },
      { score: 1, label: "Very Weak", color: "bg-red-500" },
      { score: 2, label: "Weak", color: "bg-orange-500" },
      { score: 3, label: "Fair", color: "bg-yellow-500" },
      { score: 4, label: "Good", color: "bg-blue-500" },
      { score: 5, label: "Strong", color: "bg-green-500" }
    ];

    setPasswordStrength(strengthLevels[score] || strengthLevels[0]);
  }, [password]);

  // Validation helpers
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^[0-9]{10,15}$/.test(mobile.replace(/[+\-\s]/g, ''));
  const validateName = (name) => name.trim().length >= 2;

  const getFieldError = (field) => {
    if (!touched[field]) return null;

    switch (field) {
      case 'name':
        return !validateName(name) ? "Name must be at least 2 characters" : null;
      case 'email':
        return !validateEmail(email) ? "Please enter a valid email" : null;
      case 'mobile':
        return mobile && !validateMobile(mobile) ? "Please enter a valid mobile number" : null;
      case 'password':
        return password.length < 6 ? "Password must be at least 6 characters" : null;
      case 'confirmPassword':
        return password !== confirmPassword ? "Passwords do not match" : null;
      default:
        return null;
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Mark all fields as touched
    setTouched({ name: true, email: true, mobile: true, password: true, confirmPassword: true });

    // Validation
    if (!validateName(name)) {
      setError("Please enter your full name");
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (mobile && !validateMobile(mobile)) {
      setError("Please enter a valid mobile number");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const result = await signUpWithCredentials({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        mobile: mobile ? mobile.trim() : undefined
      });

      if (result.success) {
        window.location.href = "/";
      } else {
        setError(result.error || "Registration failed");
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const InputField = ({ icon, label, type, value, onChange, placeholder, field, required = true }) => {
    const fieldError = getFieldError(field);
    const isValid = touched[field] && !fieldError && value;

    return (
      <div>
        <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className={`fa-solid ${icon} text-xl ${fieldError ? 'text-red-400' : isValid ? 'text-green-500' : 'text-gray-400'}`}></i>
          </div>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onBlur={() => setTouched(prev => ({ ...prev, [field]: true }))}
            placeholder={placeholder}
            className={`w-full pl-10 pr-10 py-3 rounded-lg border ${fieldError
              ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
              : isValid
                ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                : 'border-gray-300 focus:ring-[#D97534] focus:border-[#D97534]'
              } focus:outline-none focus:ring-2 font-inter transition-all`}
            required={required}
          />
          {touched[field] && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {fieldError ? (
                <i className="fa-solid fa-xmark text-xl text-red-500"></i>
              ) : value ? (
                <i className="fa-solid fa-check text-xl text-green-500"></i>
              ) : null}
            </div>
          )}
        </div>
        {fieldError && (
          <p className="mt-1 text-xs text-red-500 font-inter">{fieldError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-green-50 border-8 border-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <a href="/" className="inline-flex items-center gap-2">
            <i className="fa-solid fa-bag-shopping text-3xl text-[#D97534]"></i>
            <span className="font-playfair font-bold text-2xl text-[#8B4513]">Serendipity</span>
          </a>
        </div>

        <div className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] p-8">
          <div className="text-center mb-8">
            <h1 className="font-playfair font-bold text-3xl text-[#8B4513] mb-2">
              Create Account
            </h1>
            <p className="font-inter text-gray-600">
              Join Serendipity and start shopping today
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <InputField
              icon="fa-user"
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              field="name"
            />

            <InputField
              icon="fa-envelope"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              field="email"
            />

            <InputField
              icon="fa-phone"
              label="Mobile Number"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="+91 9876543210"
              field="mobile"
              required={false}
            />

            {/* Password Field with Strength Indicator */}
            <div>
              <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className={`fa-solid fa-lock text-xl ${getFieldError('password') ? 'text-red-400' : 'text-gray-400'}`}></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  placeholder="At least 6 characters"
className={`w-full pl-10 pr-10 py-3 border-4 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-pink-500 focus:bg-yellow-200 transition-transform duration-100 ${getFieldError('password')
                      ? 'border-red-500'
                      : ''
                      }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <i className="fa-solid fa-eye-slash text-xl text-gray-400 hover:text-gray-600"></i>
                  ) : (
                    <i className="fa-solid fa-eye text-xl text-gray-400 hover:text-gray-600"></i>
                  )}
                </button>
              </div>

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-all ${level <= passwordStrength.score
                          ? passwordStrength.color
                          : 'bg-gray-200'
                          }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-medium ${passwordStrength.score <= 2 ? 'text-red-500' :
                      passwordStrength.score === 3 ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                      {passwordStrength.label}
                    </span>
                    <div className="text-xs text-gray-400 space-x-2">
                      <span className={password.length >= 8 ? 'text-green-500' : ''}>8+ chars</span>
                      <span className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>A-Z</span>
                      <span className={/[0-9]/.test(password) ? 'text-green-500' : ''}>0-9</span>
                    </div>
                  </div>
                </div>
              )}
              {getFieldError('password') && (
                <p className="mt-1 text-xs text-red-500 font-inter">{getFieldError('password')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-inter font-semibold text-sm text-gray-700 mb-2">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className={`fa-solid fa-lock text-xl ${getFieldError('confirmPassword') ? 'text-red-400' : confirmPassword && password === confirmPassword ? 'text-green-500' : 'text-gray-400'}`}></i>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                  placeholder="Re-enter your password"
className={`w-full pl-10 pr-10 py-3 border-4 border-black bg-white text-black font-bold focus:outline-none focus:ring-0 focus:border-pink-500 focus:bg-yellow-200 transition-transform duration-100 ${getFieldError('confirmPassword')
                        ? 'border-red-500'
                        : ''
                        }`}
                  required
                />
                {touched.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {getFieldError('confirmPassword') ? (
                      <i className="fa-solid fa-xmark text-xl text-red-500"></i>
                    ) : confirmPassword && password === confirmPassword ? (
                      <i className="fa-solid fa-check text-xl text-green-500"></i>
                    ) : null}
                  </div>
                )}
              </div>
              {getFieldError('confirmPassword') && (
                <p className="mt-1 text-xs text-red-500 font-inter">{getFieldError('confirmPassword')}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-inter text-sm flex items-center gap-2">
                <i className="fa-solid fa-xmark text-base flex-shrink-0"></i>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-brutalist font-bold py-3 border-4 border-black transition-transform duration-100 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <i className="fa-solid fa-arrow-right text-xl"></i>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-inter text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/account/signin"
                className="text-[#D97534] hover:text-[#C86429] font-semibold"
              >
                Sign in
              </a>
            </p>
          </div>

          {/* Seller Registration Link */}
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <p className="font-inter text-sm text-gray-500">
              Want to sell on Serendipity?{" "}
              <a
                href="/seller/signup"
                className="text-[#8B4513] hover:text-[#D97534] font-semibold"
              >
                Become a Seller →
              </a>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
