---
name: wf_nextjs_new
description: Create a new Next.js project with Custom FSD architecture.
command: /nextjs-new
---

# 🚀 Workflow: New Next.js Project (/nextjs-new)

> Creates a brand new Next.js project with the full FSD scaffold.

---

## Step 1: Confirm With User

Ask:
- Project name / description?
- Is Backend API ready? If yes, what's the base URL?
- Any specific features to scaffold immediately? (auth, product, etc.)

## Step 2: Run Scaffold Skill

Activate `sk-nextjs-scaffold` and follow all 8 steps:
1. Create Next.js app via `create-next-app`
2. Install dependencies
3. Init Shadcn/ui
4. Create FSD directory structure
5. Create foundation files (apiClient, logger, utils, env, queryProvider)
6. Wire providers in root layout
7. Setup testing (Vitest + Playwright)
8. Create `.env.local`

## Step 3: Scaffold Initial Features (if requested)

For each feature requested, activate `sk-nextjs-feature`:
- Create feature directory structure
- Create entity types
- Create API layer + query hooks
- Create public API gate (index.ts)

## Step 4: Verify

Run:
```bash
npm run dev        # Should start without errors
npm run test:run   # Should pass (0 tests is OK)
```

## Step 5: Report

```
✅ PROJECT CREATED SUCCESSFULLY!
=================================
📁 FSD structure scaffolded
📦 Dependencies installed
🧪 Testing configured (Vitest + Playwright)
🎨 Shadcn/ui initialized
🔗 API client pointing to: {API_BASE_URL}

💡 Next: Use /feature to design and add your first feature.
```
