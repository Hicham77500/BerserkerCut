/**
 * Module: src/utils/theme.ts
 * Utilite: Contient la logique fonctionnelle de cette partie de BerserkerCut.
 * Navigation: Voir les exports nommes pour les points d'entree publics.
 */
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';

/**
 * BerserkerCut Theme System
 * 
 * Material Design 3 system with Industrial Brutalism + Glassmorphism
 * Tactical Berserker Red (#ff535b) primary, Primal Orange (#ffbd5c) secondary
 * Optimized for iOS with consistent visual language
 * WCAG AA compliant contrast ratios
 */

export type ThemeMode = 'dark' | 'light';

export interface ThemePalette {
  // Primary: Berserker Red (Material Design 3)
  primary: string;
  primaryDark: string; 
  primaryLight: string;
  
  // Secondary: Primal Orange (Material Design 3)
  secondary: string;
  secondaryDark: string;
  secondaryLight: string;
  
  // Accent: Tertiary Teal (Material Design 3)
  accent: string;
  accentDark: string;
  accentLight: string;
  
  // Backgrounds (Charcoal base)
  background: string;
  backgroundDark: string;
  secondaryBackground: string;
  surface: string;
  surfaceDark: string;
  
  // Text (High contrast)
  text: string;
  textLight: string;
  textDark: string;
  textMuted: string;
  label: string;
  secondaryLabel: string;
  
