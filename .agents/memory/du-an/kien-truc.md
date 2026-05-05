# 🏗️ Kiến Trúc Tổng Quan (Lớp 3)

## 1. Mô hình Architecture
Hệ thống tuân thủ nghiêm ngặt **Custom Feature-Sliced Design (FSD)** kết hợp **Next.js App Router**.

- **`/app`**: Routing Layer (Chỉ chứa page, layout, route handlers). Không chứa logic kinh doanh.
- **`/widgets`**: Composition Layer (Các thành phần UI lớn ghép nối từ nhiều feature).
- **`/features`**: Business Logic Layer (Chứa logic tác vụ cụ thể như `auth`, `admin`, `user`).
  - Mỗi feature có cấu trúc: `api/`, `model/`, `ui/`.
- **`/entities`**: Domain Models (Khai báo Type, Interface lõi phản ánh Domain như `user.model.ts`). Không chứa logic UI hay API fetch.
- **`/shared`**: Foundation Layer (Chứa code dùng chung toàn cục).
  - Cấu trúc: `api/` (apiClient, contracts), `config/` (env), `ui/` (Shadcn components), `lib/` (utils, logger).

## 2. Luồng Dữ Liệu (Data Flow)
1. **User Action:** Xảy ra tại `app/page.tsx` hoặc Component.
2. **Feature API Hook:** React Query hook (vd: `useLogin`) trong `features/[name]/api/` nhận action.
3. **API Client:** Hook gọi `shared/lib/apiClient.ts` để format request, chèn Token, bắt lỗi.
4. **Contract Validation:** Payload request/response được định nghĩa & validate bằng Zod tại `shared/api/contracts/`.
5. **State Update:** Dữ liệu trả về được đưa vào Global Store (Zustand tại `features/.../model/`) hoặc được React Query cache lại tự động.
6. **UI Re-render:** Giao diện hiển thị thay đổi.

## 3. Chiến lược Testing
- **Unit & Integration:** Dùng `Vitest` + `React Testing Library`. File test nằm ngay cạnh source (`.test.tsx`). Mock API layer thay vì network thực.
- **End-to-End (E2E):** Dùng `Playwright`. Thư mục `tests/e2e/`. Intercept và Fulfill network responses để kiểm thử UI flow độc lập backend.
