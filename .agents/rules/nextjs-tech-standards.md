# ⚖️ Next.js Tech & Architecture Standards

> These rules are ALWAYS in effect across the entire Next.js workspace.
> No exceptions. No workarounds without explicit User approval.

---

## § 1 — MANDATORY TECH STACK [CRITICAL]

The following stack is locked. Agents MUST NOT suggest alternatives unless User explicitly requests a change. Breaking this rule is a project-level failure.

| Category | Technology | Version |
|---|---|---|
| **Framework** | Next.js — App Router | 15+ |
| **Language** | TypeScript | 5+ (strict mode) |
| **Architecture** | Custom FSD + Clean Architecture | — |
| **UI Library** | Shadcn/ui (Radix UI based) | latest |
| **Server State** | TanStack Query (React Query) | v5+ |
| **Client State** | Zustand | v5+ |
| **Form** | React Hook Form | v7+ |
| **Validation** | Zod | v3+ |
| **Testing (Unit)** | Vitest + Testing Library | latest |
| **Testing (E2E)** | Playwright | latest |
| **Styling** | Tailwind CSS (via Shadcn/ui) | v3+ |

### § 1.1 — Forbidden Substitutions

Agents MUST NEVER introduce the following without explicit User approval:

- ❌ `Pages Router` — Use App Router only
- ❌ `JavaScript` — TypeScript is mandatory, no `*.js` files in `src/`
- ❌ `Ant Design` / `MUI` / `Chakra UI` — Shadcn/ui only
- ❌ `Redux` / `Recoil` / `Jotai` — Zustand for client state
- ❌ `axios` (unless justified) — Use native `fetch` wrapped by TanStack Query
- ❌ `class-validator` — Zod only
- ❌ `moment.js` — Use `date-fns` or native `Intl`
- ❌ `any` type in TypeScript — Use `unknown` and narrow properly

---

## § 2 — ARCHITECTURE: CUSTOM FSD + CLEAN ARCHITECTURE [CRITICAL]

> Full architecture details in `nextjs-architecture-standards.md`.
> This section is a quick reference only.

### § 2.1 — Layer Structure (Top → Bottom)

```
src/
├── app/          [Layer 5] Next.js App Router: routing, layouts, thin page composers
├── widgets/      [Layer 4] Composite blocks: Header, Sidebar, DashboardSummary
├── features/     [Layer 3] Business modules: auth, product, order (ui + model + api)
├── entities/     [Layer 2] Shared domain: types, Zod schemas, base entity UI
└── shared/       [Layer 1] Platform: apiClient, ui-kit, utils, config, hooks
```

### § 2.2 — Dependency Rule (STRICT)

> **Higher layers import from lower layers. NEVER the reverse.**
> **Features NEVER import from other features.** Cross-feature data goes through entities/ or props.

### § 2.3 — Feature Internal Structure

```
features/{name}/
├── ui/          ← Components (presentation layer)
├── model/       ← Hooks + Zustand store (application layer)
├── api/         ← TanStack Query hooks + API calls (infrastructure layer)
└── index.ts     ← Public API gate — ONLY import path for upper layers
```

### § 2.4 — Public API Rule

Every feature and entity MUST have an `index.ts`. Upper layers import ONLY from `index.ts`.

```typescript
import { LoginForm } from '@/features/auth'                    // ✅ CORRECT
import { LoginForm } from '@/features/auth/ui/LoginForm'       // ❌ FORBIDDEN
```

---

## § 3 — TYPESCRIPT STANDARDS [CRITICAL]

### § 3.1 — tsconfig Requirements

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### § 3.2 — Type Rules

- ✅ Always define explicit return types for functions
- ✅ Use `interface` for object shapes that may be extended
- ✅ Use `type` for unions, intersections, and primitives
- ✅ Use Zod schema as the single source of truth for types:

```typescript
// ✅ Correct: Zod is the source of truth
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})
type LoginPayload = z.infer<typeof LoginSchema>

// ❌ Wrong: manually duplicating type definitions
type LoginPayload = { email: string; password: string }
```

- ❌ Never use `any`
- ❌ Never use non-null assertion `!` without a comment explaining why

---

## § 4 — DESIGN & UI STANDARDS [HIGH]

### § 4.1 — Component Rules

- One component per file
- File name = PascalCase component name (`LoginForm.tsx`)
- Props interface named `[ComponentName]Props`

