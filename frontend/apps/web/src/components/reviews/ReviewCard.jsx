import React from 'react';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';
import { ThumbsUp, MoreVertical, CheckCircle2, MessageSquare } from 'lucide-react';
import { cn } from "@/lib/utils";

const ReviewCard = ({ review, onVoteHelpful, onResponse }) => {
    return (
        <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 mb-8">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-200 border-2 border-black flex items-center justify-center font-bold text-lg overflow-hidden">
                        {review.user?.avatar_url ? (
                            <img src={review.user.avatar_url} alt={review.user.name} className="w-full h-full object-cover" />
                        ) : (
                            review.user?.name?.charAt(0) || 'U'
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-lg leading-tight">{review.user?.name || 'Anonymous'}</h4>
                            {review.is_verified_purchase && (
                                <span className="inline-flex items-center gap-1 bg-green-300 px-2 py-0.5 border-2 border-black text-xs font-bold rounded-full">
                                    <CheckCircle2 size={12} strokeWidth={3} /> Verified
                                </span>
                            )}
                        </div>
                        <span className="text-sm font-medium text-gray-500">
                            {review.created_at ? formatDistanceToNow(new Date(review.created_at), { addSuffix: true }) : 'Just now'}
                        </span>
                    </div>
                </div>

                {/* Rating */}
                <StarRating rating={review.rating} size="sm" />
            </div>

            {/* Content */}
            <h3 className="font-black text-xl mb-2">{review.title}</h3>
            <p className="text-gray-800 font-medium mb-4 leading-relaxed">
                {review.comment}
            </p>

            {/* Media Gallery */}
            {review.media && review.media.length > 0 && (
                <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                    {review.media.map((item, idx) => (
                        <div key={idx} className="relative flex-shrink-0 w-24 h-24 border-2 border-black bg-gray-100 group cursor-pointer hover:scale-105 transition-transform">
                            {item.type === 'video' ? (
                                <video src={item.url} className="w-full h-full object-cover" />
                            ) : (
                                <img src={item.url} alt="Review media" className="w-full h-full object-cover" />
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Seller Response */}
            {review.response && (
                <div className="mt-4 bg-gray-100 border-l-4 border-black p-4 ml-2">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} strokeWidth={3} />
                        <span className="font-bold text-sm">Seller Response</span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium italic">
                        "{review.response.response}"
                    </p>
                    <span className="text-xs text-gray-500 font-bold mt-1 block">
                        {formatDistanceToNow(new Date(review.response.created_at), { addSuffix: true })}
                    </span>
                </div>
            )}

            {/* Footer Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t-2 border-gray-200">
                <button
                    onClick={() => onVoteHelpful(review.id)}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-black bg-white hover:bg-yellow-300 active:bg-yellow-400 transition-colors font-bold text-sm shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                >
                    <ThumbsUp size={16} strokeWidth={3} />
                    <span>Helpful ({review.helpful_count || 0})</span>
                </button>

                {/* Options (Report, etc.) - To implement later */}
                {/* <button className="p-2 hover:bg-gray-100 rounded-full">
                    <MoreVertical size={20} />
                </button> */}
            </div>
        </div>
    );
};

export default ReviewCard;
