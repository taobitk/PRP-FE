import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { 
  Wallet, 
  CreateWalletRequest, 
  UpdateWalletRequest,
  WalletTransferRequest,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Transaction,
  CreateTransactionRequest,
  FinanceDashboardResponse,
  FinanceReportResponse,
  SpendingBiasItem,
  CashFlowTrendItem,
  SourceRoiItem,
  ForecastResponse,
  ComparisonResponse,
  HealthScoreResponse,
  SetBudgetRequest,
  BudgetStatusItem,
  WalletListResponse,
  CategoryListResponse,
  TransactionListResponse
} from '@/shared/api/contracts/finance.contract';

// --- Wallets ---

export function useWallets() {
  return useQuery<WalletListResponse['data']>({
    queryKey: ['finance', 'wallets'],
    queryFn: () => apiClient<WalletListResponse>('/finance/wallets').then(res => res.data),
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation<Wallet, Error, CreateWalletRequest>({
    mutationFn: (data) => apiClient<any>('/finance/wallets', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; data: UpdateWalletRequest }>({
    mutationFn: ({ id, data }) => apiClient<void>(`/finance/wallets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient<void>(`/finance/wallets/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
    },
  });
}

export function useTransferMoney() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, WalletTransferRequest>({
    mutationFn: (data) => apiClient<void>('/finance/wallets/transfer', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
    },
  });
}

// --- Categories ---

export function useCategories() {
  return useQuery<CategoryListResponse['data']>({
    queryKey: ['finance', 'categories'],
    queryFn: () => apiClient<CategoryListResponse>('/finance/categories').then(res => res.data),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation<Category, Error, CreateCategoryRequest>({
    mutationFn: (data) => apiClient<any>('/finance/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; data: UpdateCategoryRequest }>({
    mutationFn: ({ id, data }) => apiClient<void>(`/finance/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient<void>(`/finance/categories/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'categories'] });
    },
  });
}

// --- Transactions ---

export function useTransactions() {
  return useQuery<TransactionListResponse['data']>({
    queryKey: ['finance', 'transactions'],
    queryFn: () => apiClient<TransactionListResponse>('/finance/transactions').then(res => res.data),
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, CreateTransactionRequest>({
    mutationFn: (data) => apiClient<any>('/finance/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  return useMutation<Transaction, Error, { id: number; data: CreateTransactionRequest }>({
    mutationFn: ({ id, data }) => apiClient<any>(`/finance/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) => apiClient<void>(`/finance/transactions/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'wallets'] });
      queryClient.invalidateQueries({ queryKey: ['finance', 'analytics'] });
    },
  });
}

// --- Analytics ---

export function useFinanceDashboard() {
  return useQuery<FinanceDashboardResponse['data']>({
    queryKey: ['finance', 'analytics', 'dashboard'],
    queryFn: () => apiClient<FinanceDashboardResponse>('/finance/analytics/dashboard').then(res => res.data || {}),
  });
}

export function useFinanceReport(months: number = 1) {
  return useQuery<FinanceReportResponse['data']>({
    queryKey: ['finance', 'analytics', 'report', months],
    queryFn: () => apiClient<FinanceReportResponse>(`/finance/analytics/report?months=${months}`).then(res => res.data || {}),
  });
}

export function useSpendingBias(months: number = 1) {
  return useQuery<SpendingBiasItem[]>({
    queryKey: ['finance', 'analytics', 'spending-bias', months],
    queryFn: () => apiClient<any>(`/finance/analytics/spending-bias?months=${months}`).then(res => res.data || []),
  });
}

export function useCashFlowTrend(months: number = 6) {
  return useQuery<CashFlowTrendItem[]>({
    queryKey: ['finance', 'analytics', 'trend', months],
    queryFn: () => apiClient<any>(`/finance/analytics/trend?months=${months}`).then(res => res.data || []),
  });
}

export function useSourceROI() {
  return useQuery<SourceRoiItem[]>({
    queryKey: ['finance', 'analytics', 'source-roi'],
    queryFn: () => apiClient<any>('/finance/analytics/source-roi').then(res => res.data || []),
  });
}

export function useForecast() {
  return useQuery<ForecastResponse['data']>({
    queryKey: ['finance', 'analytics', 'forecast'],
    queryFn: () => apiClient<ForecastResponse>('/finance/analytics/forecast').then(res => res.data || {}),
  });
}

export function useComparison() {
  return useQuery<ComparisonResponse>({
    queryKey: ['finance', 'analytics', 'comparison'],
    queryFn: () => apiClient<any>('/finance/analytics/comparison').then(res => res.data || {}),
  });
}

export function useHealthScore() {
  return useQuery<HealthScoreResponse['data']>({
    queryKey: ['finance', 'analytics', 'health-score'],
    queryFn: () => apiClient<HealthScoreResponse>('/finance/analytics/health-score').then(res => res.data || {}),
  });
}

// --- Budgets ---

export function useSetBudget() {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, SetBudgetRequest>({
    mutationFn: (data) => apiClient<{ message: string }>('/finance/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance', 'budgets'] });
    },
  });
}

export function useBudgetStatus(month?: number, year?: number) {
  const query = new URLSearchParams();
  if (month) query.append('month', month.toString());
  if (year) query.append('year', year.toString());
  
  const queryString = query.toString() ? `?${query.toString()}` : '';

  return useQuery<BudgetStatusItem[]>({
    queryKey: ['finance', 'budgets', 'status', month, year],
    queryFn: () => apiClient<any>(`/finance/budgets/status${queryString}`).then(res => res.data),
  });
}
