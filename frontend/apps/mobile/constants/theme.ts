/**
 * Serendipity Design System - Mobile Theme
 * Matches the web application 'Liquid Glass' aesthetic
 */

import { Platform } from 'react-native';

// ===== Core Brand Colors - Liquid Glass Palette =====
export const BrandColors = {
  // Primary (Vibrant Blue)
  primary: '#3B82F6',
  primaryHover: '#2563EB',
  primaryActive: '#1D4ED8',

  // Secondary (Sky Blue)
  secondary: '#60A5FA',
  secondaryHover: '#3B82F6',

  // CTA (Orange)
  cta: '#F97316',
  ctaHover: '#EA580C',

  // Text Colors
  textPrimary: '#1E293B', // Slate 800
  textSecondary: '#475569', // Slate 600
  textTertiary: '#94A3B8', // Slate 400

  // Status Colors
  success: '#22C55E', // Emerald
  warning: '#F59E0B', // Amber
  error: '#EF4444',   // Red
  info: '#3B82F6',    // Blue

  // Star Rating
  starGold: '#F59E0B',
};

// ===== Neutral Colors =====
export const NeutralColors = {
  white: '#FFFFFF',
  black: '#0F172A', // Slate 900

  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray300: '#CBD5E1',
  gray400: '#94A3B8',
  gray500: '#64748B',
  gray600: '#475569',
  gray700: '#334155',
  gray800: '#1E293B',
  gray900: '#0F172A',
};

// ===== Background Colors =====
export const BackgroundColors = {
  // Light mode
  light: '#F8FAFC', // Slate 50
  card: '#FFFFFF',
  glass: 'rgba(255, 255, 255, 0.7)',
  glassDarker: 'rgba(255, 255, 255, 0.9)',

  // Dark mode
  dark: '#0F172A', // Slate 900
  darkCard: '#1E293B', // Slate 800
  darkGlass: 'rgba(30, 41, 59, 0.7)',
};

// ===== Glass Effects =====
export const GlassEffects = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 1,
  },
  dark: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
  },
  blurAmount: Platform.select({ ios: 20, android: 10, default: 0 }),
};

// ===== Shadow Presets =====
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#3B82F6', // Blue-tinted shadow for glow effect
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  glass: {
    shadowColor: 'rgba(148, 163, 184, 0.2)', // Slate shadow
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
};

// ===== Spacing =====
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ===== Border Radius =====
export const BorderRadius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// ===== Legacy Colors Export (for backward compat) =====
const tintColorLight = BrandColors.primary;
const tintColorDark = BrandColors.primary;

export const Colors = {
  primary: BrandColors.primary,
  primaryDark: BrandColors.primaryHover,
  secondary: BrandColors.secondary,
  light: {
    text: BrandColors.textPrimary,
    textSecondary: BrandColors.textSecondary,
    background: BackgroundColors.light,
    tint: tintColorLight,
    icon: NeutralColors.gray400,
    tabIconDefault: NeutralColors.gray400,
    tabIconSelected: tintColorLight,
    // Web matched colors
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    darkBlue: BrandColors.primaryActive, // Mapped to primary active
    lightBlue: BrandColors.secondary, // Mapped to secondary
    backgroundGradientStart: '#F0F9FF', // Sky 50
    backgroundGradientMiddle: '#E0F2FE', // Sky 100
    backgroundGradientEnd: '#BAE6FD', // Sky 200
    cardBackground: BackgroundColors.card,
    textHeading: BrandColors.textPrimary,
    textBody: BrandColors.textSecondary,
    borderColor: NeutralColors.gray200,
    badgeBackground: '#ECFDF5',
    badgeText: '#047857',
    neutralBg: BackgroundColors.light,
    glass: GlassEffects.light,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: BackgroundColors.dark,
    tint: tintColorDark,
    icon: NeutralColors.gray500,
    tabIconDefault: NeutralColors.gray500,
    tabIconSelected: tintColorDark,
    // Dark mode colors
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    darkBlue: BrandColors.primaryActive,
    lightBlue: BrandColors.secondary,
    backgroundGradientStart: BackgroundColors.dark,
    backgroundGradientMiddle: '#1E293B',
    backgroundGradientEnd: '#0F172A',
    cardBackground: BackgroundColors.darkCard,
    textHeading: '#F8FAFC',
    textBody: '#94A3B8',
    borderColor: NeutralColors.gray700,
    badgeBackground: '#064E3B',
    badgeText: '#A7F3D0',
    neutralBg: '#0F172A',
    glass: GlassEffects.dark,
  },
};

// ===== Fonts =====
export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Times New Roman',
    rounded: 'System',
    mono: 'Courier New',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-medium',
    mono: 'monospace',
  },
  web: {
    sans: "'Nunito Sans', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "'Rubik', Georgia, 'Times New Roman', serif",
    rounded: "'Nunito Sans', 'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});


