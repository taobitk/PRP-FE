"use client";

import { FinanceSummary } from "@/widgets/finance-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MemberDashboardView() {
  return (
    <div className="space-y-6">
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Tổng quan tài chính cá nhân</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Chào mừng bạn! Dưới đây là tóm tắt tình hình tài sản và dòng tiền của bạn trong tháng này.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tình hình tài chính</h2>
        <FinanceSummary />
      </div>
    </div>
  );
}
