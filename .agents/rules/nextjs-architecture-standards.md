# ⚖️ Next.js Architecture Standards

> Custom FSD + Clean Architecture adapted for Next.js App Router.
> This is the definitive architecture guide for this workspace.

---

## § 1 — DIRECTORY STRUCTURE (Canonical) [HIGH]

```
src/
│
├── app/                              ← 🚪 ENTRY POINT (routing + layout only)
│   ├── layout.tsx                    ← Root layout, global providers
│   ├── page.tsx                      ← Home page
│   ├── globals.css                   ← Global styles + Tailwind directives
│   ├── not-found.tsx                 ← 404 page
│   ├── error.tsx                     ← Global error boundary
│   │
│   ├── (auth)/                       ← Route group: public auth pages
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   │
│   ├── (main)/                       ← Route group: protected routes
│   │   ├── layout.tsx                ← Auth guard + sidebar + header
│   │   ├── dashboard/page.tsx
│   │   └── products/
│   │       ├── page.tsx              ← Product list
│   │       └── [id]/page.tsx         ← Product detail
│   │
│   └── api/                          ← Next.js Route Handlers (BFF if needed)
│       └── health/route.ts
│
├── features/                         ← 🏰 BUSINESS MODULES
│   ├── auth/
│   │   ├── ui/                       ← Components (presentation layer)
│   │   │   ├── LoginForm.tsx
│   │   │   └── LoginForm.test.tsx    ← Co-located unit test
│   │   ├── model/                    ← Hooks + Zustand store (application layer)
│   │   │   ├── useAuth.ts            ← Hook = Use Case
│   │   │   └── authStore.ts          ← Client state
│   │   ├── api/                      ← TanStack Query hooks (infrastructure layer)
│   │   │   ├── authApi.ts            ← API call functions
│   │   │   └── authQueries.ts        ← useQuery / useMutation wrappers
│   │   └── index.ts                  ← Public API gate
│   │
│   └── product/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts
│
├── entities/                         ← 🧩 SHARED DOMAIN (types + base UI)
│   ├── user/
│   │   ├── types.ts                  ← User type + Zod schema
│   │   ├── ui/                       ← UserAvatar, UserBadge (reusable)
│   │   │   └── UserAvatar.tsx
│   │   └── index.ts
│   └── product/
│       ├── types.ts
│       ├── ui/
│       └── index.ts
│
├── widgets/                          ← 🧱 COMPOSITE BLOCKS (compose features)
│   ├── header/
│   │   ├── Header.tsx
│   │   └── index.ts
│   ├── sidebar/
│   └── dashboard-summary/
│
└── shared/                           ← ⚙️ PLATFORM / INFRASTRUCTURE
    ├── ui/                           ← Shadcn/ui components (Button, Input...)
    ├── lib/                          ← apiClient, logger, cn(), utils
    │   ├── apiClient.ts
    │   ├── logger.ts
    │   └── utils.ts
    ├── api/                          ← Query keys, base contracts
    │   ├── queryKeys.ts
    │   └── contracts/
    ├── config/                       ← ENV constants, app config
    │   └── env.ts
    └── hooks/                        ← Generic hooks (useDebounce, useMediaQuery)
        └── useDebounce.ts
```

---

## § 2 — LAYER MAPPING (Backend ↔ Next.js) [MEDIUM]

| Backend Architecture | Next.js FE | Role |
|---|---|---|
| `Entry Point` | `app/layout.tsx` | App initialization, providers, global layout |
| `Domain Layer` | `entities/[name]/types.ts` | Domain models, business rules, validation schemas |
| `Application/Use Case` | `features/[name]/model/` | Feature-specific logic, state management, hooks |
| `Infrastructure/Adapter` | `features/[name]/api/` + `shared/lib/` | External communication (API clients, storage) |
| `Presentation/UI` | `features/[name]/ui/` | User interface components and view logic |
| `Platform/Cross-cutting` | `shared/` | Shared utilities, logging, configuration |

