/**
 * BerserkerCut Design System
 * 
 * Comprehensive design system for iOS-first experience
 * Implements consistent spacing, typography, and component styling
 * Based on the anthracite/cuivre/olive color scheme
 */

import {
  Colors,
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
} from './theme';

/**
 * Layout system with consistent spacing rules
 * Following iOS Human Interface Guidelines
 */
const layout = {
  // Screen structure
  screenPadding: Spacing.lg,      // Consistent padding for all screens
  contentGap: Spacing.md,         // Space between content blocks
  sectionGap: Spacing.xl,         // Space between major sections
  cardSpacing: Spacing.md,        // Internal card padding
  listItemSpacing: Spacing.md,    // Space between list items
  
  // Navigation
  navBarHeight: 44,               // iOS standard
  tabBarHeight: 49,               // iOS standard
  
  // Form elements
  formGroupSpacing: Spacing.lg,   // Space between form groups
  formControlHeight: 44,          // Standard height for inputs
  formLabelSpacing: Spacing.xs,   // Space between label and input
};

/**
 * Component style definitions
 * Provides consistent styling across all components
 */
const components = {
  // Card components
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadow: Shadows.sm,
  },
  cardCompact: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    shadow: Shadows.xs,
  },
  cardElevated: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    shadow: Shadows.md,
  },
  
  // Button styles
  button: {
    minHeight: 48,
    borderRadius: BorderRadius.xl,
    horizontalPadding: Spacing.lg,
    verticalPadding: Spacing.sm,
    textStyle: Typography.button,
  },
  buttonSmall: {
    minHeight: 36,
    borderRadius: BorderRadius.lg,
    horizontalPadding: Spacing.md,
    verticalPadding: Spacing.xs,
    textStyle: { ...Typography.button, fontSize: 14 },
  },
  
  // Text input styles
  input: {
    height: 44,                     // iOS standard input height
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.surface,
    textStyle: Typography.body,
  },
  
  // Chip/badge styles
  chip: {
    borderRadius: BorderRadius.round,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    textStyle: Typography.caption,
  },
  
  // List item styles
  listItem: {
    height: 44,                     // iOS standard list item height
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderColor: Colors.border,
  },
  
  // Tab bar styles
  tab: {
    height: 48,
    indicatorHeight: 2,
    indicatorColor: Colors.primary,
  },
  
  // Avatar/Profile image
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    borderRadius: BorderRadius.round, // Fully rounded
  },
  
  // Icon sizes
  icon: {
    small: 16,
    medium: 24,
    large: 32,
  },
};

/**
 * Design System export
 * Provides a comprehensive set of design tokens
 */
export const DesignSystem = {
  // Core design tokens
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  radius: BorderRadius,
  shadows: Shadows,
  
  // Font definitions
  fonts: {
    brand: 'System',   // Use SF Pro on iOS
    body: 'System',
    heading: 'System',
    monospace: 'Menlo', // iOS standard monospace font
  },
  
  // Layout and component systems
  layout,
  components,
  
  // Animations and transitions
  animation: {
    fast: 200,        // Duration in ms
    medium: 300,
    slow: 500,
    easing: 'ease-in-out',
  },
  
  // Screen breakpoints
  breakpoints: {
    small: 375,       // iPhone SE
    medium: 414,      // iPhone Plus/Max models
    large: 768,       // iPad
  },
} as const;

export type DesignSystemType = typeof DesignSystem;

export default DesignSystem;
