import * as React from "react"
import { Link } from "react-router-dom"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi
} from "../components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { cn } from "../lib/utils"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"

// Category types
export const CATEGORIES = [
    "Electronics",
    "Fashion",
    "Home & Living",
    "Beauty",
    "Sports",
    "Books"
] as const

export type CategoryType = typeof CATEGORIES[number]

// Slide type - supports both image and video
export interface HeroSlide {
    id: string
    type: "image" | "video"
    src: string
    alt?: string
    title?: string
    subtitle?: string
    description?: string
    category?: CategoryType
    ctaText?: string
    ctaLink?: string
    discount?: string
    overlay?: boolean
}

interface EcommerceHeroProps {
    slides: HeroSlide[]
    autoplayDelay?: number
    className?: string
    height?: string
    showDots?: boolean
    showCategories?: boolean
}

export function EcommerceHero({
    slides,
    autoplayDelay = 5000,
    className,
    height = "h-[500px] md:h-[600px]",
    showDots = true,
    showCategories = true,
}: EcommerceHeroProps) {
    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [isPlaying, setIsPlaying] = React.useState(true)
    const videoRefs = React.useRef<{ [key: string]: HTMLVideoElement | null }>({})

    const plugin = React.useRef(
        Autoplay({ delay: autoplayDelay, stopOnInteraction: true })
    )

    // Track current slide and play/pause videos
    React.useEffect(() => {
        if (!api) return

        const onSelect = () => {
            const selectedIndex = api.selectedScrollSnap()
            setCurrent(selectedIndex)

            // Pause all videos
            Object.values(videoRefs.current).forEach((video) => {
                if (video) video.pause()
            })

            // Play current video if it exists
            const currentSlide = slides[selectedIndex]
            if (currentSlide?.type === "video" && videoRefs.current[currentSlide.id]) {
                videoRefs.current[currentSlide.id]?.play()
            }
        }

        onSelect()
        api.on("select", onSelect)

        return () => {
            api.off("select", onSelect)
        }
    }, [api, slides])

    // Handle autoplay toggle
    const toggleAutoplay = () => {
        if (plugin.current) {
            if (isPlaying) {
                plugin.current.stop()
            } else {
                plugin.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // Navigate to specific slide
    const goToSlide = (index: number) => {
        api?.scrollTo(index)
    }

    return (
        <div className={cn("relative w-full", className)}>
            {/* Categories Bar */}
            {showCategories && (
                <div className="bg-background border-b">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-center md:justify-start gap-6 py-4 overflow-x-auto scrollbar-hide">
                            {CATEGORIES.map((category) => (
                                <button
                                    key={category}
                                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Carousel */}
            <Carousel
                setApi={setApi}
                className="w-full"
                opts={{
                    loop: true,
                    align: "start",
                }}
                plugins={[plugin.current]}
            >
                <CarouselContent>
                    {slides.map((slide, index) => (
                        <CarouselItem key={slide.id}>
                            <div className={cn("relative w-full overflow-hidden bg-muted", height)}>
                                {/* Media Content */}
                                {slide.type === "image" ? (
                                    <img
                                        src={slide.src}
                                        alt={slide.alt || slide.title || "Hero slide"}
                                        className="w-full h-full object-cover"
                                        loading={index === 0 ? "eager" : "lazy"}
                                        fetchPriority={index === 0 ? "high" : "auto"}
                                    />
                                ) : (
                                    <video
                                        ref={(el) => {
                                            videoRefs.current[slide.id] = el
                                        }}
                                        src={slide.src}
                                        className="w-full h-full object-cover"
                                        loop
                                        muted
                                        playsInline
                                    />
                                )}

                                {/* Overlay */}
                                {((slide.overlay) || (slide.title || slide.subtitle || slide.description)) && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                )}

                                {/* Content Overlay */}
                                {(slide.title || slide.subtitle || slide.description) && (
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="container mx-auto px-4">
                                            <div className="max-w-xl space-y-4 text-white">
                                                {slide.category && (
                                                    <Badge variant="secondary" className="mb-4 text-sm px-3 py-1 backdrop-blur-md bg-white/20 text-white border-white/30">
                                                        {slide.category}
                                                    </Badge>
                                                )}

                                                {slide.discount && (
                                                    <div className="inline-block">
                                                        <div className="inline-block animate-bounce delay-1000">
                                                            <Badge className="text-xl px-6 py-2 bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)] border-2 border-white/20 rotate-[-2deg]">
                                                                {slide.discount}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}

                                                {slide.subtitle && (
                                                    <p className="text-sm md:text-base font-medium uppercase tracking-wider">
                                                        {slide.subtitle}
                                                    </p>
                                                )}

                                                {slide.title && (
                                                    <h2 className="text-4xl md:text-6xl font-bold leading-tight">
                                                        {slide.title}
                                                    </h2>
                                                )}

                                                {slide.description && (
                                                    <p className="text-lg md:text-xl text-gray-100 max-w-lg drop-shadow-md">
                                                        {slide.description}
                                                    </p>
                                                )}

                                                {slide.ctaText && (
                                                    <div className="pt-6">
                                                        <Link to={slide.ctaLink || "/search"}>
                                                            <Button
                                                                size="lg"
                                                                className="gap-2 bg-[#febd69] hover:bg-[#f3a847] text-[#232f3e] font-bold text-lg h-14 px-8 rounded-full shadow-[0_0_20px_rgba(254,189,105,0.4)] hover:shadow-[0_0_30px_rgba(254,189,105,0.6)] hover:scale-105 transition-all duration-300 border-2 border-[#232f3e]/10"
                                                            >
                                                                <i className="fa-solid fa-bag-shopping"></i>
                                                                {slide.ctaText}
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>

                {/* Navigation Arrows */}
                <CarouselPrevious className="left-4 h-12 w-12 bg-white/90 hover:bg-white border-none shadow-lg" />
                <CarouselNext className="right-4 h-12 w-12 bg-white/90 hover:bg-white border-none shadow-lg" />

                {/* Autoplay Control */}
                <button
                    onClick={toggleAutoplay}
                    className="absolute bottom-4 right-4 z-10 h-10 w-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-lg transition-colors"
                    aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
                >
                    {isPlaying ? (
                        <i className="fa-solid fa-pause text-black"></i>
                    ) : (
                        <i className="fa-solid fa-play text-black ml-0.5"></i>
                    )}
                </button>
            </Carousel>

            {/* Dot Indicators */}
            {showDots && slides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={cn(
                                "h-2 rounded-full transition-all duration-300",
                                current === index
                                    ? "w-8 bg-white"
                                    : "w-2 bg-white/50 hover:bg-white/75"
                            )}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
