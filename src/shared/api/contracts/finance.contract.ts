import { z } from 'zod';
import Big from 'big.js';

// --- Enums & Constants ---

export const WalletTypeSchema = z.enum(['cash', 'bank', 'credit']);
export type WalletType = z.infer<typeof WalletTypeSchema>;

export const CategoryTypeSchema = z.enum(['income', 'expense']);
export type CategoryType = z.infer<typeof CategoryTypeSchema>;

// --- Wallets ---

export const WalletSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  type: WalletTypeSchema,
  balance: z.string(), // Decimal as string
});

export const WalletListResponseSchema = z.object({
  data: z.array(WalletSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export const CreateWalletRequestSchema = z.object({
  name: z.string().min(1, 'Tên ví là bắt buộc'),
  type: WalletTypeSchema,
  initial_balance: z.string(),
});

export const UpdateWalletRequestSchema = z.object({
  name: z.string().min(1, 'Tên ví không được để trống'),
});

export const WalletTransferRequestSchema = z.object({
  from_wallet_id: z.number(),
  to_wallet_id: z.number(),
  amount: z.string().refine((val) => new Big(val).gt(0), 'Số tiền phải lớn hơn 0'),
});

// --- Categories ---

export const CategorySchema = z.object({
  id: z.number(),
  user_id: z.number(),
  name: z.string(),
  type: CategoryTypeSchema,
});

export const CategoryListResponseSchema = z.object({
  data: z.array(CategorySchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export const CreateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc'),
  type: CategoryTypeSchema,
});

export const UpdateCategoryRequestSchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
});

// --- Transactions & Attributions ---

export const AttributionSchema = z.object({
  id: z.number(),
  transaction_id: z.number(),
  source_wallet_id: z.number(),
  amount: z.string(),
});

export const TransactionSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  destination_wallet_id: z.number(),
  category_id: z.number(),
  amount: z.string(),
  transaction_date: z.string(), // ISO 8601
  note: z.string().optional(),
  attributions: z.array(AttributionSchema),
});

export const TransactionListResponseSchema = z.object({
  data: z.array(TransactionSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

export const CreateTransactionRequestSchema = z.object({
  destination_wallet_id: z.number(),
  category_id: z.number(),
  amount: z.string(),
  transaction_date: z.string(), // ISO 8601
  note: z.string().optional(),
  attributions: z.array(z.object({
    source_wallet_id: z.number(),
    amount: z.string(),
  })).min(1, 'Phải có ít nhất một nguồn phân bổ'),
}).superRefine((data, ctx) => {
  try {
    const totalAttribution = data.attributions.reduce(
      (sum, attr) => sum.plus(new Big(attr.amount)),
      new Big(0)
    );
    const totalAmount = new Big(data.amount);

    if (!totalAttribution.eq(totalAmount)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Tổng phân bổ (${totalAttribution.toString()}) phải bằng số tiền giao dịch (${totalAmount.toString()})`,
        path: ['attributions'],
      });
    }
  } catch (e) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Số tiền không hợp lệ',
    });
  }
});

// --- Analytics ---

export const FinanceDashboardResponseSchema = z.object({
  data: z.object({
    net_worth: z.string(),
    monthly_income: z.string(),
    monthly_expense: z.string(),
    monthly_net_cash_flow: z.string(),
  }),
});

export const FinanceReportResponseSchema = z.object({
  data: z.object({
    total_income: z.string(),
    total_expense: z.string(),
    net_cash_flow: z.string(),
    average_daily: z.string(),
  }),
});

export const SpendingBiasItemSchema = z.object({
  category_id: z.number(),
  category_name: z.string(),
  amount: z.string(),
  percentage: z.string(),
});

export const CashFlowTrendItemSchema = z.object({
  month: z.string(),
  year: z.number(),
  income: z.string(),
  expense: z.string(),
  net: z.string(),
});

export const SourceRoiItemSchema = z.object({
  source_id: z.number(),
  source_name: z.string(),
  income: z.string(),
  expense: z.string(),
  net_roi: z.string(),
});

export const ForecastResponseSchema = z.object({
  data: z.object({
    current_net_worth: z.string(),
    forecasted_monthly_expense: z.string(),
    forecasted_end_balance: z.string(),
    daily_average_expense: z.string(),
    days_remaining: z.number(),
    message: z.string(),
  }),
});

export const ComparisonResponseSchema = z.object({
  current_income: z.string(),
  prev_income: z.string(),
  income_change_percent: z.string(),
  current_expense: z.string(),
  prev_expense: z.string(),
  expense_change_percent: z.string(),
});

export const HealthScoreResponseSchema = z.object({
  data: z.object({
    total_score: z.number(),
    status: z.string(),
    savings_rate: z.string(),
    emergency_fund_months: z.string(),
    budget_compliance_rate: z.string(),
  }),
});

// --- Budgets ---

export const SetBudgetRequestSchema = z.object({
  category_id: z.number(),
  amount: z.string(),
  month: z.number().optional(),
  year: z.number().optional(),
});

export const BudgetStatusItemSchema = z.object({
  category_id: z.number(),
  category_name: z.string(),
  limit_amount: z.string(),
  spent_amount: z.string(),
  remaining: z.string(),
  is_over_budget: z.boolean(),
});

// --- Types ---

export type Wallet = z.infer<typeof WalletSchema>;
export type CreateWalletRequest = z.infer<typeof CreateWalletRequestSchema>;
export type UpdateWalletRequest = z.infer<typeof UpdateWalletRequestSchema>;
export type WalletTransferRequest = z.infer<typeof WalletTransferRequestSchema>;

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequestSchema>;
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequestSchema>;

export type Attribution = z.infer<typeof AttributionSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type CreateTransactionRequest = z.infer<typeof CreateTransactionRequestSchema>;

export type FinanceDashboardResponse = z.infer<typeof FinanceDashboardResponseSchema>;
export type FinanceReportResponse = z.infer<typeof FinanceReportResponseSchema>;
export type SpendingBiasItem = z.infer<typeof SpendingBiasItemSchema>;
export type CashFlowTrendItem = z.infer<typeof CashFlowTrendItemSchema>;
export type SourceRoiItem = z.infer<typeof SourceRoiItemSchema>;
export type ForecastResponse = z.infer<typeof ForecastResponseSchema>;
export type ComparisonResponse = z.infer<typeof ComparisonResponseSchema>;
export type HealthScoreResponse = z.infer<typeof HealthScoreResponseSchema>;

export type SetBudgetRequest = z.infer<typeof SetBudgetRequestSchema>;
export type BudgetStatusItem = z.infer<typeof BudgetStatusItemSchema>;

export type WalletListResponse = z.infer<typeof WalletListResponseSchema>;
export type CategoryListResponse = z.infer<typeof CategoryListResponseSchema>;
export type TransactionListResponse = z.infer<typeof TransactionListResponseSchema>;
