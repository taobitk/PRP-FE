---
name: wf_nextjs_design
description: Decompose UI and API requirements into widgets, features, entities, and state logic. Run before /feature when starting from a visual design or API spec.
command: /design
---

# 🎨 Workflow: UI & API Design Decomposition (/design)

> Analyze API contracts AND UI requirements, then map them into FSD layers.
> This workflow has TWO entry points — you may start from UI, API, or both.

---

## Prerequisites

- Project must be scaffolded (run `/nextjs-new` first if not)
- User provides AT LEAST ONE of:
  - UI: screenshot, Figma link, or text description
  - API: Swagger doc, backend code (Go, Java, Node.js...), JSON responses, or text description of endpoints

---

## Step 1: Determine Entry Point

Ask user what they have:

```
What do you have for this feature?

A) 🎨 UI mockup/description only (no API yet)
B) 📡 API spec/endpoints only (no UI yet)
C) 🎨📡 Both UI and API info
```

- **If A:** Skip to Step 3 (Identify Entities from UI), then Step 2 later
- **If B:** Start with Step 2 (API Analysis), then Step 3-4 later
- **If C:** Start with Step 2 (API Analysis), then continue in order

---

## Step 2: API Analysis [📡 API-FIRST]

### Step 2.1: Collect API Information

Ask user to provide endpoints. Accept ANY of these formats:
- Swagger/OpenAPI JSON or URL
- Backend handler code (Agent reads the handler + DTO structs)
- Raw JSON response examples
- Text description: "POST /auth/login with email and password, returns JWT token"

### Step 2.2: Build API Inventory Table

For each endpoint, extract and present:

```markdown
## API Inventory

| # | Method | Endpoint | Request Body | Response Body | Auth? | Notes |
|---|--------|----------|-------------|---------------|-------|-------|
| 1 | POST | /auth/login | `{ email, password }` | `{ accessToken, refreshToken, user }` | ❌ | Public |
| 2 | POST | /auth/register | `{ email, password, name }` | `{ id, email, name }` | ❌ | Public |
| 3 | GET | /auth/me | — | `{ id, email, name, role }` | ✅ | Needs token |
| 4 | GET | /products | `?page&limit&category` | `{ items[], total, page }` | ✅ | Paginated |
| 5 | GET | /products/:id | — | `{ id, name, price, description, images[] }` | ✅ | |
| 6 | POST | /products | `{ name, price, category }` | `{ id, name, price }` | ✅ | Admin only |
| 7 | PATCH | /products/:id | `{ name?, price? }` | `{ id, name, price }` | ✅ | Admin only |
| 8 | DELETE | /products/:id | — | `204 No Content` | ✅ | Admin only |
```

### Step 2.3: Extract Entities from API

From the response shapes, identify domain objects:

```markdown
## Entities Extracted from API

| Entity | Fields | Source Endpoints |
|--------|--------|-----------------|
| User | id, email, name, role | GET /auth/me, POST /auth/register |
| Product | id, name, price, description, images[], category | GET /products, GET /products/:id |
| PaginatedResponse<T> | items: T[], total, page, limit | GET /products (generic pattern) |
```

### Step 2.4: Map API to TanStack Query Strategy

For each endpoint, determine the query/mutation strategy:

```markdown
## API → State Mapping

| Endpoint | TanStack Type | Query Key | State Tool | Reason |
|----------|--------------|-----------|------------|--------|
| POST /auth/login | `useMutation` | — | Zustand (token in-memory) | Auth = client state |
| GET /auth/me | `useQuery` | `['auth', 'me']` | TanStack Query (server) | User profile = server data |
| GET /products | `useQuery` | `['products', filters]` | TanStack Query + URL State | List with filters |
| GET /products/:id | `useQuery` | `['products', id]` | TanStack Query (server) | Detail = server data |
| POST /products | `useMutation` | invalidates `['products']` | TanStack Query | Create = mutation |
| PATCH /products/:id | `useMutation` | invalidates `['products', id]` | TanStack Query | Update = mutation |
| DELETE /products/:id | `useMutation` | invalidates `['products']` | TanStack Query | Delete = mutation |
```

### Step 2.5: Define Zod Schemas (Contract Preview)

