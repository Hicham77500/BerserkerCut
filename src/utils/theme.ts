import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';

/**
 * BerserkerCut Theme System
 * 
 * Harmonized color system based on anthracite/cuivre/olive palette
 * Optimized for iOS with consistent visual language
 * WCAG AA compliant contrast ratios
 */

export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  // Primary: Cuivre (Copper)
  primary: string;
  primaryDark: string; 
  primaryLight: string;
  
  // Secondary: Anthracite (Dark Gray)
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Accent: Olive
  accent: string;
  accentDark: string;
  accentLight: string;
  
  // Backgrounds
  background: string;
  backgroundDark: string;
  secondaryBackground: string;
  surface: string;
  surfaceDark: string;
  
  // Text
  text: string;
  textLight: string;
  textDark: string;
  textMuted: string;
  label: string;
  secondaryLabel: string;
  
  // Feedback states
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Macro nutrients
  protein: string;
  carbs: string;
  fat: string;
  calories: string;
  
  // UI elements
  overlay: string;
  overlayLight: string;
  border: string;
  borderDark: string;
}

// Dark Theme Palette (Anthracite base)
export const DarkColors: ThemePalette = {
  // Primary: Copper (Cuivre)
  primary: '#C2633A',       // Improved copper tone
  primaryDark: '#9A4C2C',   // Darker copper for pressed states
  primaryLight: '#E08B62',  // Lighter copper for highlights

  // Secondary: Anthracite (Dark Gray)
  secondary: '#242420',     // True anthracite dark
  secondaryDark: '#1A1A17', // Deeper anthracite for contrast
  secondaryLight: '#38382F', // Lighter anthracite for surfaces

  // Accent: Olive
  accent: '#8A8B4A',        // True olive tone
  accentDark: '#636534',    // Darker olive for depth
  accentLight: '#A6A76D',   // Lighter olive for highlights

  // Backgrounds
  background: '#1C1A18',    // Dark background (core)
  backgroundDark: '#110C0A', // Darker background
  secondaryBackground: '#221E1B',
  surface: '#251C17',       // Surface element background
  surfaceDark: '#2E231D',   // Alternative surface

  // Text
  text: '#F5F2F0',          // Primary text (improved contrast)
  textLight: '#C4BDB9',     // Secondary text
  textDark: '#201711',      // Inverted text
  textMuted: '#A99280',     // Muted text
  label: '#F5F2F0',
  secondaryLabel: '#C4BDB9',

  // Feedback states
  success: '#8AAC6F',       // Success green (more olive tint)
  warning: '#DFA147',       // Warning orange
  error: '#C25E44',         // Error red (copper tint)
  info: '#6B8E9F',          // Info blue

  // Macro nutrients (harmonized with main palette)
  protein: '#C25E44',       // Protein (copper family)
  carbs: '#6B8E9F',         // Carbs (blue)
  fat: '#DFA147',           // Fat (orange/gold)
  calories: '#9874BC',      // Calories (purple)

  // UI elements
  overlay: 'rgba(23, 18, 15, 0.75)', // More opaque overlay
  overlayLight: 'rgba(23, 18, 15, 0.4)', // Semi transparent overlay
  border: '#3E2F26',        // Border color
  borderDark: '#4E3C32',    // Dark border
};

export const Colors: ThemePalette = { ...DarkColors };

// Light Theme Palette (iOS surfaces)
export const LightColors: ThemePalette = {
  primary: '#C2633A',
  primaryDark: '#9A4C2C',
  primaryLight: '#E08B62',

  secondary: '#EDE9E5',
  secondaryDark: '#D4CFCB',
  secondaryLight: '#F8F5F2',

  accent: '#807C5A',
  accentDark: '#5D5942',
  accentLight: '#A5A07A',

  background: '#FBF8F5',
  backgroundDark: '#F1ECE7',
  secondaryBackground: '#F5F1ED',
  surface: '#FFFFFF',
  surfaceDark: '#F1ECE7',

  text: '#2C2622',
  textLight: '#6B5F58',
  textDark: '#110C0A',
  textMuted: '#8A7C71',
  label: '#2C2622',
  secondaryLabel: '#6B5F58',

  success: '#4F8756',
  warning: '#D48A28',
  error: '#B24A32',
  info: '#3F6D82',

  protein: '#B24A32',
  carbs: '#3F6D82',
  fat: '#D48A28',
  calories: '#7456A4',

  overlay: 'rgba(17, 12, 10, 0.05)',
  overlayLight: 'rgba(17, 12, 10, 0.03)',
  border: '#E1D9D2',
  borderDark: '#C8BEB5',
};

