---
name: sk-nextjs-state
description: State management decision guide. Activate when choosing between Server State, Client State, URL State, or Form State for a feature.
version: 1.0.0
---

# 🧭 Skill: State Management Decision

> Guides the Agent to pick the RIGHT state tool for each use case.
> Wrong state choice = bugs, stale data, unnecessary re-renders.

---

## When to Activate

- Creating a new feature (during `/feature` workflow)
- User asks "where should I store this data?"
- Agent is unsure whether to use Zustand, TanStack Query, or local state

---

## The Decision Tree

```
Q: Does this data come from an API / server?
│
├── YES → SERVER STATE (TanStack Query)
│         Examples: user list, product details, order history
│
└── NO → Q: Does it need to persist across page navigation?
          │
          ├── YES → Q: Should it appear in the URL?
          │         │
          │         ├── YES → URL STATE (searchParams / useRouter)
          │         │         Examples: filters, pagination, sort, search query
          │         │
          │         └── NO → CLIENT STATE (Zustand)
          │                   Examples: auth token (in-memory), theme, sidebar open/close
          │
          └── NO → Q: Is it form-related?
                    │
                    ├── YES → FORM STATE (React Hook Form + Zod)
                    │         Examples: input values, validation errors, dirty/touched
                    │
                    └── NO → LOCAL STATE (useState)
                              Examples: modal open, tooltip visible, dropdown expanded
```

---

## State Types — Detailed Reference

### 1. Server State (TanStack Query)

**What:** Data owned by the server. FE is just a cache.

**Rules:**
- ALWAYS use TanStack Query for server data — never `useState` + `useEffect` + `fetch`
- Let TanStack Query manage: caching, refetching, loading, error states
- Mutations must invalidate related queries

```typescript
// ✅ Correct
const { data: products, isLoading, error } = useQuery({
  queryKey: productKeys.list(filters),
  queryFn: () => productApi.getAll(filters),
})

// ❌ Wrong — manually managing server data
const [products, setProducts] = useState([])
const [loading, setLoading] = useState(true)
useEffect(() => {
  fetch('/api/products').then(r => r.json()).then(setProducts).finally(() => setLoading(false))
}, [])
```

**Indicators you need Server State:**
- Data has an ID from the database
- Multiple users can modify it
- It can become stale (someone else changed it)

---

### 2. Client State (Zustand)

**What:** UI state that lives only in the browser, not from any API.

**Rules:**
- One store per feature: `features/{name}/model/{name}Store.ts`
- NEVER put server data in Zustand (that's TanStack Query's job)
- Keep stores small — if it has more than 5-7 fields, reconsider

```typescript
// ✅ Correct — UI-only state
export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,                    // In-memory only
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null }),
}))

// ❌ Wrong — server data in Zustand
export const useProductStore = create((set) => ({
  products: [],                          // This belongs in TanStack Query!
  fetchProducts: async () => { ... },
}))
```

**Indicators you need Client State:**
- Data does not exist on any server
- Only this browser tab cares about it
- It controls UI behavior (open/close, selected item, theme)

---

### 3. URL State (searchParams)

**What:** State that should be shareable via URL — if user copies the URL, they get the same view.

**Rules:**
- Filters, pagination, sort order, search query → ALWAYS in URL
- Use `useSearchParams()` (client) or `searchParams` prop (server)
- Sync URL state with TanStack Query keys for automatic refetch

```typescript
// ✅ Correct — filters in URL
// URL: /products?category=shoes&sort=price&page=2

// Server Component
export default function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; page?: string }
}) {
  return <ProductList filters={searchParams} />
}

// Client Component
"use client"
function ProductList({ filters }: { filters: ProductFilters }) {
  const { data } = useQuery({
    queryKey: productKeys.list(filters),  // URL params = query key
    queryFn: () => productApi.getAll(filters),
  })
}
```

**Indicators you need URL State:**
- User should be able to bookmark/share the current view
- Browser back button should restore previous state
- It's a filter, search, pagination, or sort parameter

---

### 4. Form State (React Hook Form)

**What:** Transient state during form filling — input values, validation errors, dirty tracking.

**Rules:**
- ALWAYS use React Hook Form + Zod resolver
- Form state is temporary — it disappears after submit
- Never duplicate form state into Zustand or useState

```typescript
// ✅ Correct
const form = useForm<LoginPayload>({
  resolver: zodResolver(LoginSchema),
  defaultValues: { email: '', password: '' },
})

// ❌ Wrong — duplicating form state
const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [errors, setErrors] = useState({})
```

---

### 5. Local State (useState)

**What:** Ephemeral UI state scoped to a single component.

**Rules:**
- If state is used by ONE component only → `useState`
- If state needs to be shared across components → elevate to Zustand or pass via props
- Never let `useState` accumulate beyond 3 in a single component — extract to a custom hook

```typescript
// ✅ Correct — simple toggle
function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      ...
    </DropdownMenu>
  )
}

// ⚠️ Too many useState → extract hook
function ProductForm() {
  const [name, setName] = useState('')       // ← Use React Hook Form instead
  const [price, setPrice] = useState(0)
  const [category, setCategory] = useState('')
  const [errors, setErrors] = useState({})
}
```

---

## Common Mistakes & Corrections

| Mistake | Why it's wrong | Correct approach |
|---|---|---|
| Products list in Zustand | Server data = stale risk | TanStack Query |
| Search query in useState | Not shareable via URL | `useSearchParams` |
| Form values in Zustand | Disappears after submit | React Hook Form |
| Auth token in localStorage | XSS vulnerable | Zustand in-memory or httpOnly cookie |
| Pagination in useState | Lost on back button | URL searchParams |
| Modal open in Zustand | Only 1 component uses it | `useState` |
