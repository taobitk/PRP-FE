import { describe, it, expect } from 'vitest';
import { money } from '@/shared/lib/money';

describe('money utility', () => {
  it('should add amounts correctly', () => {
    expect(money.add('100.1', '200.2')).toBe('300.3');
    expect(money.add('1000000', '2000000', '3000000')).toBe('6000000');
  });

  it('should subtract amounts correctly', () => {
    expect(money.subtract('500', '200')).toBe('300');
    expect(money.subtract('100', '150')).toBe('-50');
  });

  it('should compare equality correctly', () => {
    expect(money.isEqual('100.00', '100')).toBe(true);
    expect(money.isEqual('100.01', '100')).toBe(false);
  });

  it('should format VND correctly', () => {
    // Note: Intl format can vary slightly by environment, so we check for common parts
    const formatted = money.formatVND('1000000');
    expect(formatted).toContain('1.000.000');
    expect(formatted).toContain('₫');
  });
});
