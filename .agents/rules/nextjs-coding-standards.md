# ⚖️ Next.js Coding Standards

> Universal coding principles adapted for the Next.js / React / TypeScript context.
> These rules apply to ALL code written in this workspace — components, hooks, utils, stores, API layers.

---

## § 1 — CORE PRINCIPLES (DRY, KISS, YAGNI) [HIGH]

### § 1.1 — DRY (Don't Repeat Yourself)

> Every piece of knowledge must have a single, unambiguous representation.

- ✅ Extract repeated JSX into a shared component
- ✅ Extract repeated logic into a custom hook
- ✅ Extract repeated API call patterns into a shared query factory
- ❌ Never copy-paste component logic between feature slices — abstract to `shared/` instead

```typescript
// ❌ Wrong — repeated fetch logic in two places
// features/auth/api/authApi.ts
const res = await fetch('/api/auth/login', { method: 'POST', body: ... })
if (!res.ok) throw new Error(res.statusText)
return res.json()

// features/user/api/userApi.ts
const res = await fetch('/api/users', { method: 'GET' })
if (!res.ok) throw new Error(res.statusText)
return res.json()

// ✅ Correct — shared API client in shared/lib/apiClient.ts
export async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options)
  if (!res.ok) throw new ApiError(res.status, await res.json())
  return res.json()
}
```

### § 1.2 — KISS (Keep It Simple, Stupid)

> The simplest solution that works is always better.

- ✅ Prefer straightforward conditional rendering over complex state machines (unless complexity demands it)
- ✅ Use Server Components for data fetching when possible — no need for TanStack Query if data is static
- ❌ Do not over-engineer: no custom state machine for a simple toggle
- ❌ Do not create abstractions before there are at least 3 concrete use cases (Rule of Three)

```typescript
// ❌ Over-engineered
const visibilityMachine = createMachine({ ... }) // For a simple modal toggle

// ✅ Simple
const [isOpen, setIsOpen] = useState(false)
```

### § 1.3 — YAGNI (You Aren't Gonna Need It)

> Do not write code for features not in the current requirements.

- ❌ No "future-proof" abstractions without a concrete use case today
- ❌ No unused props, no commented-out code blocks, no TODO stubs left in production
- ✅ When requirements change, refactor then — not preemptively

---

## § 2 — SOLID FOR FRONTEND [MEDIUM]

> Classical SOLID adapted for React component and hook design.

### § 2.1 — SRP (Single Responsibility Principle)

> One component / one hook = one job.

```typescript
// ❌ Wrong — one component doing too much
function UserDashboard() {
  const [users, setUsers] = useState([])
  useEffect(() => { fetch('/api/users').then(...).then(setUsers) }, [])
  // Also renders table, also handles delete, also shows modal
}

// ✅ Correct — responsibilities separated
function UserDashboard() {
  return <UserTable /> // UserTable handles its own data fetching via TanStack Query
}

function useDeleteUser() { ... }  // Delete logic in dedicated hook
function UserDeleteModal() { ... } // Modal in dedicated component
```

### § 2.2 — OCP (Open/Closed Principle)

> Components open for extension, closed for modification.

```typescript
// ✅ Extend via props/composition, not modifying internals
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost'
  isLoading?: boolean
}

// Consumers add behavior via props — no need to modify Button itself
<Button variant="danger" isLoading={isPending} onClick={handleDelete}>
  Delete
</Button>
```

### § 2.3 — ISP (Interface Segregation Principle)

> Don't force components to depend on props they don't use.

```typescript
// ❌ Wrong — fat interface
interface UserCardProps {
  user: User
  onEdit: () => void
  onDelete: () => void
  onFollow: () => void
  showStats: boolean
  showFollowButton: boolean
  // ... 10 more props
}

// ✅ Correct — lean props, compose via children/slots
interface UserCardProps {
  user: Pick<User, 'name' | 'avatar' | 'email'>
  actions?: React.ReactNode  // Consumer decides what actions to render
}
```

### § 2.4 — DIP (Dependency Inversion Principle)

> Depend on abstractions (interfaces / hooks), not concrete implementations.

```typescript
// ❌ Wrong — component directly imports concrete service
import { supabaseClient } from '@/lib/supabase'

function LoginForm() {
  const handleLogin = () => supabaseClient.auth.signIn(...)
}

// ✅ Correct — depend on hook abstraction, implementation can swap
function LoginForm() {
  const { login, isPending } = useAuth() // Hook hides the implementation
}
```

---

## § 3 — CLEAN CODE [HIGH]

### § 3.1 — Naming

- Components: verb-noun describing WHAT it renders (`UserProfileCard`, `LoginForm`, `OrderSummaryList`)
- Hooks: `use` + what it manages (`useAuthSession`, `useCartItems`, `useProductSearch`)
- Event handlers: `handle` + event (`handleSubmit`, `handleDelete`, `handlePageChange`)
- Boolean props/variables: `is`, `has`, `can`, `should` prefix (`isLoading`, `hasError`, `canDelete`)

