"use client";

import { FinanceSummary } from "@/widgets/finance-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, PieChart } from "lucide-react";

export default function FinanceDashboardPage() {
  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <div className="bg-emerald-100 p-2 rounded-xl">
          <Wallet className="h-8 w-8 text-emerald-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Quản lý Tài chính</h1>
          <p className="text-muted-foreground text-sm">Theo dõi tài sản, dòng tiền và ngân sách của bạn</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-emerald-500/5 border-emerald-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng quan tài sản</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Tất cả các ví và tài khoản liên kết</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phân bổ chi tiêu</CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Theo dõi danh mục chi tiêu hàng tháng</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Tình hình tài chính</h2>
        <FinanceSummary />
      </div>
    </div>
  );
}