Draft the Zod schemas that will be created in `/feature`:

```markdown
## Zod Schema Preview

### entities/user/types.ts
- `UserSchema`: { id, email, name, role }

### entities/product/types.ts
- `ProductSchema`: { id, name, price, description, images, category }
- `CreateProductSchema`: ProductSchema.omit({ id, createdAt })

### shared/api/contracts/
- `LoginRequestSchema`: { email, password }
- `LoginResponseSchema`: { accessToken, refreshToken, user: UserSchema }
- `PaginatedResponseSchema<T>`: { items: T[], total, page, limit }
```

**Present to user. Wait for approval before continuing.**

---

## Step 3: Identify Entities (from UI and/or API)

If UI is provided, cross-reference with API entities:

```markdown
## Entities (UI + API merged)
| Entity | UI shows | API provides | Match? |
|--------|----------|-------------|--------|
| User | avatar, name | id, email, name, role | ✅ Need to add `avatarUrl` to API? |
| Product | image, title, price | id, name, price, images | ✅ Match |
```

If mismatch → flag it. FE may need a DTO transformation layer.

---

## Step 4: Identify Features (Business Actions)

Group endpoints + UI interactions into feature slices:

```markdown
## Feature Slices
| Feature | UI Components | API Endpoints | State |
|---------|--------------|---------------|-------|
| auth | LoginForm, RegisterForm, UserMenu | POST /login, POST /register, GET /me | Zustand + TanStack Query |
| product | ProductList, ProductDetail, ProductForm | GET /products, GET /:id, POST, PATCH, DELETE | TanStack Query + URL State |
```

---

## Step 5: Identify Widgets (Composite Blocks)

```markdown
## Widgets
| Widget | Composes | data-testid |
|--------|---------|-------------|
| Header | Logo + NavLinks + UserMenu(auth) | header-root |
| Sidebar | CategoryFilter(product) + NavLinks | sidebar-root |
```

---

## Step 6: Map to Page Routes

```markdown
## Routes
| Route | Page | Layout | Features Used | Auth? |
|---|---|---|---|---|
| /login | LoginPage | (auth) | auth | ❌ |
| /register | RegisterPage | (auth) | auth | ❌ |
| /dashboard | DashboardPage | (main) | auth, product | ✅ |
| /products | ProductListPage | (main) | product | ✅ |
| /products/:id | ProductDetailPage | (main) | product | ✅ |
```

---

## Step 7: Determine Server vs Client Components

```markdown
## Component Type Map
| Component | Type | Reason |
|---|---|---|
| ProductListPage (page.tsx) | Server | Initial fetch + SEO |
| ProductFilters | Client | Interactive onChange |
| ProductCard | Server | Static display |
| LoginForm | Client | Form + mutation |
| UserMenu | Client | Dropdown state |
```

---

## Step 8: Present Full Design Document

Compile ALL of the above into one summary:

```markdown
# 🎨 Design: {Feature/Page Name}

## 📡 API Inventory
[Table from Step 2.2]

## 🧩 Entities
[Table from Step 3]

## 🏰 Features & State
[Table from Step 4]

## 🧱 Widgets
[Table from Step 5]

## 🗺️ Routes
[Table from Step 6]

## ⚡ Component Types
[Table from Step 7]

## 📋 Zod Schema Preview
[From Step 2.5]
```

**Wait for user approval before proceeding.**

---

## Step 9: Hand Off

After user approves:

```
✅ DESIGN COMPLETE!
===================
📡 API endpoints analyzed: {count}
🧩 Entities identified: {count}
🏰 Features identified: {count}
🧱 Widgets identified: {count}
🗺️ Routes mapped: {count}
📋 Zod schemas drafted: {count}

💡 Next steps:
   1. Run /feature for each feature → creates Zod schemas + API layer
   2. Run /tdd to implement components (Design → Test → Code)
```

---

## ⚠️ PENDING: UI Design Skill (TODO)

> When user has NO UI mockup at all, a future `sk-nextjs-ui-design` skill
> will guide the Agent to propose a UI layout based on API data shapes
> and standard UX patterns. **This is not yet implemented.**
> For now, ask user to describe the UI in words or provide a rough sketch.
