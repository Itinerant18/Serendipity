"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import useAuthStore from "@/utils/authStore";

export default function AuthCallbackPage() {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);

    useEffect(() => {
        const handleAuthCallback = async () => {
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

                    login(user, session.access_token);
                    navigate("/");
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
