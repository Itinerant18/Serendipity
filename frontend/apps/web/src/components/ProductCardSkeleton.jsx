import React from 'react';

import React from 'react';
import GlassCard from './ui/GlassCard';

export default function ProductCardSkeleton() {
    return (
        <GlassCard className="p-4 animate-brutalist-jitter">
            <div className="aspect-square bg-gray-200 border-4 border-black mb-4"></div>
            <div className="h-4 bg-gray-200 border-4 border-black w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 border-4 border-black w-1/2 mb-2"></div>
            <div className="h-10 bg-gray-200 border-4 border-black w-full animate-pulse"></div>
        </GlassCard>
    );
}
