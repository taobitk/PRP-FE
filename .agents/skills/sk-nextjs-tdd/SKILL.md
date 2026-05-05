---
name: sk-nextjs-tdd
description: Execute TDD Red-Green-Refactor cycle for React/Next.js components and hooks. Activate when user runs /tdd or asks to write tests.
version: 2.0.0
---

# 🧪 Skill: Next.js 2-Tier TDD (Red-Green-Refactor + BDD)

> **IRON LAW: Design → Test → Code. No exceptions. Ever.**
>
> This skill enforces a strict 2-tier testing strategy:
> - **Tier 1 (Vitest):** Fast, in-memory, per-file. For TDD Red-Green-Refactor.
> - **Tier 2 (Playwright BDD):** Real browser, real clicks. For user journey validation.

---

## When to Activate

- User runs `/tdd` workflow
- User asks to "write tests", "test this feature", or "TDD"
- Agent is about to write ANY component or hook code (MUST write test first)

---

## MANDATORY FLOW (Non-Negotiable)

```
1. DESIGN   → Define what the component/hook does (props, behavior, output)
2. TEST     → Write failing test (Tier 1: Vitest)
3. CODE     → Write MINIMAL code to pass the test
4. REFACTOR → Clean up, all tests still green
5. REPEAT   → Next test case, go to step 2
6. BDD      → After all unit tests pass, write Tier 2 (Playwright) for the feature flow
```

**VIOLATION:** Writing component code before its test file exists = FORBIDDEN.
**VIOLATION:** Skipping Tier 2 for any feature with user interaction = FORBIDDEN.

---

## ELEMENT SELECTION STRATEGY (data-testid First)

### The Problem
UI text changes frequently (designer renames "Submit" to "Save", translations, A/B tests).
Tests that rely on visible text (`getByText('Submit')`) break constantly.

### The Solution: Invisible Anchors

Every interactive element MUST have a `data-testid` attribute.
Both Vitest and Playwright use `data-testid` as the PRIMARY selector.

### Naming Convention for data-testid

```
{feature}-{component}-{element}

Examples:
  auth-login-form
  auth-login-email-input
  auth-login-password-input
  auth-login-submit-btn
  auth-login-error-msg
  product-list-search-input
  product-list-item-{id}
  product-detail-add-to-cart-btn
```

### Query Priority (UPDATED)

```typescript
// ✅ Priority order for BOTH Vitest and Playwright:
// 1st: data-testid (stable, UI-change-proof)
screen.getByTestId('auth-login-submit-btn')

// 2nd: role + accessible name (good for a11y AND stability)
screen.getByRole('button', { name: /submit/i })

// 3rd: aria-label (when role is ambiguous)
screen.getByLabelText('Email address')

// ❌ FORBIDDEN for interactive elements:
screen.getByText('Submit')           // Text changes = test breaks
screen.getByText('Đăng nhập')       // Translation changes = test breaks
document.querySelector('.btn-primary') // CSS changes = test breaks
```

### Production Cleanup (Optional)

Strip `data-testid` from production builds for cleaner DOM:

```typescript
// next.config.ts
const config = {
  compiler: {
    reactRemoveProperties: process.env.NODE_ENV === 'production'
      ? { properties: ['^data-testid$'] }
      : false,
  },
}
```

---

## TIER 1: VITEST (Fast Unit/Component Tests)

### Purpose
- Test individual files in isolation
- Lightning-fast feedback (< 100ms per test)
- Run on every file save (watch mode)
- Catch logic bugs BEFORE they reach the browser

### Rules
1. **One test file per source file** — `LoginForm.tsx` → `LoginForm.test.tsx`
2. **Co-located** — test file sits RIGHT NEXT to source file
3. **Test ONE file at a time** — finish all tests for File A before moving to File B
4. **Mock external dependencies** — API calls, stores, router
5. **Never test implementation details** — test BEHAVIOR (what user sees/does)

### File Structure
```
features/auth/ui/
├── LoginForm.tsx           ← Source
├── LoginForm.test.tsx      ← Unit test (co-located)
├── RegisterForm.tsx
└── RegisterForm.test.tsx

features/auth/model/
├── useAuth.ts
├── useAuth.test.ts
├── authStore.ts
└── authStore.test.ts
```

### Component Test Template

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LoginForm } from './LoginForm'

