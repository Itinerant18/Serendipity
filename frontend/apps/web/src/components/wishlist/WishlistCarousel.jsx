import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { WishlistCard } from "./WishlistCard";
import { cn } from "@/lib/utils";

export const WishlistCarousel = ({
    products,
    onRemove,
    onAddToCart,
    onReorder,
}) => {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: "start",
        loop: false,
        skipSnaps: false,
        dragFree: false,
    });

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;

        onSelect();
        emblaApi.on("select", onSelect);
        emblaApi.on("reInit", onSelect);

        // Track dragging state
        const handlePointerDown = () => setIsDragging(true);
        const handlePointerUp = () => setTimeout(() => setIsDragging(false), 100);

        emblaApi.on("pointerDown", handlePointerDown);
        emblaApi.on("pointerUp", handlePointerUp);

        return () => {
            emblaApi.off("select", onSelect);
            emblaApi.off("reInit", onSelect);
            emblaApi.off("pointerDown", handlePointerDown);
            emblaApi.off("pointerUp", handlePointerUp);
        };
    }, [emblaApi, onSelect]);

    return (
        <div className="relative w-full">
            {/* Carousel Container */}
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-6 pl-4 pt-10 pb-10">
                    <AnimatePresence mode="popLayout">
                        {products.map((product) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.8, rotate: -5 }}
                                transition={{
                                    duration: 0.5,
                                    ease: [0.5, 1.5, 0.5, 1],
                                }}
                                className="flex-shrink-0"
                            >
                                <WishlistCard
                                    product={product}
                                    onRemove={onRemove}
                                    onAddToCart={onAddToCart}
                                    isDragging={isDragging}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Arrows */}
            {canScrollPrev && (
                <motion.button
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    onClick={scrollPrev}
                    className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4",
                        "w-12 h-12 rounded-full",
                        "bg-white border border-gray-100",
                        "flex items-center justify-center",
                        "text-gray-900 hover:bg-gray-50 transition-all duration-300",
                        "shadow-lg hover:shadow-xl",
                        "z-40"
                    )}
                >
                    <i className="fa-solid fa-chevron-left text-lg" />
                </motion.button>
            )}

            {canScrollNext && (
                <motion.button
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    onClick={scrollNext}
                    className={cn(
                        "absolute right-0 top-1/2 -translate-y-1/2 translate-x-4",
                        "w-12 h-12 rounded-full",
                        "bg-white border border-gray-100",
                        "flex items-center justify-center",
                        "text-gray-900 hover:bg-gray-50 transition-all duration-300",
                        "shadow-lg hover:shadow-xl",
                        "z-40"
                    )}
                >
                    <i className="fa-solid fa-chevron-right text-lg" />
                </motion.button>
            )}
        </div>
    );
};
