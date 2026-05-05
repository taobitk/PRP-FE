"use client";

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/features/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AdminDashboardView } from '@/features/admin/ui/AdminDashboardView';
import { DashboardOverview } from '@/features/dashboard/ui/DashboardOverview';
import { LogOut, LayoutDashboard, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info('Đã đăng xuất.');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-sm shadow-2xl border-none">
          <CardHeader className="text-center">
            <div className="bg-indigo-100 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <CardTitle className="text-2xl font-black">GoPRP Platform</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-slate-500">Vui lòng đăng nhập để truy cập trung tâm điều khiển của bạn.</p>
            <Button onClick={() => router.push('/login')} className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold">
              Đến trang đăng nhập
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Control Center</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">System Overview</p>
          </div>
        </div>
        
        {isAdmin && (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-black uppercase tracking-tighter border border-amber-100">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Admin Mode Active
          </div>
        )}
      </div>

      <div className="space-y-12">
        {isAdmin ? (
          <div className="grid gap-8">
            <section>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                User Experience
              </h2>
              <DashboardOverview />
            </section>
            
            <section className="pt-8 border-t border-dashed">
              <h2 className="text-lg font-bold mb-4 text-amber-600">Administrative Controls</h2>
              <AdminDashboardView />
            </section>
          </div>
        ) : (
          <DashboardOverview />
        )}
      </div>
    </div>
  );
}