---

## § 3 — DEPENDENCY DIRECTION (Strict) [CRITICAL]

### § 3.1 — Layer Import Rules

```
app/  →  widgets/  →  features/  →  entities/  →  shared/
 ↓          ↓            ↓             ↓             ↓
CAN      CAN import   CAN import   CAN import    CANNOT
import   features/    entities/    shared/       import
ALL      entities/    shared/      ONLY          anything
below    shared/      ONLY                       above
```

### § 3.2 — Forbidden Imports

```typescript
// ❌ FORBIDDEN: shared/ importing from features/
// File: shared/lib/utils.ts
import { useAuth } from '@/features/auth'  // VIOLATION

// ❌ FORBIDDEN: entities/ importing from features/
// File: entities/user/types.ts
import { authStore } from '@/features/auth/model/authStore'  // VIOLATION

// ❌ FORBIDDEN: feature importing from another feature
// File: features/product/model/useProductList.ts
import { useAuth } from '@/features/auth'  // VIOLATION

// ✅ CORRECT: feature imports from entities (shared domain)
import { type User } from '@/entities/user'

// ✅ CORRECT: feature imports from shared
import { apiClient } from '@/shared/lib/apiClient'
```

### § 3.3 — Cross-Feature Communication

When Feature A needs data from Feature B, use ONE of these patterns:

**Pattern 1: Props Down (Composer passes data)**
```typescript
// app/(main)/dashboard/page.tsx — Composer
import { UserGreeting } from '@/features/auth'
import { RecentOrders } from '@/features/order'

export default async function DashboardPage() {
  const user = await fetchCurrentUser()
  return (
    <>
      <UserGreeting user={user} />
      <RecentOrders userId={user.id} />  {/* Pass via props */}
    </>
  )
}
```

**Pattern 2: Shared Entity (both features read from entities/)**
```typescript
// entities/user/types.ts — shared domain type
export const UserSchema = z.object({ id: z.string(), name: z.string() })
export type User = z.infer<typeof UserSchema>

// features/auth uses User
// features/order uses User
// Neither imports from each other
```

**Pattern 3: Shared Store (rare, needs justification)**
```typescript
// entities/session/sessionStore.ts — shared session state
// Only when multiple features genuinely share the same state
// MUST be placed in entities/, NOT in any feature
```

---

## § 4 — SERVER COMPONENT vs CLIENT COMPONENT [CRITICAL]

### § 4.1 — Default: Server Component

All components are Server Components by default in App Router.
Only add `"use client"` when the component NEEDS:
- `useState`, `useEffect`, or any React hook
- Browser APIs (`window`, `document`, `localStorage`)
- Event handlers (`onClick`, `onChange`, `onSubmit`)
- TanStack Query hooks
- Zustand store access

### § 4.2 — Decision Matrix

| Need | Component Type | Where |
|---|---|---|
| Static content, SEO | Server Component | `app/` pages |
| Data fetching (no interactivity) | Server Component | `app/` pages, `widgets/` |
| Forms, buttons, interactive UI | Client Component (`"use client"`) | `features/*/ui/` |
| TanStack Query data | Client Component | `features/*/ui/` or `features/*/api/` |
| Zustand store | Client Component | `features/*/model/` |
| Layout structure | Server Component | `app/` layouts |

### § 4.3 — Push "use client" Down

```typescript
// ✅ CORRECT: Server Component page, client component only where needed
// app/(main)/products/page.tsx — Server Component (no "use client")
import { ProductList } from '@/features/product'

export default async function ProductsPage() {
  const initialData = await fetchProducts() // Server-side fetch
  return <ProductList initialData={initialData} /> // Client component
}

// features/product/ui/ProductList.tsx
"use client"
export function ProductList({ initialData }: Props) {
  const { data } = useQuery({ initialData, ... })
  // Interactive client logic here
}
```