  // Feedback states (error, success, warning, info)
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

// Dark Theme Palette aligned with design captures (Industrial Brutalism)
export const DarkColors: ThemePalette = {
  // Primary: Tactical Berserker Red (CTA/critical actions)
  primary: '#ff535b',       // Primary container from design captures
  primaryDark: '#bb152c',   // Inverse primary
  primaryLight: '#ffb3b1',  // Surface tint / highlight

  // Secondary: Primal Orange (Material Design 3)
  secondary: '#ffbd5c',     // Primal Orange
  secondaryDark: '#ab8987', // Secondary outline
  secondaryLight: '#ec9e00', // Secondary container

  // Accent: Tertiary (Teal)
  accent: '#9ecfd1',        // Tertiary (teal accent)
  accentDark: '#1a4e50',    // On-tertiary-fixed-variant
  accentLight: '#b9ecee',   // Tertiary fixed

  // Backgrounds (Charcoal base from Material Design 3)
  background: '#1e0f0f',    // Background
  backgroundDark: '#180a0a', // Surface container lowest
  secondaryBackground: '#271717', // Surface container low
  surface: '#2c1b1b',       // Surface container
  surfaceDark: '#372625',   // Surface container high

  // Text (High contrast on dark)
  text: '#f9dcda',          // On-surface (light text)
  textLight: '#e4bebc',     // On-surface-variant
  textDark: '#3e2c2b',      // Inverse on-surface
  textMuted: '#ab8987',     // Outline variant
  label: '#f9dcda',
  secondaryLabel: '#e4bebc',

  // Feedback states (Material Design 3)
  success: '#8AAC6F',       // Success green (maintaining)
  warning: '#DFA147',       // Warning orange (maintaining)
  error: '#ffb4ab',         // Error (Material Design 3)
  info: '#9ecfd1',          // Info (tertiary)

  // Macro nutrients (aligned with captures)
  protein: '#ff535b',       // Berserker Red (protein)
  carbs: '#9ecfd1',         // Teal (carbs)
  fat: '#ffbd5c',           // Primal Orange (fat)
  calories: '#ffb3b1',      // Light pink-red (calories)

  // UI elements (Glassmorphism)
  overlay: 'rgba(30, 15, 15, 0.6)', // 60% opacity for glass
  overlayLight: 'rgba(30, 15, 15, 0.3)', // 30% semi-transparent
  border: '#ab8987',        // Outline (border)
  borderDark: '#5b403f',    // Outline variant (dark border)
};

export const Colors: ThemePalette = { ...DarkColors };

// Light Theme Palette (kept high-contrast, closer to tactical identity)
export const LightColors: ThemePalette = {
  primary: '#ff535b',       // Tactical Berserker Red
  primaryDark: '#bb152c',   // Darker pressed/active
  primaryLight: '#ffb3b1',  // Highlight tint

  secondary: '#ffbd5c',
  secondaryDark: '#452b00', // On-secondary
  secondaryLight: '#ec9e00', // Secondary container

  accent: '#9ecfd1',
  accentDark: '#003739',    // On-tertiary
  accentLight: '#68999b',   // Tertiary container

  background: '#fffbfe',   // Light background (Material Design 3 standard)
  backgroundDark: '#f1ecee', // Darker light variant
  secondaryBackground: '#f7eff4',
  surface: '#fffbfe',       // Light surface
  surfaceDark: '#f1ecee',   // Alternative surface

  text: '#1a1a1a',          // Dark text for light mode
  textLight: '#49454e',     // Secondary text
  textDark: '#f9dcda',      // Inverted (on-surface from dark mode)
  textMuted: '#79747e',     // Outline
  label: '#1a1a1a',
  secondaryLabel: '#49454e',

  success: '#66bb6a',       // Success light variant
  warning: '#f57c00',       // Warning light variant
  error: '#f2b8b5',         // Error light
  info: '#80deea',          // Info light

  protein: '#ff535b',       // Berserker Red (same)
  carbs: '#80deea',         // Teal light
  fat: '#ffbd5c',           // Primal Orange (same)
  calories: '#ffb3b1',      // Light pink-red

  overlay: 'rgba(0, 0, 0, 0.05)', // Subtle overlay for light
  overlayLight: 'rgba(0, 0, 0, 0.02)', // Very subtle
  border: '#e0e0e0',        // Light border
  borderDark: '#cccccc',    // Darker light border
};

// Typography system with Material Design 3 specifications
// Fonts: Anton (headlines), Inter (body), JetBrains Mono (technical)
const createTypography = (palette: ThemePalette) => ({
  // Headlines with Anton font (aggressive, cinematic)
  h1: {
    fontSize: 48,
    fontWeight: '400' as const, // Anton is single weight
    lineHeight: 52,
    letterSpacing: 0.02, // Material Design 3 spec
    fontFamily: 'Anton',
    textTransform: 'uppercase' as any,
    color: palette.text,
  },
  h2: {
    fontSize: 32,
    fontWeight: '400' as const,
    lineHeight: 36,
    letterSpacing: 0.02,
    fontFamily: 'Anton',
    textTransform: 'uppercase' as any,
    color: palette.text,
  },
  h3: {
    fontSize: 28,
    fontWeight: '400' as const,
    lineHeight: 32,
    letterSpacing: 0.02,
    fontFamily: 'Anton',
    color: palette.text,
  },
  h4: {
    fontSize: 18,
    fontWeight: '700' as const, // Inter: Bold for title
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: 'Inter',
    color: palette.text,
  },
  // Body text with Inter font (clear, data-heavy)
  body: {
    fontSize: 16,
    fontWeight: '400' as const, // Inter: Regular
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: 'Inter',
    color: palette.text,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: 0,
    fontFamily: 'Inter',
    color: palette.textLight,
  },
  // Technical labels with JetBrains Mono
  caption: {
    fontSize: 12,
    fontWeight: '500' as const, // JetBrains Mono: Medium
    lineHeight: 16,
    letterSpacing: 0.05, // Technical font spacing
    fontFamily: 'JetBrains Mono',
    color: palette.textLight,
  },
  // Interactive elements with Inter
  button: {
    fontSize: 16,
    fontWeight: '700' as const, // Inter: Bold
    lineHeight: 24,
    letterSpacing: 0,
    fontFamily: 'Inter',
    color: palette.text,
  },
  // iOS footnote style
  footnote: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
    fontFamily: 'Inter',
    color: palette.textLight,
  },
  // iOS label style
  label: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
    fontFamily: 'Inter',
    color: palette.text,
  },
  // Technical data (set numbers, timestamps, macro grams)
  technical: {
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
    letterSpacing: 0.05,
    fontFamily: 'JetBrains Mono',
    color: palette.textLight,
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

// Spacing system based on 4px base unit (Material Design 3 spec)
// Tight (4-8px) for related data, loose (24px+) for distinct sections
export const Spacing = {
  xxs: 2,    // 2px: Very minimal spacing
  xs: 4,     // 4px base: Extra small (tight spacing)
  sm: 8,     // 8px: Small (tight related data)
  md: 12,    // 12px: Medium-small
  md_: 16,   // 16px: Medium (standard gutter)
  lg: 24,    // 24px: Large (loose distinct sections)
  xl: 32,    // 32px: Extra large
  xxl: 48,   // 48px: Double extra large
  // Aliases for layout
  gutter: 16,        // Standard gutter width (4 * 4px)
  margin_mobile: 16, // Mobile margin
  margin_desktop: 32, // Desktop margin (8 * 4px)
} as const;

// Border radius system (sharp corners for Brutalism aesthetic)
// 0px for majority of elements, exceptions for progress rings and status indicators
export const BorderRadius = {
  none: 0,    // Sharp corners (default for cards, buttons, modals)
  xs: 4,      // 4px: Progress ring (slightly rounded)
  sm: 8,      // 8px: Small progress rings, minor curves
  md: 10,     // 10px: Medium progress rings
  lg: 12,     // 12px: Large progress rings (functional exceptions)
  xl: 16,     // 16px: Extra large (rare, for specific indicators)
  round: 999, // Fully rounded (circle for avatars, status dots)
  // Aliases
  sharp: 0,   // Sharp Brutalist corner (majority)
  slight: 4,  // Slight rounding for rings
} as const;

// Initialize typography with dark theme colors as default
export let Typography: TypographyScheme = createTypography(DarkColors);

// Elevation & Glassmorphism system (replacing soft shadows)
// Tonal layering with 1px borders, no ambient shadows
// Glassmorphic overlays: rgba(26,26,26,0.6) + 20px backdrop blur
export const Shadows = {
  // Glassmorphic surfaces (for modals, cards, overlays)
  glass_xs: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    // Note: Actual glassmorphism requires:
    // backgroundColor: 'rgba(26,26,26,0.6)'
    // backdropFilter: 'blur(20px)'
    // borderWidth: 1
    // borderColor: 'rgba(171,137,135,0.2)'
  },
  glass_sm: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    // Glassmorphism config (higher opacity)
    // backgroundColor: 'rgba(26,26,26,0.75)'
    // backdropFilter: 'blur(20px)'
  },
  // Tonal borders (1px solid strokes, no shadows)
  border_xs: {
    shadowColor: 'transparent',
    elevation: 0,
    // Equivalent: 1px solid #ab8987 at 20% opacity
  },
  border_md: {
    shadowColor: 'transparent',
    elevation: 0,
    // Equivalent: 1px solid #ab8987 at 15% opacity
  },
  // Legacy minimal shadows (for backward compat during transition)
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 14,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

// Type definitions for enhanced TypeScript support
export type ColorKey = keyof typeof Colors;
export type SpacingKey = keyof typeof Spacing;
export type BorderRadiusKey = keyof typeof BorderRadius;
export type ShadowKey = keyof typeof Shadows;
export type TypographyKey = keyof TypographyScheme;
