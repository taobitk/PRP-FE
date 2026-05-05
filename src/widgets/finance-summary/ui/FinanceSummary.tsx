'use client';

import { useFinanceDashboard } from '@/features/finance/api/financeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { money } from '@/shared/lib/money';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet, TrendingUp, TrendingDown, Landmark } from 'lucide-react';

export function FinanceSummary() {
  const { data, isLoading, isError } = useFinanceDashboard();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="finance-summary-loading">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[120px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6 text-red-600">
          Không thể tải dữ liệu tài chính. Vui lòng thử lại sau.
        </CardContent>
      </Card>
    );
  }

  const items = [
    {
      title: 'Tổng tài sản',
      value: data.net_worth,
      icon: Landmark,
      testId: 'finance-card-net-worth',
      color: 'text-primary',
    },
    {
      title: 'Thu nhập tháng này',
      value: data.monthly_income,
      icon: TrendingUp,
      testId: 'finance-card-income',
      color: 'text-green-600',
    },
    {
      title: 'Chi tiêu tháng này',
      value: data.monthly_expense,
      icon: TrendingDown,
      testId: 'finance-card-expense',
      color: 'text-red-600',
    },
    {
      title: 'Dòng tiền thuần',
      value: data.monthly_net_cash_flow,
      icon: Wallet,
      testId: 'finance-card-net-cash-flow',
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.testId} data-testid={item.testId}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              {item.title}
            </CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {money.formatVND(item.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
