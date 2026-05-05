# 🗺️ Memory Index (Bản Đồ Nhớ)

> Đây là file gốc để Agent tra cứu xem bộ nhớ đang có những thông tin gì.
> Yêu cầu các Agent phải cập nhật vào đây mỗi khi tạo file mới ở thư mục `.agents/memory/`.

| Đường dẫn | Mô tả | Cập nhật |
|-----------|-------|---------|
| `du-an/cau-truc.md` | Cây thư mục dự án | 28/04 |
| `du-an/diem-neo.md` | Phân tích Entry Point & Core Config | 28/04 |
| `du-an/kien-truc.md` | Phân tích FSD, luồng dữ liệu, test | 28/04 |
| `du-an/tong-quan.md` | (Chưa có) Tổng quan dự án, tech stack. | |
| `logs/lang-nghe.md` | (Chưa có) Nhật ký giao tiếp, yêu cầu ghi nhận. | |

## ⚖️ Rules

| Rule | Mô tả | Tạo |
|------|-------|-----|
| `.agents/rules/nextjs-tech-standards.md` | [P1-CRITICAL] Tech stack, TS strict, Contract First, TDD | 28/04 |
| `.agents/rules/nextjs-coding-standards.md` | [P1-CRITICAL/P2-HIGH] Clean Code, Error Handling, SOLID | 28/04 |
| `.agents/rules/nextjs-security-standards.md` | [P1-CRITICAL] Auth/JWT, Input Validation, XSS/CSP | 28/04 |
| `.agents/rules/nextjs-architecture-standards.md` | [P1-CRITICAL] FSD custom, dependency direction, public API | 28/04 |
| `.agents/rules/nextjs-a11y-testing-standards.md` | [P1-CRITICAL] aria-label bắt buộc, getByLabel ưu tiên, cấm nth() selector | 30/04 |

## 🧠 Skills

| Skill | Mô tả | Tạo |
|-------|-------|-----|
| `.agents/skills/sk-nextjs-scaffold/SKILL.md` | Scaffold project Next.js mới: create-next-app, dependencies, Shadcn/ui, FSD directories, foundation files, testing setup | 28/04 |
| `.agents/skills/sk-nextjs-feature/SKILL.md` | Tạo feature slice mới: entity types + api layer + model + public API gate | 28/04 |
| `.agents/skills/sk-nextjs-tdd/SKILL.md` | TDD Red-Green-Refactor: Vitest + Testing Library (unit), Playwright (E2E), templates và rules | 28/04 |
| `.agents/skills/sk-nextjs-state/SKILL.md` | State decision guide: Server State (TanStack Query) vs Client State (Zustand) vs URL State vs Form State vs Local State | 28/04 |
| `.agents/skills/sk-nextjs-ui-design/SKILL.md` | Thiết kế giao diện (UI) bằng Data-Driven Mapping, UX Patterns, Wireframe Markdown, và 8 nguyên tắc UX Vàng | 28/04 |
| `.agents/skills/sk-nextjs-a11y/SKILL.md` | Quy trình 5 bước Grep→Map→Batch UI→Batch Test→Verify để chuẩn hóa aria-label + getByLabel | 30/04 |

## 📋 Workflows

| Workflow | Lệnh | Mô tả | Tạo |
|----------|------|-------|-----|
| `.agents/workflows/wf_nextjs_new.md` | `/nextjs-new` | Tạo project mới, scaffold FSD, install deps, setup testing | 28/04 |
| `.agents/workflows/wf_nextjs_feature.md` | `/feature` | Design First → Contract → Scaffold feature → Handoff to TDD | 28/04 |
| `.agents/workflows/wf_nextjs_tdd.md` | `/tdd` | Chu trình TDD: RED → GREEN → REFACTOR | 28/04 |
| `.agents/workflows/wf_nextjs_design.md` | `/design` | Bóc tách UI thành entities, features, widgets, routes, Server/Client components | 28/04 |

## 🚨 Luật Tối Thượng

| Luật | Mô tả | Ghi đè bởi User? |
|------|-------|-------------------|
| **Design → Test → Code** | Describe behavior → write test → write code. NEVER code first | ❌ KHÔNG |
| **TypeScript Strict** | No `any`, no JS files in `src/` | ❌ KHÔNG |
| **FSD Dependency Rule** | Higher layers only import from lower, features never import each other | ❌ KHÔNG |
| **Contract First** | Define Zod schema + types before API call | ❌ KHÔNG |
| **2-Tier TDD** | Tier 1 (Vitest per-file) → Tier 2 (Playwright BDD) | ❌ KHÔNG |
| **aria-label First** | Mọi element tương tác PHẢI có aria-label, Test PHẢI dùng getByLabel/getByRole | ❌ KHÔNG |


