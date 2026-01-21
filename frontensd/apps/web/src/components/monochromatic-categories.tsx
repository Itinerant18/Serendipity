"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export type CategoryMediaType = "image" | "video";

export interface MonochromeCategory {
  id: string;
  name: string;
  description?: string;
  mediaUrl: string;
  mediaType?: CategoryMediaType;
}

interface CardHoverRevealContextValue {
  isHovered: boolean;
  setIsHovered: React.Dispatch<React.SetStateAction<boolean>>;
}

const CardHoverRevealContext = React.createContext<CardHoverRevealContextValue>(
  {} as CardHoverRevealContextValue
);

function useCardHoverRevealContext() {
  const context = React.useContext(CardHoverRevealContext);
  if (!context) {
    throw new Error(
      "useCardHoverRevealContext must be used within a CardHoverReveal provider"
    );
  }
  return context;
}

const CardHoverReveal = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState<boolean>(false);

  return (
    <CardHoverRevealContext.Provider value={{ isHovered, setIsHovered }}>
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      />
    </CardHoverRevealContext.Provider>
  );
});
CardHoverReveal.displayName = "CardHoverReveal";

interface CardHoverRevealMainProps {
  initialScale?: number;
  hoverScale?: number;
}

const CardHoverRevealMain = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CardHoverRevealMainProps
>(({ className, initialScale = 1, hoverScale = 1.05, ...props }, ref) => {
  const { isHovered } = useCardHoverRevealContext();
  return (
    <div
      ref={ref}
      className={cn("size-full transition-transform duration-300", className)}
      style={
        isHovered
          ? { transform: `scale(${hoverScale})`, ...props.style }
          : { transform: `scale(${initialScale})`, ...props.style }
      }
      {...props}
    />
  );
});
CardHoverRevealMain.displayName = "CardHoverRevealMain";

const CardHoverRevealContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isHovered } = useCardHoverRevealContext();
  return (
    <div
      ref={ref}
      className={cn(
        "absolute inset-[auto_1.5rem_1.5rem] p-6 backdrop-blur-lg transition-all duration-500 ease-in-out",
        className
      )}
      style={
        isHovered
          ? { translate: "0%", opacity: 1, ...props.style }
          : { translate: "0% 120%", opacity: 0, ...props.style }
      }
      {...props}
    />
  );
});
CardHoverRevealContent.displayName = "CardHoverRevealContent";

interface CategoryCardProps {
  category: MonochromeCategory;
  size: "small" | "medium" | "large";
  href?: string;
}

function CategoryCard({ category, size, href }: CategoryCardProps) {
  const sizeClasses = {
    small: "h-[260px] w-full",
    medium: "h-[340px] w-full",
    large: "h-[420px] w-full",
  } as const;

  const mediaType: CategoryMediaType = category.mediaType ?? "image";
  const to = href ?? `/category/${encodeURIComponent(category.name)}`;

  return (
    <Link to={to} className="block">
      <CardHoverReveal className={cn("rounded-2xl", sizeClasses[size])}>
        <CardHoverRevealMain hoverScale={1.08}>
          {mediaType === "video" ? (
            <video
              src={category.mediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className="size-full object-cover grayscale"
            />
          ) : (
            <img
              src={category.mediaUrl}
              alt={category.name}
              className="size-full object-cover grayscale"
              loading="lazy"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-end p-8">
            <h3 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {category.name}
            </h3>
          </div>
        </CardHoverRevealMain>

        <CardHoverRevealContent className="rounded-2xl bg-zinc-900/90 text-zinc-50 border border-zinc-700">
          <div className="space-y-4">
            <h4 className="text-xl font-semibold text-white">{category.name}</h4>
            {category.description ? (
              <p className="text-sm text-zinc-300 leading-relaxed">
                {category.description}
              </p>
            ) : null}
            <div className="pt-2">
              <span className="inline-flex items-center px-6 py-2 bg-white text-black rounded-full text-sm font-medium hover:bg-zinc-200 transition-colors">
                Explore
              </span>
            </div>
          </div>
        </CardHoverRevealContent>
      </CardHoverReveal>
    </Link>
  );
}

export interface MonochromaticCategoriesProps {
  title?: string;
  subtitle?: string;
  categories: MonochromeCategory[];
  className?: string;
}

export function MonochromaticCategories({
  title = "Explore Categories",
  subtitle = "Discover our curated collection across diverse categories",
  categories,
  className,
}: MonochromaticCategoriesProps) {
  // Removed random sizing for standardized grid

  return (
    <section
      className={cn(
        "rounded-3xl bg-gray-50 p-6 md:p-10 border border-gray-100",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3 tracking-tight font-playfair">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          ) : null}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          <AnimatePresence mode="wait">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  layout: { duration: 0.8, ease: "easeInOut" },
                }}
                className="md:col-span-1"
              >
                <CategoryCard
                  category={category}
                  size="medium"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

