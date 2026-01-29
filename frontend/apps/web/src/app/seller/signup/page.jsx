"use client";

import { useState, useEffect } from "react";
import useAuth from "@/utils/useAuth";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/ui/GlassCard";

export default function SellerSignupPage() {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { user, setUser, setToken, setIsAuthenticated, token } = useAuth();

    useEffect(() => {
        if (user) {
            if (user.name) setName(user.name);
            if (user.email) setEmail(user.email);
            if (user.mobile) setMobile(user.mobile);
            if (user.isSeller || user.sellerProfileId) {
                navigate("/seller");
                return;
            }
        }
    }, [user, navigate]);

    const isAuth = !!user && !!token;

    const [accountType, setAccountType] = useState("individual");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [storeName, setStoreName] = useState("");
    const [storeDescription, setStoreDescription] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [businessType, setBusinessType] = useState("");

    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });

    const steps = [
        { number: 1, title: "Account Type", subtitle: "Choose your seller type" },
        { number: 2, title: "Personal Info", subtitle: "Your account details" },
        { number: 3, title: "Business Info", subtitle: "Tell us about your business" },
        { number: 4, title: "Review", subtitle: "Confirm your information" }
    ];

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

            if (!storeName || storeName.trim().length < 2) {
                setError('Store name is required and must be at least 2 characters');
                setLoading(false);
                return;
            }

            const payload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                mobile: mobile ? mobile.trim() : undefined,
                store_name: storeName.trim(),
                description: storeDescription.trim() || '',
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
                const errorMessage = data.message || data.error || 'Registration failed';

                if (errorMessage.includes('already registered as a seller')) {
                    setError('You are already registered as a seller. Syncing your account...');

                    try {
                        const syncRes = await fetch('http://localhost:5000/api/seller/sync-status', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (syncRes.ok) {
                            const syncData = await syncRes.json();
                            const profileRes = await fetch('http://localhost:5000/api/profile', {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (profileRes.ok) {
                                const profileData = await profileRes.json();
                                setUser({
                                    ...user,
                                    isSeller: true,
                                    sellerProfileId: profileData.user?.sellerProfileId || syncData.sellerProfileId
                                });
                            }

                            setError('Account synced! Redirecting...');
                            setTimeout(() => navigate('/seller'), 1500);
                        } else {
                            setError('Already registered. Redirecting...');
                            setTimeout(() => navigate('/seller'), 2000);
                        }
                    } catch (syncError) {
                        setError('Already registered. Redirecting...');
                        setTimeout(() => navigate('/seller'), 2000);
                    }

                    setLoading(false);
                    return;
                }

                setError(errorMessage);
                setLoading(false);
                return;
            }

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

                if (setUser) setUser(userData);
                if (setToken) setToken(data.token);
                if (setIsAuthenticated) setIsAuthenticated(true);
            }

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
        <div className="min-h-screen bg-white border-8 border-black">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <a href="/" className="inline-flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-orange-500 border-4 border-black flex items-center justify-center">
                            <i className="fa-solid fa-store text-2xl text-white"></i>
                        </div>
                        <span className="font-brutalist text-3xl text-black">SELLER CENTRAL</span>
                    </a>
                    <h1 className="font-brutalist text-4xl text-black mb-4 bg-yellow-200 border-4 border-black inline-block px-6 py-2">
                        BECOME A SELLER
                    </h1>
                    <p className="text-black font-bold bg-orange-100 border-2 border-black px-4 py-2 inline-block">
                        Join thousands of sellers and reach millions of customers
                    </p>
                </div>

                {/* Progress Indicator - Brutalist Style */}
                <GlassCard className="p-6 mb-8">
                    <div className="flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center flex-1">
                                <div className="flex flex-col items-center flex-1">
                                    <div className={`
                                        w-12 h-12 flex items-center justify-center font-brutalist text-xl border-4 border-black transition-all
                                        ${currentStep > step.number
                                            ? 'bg-green-500 text-white'
                                            : currentStep === step.number
                                                ? 'bg-orange-500 text-white translate(-2px,-2px) shadow-[4px_4px_0_#000000]'
                                                : 'bg-white text-black'
                                        }
                                    `}>
                                        {currentStep > step.number ? <i className="fa-solid fa-check"></i> : step.number}
                                    </div>
                                    <div className="text-center mt-2 hidden md:block">
                                        <p className="font-bold text-black text-sm">{step.title}</p>
                                    </div>
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`h-2 flex-1 mx-2 border-2 border-black ${currentStep > step.number ? 'bg-green-500' : 'bg-white'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </GlassCard>

                {/* Form Card */}
                <GlassCard className="p-8">
                    <form onSubmit={onSubmit}>
                        {/* Step 1: Account Type */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <h2 className="font-brutalist text-2xl text-black bg-black text-white px-4 py-2 inline-block">
                                    STEP 1: CHOOSE YOUR ACCOUNT TYPE
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        type="button"
                                        onClick={() => setAccountType("individual")}
                                        className={`p-6 border-4 border-black text-left transition-all ${
                                            accountType === "individual"
                                                ? 'bg-orange-500 text-white translate(-2px,-2px) shadow-[6px_6px_0_#000000]'
                                                : 'bg-white text-black hover:bg-pink-500 hover:text-white hover:translate(-2px,-2px)'
                                        }`}
                                    >
                                        <i className="fa-solid fa-user text-3xl mb-4 block"></i>
                                        <h3 className="font-brutalist text-xl mb-2">INDIVIDUAL SELLER</h3>
                                        <p className="text-sm opacity-90">Perfect for hobbyists. No business registration required.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setAccountType("business")}
                                        className={`p-6 border-4 border-black text-left transition-all ${
                                            accountType === "business"
                                                ? 'bg-orange-500 text-white translate(-2px,-2px) shadow-[6px_6px_0_#000000]'
                                                : 'bg-white text-black hover:bg-pink-500 hover:text-white hover:translate(-2px,-2px)'
                                        }`}
                                    >
                                        <i className="fa-solid fa-building text-3xl mb-4 block"></i>
                                        <h3 className="font-brutalist text-xl mb-2">PROFESSIONAL SELLER</h3>
                                        <p className="text-sm opacity-90">For registered businesses with advanced tools.</p>
                                    </button>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep2}
                                        className="bg-orange-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] font-bold"
                                    >
                                        CONTINUE <i className="fa-solid fa-arrow-right ml-2"></i>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Personal Information */}
                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <h2 className="font-brutalist text-2xl text-black bg-black text-white px-4 py-2 inline-block">
                                    STEP 2: YOUR ACCOUNT INFORMATION
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                            FULL NAME <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-user absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                            <Input
                                                type="text"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                readOnly={isAuth}
                                                placeholder="John Doe"
                                                className={`pl-10 border-4 border-black ${isAuth ? 'bg-gray-100' : ''}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                            EMAIL ADDRESS <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                            <Input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                readOnly={isAuth}
                                                placeholder="john@example.com"
                                                className={`pl-10 border-4 border-black ${isAuth ? 'bg-gray-100' : ''}`}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                            MOBILE NUMBER <span className="text-gray-400">(Optional)</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-phone absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                            <Input
                                                type="tel"
                                                value={mobile}
                                                onChange={(e) => setMobile(e.target.value)}
                                                placeholder="+1 234 567 8900"
                                                className="pl-10 border-4 border-black"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {!isAuth && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                        <div>
                                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                                PASSWORD <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    placeholder="At least 6 characters"
                                                    className="pl-10 pr-10 border-4 border-black"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2"
                                                >
                                                    <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xl text-gray-400`}></i>
                                                </button>
                                            </div>
                                            {password && (
                                                <div className="mt-2">
                                                    <div className="flex gap-1 mb-1">
                                                        {[1, 2, 3, 4, 5].map((level) => (
                                                            <div
                                                                key={level}
                                                                className={`h-2 flex-1 border-2 border-black transition-all ${level <= passwordStrength.score ? passwordStrength.color : 'bg-white'}`}
                                                            />
                                                        ))}
                                                    </div>
                                                    <span className="font-bold text-sm">{passwordStrength.label}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                                CONFIRM PASSWORD <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <i className="fa-solid fa-lock absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Re-enter password"
                                                    className="pl-10 border-4 border-black"
                                                    required
                                                />
                                            </div>
                                            {confirmPassword && (
                                                <p className={`mt-1 font-bold text-sm ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between pt-6">
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        className="bg-white text-black border-4 border-black hover:bg-gray-100 font-bold"
                                    >
                                        <i className="fa-solid fa-arrow-left mr-2"></i> BACK
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep3}
                                        className="bg-orange-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] font-bold"
                                    >
                                        CONTINUE <i className="fa-solid fa-arrow-right ml-2"></i>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Business Information */}
                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <h2 className="font-brutalist text-2xl text-black bg-black text-white px-4 py-2 inline-block">
                                    STEP 3: BUSINESS INFORMATION
                                </h2>

                                {accountType === "business" && (
                                    <div>
                                        <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                            BUSINESS NAME <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-building absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                            <Input
                                                type="text"
                                                value={businessName}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                placeholder="Acme Corporation"
                                                className="pl-10 border-4 border-black"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                            STORE NAME <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-store absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                            <Input
                                                type="text"
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                placeholder="My Amazing Store"
                                                className="pl-10 border-4 border-black"
                                                required
                                            />
                                        </div>
                                        <p className="text-sm font-bold text-gray-500 mt-1">This will be displayed to customers</p>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                            BUSINESS TYPE
                                        </label>
                                        <div className="relative">
                                            <i className="fa-solid fa-briefcase absolute left-3 top-1/2 -translate-y-1/2 text-xl text-gray-400"></i>
                                            <select
                                                value={businessType}
                                                onChange={(e) => setBusinessType(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border-4 border-black font-bold"
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
                                    <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                        STORE DESCRIPTION <span className="text-gray-400">(Optional)</span>
                                    </label>
                                    <textarea
                                        value={storeDescription}
                                        onChange={(e) => setStoreDescription(e.target.value)}
                                        placeholder="Tell customers about your products..."
                                        rows={4}
                                        className="w-full px-4 py-3 border-4 border-black font-bold resize-none"
                                    />
                                </div>

                                <div className="flex justify-between pt-6">
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        className="bg-white text-black border-4 border-black hover:bg-gray-100 font-bold"
                                    >
                                        <i className="fa-solid fa-arrow-left mr-2"></i> BACK
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={nextStep}
                                        disabled={!canProceedToStep4}
                                        className="bg-orange-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] font-bold"
                                    >
                                        CONTINUE <i className="fa-solid fa-arrow-right ml-2"></i>
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Review & Submit */}
                        {currentStep === 4 && (
                            <div className="space-y-6">
                                <h2 className="font-brutalist text-2xl text-black bg-black text-white px-4 py-2 inline-block">
                                    STEP 4: REVIEW YOUR INFORMATION
                                </h2>

                                <div className="space-y-4">
                                    <GlassCard className="p-4 bg-yellow-100">
                                        <h3 className="font-brutalist text-lg text-black mb-2">ACCOUNT TYPE</h3>
                                        <p className="font-bold text-black uppercase">{accountType} Seller</p>
                                    </GlassCard>

                                    <GlassCard className="p-4">
                                        <h3 className="font-brutalist text-lg text-black mb-3">PERSONAL INFORMATION</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="font-bold">Name:</span> {name}</div>
                                            <div><span className="font-bold">Email:</span> {email}</div>
                                            {mobile && <div><span className="font-bold">Mobile:</span> {mobile}</div>}
                                        </div>
                                    </GlassCard>

                                    <GlassCard className="p-4">
                                        <h3 className="font-brutalist text-lg text-black mb-3">BUSINESS INFORMATION</h3>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {businessName && <div><span className="font-bold">Business:</span> {businessName}</div>}
                                            <div><span className="font-bold">Store:</span> {storeName}</div>
                                            {businessType && <div><span className="font-bold">Type:</span> <span className="uppercase">{businessType}</span></div>}
                                        </div>
                                    </GlassCard>
                                </div>

                                {error && (
                                    <div className="bg-red-500 text-white border-4 border-black p-4 font-bold">
                                        <i className="fa-solid fa-xmark mr-2"></i>
                                        {error}
                                    </div>
                                )}

                                <GlassCard className="p-4 bg-blue-100">
                                    <p className="text-sm font-bold">
                                        <strong>AGREEMENT:</strong> By clicking "Create Seller Account" below, you agree to our Terms and Conditions.
                                    </p>
                                </GlassCard>

                                <div className="flex justify-between pt-6">
                                    <Button
                                        type="button"
                                        onClick={prevStep}
                                        className="bg-white text-black border-4 border-black hover:bg-gray-100 font-bold"
                                    >
                                        <i className="fa-solid fa-arrow-left mr-2"></i> BACK
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-orange-500 text-white border-4 border-black shadow-[8px_8px_0_#000000] hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[10px_10px_0_#000000] font-bold"
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin mr-2"></i> CREATING...
                                            </>
                                        ) : (
                                            <>CREATE SELLER ACCOUNT <i className="fa-solid fa-check ml-2"></i></>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    {/* Footer Links */}
                    <div className="mt-8 pt-6 border-t-4 border-black text-center">
                        <p className="font-bold text-black">
                            Already have a seller account?{" "}
                            <a href="/seller/login" className="text-orange-500 hover:text-pink-500 underline">
                                SIGN IN
                            </a>
                        </p>
                        <p className="font-bold text-black mt-2">
                            Want to shop instead?{" "}
                            <a href="/account/signin" className="text-orange-500 hover:text-pink-500 underline">
                                CUSTOMER LOGIN
                            </a>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
