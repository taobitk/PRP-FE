# ⚖️ Next.js Security & API Standards

> Security is not optional. These rules apply to every component, every API call, every form.
> Agents MUST enforce these standards proactively — not wait for User to ask.

---

## § 1 — AUTHENTICATION & JWT STANDARDS [CRITICAL]

### § 1.1 — Token Storage Rules

| Storage Method | Security | Verdict |
|---|---|---|
| `localStorage` | Vulnerable to XSS | ❌ FORBIDDEN for access tokens |
| `sessionStorage` | Vulnerable to XSS | ❌ FORBIDDEN for access tokens |
| JavaScript variable (memory) | Lost on refresh | ⚠️ Acceptable for short-lived access tokens only |
| **httpOnly Cookie** | XSS-proof | ✅ RECOMMENDED |

```typescript
// ❌ Never store JWT in localStorage
localStorage.setItem('accessToken', token)

// ✅ Let the server set httpOnly cookie
// OR store only short-lived access token in memory (Zustand), refresh via httpOnly cookie
const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null, // in-memory only, cleared on refresh
  setAccessToken: (token) => set({ accessToken: token }),
}))
```

### § 1.2 — Automatic Token Refresh

- Implement a global API interceptor in `shared/lib/apiClient.ts`
- On 401 response → attempt silent refresh → retry original request
- On refresh failure → clear auth state → redirect to login

```typescript
// shared/lib/apiClient.ts
async function apiClient<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, withAuthHeader(options))

  if (res.status === 401) {
    const refreshed = await refreshToken() // call refresh endpoint
    if (!refreshed) {
      authStore.getState().logout()
      redirect('/login')
      return
    }
    return apiClient(url, options) // retry once
  }

  if (!res.ok) throw new ApiError(res.status, await res.json())
  return res.json()
}
```

### § 1.3 — Protected Routes

All authenticated routes MUST be protected at the middleware level:

```typescript
// middleware.ts (Next.js App Router)
export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')
  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*'],
}
```

### § 1.4 — Auth State Rules

- ✅ Always check auth state on app load (hydration)
- ✅ Clear ALL auth state on logout (store + cookies)
- ❌ Never expose user roles/permissions in the URL

---

## § 2 — INPUT VALIDATION & SANITIZATION [CRITICAL]

### § 2.1 — Validate Everything with Zod

ALL user inputs MUST be validated with a Zod schema before processing or sending to API:

```typescript
// features/auth/api/authApi.ts
const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// In form:
const form = useForm<LoginPayload>({
  resolver: zodResolver(LoginSchema),
})
```

### § 2.2 — API Response Validation

Validate API responses with Zod before using the data:

```typescript
// ✅ Parse and validate response
const raw = await apiClient('/api/users')
const users = UserListSchema.parse(raw) // throws if shape is wrong

// ❌ Trust API response blindly
const users = await apiClient<User[]>('/api/users') // no runtime validation
```

### § 2.3 — URL Parameter Validation

Never trust URL params directly — always validate:

```typescript
// app/users/[id]/page.tsx
const ParamsSchema = z.object({ id: z.string().uuid() })

export default function UserPage({ params }: { params: { id: string } }) {
  const result = ParamsSchema.safeParse(params)
  if (!result.success) notFound()
  // use result.data.id safely
}
```

---

## § 3 — XSS (CROSS-SITE SCRIPTING) PREVENTION [CRITICAL]

### § 3.1 — dangerouslySetInnerHTML is Forbidden

```typescript
// ❌ FORBIDDEN — direct XSS vector
<div dangerouslySetInnerHTML={{ __html: userContent }} />

// ✅ Use a sanitization library if rich HTML is truly needed
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userContent) }} />

// ✅ Better — use a Markdown renderer with sanitization built-in
import ReactMarkdown from 'react-markdown'
<ReactMarkdown>{userContent}</ReactMarkdown>
```

### § 3.2 — No Dynamic href/src from User Input

```typescript
// ❌ Open redirect / XSS via javascript: protocol
<a href={userProvidedUrl}>Click me</a>

// ✅ Validate URL protocol before rendering
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

{isSafeUrl(userProvidedUrl) && <a href={userProvidedUrl}>Click me</a>}
```

### § 3.3 — Content Security Policy (CSP)

Configure CSP headers in `next.config.ts`:

```typescript
// next.config.ts
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]
```

---

## § 4 — API CALL STANDARDS [HIGH]

### § 4.1 — HTTP Semantics (FE Must Respect)

FE MUST use the correct HTTP method when constructing API calls:

