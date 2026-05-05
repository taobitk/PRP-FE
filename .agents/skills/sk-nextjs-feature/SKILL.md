---
name: sk-nextjs-feature
description: Create a new feature slice following FSD architecture. Activate when user wants to add a new business feature.
version: 1.0.0
---

# 🧩 Skill: Create New Feature Slice

> Scaffolds a complete feature slice with ui/, model/, api/, and index.ts.

---

## When to Activate

- User runs `/feature` workflow (after design phase)
- User asks to "create a new feature" or "add [name] module"

## Input Required

- **Feature name**: `auth`, `product`, `order`
- **Entity name**: `User`, `Product`, `Order`
- **API endpoints**: `POST /auth/login`, `GET /products`

---

## Step 1: Create Feature Directory

```
src/features/{name}/
├── ui/
├── model/
├── api/
└── index.ts          ← Public API gate
```

## Step 2: Create Entity (if not exists)

In `src/entities/{entity}/`:
- `types.ts` — Zod schema + TypeScript type (single source of truth)
- `index.ts` — Public API exports

## Step 3: Create API Layer

In `features/{name}/api/`:
- `{name}Api.ts` — Raw API call functions using `apiClient`
- `{name}Queries.ts` — TanStack Query hooks (useQuery, useMutation) + query key factory

**Rules:**
- All API responses MUST be validated with Zod `.parse()`
- Query keys MUST follow factory pattern: `{name}Keys.list()`, `{name}Keys.detail(id)`
- Mutations MUST invalidate related queries on success

## Step 4: Create Model Layer (only if needed)

Only create Zustand store when feature has **client-side UI state** (modal, filters, selection).
Server data = TanStack Query. Client UI state = Zustand.

In `features/{name}/model/`:
- `{name}Store.ts` — Zustand store for UI state
- `use{Entity}.ts` — Custom hooks composing queries + store logic

## Step 5: Create Public API Gate

`features/{name}/index.ts` — Export ONLY what upper layers need. Internal files are private.

## Step 6: Wire Into App Route

Create page in `app/` that imports from `features/{name}` public API.
Page = thin composer, no business logic inside.

---

## Validation Checklist

- [ ] `index.ts` exists with explicit exports
- [ ] Zod schema is source of truth for types
- [ ] API responses validated with `.parse()`
- [ ] No cross-feature imports
- [ ] `"use client"` only where needed
- [ ] Test files co-located (`*.test.tsx`)
