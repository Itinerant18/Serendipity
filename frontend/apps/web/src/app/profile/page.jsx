import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";
import useAuth from "../../utils/useAuth";

// --- Glass Card Component ---
const GlassCard = ({ className, children, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-white shadow-sm border border-gray-100",
            "hover:shadow-lg transition-shadow duration-300",
            className
        )}
    >
        {children}
    </motion.div>
);

// --- Nav Link Card ---
const NavLinkCard = ({ to, icon, title, subtitle, color = "text-amber-600", delay }) => (
    <Link to={to} className="block h-full">
        <GlassCard
            delay={delay}
            className="h-full group hover:border-[#D97534]/30 hover:-translate-y-1 hover:shadow-lg cursor-pointer"
        >
            <div className="p-6 flex flex-col h-full relative">
                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                    "bg-gray-50 border border-gray-100",
                    "group-hover:scale-110 transition-transform duration-300",
                    color
                )}>
                    <i className={`${icon} text-xl`}></i>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#D97534] transition-colors">
                    {title}
                </h3>
                <p className="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">
                    {subtitle}
                </p>

                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
                    <i className="fa-solid fa-chevron-right text-gray-400 text-sm"></i>
                </div>
            </div>
        </GlassCard>
    </Link>
);

export default function ProfilePage() {
    const { user, token, isAuthenticated, updateUser, signOut } = useAuth();

    // Form state
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
    
    // Check if user logged in with Google
    const isGoogleUser = user?.authProvider === 'google';

    // Initialize form with user data
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
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setMessage({ type: "error", text: "Please select an image file" });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: "error", text: "Image size must be less than 5MB" });
                return;
            }

            setAvatarFile(file);

            // Create preview
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
            console.log('📤 Starting avatar upload...');
            console.log('🔑 Token available:', !!token);
            
            const formDataUpload = new FormData();
            formDataUpload.append('file', avatarFile);

            const uploadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/upload/profile-image`;
            console.log('🌐 Upload URL:', uploadUrl);

            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataUpload
            });

            const data = await response.json();
            console.log('📸 Upload response status:', response.status);
            console.log('📸 Upload response data:', data);

            if (!response.ok) {
                throw new Error(data.message || 'Failed to upload avatar');
            }

            // Update form data with new avatar URL
            const newAvatarUrl = data.url;
            console.log('🔗 New avatar URL:', newAvatarUrl);
            
            setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
            setAvatarPreview(newAvatarUrl);
            setAvatarFile(null);
            
            console.log('💾 Auto-saving profile with new avatar...');
            console.log('📋 Current formData:', formData);
            
            const profileUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/user/profile`;
            console.log('🌐 Profile URL:', profileUrl);
            
            const savePayload = {
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile,
                avatar: newAvatarUrl
            };
            console.log('📦 Save payload:', savePayload);
            
            // Automatically save the profile with the new avatar
            const saveResponse = await fetch(profileUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(savePayload)
            });

            console.log('💾 Save response status:', saveResponse.status);
            const saveData = await saveResponse.json();
            console.log('✅ Save response data:', saveData);

            if (!saveResponse.ok) {
                throw new Error(saveData.message || 'Failed to save profile');
            }

            // Update local auth store
            updateUser(saveData);
            setMessage({ type: "success", text: "Profile picture updated successfully!" });
            setIsEditing(false);
            
        } catch (error) {
            console.error('❌ Avatar upload error:', error);
            console.error('❌ Error name:', error.name);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update profile');
            }

            // Update local auth store
            updateUser(data);
            setMessage({ type: "success", text: "Profile updated successfully!" });
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({ type: "error", text: error.message || "Failed to update profile" });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form to original user data
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
        { to: "/profile/orders", icon: "fa-solid fa-box", title: "Orders", subtitle: "Track & return items", color: "text-blue-500" },
        { to: "/profile/addresses", icon: "fa-solid fa-location-dot", title: "Addresses", subtitle: "Manage shipping info", color: "text-emerald-500" },
        { to: "/profile/payment-methods", icon: "fa-solid fa-credit-card", title: "Payments", subtitle: "Saved cards & wallets", color: "text-rose-500" },
        { to: "/profile/security", icon: "fa-solid fa-shield-halved", title: "Security", subtitle: "Password & 2FA", color: "text-cyan-500" },
    ];

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <GlassCard className="p-8 text-center">
                    <i className="fa-solid fa-lock text-4xl text-[#D97534] mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-500 mb-6">Please sign in to view your profile</p>
                    <Link to="/account/signin" className="inline-block px-6 py-3 bg-[#D97534] text-white rounded-xl font-bold hover:bg-[#C86429] transition-colors">
                        Sign In
                    </Link>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-gray-900 relative overflow-x-hidden">
            <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">

                {/* Editable Profile Section */}
                <GlassCard className="p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                        {/* Avatar */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-600 shadow-lg shadow-amber-500/20">
                                    <img
                                        src={avatarPreview || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
                                        alt={formData.name}
                                        className="w-full h-full rounded-full object-cover border-4 border-stone-900"
                                    />
                                </div>
                                {isEditing && (
                                    <button
                                        onClick={() => {
                                            if (isGoogleUser) {
                                                setShowGoogleWarning(true);
                                            } else {
                                                fileInputRef.current?.click();
                                            }
                                        }}
                                        type="button"
                                        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-stone-800 border-2 border-stone-900 flex items-center justify-center text-white hover:bg-amber-500 transition-colors cursor-pointer"
                                    >
                                        <i className="fa-solid fa-camera text-xs"></i>
                                    </button>
                                )}
                            </div>

                            {/* Hidden file input */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {/* Upload button (shown when file selected) */}
                            {isEditing && avatarFile && (
                                <button
                                    onClick={handleAvatarUpload}
                                    disabled={uploadingAvatar}
                                    className="px-3 py-1.5 text-xs rounded-lg bg-amber-500 text-stone-900 font-semibold hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                                >
                                    {uploadingAvatar ? (
                                        <>
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-solid fa-cloud-arrow-up"></i>
                                            Upload & Save
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D97534]/10 border border-[#D97534]/20">
                                    <i className="fa-solid fa-sparkles text-xs text-[#D97534]"></i>
                                    <span className="text-xs font-bold text-[#C86429] tracking-wider uppercase">
                                        {user?.isAdmin ? "Admin" : user?.isSeller ? "Seller" : "Member"}
                                    </span>
                                </div>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <i className="fa-solid fa-pen-to-square text-sm"></i>
                                        Edit Profile
                                    </button>
                                )}
                            </div>

                            {/* Message */}
                            {message.text && (
                                <div className={cn(
                                    "mb-4 p-3 rounded-xl text-sm",
                                    message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-700" : "bg-red-50 border border-red-200 text-red-700"
                                )}>
                                    <i className={`fa-solid ${message.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"} mr-2`}></i>
                                    {message.text}
                                </div>
                            )}

                            {/* Form Grid - removed avatar URL field */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        <i className="fa-solid fa-user mr-1"></i> Name
                                        {isGoogleUser && isEditing && (
                                            <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                Google Managed
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onClick={() => {
                                            if (isGoogleUser && isEditing) {
                                                setShowGoogleWarning(true);
                                            }
                                        }}
                                        disabled={!isEditing || isGoogleUser}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900",
                                            "focus:outline-none focus:border-[#D97534] focus:ring-2 focus:ring-[#D97534]/20 transition-all",
                                            (!isEditing || isGoogleUser) && "opacity-60 cursor-not-allowed"
                                        )}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        <i className="fa-solid fa-envelope mr-1"></i> Email
                                        {isGoogleUser && isEditing && (
                                            <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                                Google Managed
                                            </span>
                                        )}
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onClick={() => {
                                            if (isGoogleUser && isEditing) {
                                                setShowGoogleWarning(true);
                                            }
                                        }}
                                        disabled={!isEditing || isGoogleUser}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900",
                                            "focus:outline-none focus:border-[#D97534] focus:ring-2 focus:ring-[#D97534]/20 transition-all",
                                            (!isEditing || isGoogleUser) && "opacity-60 cursor-not-allowed"
                                        )}
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        <i className="fa-solid fa-phone mr-1"></i> Mobile
                                    </label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900",
                                            "focus:outline-none focus:border-[#D97534] focus:ring-2 focus:ring-[#D97534]/20 transition-all",
                                            !isEditing && "opacity-60 cursor-not-allowed"
                                        )}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        <i className="fa-solid fa-cake-candles mr-1"></i> Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900",
                                            "focus:outline-none focus:border-[#D97534] focus:ring-2 focus:ring-[#D97534]/20 transition-all",
                                            !isEditing && "opacity-60 cursor-not-allowed"
                                        )}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        <i className="fa-solid fa-venus-mars mr-1"></i> Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900",
                                            "focus:outline-none focus:border-[#D97534] focus:ring-2 focus:ring-[#D97534]/20 transition-all",
                                            !isEditing && "opacity-60 cursor-not-allowed"
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

                            {/* Action Buttons */}
                            {isEditing && (
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 rounded-xl bg-[#D97534] text-white font-bold hover:bg-[#C86429] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                                    >
                                        {loading ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-floppy-disk"></i>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        disabled={loading}
                                        className="px-6 py-3 rounded-xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </GlassCard>

                {/* Quick Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {links.map((link, idx) => (
                        <NavLinkCard key={link.to} {...link} delay={idx * 0.1} />
                    ))}
                </div>

                {/* Logout Button */}
                <motion.button
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    onClick={signOut}
                    className="w-full group relative overflow-hidden rounded-2xl bg-red-50 border border-red-200 p-4 hover:bg-red-100 transition-all flex items-center justify-center gap-2 text-red-600 hover:text-red-700 cursor-pointer"
                >
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span className="font-semibold">Sign Out</span>
                </motion.button>
            </div>
            
            {/* Google Auth Warning Modal */}
            {showGoogleWarning && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <i className="fab fa-google text-blue-600 text-xl"></i>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Google Account Linked
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Your profile name, email, and picture are managed by your Google account. 
                                    To update these, please visit your Google Account settings.
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-xs text-blue-700">
                                <i className="fa-solid fa-info-circle mr-2"></i>
                                You can still update your mobile number here.
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <a
                                href="https://myaccount.google.com/personal-info"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors text-center text-sm"
                            >
                                <i className="fa-solid fa-external-link mr-2"></i>
                                Open Google Settings
                            </a>
                            <button
                                onClick={() => setShowGoogleWarning(false)}
                                className="px-4 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors text-sm"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
