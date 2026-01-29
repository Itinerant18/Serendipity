import { useState, Suspense, lazy } from "react";
import { ArrowRight, Store, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Dithering = lazy(() =>
  import("@paper-design/shaders-react").then((mod) => ({ default: mod.Dithering }))
) as any;

export function BecomeSellerSection() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className="py-16 w-full flex justify-center items-center px-4 md:px-6">
      <div
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-amber-500/20 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 shadow-2xl min-h-[500px] md:min-h-[550px] flex flex-col items-center justify-center duration-500">
          <Suspense fallback={<div className="absolute inset-0 bg-amber-500/5" />}>
            <div className="absolute inset-0 z-0 pointer-events-none opacity-50 mix-blend-screen">
              <Dithering
                colorBack="#00000000"
                colorFront="#F59E0B"
                shape="warp"
                type="4x4"
                speed={isHovered ? 0.6 : 0.2}
                className="size-full"
                minPixelRatio={1}
              />
            </div>
          </Suspense>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/40 via-transparent to-stone-900/40 z-[1]" />

          <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-400 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
              </span>
              Start Selling Today
            </div>

            {/* Headline */}
            <h2 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white mb-6 leading-[1.1]">
              Become a Seller,<br />
              <span className="text-amber-400">Grow Your Business.</span>
            </h2>

            {/* Description */}
            <p className="text-stone-300 text-base md:text-lg max-w-2xl mb-8 leading-relaxed">
              Join thousands of sellers on Serendipity. Reach millions of customers,
              manage your store with ease, and grow your brand with our powerful tools.
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-10">
              <div className="flex items-center gap-2 text-stone-400">
                <Store className="w-5 h-5 text-amber-500" />
                <span className="text-sm">5,000+ Sellers</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span className="text-sm">₹10Cr+ Monthly Sales</span>
              </div>
              <div className="flex items-center gap-2 text-stone-400">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="text-sm">Secure Payments</span>
              </div>
            </div>

            {/* CTA Button */}
            <Link
              to="/seller/signup"
              className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-amber-500 px-10 md:px-12 text-base font-semibold text-stone-900 transition-all duration-300 hover:bg-amber-400 hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-amber-500/30"
            >
              <span className="relative z-10">Start Selling</span>
              <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// Keep legacy export for backwards compatibility
export { BecomeSellerSection as CTASection };