```typescript
// ❌ Wrong
const x = useData()
const fn = () => {}
const flag = true

// ✅ Correct
const { products, isLoading } = useProductList()
const handleAddToCart = () => {}
const isAuthenticated = true
```

### § 3.2 — Function / Component Size

- A component that needs scrolling to read is too long → split it
- Max ~150 lines per component file (including imports and types)
- A custom hook doing more than 3 things → split it

### § 3.3 — No Magic Numbers / Strings

```typescript
// ❌ Wrong
if (status === 3) { ... }
setTimeout(fn, 5000)

// ✅ Correct
const ORDER_STATUS = { SHIPPED: 3 } as const
const POLLING_INTERVAL_MS = 5_000
if (status === ORDER_STATUS.SHIPPED) { ... }
setTimeout(fn, POLLING_INTERVAL_MS)
```

### § 3.4 — Dead Code Policy

- ❌ No commented-out code in PRs
- ❌ No unused imports, unused variables, unused props
- ❌ No `console.log` in committed code (use proper logging — see §4)

---

## § 4 — ERROR HANDLING [CRITICAL]

### § 4.1 — Never Swallow Errors

```typescript
// ❌ Wrong — silent failure
try {
  await login(credentials)
} catch (e) {
  // nothing
}

// ✅ Correct — always surface errors
try {
  await login(credentials)
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message)
    logger.error('Login failed', { error, email: credentials.email })
  } else {
    logger.error('Unexpected login error', { error })
    toast.error('Something went wrong. Please try again.')
  }
}
```

### § 4.2 — Error Boundary

Every feature's root component MUST be wrapped in an Error Boundary:

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <ErrorBoundary fallback={<DashboardError />}>
      <Dashboard />
    </ErrorBoundary>
  )
}
```

### § 4.3 — TanStack Query Error Handling

```typescript
// ✅ Always handle error state in queries
const { data, isLoading, error } = useQuery({ ... })

if (isLoading) return <Skeleton />
if (error) return <ErrorMessage error={error} />
return <DataView data={data} />
```

### § 4.4 — Form Error Handling (React Hook Form + Zod)

```typescript
// ✅ Validate with Zod, display errors per field
const form = useForm<LoginPayload>({
  resolver: zodResolver(LoginSchema),
})

// Always display field-level errors
<FormField
  name="email"
  render={({ field, fieldState }) => (
    <FormItem>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage>{fieldState.error?.message}</FormMessage>
    </FormItem>
  )}
/>
```

---

## § 5 — LOGGING [MEDIUM]

### § 5.1 — No Raw console.log in Production

```typescript
// ❌ Forbidden in committed code
console.log('user data:', user)

// ✅ Use structured logger (shared/lib/logger.ts)
logger.info('User logged in', { userId: user.id })
logger.warn('Token expiring soon', { expiresIn: '5min' })
logger.error('Payment failed', { error, orderId })
```

### § 5.2 — Log Levels

| Level | When to use |
|---|---|
| `error` | Caught exceptions, failed API calls, critical failures |
| `warn` | Deprecated usage, token near expiry, fallback triggered |
| `info` | User actions (login, checkout), page navigation events |
| `debug` | Development-only — NEVER in production bundle |

### § 5.3 — Production Error Tracking

- All unhandled errors MUST be reported to Sentry (or equivalent)
- `logger.error()` in `shared/lib/logger.ts` MUST call `Sentry.captureException()`

---

## § 6 — 12-FACTOR APP [HIGH]

### § 6.1 — Config via Environment Variables

```typescript
// ✅ All external URLs and secrets via ENV
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

// ❌ Hardcoded URLs/config
const API_BASE_URL = 'http://localhost:8080'
```

- Public config (safe to expose): prefix with `NEXT_PUBLIC_`
- Server-only secrets: no prefix, never sent to browser

### § 6.2 — Stateless Frontend

- ❌ Never store server state in `localStorage` / `sessionStorage` — TanStack Query cache handles this
- ❌ Never store JWT access token in `localStorage` — use httpOnly cookies
- ✅ Client state (UI preferences) in `localStorage` is acceptable with a dedicated hook

### § 6.3 — Parallel Request Strategy (Anti-Waterfall)

FE equivalent of N+1 query problem: **waterfall requests** (fetch A, then fetch B, then fetch C sequentially when they could be parallel).

```typescript
// ❌ Waterfall — slow
const user = await fetchUser(id)
const orders = await fetchOrders(user.id) // waits for user first

// ✅ Parallel — fast
const [user, orders] = await Promise.all([
  fetchUser(id),
  fetchOrders(id),
])

// ✅ TanStack Query parallel queries
const results = useQueries({
  queries: [
    { queryKey: ['user', id], queryFn: () => fetchUser(id) },
    { queryKey: ['orders', id], queryFn: () => fetchOrders(id) },
  ],
})
```
