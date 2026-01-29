import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import StarRating from './StarRating';
import ReviewMediaUploader from './ReviewMediaUploader';
import { apiRequest, API_URL } from '@/lib/api';
import toast from 'react-hot-toast';

const WriteReviewModal = ({ isOpen, onClose, productId, orderId, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) return toast.error('Please select a star rating');
        if (!comment.trim()) return toast.error('Please write a review comment');

        setLoading(true);
        try {
            // 1. Upload files first if any
            const uploadedMedia = [];
            if (files.length > 0) {
                for (const file of files) {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('productId', productId);

                    const uploadResponse = await apiRequest('/upload/review-media', {
                        method: 'POST',
                        body: formData
                    });
                    const data = uploadResponse;

                    if (data.success) {
                        uploadedMedia.push({
                            url: data.url,
                            type: data.type,
                            size: data.size
                        });
                    }
                }
            }

            // 2. Submit review
            const review = await apiRequest('/reviews', {
                method: 'POST',
                body: JSON.stringify({
                    productId,
                    orderId,
                    rating,
                    title,
                    comment,
                    media: uploadedMedia
                })
            });

            toast.success('Review submitted successfully!');
            onReviewSubmitted(review);
            onClose();

        } catch (error) {
            console.error(error);
            toast.error(
                error.response?.data?.message ||
                'Failed to submit review. Ensure you have received this order.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-2xl bg-white border-4 border-black shadow-[12px_12px_0_0_#000] max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b-4 border-black bg-blue-100">
                    <h2 className="text-2xl font-black uppercase tracking-tight">Write Your Review</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white border-2 border-transparent hover:border-black transition-all">
                        <X size={24} strokeWidth={3} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 md:p-8">
                    {/* Rating Section */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold mb-2 uppercase">Your Rating *</label>
                        <div className="flex items-center gap-4">
                            <StarRating
                                rating={rating}
                                maxRating={5}
                                interactive={true}
                                onChange={setRating}
                                size="xl"
                                className="gap-2"
                            />
                            <span className="text-2xl font-black">{rating > 0 ? `${rating}/5` : ''}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 uppercase">Headline</label>
                        <input
                            type="text"
                            className="w-full border-4 border-gray-200 focus:border-black p-3 font-bold text-lg outline-none transition-colors placeholder:font-normal"
                            placeholder="What's most important to know?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    {/* Comment */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold mb-2 uppercase">Your Review *</label>
                        <textarea
                            className="w-full border-4 border-gray-200 focus:border-black p-4 min-h-[150px] font-medium text-lg outline-none resize-y transition-colors placeholder:text-gray-400"
                            placeholder="Share your honest experience with this product..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                        />
                    </div>

                    {/* Media Upload */}
                    <ReviewMediaUploader
                        files={files}
                        onFilesChange={setFiles}
                    />

                    {/* Actions */}
                    <div className="flex justify-end gap-4 mt-8 pt-6 border-t-4 border-gray-100">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 font-bold border-2 border-transparent hover:underline"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || rating === 0 || !comment}
                            className="flex items-center gap-2 px-8 py-3 bg-black text-white font-black uppercase text-lg border-2 border-black hover:bg-yellow-400 hover:text-black shadow-[4px_4px_0_0_#666] hover:shadow-[6px_6px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Submit Review'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WriteReviewModal;