### § 4.4 — Forbidden Patterns

```typescript
// ❌ NEVER: "use client" on layout or page when not needed
"use client"  // WHY? This page has no interactivity
export default function AboutPage() {
  return <div>About us</div>
}

// ❌ NEVER: Fetching with useEffect in Server Component context
"use client"
export default function ProductsPage() {
  const [products, setProducts] = useState([])
  useEffect(() => { fetch('/api/products')... }, []) // Use Server Component instead!
}
```

---

## § 5 — DATA FETCHING PATTERNS [HIGH]

### § 5.1 — Two Strategies

| Strategy | When | How |
|---|---|---|
| **Server Fetch** | Initial page load, SEO content, static data | `fetch()` in Server Component / `generateMetadata` |
| **Client Fetch** | Interactive data, real-time, user-triggered | TanStack Query in Client Component |

### § 5.2 — Hydration Pattern (Best of Both)

```typescript
// 1. Server fetches initial data
// app/(main)/products/page.tsx
export default async function ProductsPage() {
  const products = await fetchProducts()  // Server-side
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductList initialData={products} />
    </HydrationBoundary>
  )
}

// 2. Client takes over for interactivity
// features/product/ui/ProductList.tsx
"use client"
export function ProductList({ initialData }: Props) {
  const { data, refetch } = useQuery({
    queryKey: productKeys.list(),
    queryFn: fetchProducts,
    initialData,  // No loading spinner on first render
  })
  // Now client manages: refetch, pagination, filters...
}
```

### § 5.3 — Query Key Convention

```typescript
// shared/api/queryKeys.ts
export const productKeys = {
  all:     ['products'] as const,
  lists:   () => [...productKeys.all, 'list'] as const,
  list:    (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail:  (id: string) => [...productKeys.details(), id] as const,
}
```

---

## § 6 — PUBLIC API GATE (index.ts) [CRITICAL]

### § 6.1 — Every Slice MUST Have index.ts

```typescript
// features/auth/index.ts
// ✅ Explicit public API — only these are importable by upper layers
export { LoginForm } from './ui/LoginForm'
export { RegisterForm } from './ui/RegisterForm'
export { useAuth } from './model/useAuth'
export { useAuthStore } from './model/authStore'
export type { LoginPayload, RegisterPayload } from './api/authApi'
```

### § 6.2 — Import Rule

```typescript
// ✅ CORRECT: Import from public API
import { LoginForm, useAuth } from '@/features/auth'

// ❌ FORBIDDEN: Import from internal path
import { LoginForm } from '@/features/auth/ui/LoginForm'
import { useAuth } from '@/features/auth/model/useAuth'
```

---

## § 7 — ROUTE ORGANIZATION [HIGH]

### § 7.1 — Route Groups

Use `()` parentheses for logical grouping WITHOUT affecting URL:

```
app/
├── (auth)/           → URL: /login, /register (no /auth/ prefix)
├── (main)/           → URL: /dashboard, /products (no /main/ prefix)
└── (marketing)/      → URL: /about, /pricing
```

### § 7.2 — Page File Rules

- `page.tsx` — The rendered page (REQUIRED for route to exist)
- `layout.tsx` — Shared layout for this route group
- `loading.tsx` — Loading UI (Suspense boundary)
- `error.tsx` — Error boundary for this route
- `not-found.tsx` — 404 for this route

### § 7.3 — Pages Are Thin Composers

```typescript
// ✅ CORRECT: Page is a thin shell that composes features
export default async function DashboardPage() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <DashboardSummary />      {/* from widgets/ */}
      <RecentOrders />          {/* from features/order */}
      <QuickActions />          {/* from features/dashboard */}
    </div>
  )
}

// ❌ WRONG: Page contains business logic directly
export default function DashboardPage() {
  const [orders, setOrders] = useState([])
  useEffect(() => { /* fetch logic here */ }, [])
  // ... 200 lines of logic
}
```
