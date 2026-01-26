"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
// FontAwesome icons loaded globally
import useAuth from "@/utils/useAuth";
import { AuthComponent } from "@/components/ui/sign-up";

export default function SellerLoginPage() {
    const navigate = useNavigate();
    const { signInAsSeller, signInWithGoogle } = useAuth();

    const handleLogin = async (email, password) => {
        const result = await signInAsSeller({ email, password });
        if (result.success) {
            navigate("/seller");
        } else {
            throw new Error(result.error || "Login failed");
        }
    };

    const handleGoogleLogin = async () => {
        const result = await signInWithGoogle('seller');
        if (result.success) {
            // Success handled by callback
        } else {
            alert(result.error || "Google login failed");
        }
    };

    return (
        <AuthComponent
            mode="login"
            brandName="Serendipity"
            logo={<i className="fa-solid fa-store text-3xl text-[#FF9900]"></i>}
            onSuccess={handleLogin}
            onGoogleLogin={handleGoogleLogin}
            signUpLink="/seller/signup"
            loginLink="/seller/login"
        />
    );
}
