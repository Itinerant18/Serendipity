# Summary of Neo Brutalism Design Implementation

This document summarizes the changes applied in commit `67c53d60238c0fe7dbec6ccce224fdec45c8deb8` to transform the site's design from a soft, glassmorphic aesthetic to a hard-edged Neo Brutalism style.

## Core Styling Transformation (`frontend/apps/web/src/app/global.css`)

The most significant changes were made in the global stylesheet, redefining the entire design system.

### 1. Font Replacement
The elegant and soft fonts were replaced with bold, blocky, and monospace fonts.
- **Before**: `Quicksand`, `Caveat`
- **After**: `Space Grotesk`, `Anton`, `Bebas Neue`

### 2. Color Palette Overhaul
The warm, neutral color palette was replaced with a high-contrast, vibrant brutalist palette.

**Before (Glassmorphism):**
```css
:root {
  --color-charcoal: #1c1917;
  --color-gold: #ca8a04;
  --color-warm-white: #fafaf9;
  --glass-bg: rgba(255, 255, 255, 0.75);
  --glass-blur: 12px;
}
```

**After (Neo Brutalism):**
```css
:root {
  --brutalist-black: #000000;
  --brutalist-white: #ffffff;
  --brutalist-blue: #0066ff;
  --brutalist-pink: #ff006e;
  --brutalist-orange: #ff6b00;
  --brutalist-border: 4px;
  --brutalist-shadow-offset: 8px;
  --brutalist-radius: 0px;
}
```

### 3. Component Style Revolution
Glass effects were completely removed and replaced with solid, bordered styles.

**Before (Glass Effect):**
```css
.glass {
  @apply bg-white/80 backdrop-blur-xl border border-white/20;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}
```
**After (Brutalist Card):**
```css
.glass, .brutalist-card {
  background-color: var(--brutalist-white, #ffffff);
  border: var(--brutalist-border, 4px) solid var(--brutalist-black, #000000);
  box-shadow: var(--brutalist-shadow-offset, 8px) var(--brutalist-shadow-offset, 8px) 0 var(--brutalist-black, #000000);
  border-radius: var(--brutalist-radius, 0px);
  backdrop-filter: none;
}
```

### 4. Animation Overhaul
Smooth, gentle animations were replaced with snappy, harsh, and glitch-style animations.
- **Added Keyframes**: `brutalist-fadeIn`, `brutalist-slideInLeft`, `brutalist-jitter`, `brutalist-glitch`.

## Page-Level Backgrounds

The background of all main pages was updated to have a solid color and a thick, uniform border.
- **`frontend/apps/web/src/app/page.jsx`**: Changed `bg-[#F3F3F3]` to `bg-white border-8 border-black`.
- **`frontend/apps/web/src/app/cart/page.jsx`**: Changed `bg-[#F3F3F3]` to `bg-white border-8 border-black`.
- **`frontend/apps/web/src/app/search/page.jsx`**: Changed `bg-[#FFF8F0]` to `bg-yellow-50 border-8 border-black`.
- **`frontend/apps/web/src/app/wishlist/page.jsx`**: Changed `bg-[#F3F3F3]` to `bg-blue-50 border-8 border-black`.

## Component Modifications

### `frontend/apps/web/src/components/Header.jsx`
The header was transformed from a semi-transparent, blurry element to a solid, imposing block.
- **Before**: `bg-stone-900/95 backdrop-blur-xl`
- **After**: `bg-black border-4 border-b-4 border-white shadow-[8px_8px_0_#ffffff]`
- All interactive elements (logo, search bar, icons) were updated with hard borders and shadows.

## Dependency Updates

### `frontend/apps/web/bun.lock`
- The `framer-motion` library was updated, likely to support the new, more aggressive animation styles.
