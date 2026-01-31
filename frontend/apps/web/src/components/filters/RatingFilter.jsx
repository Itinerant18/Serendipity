import React from 'react';

const RatingFilter = ({ value, onChange, minStars = 1 }) => {
    const ratingOptions = [
        { stars: 4, label: "4★ & Up" },
        { stars: 3, label: "3★ & Up" },
        { stars: 2, label: "2★ & Up" },
        { stars: 1, label: "1★ & Up" }
    ];

    const handleRatingSelect = (stars) => {
        onChange(value === stars ? 0 : stars);
    };

    const renderStars = (count, active) => {
        return (
            <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                    <i
                        key={i}
                        className={`fas fa-star text-sm ${
                            i < count ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                    ></i>
                ))}
            </div>
        );
    };

    return (
        <div className="border-4 border-black bg-white p-4">
            <h4 className="font-bold text-black mb-3 uppercase text-sm">Customer Rating</h4>
            
            <div className="space-y-2">
                {ratingOptions.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => handleRatingSelect(option.stars)}
                        className={`w-full flex items-center justify-between p-3 border-2 font-bold text-sm transition-all duration-150 ${
                            value === option.stars
                                ? 'bg-orange-500 text-white border-black'
                                : 'bg-white text-black border-black hover:bg-pink-500 hover:text-white'
                        }`}
                        aria-label={`Filter by ${option.label} rating`}
                    >
                        <span className="capitalize">{option.label}</span>
                        {renderStars(option.stars, value === option.stars)}
                    </button>
                ))}
            </div>

            {value > 0 && (
                <button
                    onClick={() => onChange(0)}
                    className="w-full px-4 py-2 bg-red-500 text-white font-bold border-2 border-black hover:bg-black transition-all duration-150 mt-3"
                    aria-label="Clear rating filter"
                >
                    <i className="fas fa-times mr-2"></i>
                    Clear Rating
                </button>
            )}
        </div>
    );
};

export default RatingFilter;