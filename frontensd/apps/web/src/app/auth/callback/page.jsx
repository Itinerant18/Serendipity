"use client";

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import useAuthStore from "@/utils/authStore";

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const processing = useRef(false);

    useEffect(() => {
        const handleAuthCallback = async () => {
            if (processing.current) return;
            processing.current = true;

            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error("Auth callback error:", error);
                navigate("/account/signin?error=AuthFailed");
                return;
            }

            if (session?.user) {
                // Fetch full profile from backend to get isSeller, isAdmin, etc.
                try {
                    const profileRes = await fetch("http://localhost:5000/api/profile", {
                        headers: { Authorization: `Bearer ${session.access_token}` }
                    });

                    let isSeller = false;
                    let isAdmin = false;
                    let sellerProfileId = null;
                    let mobile = null;

                    if (profileRes.ok) {
                        const profileData = await profileRes.json();
                        isSeller = profileData.user?.isSeller || false;
                        isAdmin = profileData.user?.isAdmin || false;
                        sellerProfileId = profileData.user?.sellerProfileId || null;
                        mobile = profileData.user?.mobile || null;
                    }

                    // Map Supabase user to App user format with DB data
                    const user = {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                        avatar: session.user.user_metadata?.avatar_url,
                        authProvider: 'google',
                        mobile,
                        isSeller,
                        isAdmin,
                        sellerProfileId
                    };

                    console.log("Profile fetched for user:", user.email, "isSeller:", isSeller, "ID:", user.id);
                    login(user, session.access_token);

                    // Check for role-based intent stored in localStorage
                    const intentRole = localStorage.getItem('auth_intent_role');
                    localStorage.removeItem('auth_intent_role'); // Clean up

                    if (intentRole === 'seller') {
                        if (isSeller) {
                            navigate("/seller");
                        } else {
                            // If they intent to be a seller but aren't one yet, send to seller signup
                            console.log("Seller intent detected. User is NOT a seller. Redirecting to signup.");
                            navigate("/seller/signup");
                        }
                    } else if (intentRole === 'customer') {
                        navigate("/");
                    } else {
                        // If no intent was found, it might have been cleared or not set
                        // But we already logged in, so just go home if not already on a target page
                        console.log("No specific intent role found, defaulting to home");
                        navigate("/");
                    }
                } catch (err) {
                    console.error("Failed to fetch profile after Google login:", err);
                    // Fallback to basic user data
                    const user = {
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                        avatar: session.user.user_metadata?.avatar_url,
                        authProvider: 'google',
                        isSeller: false,
                        isAdmin: false
                    };
                    login(user, session.access_token);
                    navigate("/");
                }
            } else {
                navigate("/account/signin");
            }
        };

        handleAuthCallback();
    }, [navigate, login]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#D97534] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-gray-700">Completing sign in...</h2>
                <p className="text-gray-500 mt-2">Please wait while we redirect you.</p>
            </div>
        </div>
    );
}
