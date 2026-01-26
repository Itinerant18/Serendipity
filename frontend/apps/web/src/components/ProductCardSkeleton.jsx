import React from 'react';

export default function ProductCardSkeleton() {
    return (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden p-4">
            <div className="skeleton-image mb-4"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text w-1/2"></div>
            <div className="mt-4 skeleton h-10 w-full rounded-lg"></div>
        </div>
    );
}
