import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import useAuth from "../../utils/useAuth";
import GlassCard from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
    const { user, token, isAuthenticated, updateUser, signOut } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        avatar: "",
        date_of_birth: "",
        gender: ""
    });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });
    const [showGoogleWarning, setShowGoogleWarning] = useState(false);
    const fileInputRef = React.useRef(null);
    
    const isGoogleUser = user?.authProvider === 'google';

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                mobile: user.mobile || "",
                avatar: user.avatar || user.image || "",
                date_of_birth: user.date_of_birth || "",
                gender: user.gender || ""
            });
            setAvatarPreview(user.avatar || user.image || null);
        }
    }, [user]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setMessage({ type: "error", text: "Please select an image file" });
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: "error", text: "Image size must be less than 5MB" });
                return;
            }
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
            setMessage({ type: "", text: "" });
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile) return;
        setUploadingAvatar(true);
        setMessage({ type: "", text: "" });

        try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', avatarFile);

            const uploadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/profile-image`;

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload avatar');
            }

            const newAvatarUrl = data.url;
            setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
            setAvatarPreview(newAvatarUrl);
            setAvatarFile(null);
            
            const saveResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, avatar: newAvatarUrl })
            });

            const saveData = await saveResponse.json();
            if (!saveResponse.ok) throw new Error(saveData.message || 'Failed to save profile');

            updateUser(saveData);
            setMessage({ type: "success", text: "Profile picture updated!" });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Failed to upload avatar" });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage({ type: "", text: "" });

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/profile`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update profile');

            updateUser(data);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setIsEditing(false);
        } catch (error) {
            setMessage({ type: "error", text: error.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                mobile: user.mobile || "",
                avatar: user.avatar || user.image || "",
                date_of_birth: user.date_of_birth || "",
                gender: user.gender || ""
            });
            setAvatarPreview(user.avatar || user.image || null);
        }
        setAvatarFile(null);
        setIsEditing(false);
        setMessage({ type: "", text: "" });
    };

    const links = [
        { to: "/profile/orders", icon: "fa-solid fa-box", title: "Orders", subtitle: "Track & return items", color: "bg-blue-100" },
        { to: "/profile/addresses", icon: "fa-solid fa-location-dot", title: "Addresses", subtitle: "Manage shipping", color: "bg-green-100" },
        { to: "/profile/payment-methods", icon: "fa-solid fa-credit-card", title: "Payments", subtitle: "Saved cards", color: "bg-pink-100" },
        { to: "/profile/security", icon: "fa-solid fa-shield-halved", title: "Security", subtitle: "Password & 2FA", color: "bg-yellow-100" },
    ];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white border-8 border-black flex items-center justify-center p-4">
                <GlassCard className="p-8 text-center">
                    <div className="w-16 h-16 bg-orange-500 border-4 border-black flex items-center justify-center mx-auto mb-4">
                        <i className="fa-solid fa-lock text-3xl text-white"></i>
                    </div>
                    <h2 className="font-brutalist text-2xl text-black mb-2 bg-black text-white px-4 py-2 inline-block">
                        AUTHENTICATION REQUIRED
                    </h2>
                    <p className="font-bold text-black mb-6">Please sign in to view your profile</p>
                    <Link to="/account/signin" className="inline-block px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all">
                        SIGN IN
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white border-8 border-black">
            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Profile Section */}
                <GlassCard className="p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-28 h-28 bg-orange-500 border-4 border-black p-1">
                                    <img
                                        src={avatarPreview || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                                        alt={formData.name}
                                        className="w-full h-full object-cover border-2 border-black"
                                    />
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            if (isGoogleUser) setShowGoogleWarning(true);
                                            else fileInputRef.current?.click();
                                        }}
                                        type="button"
                                        className="absolute bottom-0 right-0 w-10 h-10 bg-black border-4 border-white flex items-center justify-center text-white hover:bg-orange-500 transition-colors cursor-pointer"
                                    >
                                        <i className="fa-solid fa-camera text-sm"></i>
                                    </button>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {isEditing && avatarFile && (
                                <button
                                    onClick={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                    className="px-4 py-2 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all disabled:opacity-50"
                                >
                                    {uploadingAvatar ? (
                                        <><i className="fa-solid fa-spinner fa-spin mr-2"></i> UPLOADING...</>
                                    ) : (
                                        <><i className="fa-solid fa-cloud-arrow-up mr-2"></i> UPLOAD & SAVE</>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="bg-yellow-200 border-4 border-black px-4 py-1 font-bold text-sm">
                                    <i className="fa-solid fa-crown text-orange-500 mr-2"></i>
                                    {user?.isAdmin ? "ADMIN" : user?.isSeller ? "SELLER" : "MEMBER"}
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 bg-white border-4 border-black text-black font-bold hover:bg-orange-500 hover:text-white hover:translate(-2px,-2px) transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <i className="fa-solid fa-pen-to-square"></i>
                                        EDIT PROFILE
                                    </button>
                                )}
                            </div>

                            {message.text && (
                                <div className={cn(
                                    "mb-4 p-4 border-4 border-black font-bold",
                                    message.type === "success" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                                )}>
                                    <i className={`fa-solid ${message.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"} mr-2`}></i>
                                    {message.text}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                        <i className="fa-solid fa-user mr-2"></i> NAME
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onClick={() => isGoogleUser && isEditing && setShowGoogleWarning(true)}
                                        disabled={!isEditing || isGoogleUser}
                                        className={cn(
                                            "w-full px-4 py-3 border-4 border-black font-bold bg-white",
                                            "focus:outline-none focus:bg-yellow-200",
                                            (!isEditing || isGoogleUser) && "opacity-50 cursor-not-allowed bg-gray-100"
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                        <i className="fa-solid fa-envelope mr-2"></i> EMAIL
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onClick={() => isGoogleUser && isEditing && setShowGoogleWarning(true)}
                                        disabled={!isEditing || isGoogleUser}
                                        className={cn(
                                            "w-full px-4 py-3 border-4 border-black font-bold bg-white",
                                            "focus:outline-none focus:bg-yellow-200",
                                            (!isEditing || isGoogleUser) && "opacity-50 cursor-not-allowed bg-gray-100"
                                        )}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                        <i className="fa-solid fa-phone mr-2"></i> MOBILE
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={cn(
                                            "w-full px-4 py-3 border-4 border-black font-bold bg-white",
                                            "focus:outline-none focus:bg-yellow-200",
                                            !isEditing && "opacity-50 cursor-not-allowed bg-gray-100"
                                        )}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                        <i className="fa-solid fa-cake-candles mr-2"></i> DATE OF BIRTH
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={cn(
                                            "w-full px-4 py-3 border-4 border-black font-bold bg-white",
                                            "focus:outline-none focus:bg-yellow-200",
                                            !isEditing && "opacity-50 cursor-not-allowed bg-gray-100"
                                        )}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block font-bold text-black mb-2 border-2 border-black inline-block px-3 py-1">
                                        <i className="fa-solid fa-venus-mars mr-2"></i> GENDER
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={cn(
                                            "w-full px-4 py-3 border-4 border-black font-bold bg-white",
                                            "focus:outline-none focus:bg-yellow-200",
                                            !isEditing && "opacity-50 cursor-not-allowed bg-gray-100"
                                        )}
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="prefer_not_to_say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="flex gap-4 mt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 bg-orange-500 border-4 border-black text-white font-bold hover:bg-pink-500 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <><i className="fa-solid fa-spinner fa-spin"></i> SAVING...</>
                                        ) : (
                                            <><i className="fa-solid fa-floppy-disk"></i> SAVE CHANGES</>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-6 py-3 bg-white border-4 border-black text-black font-bold hover:bg-gray-100 transition-all flex items-center gap-2"
                                    >
                                        <i className="fa-solid fa-xmark"></i> CANCEL
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Quick Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {links.map((link, idx) => (
                        <Link key={link.to} to={link.to} className="block h-full">
                            <GlassCard className="h-full p-6 hover:translate(-2px,-2px) hover:shadow-[8px_8px_0_#000000] transition-all duration-100">
                                <div className={`w-12 h-12 ${link.color} border-4 border-black flex items-center justify-center mb-4 group-hover:bg-yellow-300 transition-colors`}>
                                    <i className={`${link.icon} text-xl`}></i>
                                </div>
                                <h3 className="font-brutalist text-lg text-black mb-1">{link.title}</h3>
                                <p className="font-bold text-sm text-black">{link.subtitle}</p>
                                <div className="absolute top-6 right-6">
                                    <i className="fa-solid fa-chevron-right text-xl text-black group-hover:translate-x-1 transition-transform"></i>
                                </div>
                            </GlassCard>
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    onClick={signOut}
                    className="w-full group relative overflow-hidden bg-red-500 border-4 border-black p-4 hover:bg-red-600 hover:translate(-2px,-2px) hover:shadow-[6px_6px_0_#000000] transition-all flex items-center justify-center gap-2 text-white font-bold"
                >
                    <i className="fa-solid fa-right-from-bracket text-xl"></i>
                    <span className="text-lg">SIGN OUT</span>
                </motion.button>
            </div>
            
            {/* Google Auth Warning Modal */}
            {showGoogleWarning && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white border-4 border-black shadow-[12px_12px_0_#000000] max-w-md w-full p-6"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-blue-500 border-4 border-black flex items-center justify-center flex-shrink-0">
                                <i className="fab fa-google text-white text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-brutalist text-xl text-black mb-2 bg-black text-white px-3 py-1 inline-block">
                                    GOOGLE ACCOUNT LINKED
                                </h3>
                                <p className="font-bold text-black">
                                    Your profile name, email, and picture are managed by Google. 
                                    To update these, please visit your Google Account settings.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-blue-200 border-4 border-black p-4 mb-4">
                            <p className="font-bold text-sm text-black">
                                <i className="fa-solid fa-info-circle mr-2"></i>
                                You can still update your mobile number here.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <a
                                href="https://myaccount.google.com/personal-info"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-3 bg-blue-500 border-4 border-black text-white font-bold hover:bg-blue-600 hover:translate(-2px,-2px) hover:shadow-[4px_4px_0_#000000] transition-all text-center"
                            >
                                <i className="fa-solid fa-external-link mr-2"></i>
                                GOOGLE SETTINGS
                            </a>
                            <button
                                onClick={() => setShowGoogleWarning(false)}
                                className="px-4 py-3 bg-white border-4 border-black text-black font-bold hover:bg-gray-100 transition-all"
                            >
                                GOT IT
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
