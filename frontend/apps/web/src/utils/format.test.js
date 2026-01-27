import { describe, it, expect } from 'vitest';
import { formatCurrency, formatCompactNumber } from './format';

describe('formatCurrency', () => {
    it('formats a number as Indian currency with symbol by default', () => {
        expect(formatCurrency(1234.56)).toBe('₹1,234.56');
    });

    it('formats a string number as Indian currency', () => {
        expect(formatCurrency("1234.56")).toBe('₹1,234.56');
    });

    it('formats a number without symbol when showSymbol is false', () => {
        expect(formatCurrency(1234.56, false)).toBe('1,234.56');
    });

    it('handles null input', () => {
        expect(formatCurrency(null)).toBe('₹0.00');
    });

    it('handles undefined input', () => {
        expect(formatCurrency(undefined)).toBe('₹0.00');
    });

    it('handles zero input', () => {
        expect(formatCurrency(0)).toBe('₹0.00');
    });

    it('handles invalid number string', () => {
        expect(formatCurrency("abc")).toBe('₹0.00');
    });

    it('formats large numbers correctly (Lakhs/Crores)', () => {
         // Note: Intl.NumberFormat for en-IN groups by 2 after the first 3 digits
         // 123456789 -> 12,34,56,789
        expect(formatCurrency(123456789)).toBe('₹12,34,56,789.00');
    });
});

describe('formatCompactNumber', () => {
    it('returns the number as string for small numbers', () => {
        expect(formatCompactNumber(500)).toBe('500');
    });

    it('formats thousands with "k"', () => {
        expect(formatCompactNumber(1500)).toBe('1.5k');
    });

    it('formats lakhs with "L"', () => {
        expect(formatCompactNumber(150000)).toBe('1.5L');
    });

    it('formats crores with "Cr"', () => {
        expect(formatCompactNumber(15000000)).toBe('1.5Cr');
    });

    it('handles zero', () => {
        expect(formatCompactNumber(0)).toBe('0');
    });

    it('handles null/undefined', () => {
        expect(formatCompactNumber(null)).toBe('0');
        expect(formatCompactNumber(undefined)).toBe('0');
    });
});
