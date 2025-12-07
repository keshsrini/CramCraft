import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { getContrastRatio, meetsWCAGAA, hexToRgb, TAILWIND_COLORS } from './colorContrast';

/**
 * Property 39: Color contrast compliance
 * **Feature: cramcraft, Property 39: Color contrast compliance**
 * **Validates: Requirements 10.3**
 * 
 * For any text element, the color contrast ratio should meet WCAG AA standards (4.5:1 for normal text).
 */
describe('Property 39: Color contrast compliance', () => {
  it('should verify all Tailwind color combinations used in CramCraft meet WCAG AA', () => {
    // Test common text color combinations used in the app
    const textColorCombinations = [
      // Text on white backgrounds
      { fg: TAILWIND_COLORS['gray-700'], bg: TAILWIND_COLORS.white, desc: 'gray-700 on white' },
      { fg: TAILWIND_COLORS['gray-800'], bg: TAILWIND_COLORS.white, desc: 'gray-800 on white' },
      { fg: TAILWIND_COLORS['gray-900'], bg: TAILWIND_COLORS.white, desc: 'gray-900 on white' },
      { fg: TAILWIND_COLORS['gray-600'], bg: TAILWIND_COLORS.white, desc: 'gray-600 on white' },
      
      // Text on gray backgrounds
      { fg: TAILWIND_COLORS['gray-700'], bg: TAILWIND_COLORS['gray-50'], desc: 'gray-700 on gray-50' },
      { fg: TAILWIND_COLORS['gray-800'], bg: TAILWIND_COLORS['gray-50'], desc: 'gray-800 on gray-50' },
      
      // White text on colored backgrounds (buttons)
      { fg: TAILWIND_COLORS.white, bg: TAILWIND_COLORS['blue-600'], desc: 'white on blue-600' },
      { fg: TAILWIND_COLORS.white, bg: TAILWIND_COLORS['green-700'], desc: 'white on green-700' },
      { fg: TAILWIND_COLORS.white, bg: TAILWIND_COLORS['red-600'], desc: 'white on red-600' },
      
      // Colored text on light backgrounds (status indicators)
      { fg: TAILWIND_COLORS['blue-600'], bg: TAILWIND_COLORS['blue-50'], desc: 'blue-600 on blue-50' },
      { fg: TAILWIND_COLORS['green-700'], bg: TAILWIND_COLORS.white, desc: 'green-700 on white' },
      { fg: TAILWIND_COLORS['red-700'], bg: TAILWIND_COLORS.white, desc: 'red-700 on white' },
    ];

    textColorCombinations.forEach(({ fg, bg, desc }) => {
      const ratio = getContrastRatio(fg, bg);
      const meetsStandard = meetsWCAGAA(fg, bg);
      
      expect(meetsStandard, `${desc} should meet WCAG AA (ratio: ${ratio.toFixed(2)}:1)`).toBe(true);
      expect(ratio, `${desc} should have ratio >= 4.5:1`).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('should calculate correct contrast ratios for known color pairs', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          // Black on white should be 21:1
          { fg: { r: 0, g: 0, b: 0 }, bg: { r: 255, g: 255, b: 255 }, expected: 21 },
          // White on black should be 21:1
          { fg: { r: 255, g: 255, b: 255 }, bg: { r: 0, g: 0, b: 0 }, expected: 21 },
          // Same color should be 1:1
          { fg: { r: 128, g: 128, b: 128 }, bg: { r: 128, g: 128, b: 128 }, expected: 1 }
        ),
        ({ fg, bg, expected }) => {
          const ratio = getContrastRatio(fg, bg);
          expect(Math.abs(ratio - expected)).toBeLessThan(0.1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify contrast ratio is symmetric', () => {
    fc.assert(
      fc.property(
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        (color1, color2) => {
          const ratio1 = getContrastRatio(color1, color2);
          const ratio2 = getContrastRatio(color2, color1);
          
          // Contrast ratio should be the same regardless of order
          expect(Math.abs(ratio1 - ratio2)).toBeLessThan(0.001);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify WCAG AA threshold is correctly applied', () => {
    fc.assert(
      fc.property(
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        (fg, bg) => {
          const ratio = getContrastRatio(fg, bg);
          const meetsAA = meetsWCAGAA(fg, bg, false);
          const meetsAALarge = meetsWCAGAA(fg, bg, true);
          
          // Normal text requires 4.5:1
          if (ratio >= 4.5) {
            expect(meetsAA).toBe(true);
          } else {
            expect(meetsAA).toBe(false);
          }
          
          // Large text requires 3:1
          if (ratio >= 3) {
            expect(meetsAALarge).toBe(true);
          } else {
            expect(meetsAALarge).toBe(false);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly parse hex colors', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        (r, g, b) => {
          // Convert to hex string
          const hexString = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          const hex = `#${hexString}`;
          const rgb = hexToRgb(hex);
          
          expect(rgb).toBeTruthy();
          if (rgb) {
            expect(rgb.r).toBe(r);
            expect(rgb.g).toBe(g);
            expect(rgb.b).toBe(b);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify contrast ratio is always >= 1', () => {
    fc.assert(
      fc.property(
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        fc.record({
          r: fc.integer({ min: 0, max: 255 }),
          g: fc.integer({ min: 0, max: 255 }),
          b: fc.integer({ min: 0, max: 255 }),
        }),
        (color1, color2) => {
          const ratio = getContrastRatio(color1, color2);
          
          // Contrast ratio should always be at least 1:1
          expect(ratio).toBeGreaterThanOrEqual(1);
          
          // Contrast ratio should never exceed 21:1 (black on white)
          expect(ratio).toBeLessThanOrEqual(21);
        }
      ),
      { numRuns: 100 }
    );
  });
});
