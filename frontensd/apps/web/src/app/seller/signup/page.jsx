"use client";

import { useState, useEffect } from "react";
// FontAwesome icons loaded globally
import useAuth from "@/utils/useAuth";
import { useNavigate } from "react-router-dom";

export default function SellerSignupPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { user, setUser, setToken, setIsAuthenticated, token } = useAuth();

    // Check if user is already authenticated (e.g., from Google login)
    useEffect(() => {
        if (user) {
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.mobile) setMobile(user.mobile);
            if (user.isSeller) {
                navigate("/seller");
            }
        }
    }, [user]);

    const isAuth = !!user && !!token;

    // Step 1: Account Type
    const [accountType, setAccountType] = useState("individual"); // individual or business

    // Step 2: Personal Information
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Step 3: Business Information
    const [businessName, setBusinessName] = useState("");
    const [storeName, setStoreName] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessType, setBusinessType] = useState(""); // retail, wholesale, manufacturer

    // Step 4: Tax & Banking (simplified)
    const [taxId, setTaxId] = useState("");
    const [bankAccountHolder, setBankAccountHolder] = useState("");

    // Validation states
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
    const [touched, setTouched] = useState({});

    const steps = [
        { number: 1, title: "Account Type", subtitle: "Choose your seller type" },
        { number: 2, title: "Personal Info", subtitle: "Your account details" },
        { number: 3, title: "Business Info", subtitle: "Tell us about your business" },
        { number: 4, title: "Review", subtitle: "Confirm your information" }
    ];

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
    const validateMobile = (mobile) => !mobile || /^[0-9]{10,15}$/.test(mobile.replace(/[+\-\s]/g, ''));
    const validateName = (name) => name.trim().length >= 2;

    const canProceedToStep2 = accountType !== "";
    const canProceedToStep3 = isAuth
        ? validateName(name) && validateEmail(email)
        : validateName(name) && validateEmail(email) && password.length >= 6 && password === confirmPassword;
    const canProceedToStep4 = storeName.trim().length >= 3;

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            setError(null);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const apiEndpoint = isAuth
                ? 'http://localhost:5000/api/seller/register'
                : 'http://localhost:5000/api/seller/signup';

            const payload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                mobile: mobile ? mobile.trim() : undefined,
                store_name: storeName.trim(),
                description: storeDescription.trim(),
                account_type: accountType,
                business_name: businessName.trim() || storeName.trim(),
                business_type: businessType,
                business_address: businessAddress.trim()
            };

            if (!isAuth) {
                payload.password = password;
            }

            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(isAuth && { 'Authorization': `Bearer ${token}` })
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Registration failed');
                setLoading(false);
                return;
            }

            // Store user data and token
            if (data.token) {
                const userData = {
                    id: data._id,
                    name: data.name,
                    email: data.email,
                    mobile: data.mobile,
                    isAdmin: data.isAdmin,
                    isSeller: data.isSeller,
                    sellerProfileId: data.sellerProfileId
                };

                // Persist auth state via zustand store (also persisted to localStorage under 'auth-storage')
                if (setUser) setUser(userData);
                if (setToken) setToken(data.token);
                if (setIsAuthenticated) setIsAuthenticated(true);
            }

            // Redirect to seller dashboard (or seller login if no token was returned)
            if (data.token) {
                navigate("/seller");
            } else {
                navigate("/seller/login");
            }
        } catch (err) {
            setError(err.message || "Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <a href="/" className="inline-flex items-center gap-2 mb-4">
                        <i className="fa-solid fa-store text-3xl text-[#FF9900]"></i>
                        <span className="font-bold text-2xl text-[#232F3E]">Serendipity Seller Central</span>
                    </a>
                    <h1 className="text-3xl font-bold text-[#232F3E] mb-2">
                        Start selling on Serendipity
                    </h1>
                    <p className="text-gray-600">
                        Join thousands of sellers and reach millions of customers
                    </p>
                </div>

                {/* Progress Indicator */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${currentStep > step.number
                                        ? 'bg-green-500 text-white'
                                        : currentStep === step.number
                                            ? 'bg-[#FF9900] text-white'
                                            : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {currentStep > step.number ? <i className="fa-solid fa-check text-xl"></i> : step.number}
                                    </div>
                                    <div className="text-center mt-2 hidden md:block">
                                        <p className="text-xs font-semibold text-gray-700">{step.title}</p>
                                        <p className="text-xs text-gray-500">{step.subtitle}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-1 flex-1 mx-2 rounded transition-all ${currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                        }`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <form onSubmit={onSubmit}>
                        {/* Step 1: Account Type */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#232F3E] mb-2">Choose your account type</h2>
                                    <p className="text-gray-600 mb-6">Select the option that best describes your business</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAccountType("individual")}
                                        className={`p-6 border-2 rounded-lg text-left transition-all ${accountType === "individual"
                                            ? 'border-[#FF9900] bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <i className="fa-solid fa-user text-2xl text-[#FF9900] flex-shrink-0 mt-1"></i>
                                            <div>
                                                <h3 className="font-bold text-lg text-[#232F3E] mb-2">Individual Seller</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Sell as an individual. No business registration required.
                                                </p>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    <li className="flex items-center gap-2">
                                                        <i className="fa-solid fa-check text-base text-green-500"></i>
                                                        Perfect for hobbyists
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <i className="fa-solid fa-check text-base text-green-500"></i>
                                                        Quick setup
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAccountType("business")}
                                        className={`p-6 border-2 rounded-lg text-left transition-all ${accountType === "business"
                                            ? 'border-[#FF9900] bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <i className="fa-solid fa-building text-2xl text-[#FF9900] flex-shrink-0 mt-1"></i>
                                            <div>
                                                <h3 className="font-bold text-lg text-[#232F3E] mb-2">Professional Seller</h3>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Sell as a registered business with advanced tools.
                                                </p>
                                                <ul className="text-sm text-gray-600 space-y-1">
                                                    <li className="flex items-center gap-2">
                                                        <i className="fa-solid fa-check text-base text-green-500"></i>
                                                        Advanced analytics
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <i className="fa-solid fa-check text-base text-green-500"></i>
                                                        Bulk operations
                                                    </li>
                                                    <li className="flex items-center gap-2">
                                                        <i className="fa-solid fa-check text-base text-green-500"></i>
                                                        API access
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </button>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep2}
                                        className="bg-[#FF9900] hover:bg-[#FA8900] text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Continue
                                        <i className="fa-solid fa-arrow-right text-xl"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Personal Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#232F3E] mb-2">Your account information</h2>
                                    <p className="text-gray-600 mb-6">This information will be used to create your seller account</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Full Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-user absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                readOnly={isAuth}
                                                placeholder="John Doe"
                                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent ${isAuth ? 'bg-gray-50 text-gray-400' : ''}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Email Address <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-envelope absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                readOnly={isAuth}
                                                placeholder="john@example.com"
                                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent ${isAuth ? 'bg-gray-50 text-gray-400' : ''}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Mobile Number <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-phone absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <input
                                                type="tel"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="+1 234 567 8900"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {!isAuth && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <i className="fa-solid fa-lock absolute left-3 top-3 text-xl text-gray-400"></i>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="At least 6 characters"
                                                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-3"
                                                >
                                                    {showPassword ? (
                                                        <i className="fa-solid fa-eye-slash text-xl text-gray-400"></i>
                                                    ) : (
                                                        <i className="fa-solid fa-eye text-xl text-gray-400"></i>
                                                    )}
                                                </button>
                                            </div>
                                            {password && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1 mb-1">
                                                        {[1, 2, 3, 4, 5].map((level) => (
                                                            <div
                                                                key={level}
                                                                className={`h-1 flex-1 rounded-full transition-all ${level <= passwordStrength.score ? passwordStrength.color : 'bg-gray-200'
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-600">{passwordStrength.label}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Confirm Password <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <i className="fa-solid fa-lock absolute left-3 top-3 text-xl text-gray-400"></i>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter password"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                                    required
                                                />
                                            </div>
                                            {confirmPassword && (
                                                <p className={`mt-1 text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xl"></i>
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep3}
                                        className="bg-[#FF9900] hover:bg-[#FA8900] text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Continue
                                        <i className="fa-solid fa-arrow-right text-xl"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Business Information */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#232F3E] mb-2">Business information</h2>
                                    <p className="text-gray-600 mb-6">Tell us about your {accountType === "business" ? "business" : "store"}</p>
                                </div>

                                {accountType === "business" && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-building absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <input
                                                type="text"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="Acme Corporation"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Store Name <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-store absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <input
                                                type="text"
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                placeholder="My Amazing Store"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">This will be displayed to customers</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Type
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-briefcase absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <select
                                                value={businessType}
                                                onChange={(e) => setBusinessType(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                            >
                                                <option value="">Select type</option>
                                                <option value="retail">Retail</option>
                                                <option value="wholesale">Wholesale</option>
                                                <option value="manufacturer">Manufacturer</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Store Description <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={storeDescription}
                                        onChange={(e) => setStoreDescription(e.target.value)}
                                        placeholder="Tell customers about your products and what makes your store special..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent resize-none"
                                    />
                                </div>

                                {accountType === "business" && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Business Address
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-location-dot absolute left-3 top-3 text-xl text-gray-400"></i>
                                            <input
                                                type="text"
                                                value={businessAddress}
                                                onChange={(e) => setBusinessAddress(e.target.value)}
                                                placeholder="123 Main St, City, State, ZIP"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xl"></i>
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep4}
                                        className="bg-[#FF9900] hover:bg-[#FA8900] text-white px-8 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        Continue
                                        <i className="fa-solid fa-arrow-right text-xl"></i>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-[#232F3E] mb-2">Review your information</h2>
                                    <p className="text-gray-600 mb-6">Please confirm all details are correct before submitting</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-[#232F3E] mb-3">Account Type</h3>
                                        <p className="text-gray-700 capitalize">{accountType} Seller</p>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-[#232F3E] mb-3">Personal Information</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-gray-500">Name:</span> <span className="text-gray-700 font-medium">{name}</span></div>
                                            <div><span className="text-gray-500">Email:</span> <span className="text-gray-700 font-medium">{email}</span></div>
                                            {mobile && <div><span className="text-gray-500">Mobile:</span> <span className="text-gray-700 font-medium">{mobile}</span></div>}
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="font-semibold text-[#232F3E] mb-3">Business Information</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {businessName && <div><span className="text-gray-500">Business:</span> <span className="text-gray-700 font-medium">{businessName}</span></div>}
                                            <div><span className="text-gray-500">Store:</span> <span className="text-gray-700 font-medium">{storeName}</span></div>
                                            {businessType && <div><span className="text-gray-500">Type:</span> <span className="text-gray-700 font-medium capitalize">{businessType}</span></div>}
                                            {storeDescription && <div className="col-span-2"><span className="text-gray-500">Description:</span> <span className="text-gray-700 font-medium">{storeDescription}</span></div>}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                                        <i className="fa-solid fa-xmark text-xl flex-shrink-0 mt-0.5"></i>
                                        <div>{error}</div>
                                    </div>
                                )}

                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Agreement:</strong> By clicking "Create Seller Account" below, you agree to Serendipity's Seller Terms and Conditions.
                                    </p>
                                </div>

                                <div className="flex justify-between pt-4">
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-arrow-left text-xl"></i>
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-[#FF9900] hover:bg-[#FA8900] text-white px-8 py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Creating Account...
                                            </>
                                        ) : (
                                            <>
                                                Create Seller Account
                                                <i className="fa-solid fa-check text-xl"></i>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
                        <p>
                            Already have a seller account?{" "}
                            <a href="/seller/login" className="text-[#FF9900] hover:text-[#FA8900] font-semibold">
                                Sign in
                            </a>
                        </p>
                        <p className="mt-2">
                            Want to shop instead?{" "}
                            <a href="/account/signin" className="text-[#FF9900] hover:text-[#FA8900] font-semibold">
                                Customer Login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
