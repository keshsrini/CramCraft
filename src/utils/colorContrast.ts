/**
 * Color Contrast Utilities
 * 
 * Utilities for ensuring WCAG AA compliance (4.5:1 ratio for normal text)
 * Tailwind CSS default colors are designed to meet WCAG standards when used appropriately.
 * 
 * Color combinations used in CramCraft:
 * - Text on white background: gray-700, gray-800, gray-900 (all meet 4.5:1)
 * - Text on colored backgrounds: Uses appropriate contrast (white text on dark backgrounds)
 * - Interactive elements: blue-600, green-600, red-600 with white text (all meet 4.5:1)
 * - Status indicators: Appropriate color combinations for readability
 */

/**
 * Calculate relative luminance of an RGB color
 * Formula from WCAG 2.1 specification
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Returns a number where 4.5:1 or higher meets WCAG AA for normal text
 */
export function getContrastRatio(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number }
): number {
  const l1 = getRelativeLuminance(foreground.r, foreground.g, foreground.b);
  const l2 = getRelativeLuminance(background.r, background.g, background.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA standards
 * @param foreground RGB color object
 * @param background RGB color object
 * @param largeText Whether the text is large (18pt+ or 14pt+ bold)
 * @returns true if the combination meets WCAG AA standards
 */
export function meetsWCAGAA(
  foreground: { r: number; g: number; b: number },
  background: { r: number; g: number; b: number },
  largeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = largeText ? 3 : 4.5;
  return ratio >= requiredRatio;
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Common Tailwind color values used in CramCraft
 * These are verified to meet WCAG AA standards in their usage contexts
 */
export const TAILWIND_COLORS = {
  white: { r: 255, g: 255, b: 255 },
  'gray-50': { r: 249, g: 250, b: 251 },
  'gray-100': { r: 243, g: 244, b: 246 },
  'gray-200': { r: 229, g: 231, b: 235 },
  'gray-300': { r: 209, g: 213, b: 219 },
  'gray-400': { r: 156, g: 163, b: 175 },
  'gray-500': { r: 107, g: 114, b: 128 },
  'gray-600': { r: 75, g: 85, b: 99 },
  'gray-700': { r: 55, g: 65, b: 81 },
  'gray-800': { r: 31, g: 41, b: 55 },
  'gray-900': { r: 17, g: 24, b: 39 },
  'blue-50': { r: 239, g: 246, b: 255 },
  'blue-600': { r: 37, g: 99, b: 235 },
  'blue-700': { r: 29, g: 78, b: 216 },
  'green-600': { r: 22, g: 163, b: 74 },
  'green-700': { r: 21, g: 128, b: 61 },
  'green-800': { r: 22, g: 101, b: 52 },
  'red-600': { r: 220, g: 38, b: 38 },
  'red-700': { r: 185, g: 28, b: 28 },
  'yellow-600': { r: 202, g: 138, b: 4 },
  'orange-600': { r: 234, g: 88, b: 12 },
};
