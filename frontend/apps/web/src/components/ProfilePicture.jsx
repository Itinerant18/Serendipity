import React from 'react';

const ProfilePicture = ({ 
  src, 
  alt, 
  size = 'w-28 h-28', 
  isGoogleUser = false, 
  isEditing = false, 
  onUploadClick, 
  className = '' 
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className={`${size} bg-orange-500 border-4 border-black p-1`}>
        <img
          src={src || "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop"}
          alt={alt}
          className="w-full h-full object-cover border-2 border-black"
        />
      </div>
      
      {isEditing && !isGoogleUser && (
        <button
          onClick={onUploadClick}
          type="button"
          className="absolute bottom-0 right-0 w-10 h-10 bg-black border-4 border-white flex items-center justify-center text-white hover:bg-orange-500 transition-colors cursor-pointer"
        >
          <i className="fa-solid fa-camera text-sm"></i>
        </button>
      )}
      
      {isGoogleUser && (
        <div 
          className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 border-4 border-white flex items-center justify-center text-white cursor-help"
          title="Google profile picture cannot be edited here"
        >
          <i className="fab fa-google text-sm"></i>
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
