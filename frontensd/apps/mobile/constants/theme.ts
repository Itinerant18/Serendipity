/**
 * Serendipity Design System - Mobile Theme
 * Matches the web application aesthetic
 */

import { Platform } from 'react-native';

// ===== Core Brand Colors =====
export const BrandColors = {
  // Primary (Amber/Orange)
  primary: '#D97534',
  primaryHover: '#C86429',
  primaryActive: '#B55A24',
  
  // Secondary (Gold)
  secondary: '#febd69',
  secondaryHover: '#f3a847',
  
  // Dark Blue (Headers)
  darkBlue: '#232F3E',
  lightBlue: '#37475A',
  
  // Success/Error/Warning
  success: '#067D62',
  warning: '#FFA724',
  error: '#C7511F',
  info: '#007185',
  
  // Star Rating
  starGold: '#FFA41C',
};

// ===== Neutral Colors =====
export const NeutralColors = {
  white: '#FFFFFF',
  black: '#0F1111',
  
  // Grays
  gray50: '#FAFAFA',
  gray100: '#F3F3F3',
  gray200: '#E7E7E7',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// ===== Background Colors =====
export const BackgroundColors = {
  // Light mode
  light: '#FFFFFF',
  cream: '#FFF8F0',
  creamDark: '#F4E4D7',
  neutral: '#F3F3F3',
  
  // Dark mode
  dark: '#151718',
  darkCard: '#232D3F',
};

// ===== Shadow Presets =====
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glass: {
    shadowColor: 'rgba(31, 38, 135, 0.07)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 32,
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
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

// ===== Legacy Colors Export (for backward compat) =====
const tintColorLight = '#D97534';
const tintColorDark = '#febd69';

export const Colors = {
  primary: BrandColors.primary,
  primaryDark: BrandColors.primaryHover,
  secondary: BrandColors.darkBlue,
  light: {
    text: NeutralColors.gray900,
    background: BackgroundColors.light,
    tint: tintColorLight,
    icon: NeutralColors.gray500,
    tabIconDefault: NeutralColors.gray400,
    tabIconSelected: tintColorLight,
    // Web matched colors
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    darkBlue: BrandColors.darkBlue,
    lightBlue: BrandColors.lightBlue,
    backgroundGradientStart: BackgroundColors.creamDark,
    backgroundGradientMiddle: BackgroundColors.cream,
    backgroundGradientEnd: '#FAE5D3',
    cardBackground: BackgroundColors.light,
    textHeading: '#8B4513',
    textBody: NeutralColors.gray600,
    borderColor: NeutralColors.gray300,
    badgeBackground: '#ECFDF5',
    badgeText: '#047857',
    neutralBg: BackgroundColors.neutral,
  },
  dark: {
    text: '#ECEDEE',
    background: BackgroundColors.dark,
    tint: tintColorDark,
    icon: NeutralColors.gray400,
    tabIconDefault: NeutralColors.gray400,
    tabIconSelected: tintColorDark,
    // Dark mode colors
    primary: BrandColors.primary,
    secondary: BrandColors.secondary,
    darkBlue: BrandColors.darkBlue,
    lightBlue: BrandColors.lightBlue,
    backgroundGradientStart: BackgroundColors.dark,
    backgroundGradientMiddle: BackgroundColors.dark,
    backgroundGradientEnd: BackgroundColors.dark,
    cardBackground: BackgroundColors.darkCard,
    textHeading: '#ECEDEE',
    textBody: NeutralColors.gray400,
    borderColor: NeutralColors.gray700,
    badgeBackground: '#064E3B',
    badgeText: '#A7F3D0',
    neutralBg: '#1a1a1a',
  },
};

// ===== Fonts =====
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
});