// Typography system with consistent scaling
const createTypography = (palette: ThemePalette) => ({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as const, // Bold
    lineHeight: 40,
    letterSpacing: 0.35,        // iOS-specific letter spacing
    color: palette.text,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const, // Semi-bold
    lineHeight: 32,
    letterSpacing: 0.25,
    color: palette.text,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const, // Semi-bold
    lineHeight: 28,
    letterSpacing: 0.15,
    color: palette.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: '500' as const, // Medium
    lineHeight: 24,
    letterSpacing: 0.15,
    color: palette.text,
  },
  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as const, // Regular
    lineHeight: 24,
    letterSpacing: 0.5,
    color: palette.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const, // Regular
    lineHeight: 20,
    letterSpacing: 0.25,
    color: palette.textLight,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const, // Regular
    lineHeight: 16,
    letterSpacing: 0.4,
    color: palette.textLight,
  },
  // Interactive elements
  button: {
    fontSize: 16,
    fontWeight: '600' as const, // Semi-bold
    lineHeight: 24,
    letterSpacing: 0.5,
    color: palette.text,
  },
  // New styles for iOS
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
    color: palette.textLight,
  },
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: palette.text,
  },
});

type TypographyScheme = ReturnType<typeof createTypography>;

export const DarkTheme = {
  colors: DarkColors,
  mode: 'dark' as ThemeMode,
};

export const LightTheme = {
  colors: LightColors,
  mode: 'light' as ThemeMode,
};

export const DarkNavigationTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: DarkColors.primary,
    background: DarkColors.background,
    card: DarkColors.surface,
    text: DarkColors.text,
    border: DarkColors.border,
    notification: DarkColors.accent,
  },
};

export const LightNavigationTheme = {
  ...NavigationLightTheme,
  colors: {
    ...NavigationLightTheme.colors,
    primary: LightColors.primary,
    background: LightColors.background,
    card: LightColors.surface,
    text: LightColors.text,
    border: LightColors.border,
    notification: LightColors.accent,
  },
};

// iOS-optimized spacing system with more precision
export const Spacing = {
  xxs: 2,    // New: Extra small spacing
  xs: 4,     // Extra small spacing
  sm: 8,     // Small spacing
  md: 16,    // Medium spacing
  lg: 24,    // Large spacing
  xl: 32,    // Extra large spacing
  xxl: 48,   // Double extra large
} as const;

// iOS-optimized border radius system
export const BorderRadius = {
  xs: 2,     // New: Extra small radius
  sm: 4,     // Small radius 
  md: 8,     // Medium radius
  lg: 12,    // Large radius
  xl: 16,    // Extra large radius
  xxl: 24,   // New: Double extra large radius
  round: 999, // Fully rounded (better than 50 for various sizes)
} as const;

// Initialize typography with dark theme colors as default
export let Typography: TypographyScheme = createTypography(DarkColors);

// iOS-optimized shadow system
export const Shadows = {
  xs: {      // New: Extra small shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {      // Small shadow (subtle)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  md: {      // Medium shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  lg: {      // Large shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
  },
  xl: {      // New: Extra large shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
} as const;

// Type definitions for enhanced TypeScript support
export type ColorKey = keyof typeof Colors;
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type ShadowKey = keyof typeof Shadows;
export type TypographyKey = keyof TypographyScheme;