```typescript
// ✅ Correct
interface LoginFormProps {
  onSuccess?: () => void
  isLoading?: boolean
}

export function LoginForm({ onSuccess, isLoading }: LoginFormProps) { ... }
```

### § 4.2 — Shadcn/ui Usage

- All base UI components (Button, Input, Modal...) MUST come from `src/shared/ui/`
- Shadcn components are installed via CLI: `npx shadcn@latest add [component]`
- Customize components ONLY inside `src/shared/ui/` — never modify `node_modules`

### § 4.3 — Styling Rules & Custom CSS [CRITICAL]

- Use Tailwind CSS utility classes exclusively.
- **RESTRICTION:** NO separate `.css` / `.scss` files per component.
- **RESTRICTION:** NO inline styles (`style={{}}`) except for dynamic calculated values.
- **RESTRICTION:** Hạn chế tối đa việc viết Custom CSS (Arbitrary values kiểu `w-[245px]` hoặc viết thêm class trong `globals.css`). 
  - 🛑 **NẾU BẮT BUỘC PHẢI VIẾT CUSTOM CSS:** Agent **PHẢI** dừng lại, trình bày lý do tại sao Tailwind không giải quyết được, và xin phép User.
- Use `cn()` utility (from `clsx` + `tailwind-merge`) for conditional classes.

```typescript
import { cn } from '@/shared/lib/utils'

// ✅ Correct
<div className={cn('base-class', isActive && 'active-class', className)} />

// ❌ Wrong (Forbidden)
<div style={{ color: 'red' }} />
<div className="w-[123px] text-[#ff0000]" /> // Arbitrary values are discouraged
```

### § 4.4 — UX & UI Principles [HIGH]

1. **Don't Make Me Think:** Giao diện phải tự giải thích. Nút bấm (CTA) phải có Action rõ ràng (VD: `Xác nhận xóa` thay vì `OK`).
2. **Tỷ lệ 60-30-10:** 60% Nền (`bg-background`), 30% Mảng phụ (`bg-muted`/`bg-card`), 10% Điểm nhấn (`bg-primary`). Không dùng màu bừa bãi.
3. **Quy tắc Max 2 Fonts:** Phân cấp Heading và Body rõ ràng.
4. **Hệ thống Lưới (Grid):** Dùng `grid-cols-1` (Mobile) và `md:grid-cols-12` (Desktop) với `gap-4` hoặc `gap-6`.
5. **Định luật Fitts:** Nút CTA phải to và dễ bấm (`size="lg"`). Trên Mobile không nhỏ hơn 44px (`h-11`).
6. **Chiều sâu thị giác:** Ưu tiên đổ bóng mềm (`shadow-sm`, `shadow-md`) và `backdrop-blur` thay vì viền gắt.
7. **WCAG 2.2:** Đảm bảo độ tương phản màu sắc. Text phụ dùng `text-muted-foreground`.
8. **No Custom CSS:** (Đã định nghĩa ở § 4.3).

---

## § 5 — API & DATA FETCHING STANDARDS [HIGH]

### § 5.1 — Contract First Rule

> Before implementing any API call, the TypeScript contract (request/response types + Zod schema) MUST be defined first.

```typescript
// shared/api/contracts/auth.contract.ts — DEFINE THIS FIRST
export const LoginResponseSchema = z.object({
  accessToken: z.string(),
  user: UserSchema,
})
export type LoginResponse = z.infer<typeof LoginResponseSchema>
```

### § 5.2 — TanStack Query Rules

- All server data fetching MUST go through TanStack Query
- Query keys MUST be centralized in `shared/api/queryKeys.ts`
- Never `useEffect` + `fetch` for server data

```typescript
// ✅ Correct
export const authKeys = {
  me: ['auth', 'me'] as const,
  session: (id: string) => ['auth', 'session', id] as const,
}
```

### § 5.3 — Zustand Rules