// Wrap with providers if needed
function renderLoginForm(props = {}) {
  const defaultProps = { onSubmit: vi.fn() }
  return render(<LoginForm {...defaultProps} {...props} />)
}

describe('LoginForm', () => {
  // ── RENDERING ──
  it('should render email input', () => {
    renderLoginForm()
    expect(screen.getByTestId('auth-login-email-input')).toBeInTheDocument()
  })

  it('should render password input', () => {
    renderLoginForm()
    expect(screen.getByTestId('auth-login-password-input')).toBeInTheDocument()
  })

  it('should render submit button', () => {
    renderLoginForm()
    expect(screen.getByTestId('auth-login-submit-btn')).toBeInTheDocument()
  })

  // ── INTERACTION ──
  it('should call onSubmit with form data when submitted', async () => {
    const handleSubmit = vi.fn()
    renderLoginForm({ onSubmit: handleSubmit })

    await userEvent.type(
      screen.getByTestId('auth-login-email-input'),
      'test@test.com'
    )
    await userEvent.type(
      screen.getByTestId('auth-login-password-input'),
      'password123'
    )
    await userEvent.click(screen.getByTestId('auth-login-submit-btn'))

    expect(handleSubmit).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    })
  })

  // ── VALIDATION (Edge Cases) ──
  it('should show error for invalid email', async () => {
    renderLoginForm()

    await userEvent.type(
      screen.getByTestId('auth-login-email-input'),
      'invalid'
    )
    await userEvent.click(screen.getByTestId('auth-login-submit-btn'))

    expect(screen.getByTestId('auth-login-error-msg')).toBeInTheDocument()
  })

  // ── STATES ──
  it('should disable submit button when loading', () => {
    renderLoginForm({ isLoading: true })
    expect(screen.getByTestId('auth-login-submit-btn')).toBeDisabled()
  })
})
```

### Hook Test Template

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should start at initial value', () => {
    const { result } = renderHook(() => useCounter(5))
    expect(result.current.count).toBe(5)
  })

  it('should increment', () => {
    const { result } = renderHook(() => useCounter(0))
    act(() => result.current.increment())
    expect(result.current.count).toBe(1)
  })
})
```

