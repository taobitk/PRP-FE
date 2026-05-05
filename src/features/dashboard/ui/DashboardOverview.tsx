"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  PlusCircle, 
  Wallet, 
  ArrowRight, 
  Sparkles, 
  Search,
  ChevronRight,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/features/auth";
import { CreateDocumentModal } from "@/features/annotation/ui/CreateDocumentModal";

export function DashboardOverview() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 p-8 text-white shadow-2xl">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white/20 backdrop-blur-md p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-200" />
            </div>
            <span className="text-sm font-medium text-indigo-100 tracking-wider uppercase">Welcome back</span>
          </div>
          <h2 className="text-4xl font-black mb-2 tracking-tight">
            Chào mừng quay trở lại, {user?.username}!
          </h2>
          <p className="text-indigo-100 max-w-xl text-lg opacity-90 leading-relaxed">
            Hệ thống GoPRP đã sẵn sàng. Hôm nay bạn muốn bắt đầu từ đâu? 
            Hãy chọn một trong các module bên dưới để tiếp tục công việc.
          </p>
          
          <div className="flex gap-4 mt-6">
            <CreateDocumentModal
              trigger={
                <Button className="bg-white text-indigo-600 hover:bg-indigo-50 rounded-xl px-6 h-12 font-bold shadow-lg transition-all hover:scale-105 active:scale-95">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Băm tài liệu mới
                </Button>
              }
            />
            <Link href="/finance/transactions">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md rounded-xl px-6 h-12 font-bold transition-all">
                <Wallet className="mr-2 h-5 w-5" />
                Thêm chi tiêu
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>

      {/* Modules Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Annotation Module Card */}
        <Card className="group overflow-hidden border-none shadow-xl bg-white hover:ring-2 hover:ring-indigo-500/20 transition-all">
          <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-indigo-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Annotation</CardTitle>
                <p className="text-sm text-muted-foreground">Quản lý & Phân tách nội dung</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/annotations" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 group/item transition-colors">
                <span className="text-sm font-semibold">Tài liệu của tôi</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 transition-transform" />
              </Link>
              <Link href="/annotations/search" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 group/item transition-colors">
                <span className="text-sm font-semibold">Tìm theo Tag</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Tổ chức nội dung Markdown thành cấu trúc cây thông minh.
            </p>
          </CardContent>
        </Card>

        {/* Finance Module Card */}
        <Card className="group overflow-hidden border-none shadow-xl bg-white hover:ring-2 hover:ring-emerald-500/20 transition-all">
          <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-2xl group-hover:scale-110 transition-transform">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">Finance</CardTitle>
                <p className="text-sm text-muted-foreground">Tài chính & Tài sản</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Link href="/finance" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 group/item transition-colors">
                <span className="text-sm font-semibold">Tổng quan</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 transition-transform" />
              </Link>
              <Link href="/finance/wallets" className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 group/item transition-colors">
                <span className="text-sm font-semibold">Ví cá nhân</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:translate-x-1 transition-transform" />
              </Link>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Activity className="w-3 h-3" />
              Theo dõi biến động số dư và phân loại chi tiêu tự động.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions / System Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 border-none shadow-lg bg-white overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Hệ thống thông báo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-8 text-center text-slate-400">
              <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6" />
              </div>
              <p className="font-medium">Chưa có thông báo mới nào từ hệ thống.</p>
              <p className="text-xs">Mọi thứ vẫn đang hoạt động ổn định.</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-lg bg-indigo-50/50 border-indigo-100">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-indigo-500">Quick Support</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-indigo-900 mb-4 font-medium">Bạn cần trợ giúp về cách sử dụng GoPRP?</p>
            <Button variant="link" className="px-0 text-indigo-600 font-bold h-auto">
              Xem tài liệu hướng dẫn <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
