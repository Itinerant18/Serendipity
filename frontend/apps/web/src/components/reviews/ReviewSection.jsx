import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import ReviewCard from './ReviewCard';
import WriteReviewModal from './WriteReviewModal';
import { apiRequest } from '@/lib/api';
import { PencilLine, BarChart3, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import useAuth from '@/utils/useAuth';

const ReviewSection = ({ productId, productTitle }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, avg: 0 });
    const [canReview, setCanReview] = useState({ allowed: false, orderId: null, reason: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch reviews
    const fetchReviews = async () => {
        try {
            const data = await apiRequest(`/reviews/product/${productId}`);
            setReviews(data.reviews);
            setStats({ total: data.total, avg: calculateAvg(data.reviews) });
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    // Check eligibility logic moved to frontend "check" or just try to open properties
    // Actually we have an endpoint for this.
    const checkEligibility = async () => {
        if (!user) return;
        try {
            const data = await apiRequest(`/reviews/can-review/${productId}`);
            setCanReview({ allowed: data.canReview, orderId: data.orderId, reason: data.reason });
        } catch (error) {
            console.error('Eligibility check failed', error);
        }
    };

    useEffect(() => {
        fetchReviews();
        if (user) checkEligibility();
    }, [productId, user]);

    const calculateAvg = (reviews) => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const handleVoteHelpful = async (reviewId) => {
        try {
            await apiRequest(`/reviews/${reviewId}/vote`, {
                method: 'POST',
                body: JSON.stringify({ isHelpful: true })
            });
            // Optimistic update
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? { ...r, helpful_count: (r.helpful_count || 0) + 1 } : r
            ));
            toast.success('Marked as helpful');
        } catch (error) {
            toast.error('Failed to vote');
        }
    };

    const handleReviewSubmitted = (newReview) => {
        setReviews([newReview, ...reviews]);
        setCanReview({ ...canReview, allowed: false }); // Disable button immediately
        setStats(prev => ({
            total: prev.total + 1,
            // Simple new avg calc (approx)
            avg: ((prev.avg * prev.total + newReview.rating) / (prev.total + 1)).toFixed(1)
        }));
    };

    return (
        <section className="py-12 bg-white">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-12 items-start md:items-center justify-between border-b-4 border-black pb-8">
                    <div>
                        <h2 className="text-4xl font-black uppercase tracking-tight mb-2 flex items-center gap-3">
                            Reviews <span className="bg-black text-white px-3 py-1 text-xl rounded-full">{stats.total}</span>
                        </h2>
                        <div className="flex items-center gap-4">
                            <StarRating rating={Math.round(stats.avg)} size="lg" />
                            <span className="text-2xl font-bold">{stats.avg || 0} out of 5</span>
                        </div>
                    </div>

                    {canReview.allowed ? (
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="bg-yellow-400 text-black border-4 border-black px-8 py-4 font-black uppercase text-lg shadow-[6px_6px_0_0_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0_0_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all flex items-center gap-2"
                        >
                            <PencilLine strokeWidth={3} />
                            Write a Review
                        </button>
                    ) : (
                        <div className="hidden md:block text-right">
                            {/* Condition messages can go here */}
                            {!user ? (
                                <p className="text-gray-500 font-bold flex items-center gap-2"><Lock size={16} /> Log in to review</p>
                            ) : (
                                // Don't show anything if they just haven't bought it, keeps UI clean.
                                // Or show "Verified Owners Only" badge
                                <span className="inline-block bg-gray-100 text-gray-500 px-4 py-2 font-bold border-2 border-gray-200 rounded-full">
                                    Verified Owners Only
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Rating Distribution (Simplistic for now) */}
                {/* <div className="mb-12 p-6 bg-gray-50 border-4 border-black">
                     <h3 className="font-bold uppercase mb-4 flex items-center gap-2"><BarChart3 /> Rating Breakdown</h3>
                     Coming soon...
                </div> */}

                {/* Reviews List */}
                {loading ? (
                    <div className="space-y-6 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 border-4 border-gray-300"></div>
                        ))}
                    </div>
                ) : reviews.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6">
                        {reviews.map(review => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onVoteHelpful={handleVoteHelpful}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 border-4 border-dashed border-gray-300">
                        <h3 className="text-xl font-bold text-gray-400 uppercase">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to share your thoughts!</p>
                    </div>
                )}
            </div>

            <WriteReviewModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                productId={productId}
                orderId={canReview.orderId}
                onReviewSubmitted={handleReviewSubmitted}
            />
        </section>
    );
};

export default ReviewSection;
