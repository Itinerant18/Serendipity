import React, { Suspense } from "react";
import { Link } from "react-router-dom";


// Lazy load actual ProductCard to avoid circular deps or heavy initial load
const ProductCard = React.lazy(() => import("@/components/ProductCard"));

export default function RelatedProducts({ products, category }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="bg-gradient-to-b from-slate-50/50 to-white py-20 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h2 className="text-3xl font-heading font-bold text-slate-900 mb-2">You Might Also Like</h2>
                        <p className="text-slate-500">Selected picks from {category}</p>
                    </div>
                    <Link
                        to={`/category/${category}`}
                        className="text-sky-600 hover:text-sky-700 font-bold text-sm flex items-center gap-1 px-4 py-2 rounded-full hover:bg-sky-50 transition-colors"
                    >
                        View All <i className="fa-solid fa-chevron-right text-xs"></i>
                    </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Suspense fallback={
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="h-96 rounded-2xl bg-slate-100 animate-pulse" />
                        ))
                    }>
                        {products.map((p) => (
                            <ProductCard
                                key={p.id || p._id}
                                product={p}
                                onAddToCart={() => { /* related add action */ }}
                            />
                        ))}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}
