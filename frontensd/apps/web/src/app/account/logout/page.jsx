"use client";

import { useEffect } from "react";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth(); // Assuming signOut alias or logout is available

  useEffect(() => {
    // Perform logout
    signOut();

    // Redirect to home
    window.location.href = "/";
  }, [signOut]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF8F0]">
      <p className="font-inter text-gray-600">Logging out...</p>
    </div>
  );
}
