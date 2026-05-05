import Big from 'big.js';

/**
 * Tiện ích xử lý tiền tệ chính xác bằng Big.js
 */
export const money = {
  /**
   * Cộng hai hoặc nhiều số (dạng string)
   */
  add: (...amounts: string[]): string => {
    return amounts.reduce((sum, val) => sum.plus(new Big(val || '0')), new Big(0)).toString();
  },

  /**
   * Trừ hai số
   */
  subtract: (a: string, b: string): string => {
    return new Big(a || '0').minus(new Big(b || '0')).toString();
  },

  /**
   * So sánh hai số
   */
  isEqual: (a: string, b: string): boolean => {
    return new Big(a || '0').eq(new Big(b || '0'));
  },

  /**
   * Kiểm tra a > b
   */
  isGreaterThan: (a: string, b: string): boolean => {
    return new Big(a || '0').gt(new Big(b || '0'));
  },

  /**
   * Định dạng tiền tệ VND (dùng Intl.NumberFormat)
   */
  formatVND: (amount: string | number): string => {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  },
};
