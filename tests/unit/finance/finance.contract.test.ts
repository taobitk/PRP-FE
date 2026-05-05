import { describe, it, expect } from 'vitest';
import { CreateTransactionRequestSchema } from '@/shared/api/contracts/finance.contract';

describe('Finance Contract - CreateTransactionRequestSchema', () => {
  it('should pass when total attributions equal transaction amount', () => {
    const validData = {
      destination_wallet_id: 1,
      category_id: 2,
      amount: '1000',
      transaction_date: '2026-05-01',
      attributions: [
        { source_wallet_id: 1, amount: '400' },
        { source_wallet_id: 2, amount: '600' },
      ],
    };

    const result = CreateTransactionRequestSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail when total attributions do NOT equal transaction amount', () => {
    const invalidData = {
      destination_wallet_id: 1,
      category_id: 2,
      amount: '1000',
      transaction_date: '2026-05-01',
      attributions: [
        { source_wallet_id: 1, amount: '400' },
        { source_wallet_id: 2, amount: '500' }, // Total = 900 != 1000
      ],
    };

    const result = CreateTransactionRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Tổng phân bổ (900) phải bằng số tiền giao dịch (1000)');
    }
  });

  it('should handle zero and empty values safely', () => {
    const invalidData = {
      destination_wallet_id: 1,
      category_id: 2,
      amount: '0',
      transaction_date: '2026-05-01',
      attributions: [],
    };

    const result = CreateTransactionRequestSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
