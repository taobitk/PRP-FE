---
name: sk-nextjs-scaffold
description: Scaffold a new Next.js project with Custom FSD + App Router structure. Activate when creating a brand new project or resetting project structure.
version: 1.0.0
---

# 🏗️ Skill: Next.js Project Scaffold

> Creates a full Next.js project with the Custom FSD architecture from scratch.

---

## When to Activate

- User runs `/nextjs-new` workflow
- User asks to "create a new Next.js project"
- User asks to "scaffold" or "init" the frontend

---

## Step 1: Create Next.js App

```bash
npx -y create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

**Flags explained:**
- `--typescript` — TypeScript mandatory
- `--tailwind` — Required for Shadcn/ui
- `--app` — App Router (NOT Pages Router)
- `--src-dir` — Code lives in `src/`
- `--import-alias "@/*"` — Clean imports

---

## Step 2: Install Core Dependencies

```bash
npm install @tanstack/react-query zustand react-hook-form @hookform/resolvers zod date-fns clsx tailwind-merge
```

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event @vitejs/plugin-react jsdom @playwright/test
```

---

## Step 3: Initialize Shadcn/ui

```bash
npx -y shadcn@latest init -d
```

Then install base components:
```bash
npx -y shadcn@latest add button input label card dialog form toast
```

---

## Step 4: Create FSD Directory Structure

Create ALL directories:

```
src/
├── features/
├── entities/
├── widgets/
└── shared/
    ├── ui/          ← (Shadcn installs here automatically)
    ├── lib/
    ├── api/
    │   └── contracts/
    ├── config/
    └── hooks/
```

---

## Step 5: Create Foundation Files

### 5.1 — API Client (`src/shared/lib/apiClient.ts`)

```typescript
import { env } from '@/shared/config/env'

export class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown,
  ) {
    super(`API Error: ${status}`)
    this.name = 'ApiError'
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${env.API_BASE_URL}${endpoint}`

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (res.status === 401) {
    // TODO: Implement token refresh logic
    throw new ApiError(401, { message: 'Unauthorized' })
  }

  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After') ?? '5'
    throw new ApiError(429, { message: `Rate limited. Retry after ${retryAfter}s` })
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => null))
  }

  return res.json()
}
```

### 5.2 — Logger (`src/shared/lib/logger.ts`)

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel =
  process.env.NODE_ENV === 'production' ? 'warn' : 'debug'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('debug')) console.debug(`[DEBUG] ${message}`, context ?? '')
  },
  info: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('info')) console.info(`[INFO] ${message}`, context ?? '')
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('warn')) console.warn(`[WARN] ${message}`, context ?? '')
  },
  error: (message: string, context?: Record<string, unknown>) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, context ?? '')
      // TODO: Sentry.captureException() in production
    }
  },
}
```

### 5.3 — Utils (`src/shared/lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

### 5.4 — ENV Config (`src/shared/config/env.ts`)

```typescript
import { z } from 'zod'

const envSchema = z.object({
  API_BASE_URL: z.string().url(),
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
})

export const env = envSchema.parse({
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080',
  APP_ENV: process.env.NEXT_PUBLIC_APP_ENV ?? 'development',
})
```

### 5.5 — Query Keys Base (`src/shared/api/queryKeys.ts`)

```typescript
// Central query key registry
// Each feature adds its own keys here or in its own file
export const queryKeys = {
  // Example: productKeys, authKeys, orderKeys
  // Will be populated as features are created
}
```

### 5.6 — TanStack Query Provider (`src/shared/lib/queryProvider.tsx`)

```typescript
"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, type ReactNode } from 'react'

interface QueryProviderProps {
  children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // 1 minute
            gcTime: 5 * 60 * 1000,       // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

---

## Step 6: Wire Providers in Root Layout

Update `src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '@/shared/lib/queryProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'App',
  description: 'Next.js application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

---

## Step 7: Setup Testing

### 7.1 — Vitest Config (`vitest.config.ts`)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### 7.2 — Test Setup (`src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest'
```

### 7.3 — Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 7.4 — Add Test Scripts to `package.json`

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

---

## Step 8: Create `.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_ENV=development
```

---

## Completion Checklist

After scaffolding, verify:

- [ ] `npm run dev` starts without errors
- [ ] `npm run test:run` works (even with 0 tests)
- [ ] All FSD directories exist under `src/`
- [ ] `@/` import alias works
- [ ] Shadcn/ui components in `src/shared/ui/` (or `src/components/ui/`)
- [ ] TanStack Query provider wraps the app
- [ ] `.env.local` exists with API_BASE_URL
