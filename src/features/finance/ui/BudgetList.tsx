'use client';

import { useBudgetStatus } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { money } from '@/shared/lib/money';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  month?: number;
  year?: number;
}

export function BudgetList({ month, year }: Props) {
  const { data: budgets, isLoading } = useBudgetStatus(month, year);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2" data-testid="budget-list-loading">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
    return (
      <div className="text-center p-12 text-text-secondary border rounded-lg border-dashed">
        Chưa có ngân sách nào được thiết lập cho thời gian này.
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {budgets.map((budget) => {
        const spent = parseFloat(budget.spent_amount);
        const limit = parseFloat(budget.limit_amount);
        const percent = Math.min(Math.round((spent / limit) * 100), 100);
        const isOver = budget.is_over_budget;

        return (
          <Card key={budget.category_id} className={isOver ? 'border-red-200 bg-red-50/30' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg font-bold">{budget.category_name}</CardTitle>
                {isOver ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Đã tiêu: {money.formatVND(budget.spent_amount)}</span>
                  <span className="font-semibold">{percent}%</span>
                </div>
                <Progress 
                  value={percent} 
                  className="h-2" 
                  data-over={isOver}
                  data-testid={`budget-progress-${budget.category_id}`}
                />
                <div className="flex justify-between text-[10px] text-text-muted">
                  <span>Hạn mức: {money.formatVND(budget.limit_amount)}</span>
                  <span>Còn lại: {money.formatVND(budget.remaining)}</span>
                </div>
              </div>

              {isOver && (
                <p className="text-xs text-red-600 font-medium">
                  Cảnh báo: Bạn đã chi vượt mức ngân sách cho phép!
                </p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
