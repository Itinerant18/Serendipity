import React, { useRef, useState } from 'react';
import { Upload, X, Film, Image as ImageIcon } from 'lucide-react';
import { cn } from "@/lib/utils";

const ReviewMediaUploader = ({
    files,
    onFilesChange,
    maxFiles = 5,
    maxImageSize = 500 * 1024, // 500KB
    maxVideoSize = 5 * 1024 * 1024 // 5MB
}) => {
    const fileInputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const [error, setError] = useState('');

    const validateFile = (file) => {
        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');

        if (!isVideo && !isImage) {
            return `File type ${file.type} not supported. Use images or videos.`;
        }

        if (isVideo && file.size > maxVideoSize) {
            return `Video ${file.name} exceeds 5MB limit.`;
        }

        if (isImage && file.size > maxImageSize) {
            return `Image ${file.name} exceeds 500KB limit.`;
        }

        return null;
    };

    const handleFiles = (newFiles) => {
        setError('');
        const validFiles = [];
        let hasError = false;

        if (files.length + newFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed.`);
            return;
        }

        Array.from(newFiles).forEach(file => {
            const err = validateFile(file);
            if (err) {
                setError(err);
                hasError = true;
            } else {
                // Add preview URL
                file.preview = URL.createObjectURL(file);
                validFiles.push(file);
            }
        });

        if (!hasError || validFiles.length > 0) {
            onFilesChange([...files, ...validFiles]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        if (newFiles[index].preview) {
            URL.revokeObjectURL(newFiles[index].preview);
        }
        newFiles.splice(index, 1);
        onFilesChange(newFiles);
    };

    return (
        <div className="mb-6">
            <label className="block text-sm font-bold mb-2">ADD PHOTOS/VIDEOS (OPTIONAL)</label>

            {/* Drop Zone */}
            <div
                className={cn(
                    "border-4 border-dashed border-gray-300 p-8 text-center bg-gray-50 transition-colors cursor-pointer",
                    dragging ? "border-black bg-blue-50" : "hover:border-gray-400"
                )}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-black text-white p-3 rounded-full">
                        <Upload size={24} strokeWidth={3} />
                    </div>
                    <p className="font-bold">Click to upload or drag & drop</p>
                    <p className="text-xs text-gray-500 font-medium">
                        Max {maxFiles} files (JPEG, PNG, MP4) <br />
                        Photos ≤ 500KB, Videos ≤ 5MB
                    </p>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*,video/*"
                    onChange={(e) => handleFiles(e.target.files)}
                />
            </div>

            {error && (
                <div className="mt-2 text-sm font-bold text-red-600 bg-red-100 p-2 border-2 border-red-200">
                    ⚠️ {error}
                </div>
            )}

            {/* Previews */}
            {files.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mt-4">
                    {files.map((file, idx) => (
                        <div key={idx} className="relative aspect-square border-2 border-black group">
                            {file.type.startsWith('video/') ? (
                                <video src={file.preview} className="w-full h-full object-cover" />
                            ) : (
                                <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                            )}

                            {/* Type Indicator */}
                            <div className="absolute top-1 left-1 bg-black/70 text-white p-1 rounded-sm">
                                {file.type.startsWith('video/') ? <Film size={12} /> : <ImageIcon size={12} />}
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 border-2 border-black hover:bg-red-600 shadow-[2px_2px_0_0_#000]"
                            >
                                <X size={12} strokeWidth={3} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewMediaUploader;
