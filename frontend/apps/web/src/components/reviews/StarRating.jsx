import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Star } from 'lucide-react';

const StarRating = ({
    rating,
    maxRating = 5,
    interactive = false,
    onChange,
    size = "md",
    className
}) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: "w-4 h-4",
        md: "w-6 h-6",
        lg: "w-8 h-8",
        xl: "w-10 h-10"
    };

    const handleMouseEnter = (index) => {
        if (interactive) setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (interactive) setHoverRating(0);
    };

    const handleClick = (index) => {
        if (interactive && onChange) onChange(index);
    };

    const currentRating = interactive && hoverRating > 0 ? hoverRating : rating;

    return (
        <div className={cn("flex gap-1", className)}>
            {[...Array(maxRating)].map((_, i) => {
                const index = i + 1;
                const isFilled = index <= (currentRating || 0);
                const isHalf = !isFilled && index - 0.5 <= (currentRating || 0); // Logic for half stars can be added if needed, sticking to full stars for brutalism

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={!interactive}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(index)}
                        className={cn(
                            "transition-transform active:scale-90 focus:outline-none",
                            interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
                        )}
                    >
                        <Star
                            className={cn(
                                sizes[size],
                                "stroke-2 transition-all duration-200",
                                isFilled
                                    ? "fill-yellow-400 stroke-black drop-shadow-[2px_2px_0_rgba(0,0,0,1)]"
                                    : "fill-white stroke-black"
                            )}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default StarRating;
