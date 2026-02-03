"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
// FontAwesome icons loaded globally
import { Button } from "./button";
import { Input } from "./input";
import { Card } from "./card";
import { Badge } from "./badge";
import confetti from 'canvas-confetti';

///////////////////
type LoginPayload = {
    email: string;
    password: string;
};

type SignupPayload = {
    name: string;
    email: string;
    password: string;
    mobile?: string;
};

type AuthComponentProps = {
    onSuccess: (data: LoginPayload | SignupPayload | string, password?: string) => Promise<void>;
    onGoogleLogin?: () => void;
    mode?: "login" | "signup";
    brandName?: string;
    logo?: React.ReactNode;
    signUpLink?: string;
    loginLink?: string;
};

///////


const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export function AuthComponent({
    onSuccess,
    onGoogleLogin,
    mode = "login",
    brandName = "Serendipity",
    logo,
    signUpLink = "/signup",
    loginLink = "/login"
}: AuthComponentProps) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [mobile, setMobile] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);

    const handleConfetti = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number): number =>
            Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (mode === "login") {
                await onSuccess(email, password);
            } else {
                await onSuccess({ name, email, password, mobile });
            }
            setIsSuccess(true);
            handleConfetti();
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Authentication failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f8f9fa] overflow-hidden relative">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100 rounded-full blur-[120px] opacity-50 animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-50 animate-pulse" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="w-full max-w-md z-10"
            >
                <Card className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl overflow-hidden rounded-3xl">
                    <div className="p-8">
                        <motion.div variants={itemVariants} className="flex justify-center mb-6">
                            <div className="p-3 bg-orange-100 rounded-2xl">
                                {logo || <i className="fa-solid fa-store text-3xl text-[#FF9900]"></i>}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-linear-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                {mode === "login" ? "Welcome Back" : "Create Account"}
                            </h1>
                            <p className="text-gray-500 mt-2 font-medium">
                                {brandName} {mode === "login" ? "Partner Login" : "Partner Program"}
                            </p>
                        </motion.div>

                        <AnimatePresence mode="wait">
                            {!isSuccess ? (
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-5"
                                >
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100"
                                        >
                                            <i className="fa-solid fa-circle-exclamation text-xl"></i>
                                            <p className="text-sm font-medium">{error}</p>
                                        </motion.div>
                                    )}

                                    {mode === "signup" && currentStep === 1 && (
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition-colors group-focus-within:text-[#FF9900]"></i>
                                                <Input
                                                    placeholder="Your Name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="pl-12 h-14 bg-gray-50/50 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="relative group">
                                                <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition-colors group-focus-within:text-[#FF9900]"></i>
                                                <Input
                                                    placeholder="Mobile Number"
                                                    value={mobile}
                                                    onChange={(e) => setMobile(e.target.value)}
                                                    className="pl-12 h-14 bg-gray-50/50 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition-all"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {(mode === "login" || (mode === "signup" && currentStep === 2)) && (
                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition-colors group-focus-within:text-[#FF9900]"></i>
                                                <Input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="pl-12 h-14 bg-gray-50/50 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition-all"
                                                    required
                                                />
                                            </div>
                                            <div className="relative group">
                                                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-400 transition-colors group-focus-within:text-[#FF9900]"></i>
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    className="pl-12 pr-12 h-14 bg-gray-50/50 border-gray-200/50 rounded-2xl focus:ring-2 focus:ring-[#FF9900]/20 focus:border-[#FF9900] transition-all"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <i className="fa-solid fa-xmark text-xl"></i>
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2 flex flex-col gap-4">
                                        {mode === "signup" && (
                                            <div className="flex justify-between items-center px-1">
                                                {currentStep === 2 ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => setCurrentStep(1)}
                                                        className="text-gray-500 hover:text-gray-900"
                                                    >
                                                        <i className="fa-solid fa-arrow-left text-base mr-2"></i> Back
                                                    </Button>
                                                ) : <div />}

                                                {currentStep === 1 ? (
                                                    <Button
                                                        type="button"
                                                        onClick={() => setCurrentStep(2)}
                                                        disabled={!name}
                                                        className="bg-gray-900 hover:bg-black text-white px-8 rounded-2xl h-14 font-semibold shadow-xl shadow-gray-200"
                                                    >
                                                        Next Step <i className="fa-solid fa-arrow-right text-base ml-2"></i>
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        disabled={isLoading || !email || !password}
                                                        className="bg-[#FF9900] hover:bg-[#FA8900] text-white px-8 rounded-2xl h-14 font-semibold shadow-xl shadow-orange-100 flex-1 ml-4"
                                                    >
                                                        {isLoading ? "Please wait..." : "Create Account"}
                                                        {!isLoading && <i className="fa-solid fa-paper-plane text-base ml-2 rotate-45"></i>}
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {mode === "login" && (
                                            <Button
                                                disabled={isLoading}
                                                className="w-full bg-[#FF9900] hover:bg-[#FA8900] text-white h-14 rounded-2xl font-bold shadow-xl shadow-orange-100 text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                {isLoading ? "Authenticating..." : "Sign In"}
                                                {!isLoading && <i className="fa-solid fa-arrow-right text-xl ml-2"></i>}
                                            </Button>
                                        )}

                                        {mode === "login" && onGoogleLogin && (
                                            <Button
                                                type="button"
                                                onClick={onGoogleLogin}
                                                variant="outline"
                                                className="w-full h-14 border-gray-200 rounded-2xl font-semibold hover:bg-gray-50 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                            >
                                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EB4335" />
                                                </svg>
                                                Sign in with Google
                                            </Button>
                                        )}
                                    </div>
                                </motion.form>
                            ) : (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <i className="fa-solid fa-check text-4xl text-green-600"></i>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Login Successful!</h2>
                                    <p className="text-gray-500 mt-2">Redirecting to your dashboard...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="px-8 py-6 bg-gray-50/50 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            {mode === "login" ? (
                                <>New to {brandName}? <a href={signUpLink} className="text-[#FF9900] hover:text-[#FA8900] font-bold">Sign Up</a></>
                            ) : (
                                <>Already have an account? <a href={loginLink} className="text-[#FF9900] hover:text-[#FA8900] font-bold">Sign In</a></>
                            )}
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
