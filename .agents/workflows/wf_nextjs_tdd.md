---
name: wf_nextjs_tdd
description: Execute TDD Red-Green-Refactor cycle for Next.js components and hooks.
command: /tdd
---

# 🧪 Workflow: 2-Tier TDD (/tdd)

> **IRON LAW: Design → Test → Code. No exceptions.**
>
> Tier 1 (Vitest) = per-file TDD, fast feedback.
> Tier 2 (Playwright BDD) = user journey validation.

---

## Prerequisites

- Feature MUST be designed first via `/feature` workflow
- Entity types and API layer contracts MUST exist
- If not → redirect user to run `/feature` first

---

## Phase 1: TIER 1 — Vitest TDD (Per File)

### Step 1.1: Pick ONE File to Build

Ask user or determine from `/feature` output:
- Which component/hook are we building FIRST?
- What is its expected behavior? (props in, render/action out)

### Step 1.2: DESIGN — Describe Before Writing

Before any code, Agent MUST present:

```markdown
## Component Design: LoginForm
- **Props:** onSubmit(data), isLoading?
- **Renders:** email input, password input, submit button
- **Behavior:**
  - Validates email format with Zod
  - Validates password min 8 chars
  - Calls onSubmit with validated data
  - Shows field-level error messages
  - Disables button when isLoading=true
- **data-testid map:**
  - auth-login-form
  - auth-login-email-input
  - auth-login-password-input
  - auth-login-submit-btn
  - auth-login-error-msg
```

**Wait for user to confirm design before proceeding.**

### Step 1.3: RED — Write Failing Test

1. Create test file: `LoginForm.test.tsx`
2. Write ONE test case
3. Run: `npm run test:run -- LoginForm`
4. Confirm 🔴 RED (file/component doesn't exist)

```
🔴 RED: Test written and failing.
File: features/auth/ui/LoginForm.test.tsx
Test: "should render email input"
Error: Cannot find module './LoginForm'
```

### Step 1.4: GREEN — Write Minimal Code

1. Create `LoginForm.tsx` with MINIMAL code to pass
2. Ensure all `data-testid` attributes are added
3. Run: `npm run test:run -- LoginForm`
4. Confirm 🟢 GREEN

```
🟢 GREEN: Test passing!
✅ should render email input
```

### Step 1.5: Next Test Case

1. Write next test (interaction, validation, states...)
2. Run → 🔴 RED
3. Add code → 🟢 GREEN
4. Refactor if needed → 🟢 STILL GREEN
5. Repeat until ALL behaviors from Step 1.2 are covered

```
♻️ REFACTOR: Code cleaned, all tests passing.
✅ should render email input
✅ should render password input
✅ should render submit button
✅ should call onSubmit with form data
✅ should show error for invalid email
✅ should disable button when loading
```

### Step 1.6: MOVE TO NEXT FILE

```
✅ FILE COMPLETE: LoginForm (6/6 tests passing)
📄 Next file: RegisterForm.tsx
→ Go back to Step 1.2 (Design)
```

Repeat Steps 1.2-1.6 for EVERY file in the feature.

---

## Phase 2: TIER 2 — Playwright BDD (Feature Flow)

### Prerequisites for Phase 2
- ALL Tier 1 tests for this feature MUST be passing
- The feature must be wirable (pages exist in `app/`)

### Step 2.1: Define User Journeys

Agent identifies the key user flows:

```markdown
## User Journeys: Auth Feature
1. ✅ Happy Path: Successful login → redirect to dashboard
2. ⚠️ Error Path: Invalid credentials → show error, stay on login
3. ✅ Happy Path: Successful register → redirect to login
```

**Only Happy Paths + Critical Error Paths. No edge cases (Tier 1 handles those).**

### Step 2.2: Write BDD Spec

Create `tests/e2e/auth/login.spec.ts` with Given-When-Then structure:

```typescript
test('Scenario: Successful login', async ({ page }) => {
  await test.step('Given the user is on login page', async () => { ... })
  await test.step('When the user enters valid credentials', async () => { ... })
  await test.step('Then the user is redirected to dashboard', async () => { ... })
})
```

### Step 2.3: Run E2E

```bash
npm run test:e2e -- auth
```

### Step 2.4: Fix if Needed

If Playwright fails:
- Is it a flaky test? → Fix with proper auto-wait
- Is it a real bug? → Go back to Tier 1, add a failing unit test for the bug, fix it, then re-run Tier 2

---

## Completion Report

```
✅ FEATURE TDD COMPLETE: auth
════════════════════════════
📋 Tier 1 (Vitest):
   ├── LoginForm: 6/6 tests ✅
   ├── RegisterForm: 5/5 tests ✅
   ├── useAuth: 4/4 tests ✅
   └── authStore: 3/3 tests ✅

🌐 Tier 2 (Playwright BDD):
   ├── Successful login flow ✅
   ├── Failed login flow ✅
   └── Successful register flow ✅

🏷️ data-testid coverage: 12 elements tagged
```

---

## Rules Recap

| Rule | Enforcement |
|---|---|
| Design → Test → Code | ❌ NEVER skip design step |
| One file at a time | ❌ NEVER start File B before File A tests pass |
| data-testid on interactive elements | ❌ NEVER query by visible text for buttons/inputs |
| Tier 1 before Tier 2 | ❌ NEVER write E2E before all unit tests pass |
| BDD structure (Given-When-Then) | ❌ NEVER write flat Playwright tests |
| No flaky patterns | ❌ NEVER use waitForTimeout / setTimeout |
