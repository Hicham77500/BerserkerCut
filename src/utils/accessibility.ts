/**
 * BerserkerCut Accessibility Utilities
 * 
 * Utilities to ensure optimal accessibility and WCAG AA compliance
 * Focuses on color contrast ratios for optimal readability
 */

import { Colors } from './theme';

/**
 * Calculate the relative luminance of an RGB color
 * Formula from WCAG 2.0 https://www.w3.org/TR/WCAG20/#relativeluminancedef
 * 
 * @param r Red channel (0-255)
 * @param g Green channel (0-255)
 * @param b Blue channel (0-255)
 * @returns Relative luminance value (0-1)
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [R, G, B] = [r, g, b].map(c => {
    const channel = c / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
};

/**
 * Parse a hex color string into RGB values
 * 
 * @param hex Color in hex format (#RGB or #RRGGBB)
 * @returns Object with r, g, b values (0-255)
 */
const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex to RGB
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }

  return { r, g, b };
};

/**
 * Calculate the contrast ratio between two colors
 * Formula from WCAG 2.0 https://www.w3.org/TR/WCAG20/#contrast-ratiodef
 * 
 * @param color1 First color in hex format
 * @param color2 Second color in hex format
 * @returns Contrast ratio (1-21)
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  // Calculate contrast ratio: (L1 + 0.05) / (L2 + 0.05)
  // Where L1 is the higher luminance and L2 is the lower luminance
  const ratio = l1 > l2 
    ? (l1 + 0.05) / (l2 + 0.05) 
    : (l2 + 0.05) / (l1 + 0.05);
  
  return parseFloat(ratio.toFixed(2));
};

/**
 * Check if a contrast ratio meets WCAG AA standard
 * For normal text, the required ratio is at least 4.5:1
 * For large text (18pt or 14pt bold), the required ratio is at least 3:1
 * 
 * @param ratio Contrast ratio
 * @param isLargeText Whether the text is large (>=18pt or >=14pt bold)
 * @returns Boolean indicating if it meets WCAG AA standard
 */
export const meetsWCAGAA = (ratio: number, isLargeText = false): boolean => {
  return isLargeText ? ratio >= 3.0 : ratio >= 4.5;
};

/**
 * Check if a text color and background color combination meets WCAG AA standards
 * 
 * @param textColor Text color in hex format
 * @param bgColor Background color in hex format
 * @param isLargeText Whether the text is large (>=18pt or >=14pt bold)
 * @returns Boolean indicating if it meets WCAG AA standard
 */
export const isAccessible = (
  textColor: string, 
  bgColor: string, 
  isLargeText = false
): boolean => {
  const ratio = getContrastRatio(textColor, bgColor);
  return meetsWCAGAA(ratio, isLargeText);
};

/**
 * Check accessibility of our design system color combinations
 * This helps identify any accessibility issues in our color palette
 * 
 * @returns Object containing pairs of colors and their accessibility status
 */
export const checkDesignSystemAccessibility = () => {
  const results: {[key: string]: {ratio: number, passes: boolean}} = {};
  
  // Check text colors against backgrounds
  results['Text on Background'] = {
    ratio: getContrastRatio(Colors.text, Colors.background),
    passes: isAccessible(Colors.text, Colors.background)
  };
  
  results['Text on Surface'] = {
    ratio: getContrastRatio(Colors.text, Colors.surface),
    passes: isAccessible(Colors.text, Colors.surface)
  };
  
  results['TextLight on Background'] = {
    ratio: getContrastRatio(Colors.textLight, Colors.background),
    passes: isAccessible(Colors.textLight, Colors.background)
  };
  
  results['TextMuted on Background'] = {
    ratio: getContrastRatio(Colors.textMuted, Colors.background),
    passes: isAccessible(Colors.textMuted, Colors.background)
  };
  
  results['Text on Primary'] = {
    ratio: getContrastRatio(Colors.text, Colors.primary),
    passes: isAccessible(Colors.text, Colors.primary)
  };
  
  results['Text on Secondary'] = {
    ratio: getContrastRatio(Colors.text, Colors.secondary),
    passes: isAccessible(Colors.text, Colors.secondary)
  };
  
  results['Text on Accent'] = {
    ratio: getContrastRatio(Colors.text, Colors.accent),
    passes: isAccessible(Colors.text, Colors.accent)
  };
  
  // Check macro nutrient colors against backgrounds
  results['Protein on Background'] = {
    ratio: getContrastRatio(Colors.protein, Colors.background),
    passes: isAccessible(Colors.protein, Colors.background, true) // Consider as large text
  };
  
  results['Carbs on Background'] = {
    ratio: getContrastRatio(Colors.carbs, Colors.background),
    passes: isAccessible(Colors.carbs, Colors.background, true)
  };
  
  results['Fat on Background'] = {
    ratio: getContrastRatio(Colors.fat, Colors.background),
    passes: isAccessible(Colors.fat, Colors.background, true)
  };
  
  results['Calories on Background'] = {
    ratio: getContrastRatio(Colors.calories, Colors.background),
    passes: isAccessible(Colors.calories, Colors.background, true)
  };
  
  return results;
};

/**
 * Suggest an adjusted color to meet WCAG AA contrast standards
 * This is useful for dynamically adjusting colors to ensure accessibility
 * 
 * @param foreground Foreground color in hex format
 * @param background Background color in hex format
 * @param isLargeText Whether the text is large (>=18pt or >=14pt bold)
 * @returns Adjusted foreground color that meets WCAG AA standards
 */
export const suggestAccessibleColor = (
  foreground: string, 
  background: string, 
  isLargeText = false
): string => {
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  // Get the luminance of the background
  const bgLuminance = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  
  // Determine if we should go darker or lighter
  const shouldDarken = bgLuminance > 0.5;
  
  // Start with the original color
  let adjustedRgb = { ...fgRgb };
  let adjustedLuminance = getLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
  let ratio = (Math.max(adjustedLuminance, bgLuminance) + 0.05) / 
             (Math.min(adjustedLuminance, bgLuminance) + 0.05);
  
  // Target ratio based on WCAG AA
  const targetRatio = isLargeText ? 3.0 : 4.5;
  
  // Maximum adjustment iterations
  const maxIterations = 20;
  let iterations = 0;
  
  // Adjust color until it meets the contrast requirement or we hit max iterations
  while (ratio < targetRatio && iterations < maxIterations) {
    // Adjust the color by making it lighter or darker
    if (shouldDarken) {
      // Darken
      adjustedRgb.r = Math.max(0, adjustedRgb.r - 10);
      adjustedRgb.g = Math.max(0, adjustedRgb.g - 10);
      adjustedRgb.b = Math.max(0, adjustedRgb.b - 10);
    } else {
      // Lighten
      adjustedRgb.r = Math.min(255, adjustedRgb.r + 10);
      adjustedRgb.g = Math.min(255, adjustedRgb.g + 10);
      adjustedRgb.b = Math.min(255, adjustedRgb.b + 10);
    }
    
    // Recalculate luminance and ratio
    adjustedLuminance = getLuminance(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
    ratio = (Math.max(adjustedLuminance, bgLuminance) + 0.05) / 
           (Math.min(adjustedLuminance, bgLuminance) + 0.05);
    
    iterations++;
  }
  
  // Convert back to hex
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(adjustedRgb.r)}${toHex(adjustedRgb.g)}${toHex(adjustedRgb.b)}`;
};

export default {
  getContrastRatio,
  meetsWCAGAA,
  isAccessible,
  checkDesignSystemAccessibility,
  suggestAccessibleColor
};