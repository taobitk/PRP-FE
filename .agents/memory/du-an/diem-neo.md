# 📍 Điểm Neo Dự Án (Lớp 2)

Dự án Next.js 15 (App Router) với kiến trúc Feature-Sliced Design.

| Tech Stack / Phân loại | File / Thư mục | Ý Nghĩa Chức Năng |
|---|---|---|
| **Entry Point (App Router)** | `src/app/layout.tsx`, `src/app/page.tsx` | Root Layout (chứa QueryProvider, Toaster) và Entry chính. |
| **Routing / Pages** | `src/app/login/`, `src/app/dashboard/` | Các trang chính (dựa trên App Router convention). |
| **Core Configuration** | `next.config.ts`, `tailwind.config.ts`, `tsconfig.json` | Config hệ thống Next.js, Styling và TypeScript. |
| **Testing Setup** | `vitest.config.ts`, `playwright.config.ts` | Config TDD (Unit) và E2E (Playwright). |
| **API Client (Shared)** | `src/shared/lib/apiClient.ts` | Fetch Wrapper xử lý logic gọi API, Auth Token, Retry và Global Error. |
| **Global State** | `src/features/auth/model/authStore.ts` | Zustand Store quản lý trạng thái đăng nhập, phân quyền người dùng. |
| **UI Components** | `src/components/ui/` | Chứa Shadcn/ui core components (Button, Card, Form...). |
| **Runner Script** | `run.ps1` | Script tiện ích để chạy Dev, Test, E2E nhanh trên Windows. |
