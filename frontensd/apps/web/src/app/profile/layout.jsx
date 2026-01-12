"use client";

import React, { useState, useEffect } from "react";
import ProfileSidebar from "@/components/ProfileSidebar";
import useAuth from "@/utils/useAuth";

// Simple wrapper that only provides the sidebar - Header/Footer are handled by parent layouts
export default function ProfileLayout({ children }) {
    const { user, token, isAuthenticated } = useAuth(); // getting token from useAuth hook (which uses store)
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token || !isAuthenticated) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("http://localhost:5000/api/profile", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "/account/signin";
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [isAuthenticated]);

    // Show sign-in prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
                <p className="text-gray-600 mb-6">You need to be logged in to view your profile.</p>
                <a
                    href="/account/signin"
                    className="inline-block px-6 py-3 bg-[#D97534] hover:bg-[#C86429] text-white font-bold rounded-lg"
                >
                    Sign In
                </a>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar */}
                <ProfileSidebar user={profile?.user || user} />

                {/* Main Content */}
                <div className="flex-1">
                    {loading ? (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <div className="w-8 h-8 border-4 border-[#D97534] border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-gray-500 mt-4">Loading profile...</p>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </div>
    );
}
