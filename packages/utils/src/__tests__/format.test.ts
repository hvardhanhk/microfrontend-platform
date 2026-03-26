import { formatCurrency, formatDate, formatNumber } from '../format';

describe('formatCurrency', () => {
  it('formats USD by default', () => {
    expect(formatCurrency(99.99)).toBe('$99.99');
  });

  it('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats large numbers with commas', () => {
    const result = formatCurrency(1234567.89);
    expect(result).toContain('1,234,567.89');
  });

  it('supports EUR currency', () => {
    const result = formatCurrency(49.99, 'EUR', 'de-DE');
    expect(result).toContain('49,99');
  });
});

describe('formatNumber', () => {
  it('formats with locale separators', () => {
    expect(formatNumber(1000000)).toBe('1,000,000');
  });
});

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2025-03-15T00:00:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});
