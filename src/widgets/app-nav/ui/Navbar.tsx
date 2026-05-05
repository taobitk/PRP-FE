'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import { 
  Search, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut,
  Sparkles,
  ChevronDown,
  Wallet,
  Receipt,
  PieChart,
  Settings2,
  Tags,
  FileText,
  Users
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/model/authStore';
import { Button } from '@/components/ui/button';
import { CreateDocumentModal } from '@/features/annotation/ui/CreateDocumentModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isAnnotationActive = pathname.startsWith('/annotations');
  const isFinanceActive = pathname.startsWith('/finance');

  // Ẩn Navbar trên trang login
  if (pathname === '/login') {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-1.5 rounded-lg shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              GoPRP
            </span>
          </Link>

          {/* Main Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                pathname === '/dashboard' ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* Annotation Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                nativeButton={false}
                render={
                  <div 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer outline-none",
                      isAnnotationActive ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <FileText className="w-4 h-4" />
                    Annotation
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </div>
                }
              />
              <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl shadow-xl border-slate-100">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 pb-2">
                    Content Processing
                  </DropdownMenuLabel>
                  <Link href="/annotations/search">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                      <div className="bg-indigo-100 p-1.5 rounded-md">
                        <Search className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Search Tags</span>
                        <span className="text-[10px] opacity-60">Tìm kiếm theo nhãn</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <Link href="/annotations">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-indigo-50 focus:text-indigo-600 transition-colors">
                      <div className="bg-indigo-100 p-1.5 rounded-md">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Manage Documents</span>
                        <span className="text-[10px] opacity-60">Quản lý tài liệu</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Finance Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger 
                nativeButton={false}
                render={
                  <div 
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer outline-none",
                      isFinanceActive ? "bg-emerald-50 text-emerald-600" : "text-gray-600 hover:bg-gray-50"
                    )}
                  >
                    <Wallet className="w-4 h-4" />
                    Finance
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </div>
                }
              />
              <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl shadow-xl border-slate-100">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 pb-2">
                    Financial Management
                  </DropdownMenuLabel>
                  <Link href="/finance">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                      <div className="bg-emerald-100 p-1.5 rounded-md">
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Finance Overview</span>
                        <span className="text-[10px] opacity-60">Tổng quan tài chính</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/finance/analytics">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                      <div className="bg-emerald-100 p-1.5 rounded-md">
                        <PieChart className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Analytics</span>
                        <span className="text-[10px] opacity-60">Thống kê & Biểu đồ</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/finance/transactions">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                      <div className="bg-emerald-100 p-1.5 rounded-md">
                        <Receipt className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Transactions</span>
                        <span className="text-[10px] opacity-60">Quản lý giao dịch</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/finance/wallets">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                      <div className="bg-emerald-100 p-1.5 rounded-md">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Wallets</span>
                        <span className="text-[10px] opacity-60">Ví tiền của bạn</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-2 pb-2">
                    Settings
                  </DropdownMenuLabel>
                  <Link href="/finance/budgets">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                      <div className="bg-emerald-100 p-1.5 rounded-md">
                        <Settings2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Budgets</span>
                        <span className="text-[10px] opacity-60">Thiết lập ngân sách</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/finance/categories">
                    <DropdownMenuItem className="rounded-lg cursor-pointer gap-3 p-2.5 focus:bg-emerald-50 focus:text-emerald-600 transition-colors">
                      <div className="bg-emerald-100 p-1.5 rounded-md">
                        <Tags className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">Categories</span>
                        <span className="text-[10px] opacity-60">Danh mục thu chi</span>
                      </div>
                    </DropdownMenuItem>
                  </Link>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Admin Menu (Only for Admins) */}
            {user?.role === 'admin' && (
              <Link
                href="/admin/users"
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                  pathname.startsWith('/admin') ? "bg-rose-50 text-rose-600" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <Users className="w-4 h-4" />
                Admin
              </Link>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold text-gray-900">{user.username}</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">{user.role}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => logout()}
                  className="text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md px-6 h-10">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