- One store per feature slice (`features/[name]/model/[name]Store.ts`)
- Stores MUST only hold UI/client state (not server data — that's TanStack Query)
- Use `immer` middleware for complex state mutations

---

## § 6 — TESTING STANDARDS [CRITICAL]

### § 6.1 — IRON LAW: Design → Test → Code

The mandatory flow for EVERY file:
1. **DESIGN** — Describe component behavior (props, renders, actions, data-testid map)
2. **TEST** — Write failing test (🔴 RED)
3. **CODE** — Write minimal code to pass (🟢 GREEN)
4. **REFACTOR** — Clean up, all tests still green

**VIOLATION: Writing component code before its test file exists = FORBIDDEN.**

### § 6.2 — 2-Tier Testing Strategy

| Tier | Tool | Purpose | When |
|---|---|---|---|
| **Tier 1** | Vitest + Testing Library | Per-file TDD, fast feedback (< 100ms) | During coding (every file) |
| **Tier 2** | Playwright (BDD) | User journey validation in real browser | After all Tier 1 tests pass |

**Separation of concerns:**
- Tier 1: ALL edge cases, validation, state transitions, component rendering
- Tier 2: ONLY Happy Paths + Critical Error Paths (no duplication with Tier 1)

### § 6.3 — Test File Convention

- Tier 1: `[name].test.tsx` co-located next to source file
- Tier 2: `tests/e2e/[feature]/[flow].spec.ts`

```
features/auth/ui/LoginForm.tsx
features/auth/ui/LoginForm.test.tsx   ← Tier 1 (co-located)

tests/e2e/auth/login.spec.ts         ← Tier 2 (BDD flow)
```

### § 6.4 — Element Selection: data-testid First

UI text changes break tests. All interactive elements MUST have `data-testid`.
Both Vitest and Playwright use the SAME testid as primary selector.

```typescript
// ✅ PRIORITY 1: data-testid (stable, UI-change-proof)
screen.getByTestId('auth-login-submit-btn')
page.getByTestId('auth-login-submit-btn')

// ✅ PRIORITY 2: role + accessible name (if name is stable)
screen.getByRole('button', { name: /submit/i })

// ❌ FORBIDDEN for interactive elements:
screen.getByText('Submit')            // Text changes = test breaks
screen.getByText('Đăng nhập')        // Translation = test breaks
document.querySelector('.btn-primary') // CSS = test breaks
```

**data-testid naming:** `{feature}-{component}-{element}`
Example: `auth-login-email-input`, `product-list-search-input`

### § 6.5 — Playwright BDD Structure

E2E tests MUST use `test.step()` with Given-When-Then:

```typescript
test('Scenario: Successful login', async ({ page }) => {
  await test.step('Given the user is on login page', async () => { ... })
  await test.step('When the user enters credentials', async () => { ... })
  await test.step('Then the user is redirected to dashboard', async () => { ... })
})
```

### § 6.6 — Anti-Flaky Rules

```typescript
// ❌ FORBIDDEN: Hard waits in tests
await page.waitForTimeout(3000)

// ✅ REQUIRED: Playwright auto-wait
await expect(page.getByTestId('dashboard')).toBeVisible()
```

---

## § 7 — FILE & NAMING CONVENTIONS [MEDIUM]

| Item | Convention | Example |
|---|---|---|
| Components | PascalCase | `LoginForm.tsx` |
| Hooks | camelCase + `use` prefix | `useAuthStore.ts` |
| Utils/Helpers | camelCase | `formatDate.ts` |
| Zod Schemas | PascalCase + `Schema` suffix | `LoginSchema` |
| Types/Interfaces | PascalCase | `LoginPayload`, `UserEntity` |
| API files | camelCase + `Api` suffix | `authApi.ts` |
| Store files | camelCase + `Store` suffix | `authStore.ts` |
| Query key files | camelCase + `Keys` suffix | `authKeys.ts` |
| Folders | kebab-case | `user-profile/` |

---

## § 8 — SUPREME LAWS (Non-Negotiable)

| Law | Description | Override? |
|---|---|---|
| **Design → Test → Code** | Describe behavior → write test → write code. NEVER code first | ❌ NEVER |
| **TypeScript Strict** | No `any`, no JS files in `src/` | ❌ NEVER |
| **FSD Dependency Rule** | Higher layers only import from lower | ❌ NEVER |
| **Contract First** | Define types/schema before API call | ❌ NEVER |
| **2-Tier TDD** | Tier 1 (Vitest per-file) → Tier 2 (Playwright BDD) | ❌ NEVER |
| **data-testid First** | All interactive elements MUST have data-testid | ❌ NEVER |
| **Public API Only** | Import from `index.ts` only | ❌ NEVER |