| Operation | HTTP Method | Example |
|---|---|---|
| Fetch data | `GET` | `GET /api/users` |
| Create resource | `POST` | `POST /api/users` |
| Full update | `PUT` | `PUT /api/users/:id` |
| Partial update | `PATCH` | `PATCH /api/users/:id` |
| Delete resource | `DELETE` | `DELETE /api/users/:id` |

```typescript
// ❌ Wrong — using POST for everything
await apiClient('/api/users/delete', { method: 'POST', body: { id } })

// ✅ Correct
await apiClient(`/api/users/${id}`, { method: 'DELETE' })
```

### § 4.2 — REST URL Construction Rules

- Use plural nouns for resources: `/users`, `/products`, `/orders`
- Never put verbs in URL: `/api/getUsers` ❌ → `/api/users` ✅
- Nest related resources: `/api/users/:id/orders`
- Query params for filtering: `/api/products?category=shoes&sort=price`

### § 4.3 — Rate Limit (429) Handling

```typescript
// shared/lib/apiClient.ts
if (res.status === 429) {
  const retryAfter = res.headers.get('Retry-After') ?? '5'
  toast.warning(`Too many requests. Please wait ${retryAfter} seconds.`)
  throw new RateLimitError(parseInt(retryAfter))
}
```

### § 4.4 — Never Expose Sensitive Data in URLs

```typescript
// ❌ Token in URL — appears in browser history, server logs
fetch(`/api/data?token=${accessToken}`)

// ✅ Token in Authorization header
fetch('/api/data', {
  headers: { Authorization: `Bearer ${accessToken}` }
})
```

---

## § 5 — ACCESSIBILITY (a11y) STANDARDS [HIGH]

> Accessibility is part of security and quality — not optional.

### § 5.1 — Semantic HTML First

```tsx
// ❌ div soup
<div onClick={handleSubmit}>Submit</div>

// ✅ Semantic element — keyboard accessible, screen-reader friendly
<button type="submit" onClick={handleSubmit}>Submit</button>
```

### § 5.2 — ARIA Labels

Every interactive element must have a descriptive label:

```tsx
// ❌ Icon-only button with no label
<button onClick={handleDelete}><TrashIcon /></button>

// ✅ Labeled for screen readers
<button onClick={handleDelete} aria-label="Delete user John Doe">
  <TrashIcon aria-hidden="true" />
</button>
```

### § 5.3 — Keyboard Navigation

- All interactive elements MUST be reachable via `Tab`
- Modals MUST trap focus inside when open
- `Escape` key MUST close modals/dropdowns
- Shadcn/ui (Radix UI) handles this automatically — DO NOT override with `tabIndex={-1}` unless intentional

### § 5.4 — Color Contrast

- Text contrast ratio MUST meet WCAG AA: 4.5:1 for normal text, 3:1 for large text
- Never convey information by color alone (add icon or text alongside)

---

## § 6 — PERFORMANCE & SECURITY BUDGET [MEDIUM]

### § 6.1 — Bundle Size Rules

- ❌ Never import entire libraries: `import _ from 'lodash'`
- ✅ Tree-shake imports: `import { debounce } from 'lodash-es'`
- ✅ Use Next.js dynamic import for heavy components:

```typescript
const RichTextEditor = dynamic(() => import('@/features/editor/ui/RichTextEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
})
```

### § 6.2 — Sensitive Data in Client Components

- ❌ Never pass API keys, secrets, or server-only config to Client Components
- ✅ Server Components handle all sensitive data fetching — pass only what UI needs

```typescript
// ✅ Server Component fetches with secret, passes safe data to client
async function ProductPage({ id }: { id: string }) {
  const product = await fetchProductInternal(id, process.env.INTERNAL_API_KEY)
  return <ProductDisplay name={product.name} price={product.price} />
  // Note: INTERNAL_API_KEY never reaches the client
}
```

---

## § 7 — SUPREME SECURITY LAWS

| Law | Rule | Override? |
|---|---|---|
| **No localStorage for tokens** | Access tokens in memory or httpOnly cookie only | ❌ NEVER |
| **No dangerouslySetInnerHTML** | Use DOMPurify if truly needed | ❌ Needs justification |
| **Validate all inputs** | Zod on every form and URL param | ❌ NEVER |
| **Validate API responses** | Zod `.parse()` on all external data | ❌ NEVER |
| **No secrets in client** | Server-only ENV vars stay server-only | ❌ NEVER |
| **Semantic HTML** | Use correct HTML elements, not div soup | ❌ NEVER |