### Zustand Store Test Template

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null }) // Reset between tests
  })

  it('should set access token', () => {
    useAuthStore.getState().setAccessToken('abc123')
    expect(useAuthStore.getState().accessToken).toBe('abc123')
  })

  it('should clear state on logout', () => {
    useAuthStore.getState().setAccessToken('abc123')
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
```

### TDD Cycle (Per File)

```
STEP 1: Create test file (LoginForm.test.tsx)
STEP 2: Write first test → RUN → 🔴 RED (component doesn't exist)
STEP 3: Create LoginForm.tsx with MINIMAL code → RUN → 🟢 GREEN
STEP 4: Write second test → RUN → 🔴 RED
STEP 5: Add code to pass → RUN → 🟢 GREEN
STEP 6: Refactor if needed → RUN → 🟢 STILL GREEN
STEP 7: Repeat until all behaviors are covered
STEP 8: Move to next file
```

---

## TIER 2: PLAYWRIGHT BDD (End-to-End User Journeys)

### Purpose
- Validate COMPLETE user journeys in a REAL browser
- Verify that features work together (integration)
- Written in BDD style (Given-When-Then via test.step)
- Run before deployment, not during TDD

### When to Write Tier 2
- AFTER all Tier 1 tests pass for a feature
- Only for features with USER INTERACTION (forms, navigation, flows)
- Focus on Happy Path + Critical Error Paths only
- Do NOT duplicate edge cases already covered by Tier 1

### Rules
1. **One spec file per feature flow** — `auth.spec.ts`, `product-crud.spec.ts`
2. **BDD structure** — Use `test.step()` for Given-When-Then
3. **data-testid selectors** — Same testid used in Vitest
4. **Auto-wait** — Use Playwright's built-in waiting, NEVER `setTimeout`
5. **Isolated** — Each test must work independently (no test order dependency)

### File Structure
```
tests/
└── e2e/
    ├── auth/
    │   ├── login.spec.ts        ← Login flow
    │   └── register.spec.ts     ← Register flow
    ├── product/
    │   ├── product-list.spec.ts
    │   └── product-crud.spec.ts
    └── helpers/
        └── test-utils.ts        ← Shared setup, login helper
```

### BDD Test Template

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature: User Login', () => {

  test('Scenario: Successful login with valid credentials', async ({ page }) => {

    await test.step('Given the user is on the login page', async () => {
      await page.goto('/login')
      await expect(page.getByTestId('auth-login-form')).toBeVisible()
    })

    await test.step('When the user enters valid credentials', async () => {
      await page.getByTestId('auth-login-email-input').fill('user@example.com')
      await page.getByTestId('auth-login-password-input').fill('Password123!')
    })

    await test.step('And clicks the login button', async () => {
      await page.getByTestId('auth-login-submit-btn').click()
    })

    await test.step('Then the user should be redirected to dashboard', async () => {
      await expect(page).toHaveURL('/dashboard')
    })

    await test.step('And should see a welcome message', async () => {
      await expect(page.getByTestId('dashboard-welcome-msg')).toBeVisible()
    })
  })

  test('Scenario: Failed login with invalid credentials', async ({ page }) => {

    await test.step('Given the user is on the login page', async () => {
      await page.goto('/login')
    })

    await test.step('When the user enters wrong credentials', async () => {
      await page.getByTestId('auth-login-email-input').fill('wrong@example.com')
      await page.getByTestId('auth-login-password-input').fill('wrongpass')
    })

    await test.step('And clicks the login button', async () => {
      await page.getByTestId('auth-login-submit-btn').click()
    })

    await test.step('Then an error message should be displayed', async () => {
      await expect(page.getByTestId('auth-login-error-msg')).toBeVisible()
    })

    await test.step('And the user should remain on the login page', async () => {
      await expect(page).toHaveURL('/login')
    })
  })
})
```

### Playwright Helpers

```typescript
// tests/e2e/helpers/test-utils.ts
import { type Page } from '@playwright/test'

/**
 * Login helper — reuse across specs that need authenticated state
 */
export async function loginAsUser(page: Page, email = 'user@test.com', password = 'Password123!') {
  await page.goto('/login')
  await page.getByTestId('auth-login-email-input').fill(email)
  await page.getByTestId('auth-login-password-input').fill(password)
  await page.getByTestId('auth-login-submit-btn').click()
  await page.waitForURL('/dashboard')
}
```

### Anti-Flaky Rules

```typescript
// ❌ FORBIDDEN: Hard waits
await page.waitForTimeout(3000)

// ✅ CORRECT: Auto-wait for element
await expect(page.getByTestId('product-list')).toBeVisible()

// ❌ FORBIDDEN: Race condition
await page.click('[data-testid="submit"]')
expect(page.url()).toBe('/dashboard')  // Might not have navigated yet!

// ✅ CORRECT: Wait for navigation
await page.getByTestId('submit').click()
await expect(page).toHaveURL('/dashboard')
```

---

## TIER RESPONSIBILITY MATRIX

| What to Test | Tier 1 (Vitest) | Tier 2 (Playwright) |
|---|---|---|
| Component renders correctly | ✅ | ❌ |
| Props behavior | ✅ | ❌ |
| Form validation (each field) | ✅ | ❌ |
| Hook logic / state transitions | ✅ | ❌ |
| Zustand store actions | ✅ | ❌ |
| API mock responses | ✅ | ❌ |
| Happy Path user flow | ❌ | ✅ |
| Critical Error flow | ❌ | ✅ |
| Navigation between pages | ❌ | ✅ |
| Auth guard (redirect) | ❌ | ✅ |
| Multi-step forms | ❌ | ✅ |
| Cross-feature integration | ❌ | ✅ |

**Rule:** If it's tested in Tier 1, do NOT repeat in Tier 2.
**Rule:** Tier 2 only tests what Tier 1 CANNOT (real browser, real navigation, real CSS).

---

## AGENT ENFORCEMENT RULES

1. **Design → Test → Code.** Agent MUST describe the component design (props, behavior) BEFORE writing any test. Agent MUST write test BEFORE writing any component code.
2. **Per-file TDD.** Agent works on ONE file at a time. All tests for `LoginForm.tsx` must pass before touching `RegisterForm.tsx`.
3. **data-testid on every interactive element.** No exceptions. Format: `{feature}-{component}-{element}`.
4. **Tier 1 before Tier 2.** All Vitest tests for a feature must pass before writing Playwright specs.
5. **BDD structure in Playwright.** Every E2E test must use `test.step()` with Given-When-Then language.
6. **No flaky patterns.** Agent must NEVER use `waitForTimeout`, `sleep`, or `setTimeout` in tests.
