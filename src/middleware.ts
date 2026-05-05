import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // 1. Nếu đã đăng nhập mà định vào trang login thì cho vào dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 2. Nếu chưa đăng nhập mà vào các trang yêu cầu auth
  const protectedPaths = ['/dashboard', '/finance', '/admin'];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (!token && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Bảo vệ trang Admin
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Chỉ chạy middleware trên các đường dẫn cụ thể để tránh tốn tài nguyên
export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/finance/:path*', 
    '/admin/:path*', 
    '/login'
  ],
};
