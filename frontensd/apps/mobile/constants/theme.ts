/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  primary: '#D97534', // Web Primary
  primaryDark: '#C86429', // Web Primary Hover
  secondary: '#8B4513', // Web Secondary (Headings)
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Web matched colors
    primary: '#D97534',
    backgroundGradientStart: '#F4E4D7',
    backgroundGradientMiddle: '#FFF8F0',
    backgroundGradientEnd: '#FAE5D3',
    cardBackground: '#FFFFFF',
    textHeading: '#8B4513',
    textBody: '#4B5563', // gray-600
    borderColor: '#D1D5DB', // gray-300
    badgeBackground: '#ECFDF5', // emerald-50
    badgeText: '#047857', // emerald-700
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Fallbacks for dark mode (can be adjusted later)
    primary: '#D97534',
    backgroundGradientStart: '#151718',
    backgroundGradientMiddle: '#151718',
    backgroundGradientEnd: '#151718',
    cardBackground: '#232D3F',
    textHeading: '#ECEDEE',
    textBody: '#9BA1A6',
    borderColor: '#4B5563',
    badgeBackground: '#064E3B',
    badgeText: '#A7F3D0',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
