'use client';

import { SpendingChart } from '@/features/finance/ui/SpendingChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  useCashFlowTrend, 
  useSourceROI, 
  useHealthScore,
  useForecast,
  useComparison,
  useFinanceDashboard,
  useFinanceReport
} from '@/features/finance/api/financeApi';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';
import { money } from '@/shared/lib/money';
import { Activity, ShieldCheck, Zap, TrendingUp, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';

export default function AnalyticsPage() {
  const { data: trend } = useCashFlowTrend(6);
  const { data: roi } = useSourceROI();
  const { data: health } = useHealthScore();
  const { data: forecast } = useForecast();
  const { data: comparison } = useComparison();
  const { data: dashboard } = useFinanceDashboard();
  const { data: report } = useFinanceReport(1);

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phân tích tài chính</h1>
          <p className="text-text-secondary mt-1">Dữ liệu thông minh giúp bạn tối ưu hóa dòng tiền.</p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm text-text-muted">Tổng tài sản ước tính</div>
          <div className="text-2xl font-bold text-primary">{money.formatVND(dashboard?.net_worth || 0)}</div>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-primary text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <ShieldCheck className="h-4 w-4 opacity-70" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{health?.total_score || 0} / 100</div>
            <p className="text-xs mt-1 opacity-80">{health?.status || 'Đang tính toán...'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thu nhập tháng này</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{money.formatVND(report?.total_income || 0)}</div>
            <p className="text-xs text-text-secondary mt-1">Dựa trên báo cáo tháng gần nhất</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chi tiêu tháng này</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{money.formatVND(report?.total_expense || 0)}</div>
            <p className="text-xs text-text-secondary mt-1">Net flow: {money.formatVND(report?.net_cash_flow || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dự báo số dư</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{money.formatVND(forecast?.forecasted_end_balance || 0)}</div>
            <p className="text-xs text-text-secondary mt-1">Dự báo cho tháng tới</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SpendingChart />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Xu hướng dòng tiền (6 tháng)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend || []}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C49F" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#00C49F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis hide />
                <Tooltip />
                <Area type="monotone" dataKey="net_cash_flow" stroke="#00C49F" fillOpacity={1} fill="url(#colorIncome)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">So sánh mức chi tiêu</CardTitle>
            <TrendingUp className="h-4 w-4 text-text-muted" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Của bạn</span>
                <span className="font-bold">{money.formatVND(comparison?.current_expense || 0)}</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${Math.min(Number(comparison?.expense_change_percent || 0), 100)}%` }} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Trung bình hệ thống</span>
                <span className="font-bold">{money.formatVND(comparison?.prev_expense || 0)}</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-text-muted" 
                  style={{ width: '50%' }} 
                />
              </div>
            </div>
            <p className="text-xs text-text-secondary italic">
               * Dữ liệu so sánh dựa trên hoạt động tài chính cá nhân của bạn.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">ROI theo nguồn tiền</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roi || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="source_name" />
                <YAxis />
                <Tooltip />
                 <Bar dataKey="net_roi" fill="#0088FE" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
