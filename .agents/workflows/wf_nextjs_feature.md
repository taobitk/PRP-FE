---
name: wf_nextjs_feature
description: Design and scaffold a new feature. Contract First — define types and API before writing code.
command: /feature
---

# 🎯 Workflow: Feature Design & Scaffold (/feature)

> **MANDATORY before writing any feature code.**
> Design First → Contract First → TDD.

---

## Step 1: Gather Requirements

Ask user:
- What does this feature do? (1-2 sentences)
- What entity does it manage? (User, Product, Order...)
- What API endpoints does it call? (method + path + request/response)
- What pages/routes need this feature?

## Step 2: Define Contract (Types + Zod Schema)

Based on API endpoints, create:

1. **Entity type** in `entities/{entity}/types.ts`:
   - Zod schema = single source of truth
   - TypeScript type inferred from schema

2. **API contract** in `shared/api/contracts/{name}.contract.ts` (if cross-feature):
   - Request payload schema
   - Response schema
   - Error response schema

Present to user for review. **Do NOT proceed until user approves the contract.**

## Step 3: Scaffold Feature

Activate `sk-nextjs-feature`:
- Create `features/{name}/` directory structure
- Create API layer with query hooks
- Create model layer (if client state needed)
- Create public API gate (index.ts)

## Step 4: Hand Off to TDD

Inform user:
```
✅ FEATURE DESIGNED & SCAFFOLDED!
==================================
📋 Contract defined: entities/{entity}/types.ts
📁 Feature created: features/{name}/
📄 API layer: features/{name}/api/

💡 Next: Run /tdd to implement the UI components with tests.
```

---

## Design Document Template

For complex features, create a design doc in `docs/features/{name}.md`:

```markdown
# Feature: {Name}

## Overview
{1-2 sentence description}

## Entity
{Entity name + key fields}

## API Endpoints
| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST   | /auth/login | { email, password } | { accessToken, user } |

## Pages
- /login → LoginForm
- /register → RegisterForm

## Components
- LoginForm (Client Component)
- RegisterForm (Client Component)

## State
- authStore: { accessToken, user } (Zustand, in-memory)
```
