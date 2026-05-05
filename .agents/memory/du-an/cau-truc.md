# 📂 Cấu Trúc Dự Án: GoPRP-FE

> Bản đồ cây thư mục của toàn bộ dự án, được tự động quét và cập nhật.

## 🌳 Cây Thư Mục (Lớp 1)

``text
📁 GoPRP-FE/
├── 📁 .agents
│   ├── 📁 memory
│   │   ├── 📁 du-an
│   │   │   ├── 📄 cau-truc.md
│   │   │   ├── 📄 diem-neo.md
│   │   │   └── 📄 kien-truc.md
│   │   ├── 📁 logs
│   │   └── 📄 index.md
│   ├── 📁 rules
│   │   ├── 📄 nextjs-a11y-testing-standards.md
│   │   ├── 📄 nextjs-architecture-standards.md
│   │   ├── 📄 nextjs-coding-standards.md
│   │   ├── 📄 nextjs-security-standards.md
│   │   └── 📄 nextjs-tech-standards.md
│   ├── 📁 scripts
│   ├── 📁 skills
│   │   ├── 📁 sk-nextjs-a11y
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 sk-nextjs-feature
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 sk-nextjs-scaffold
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 sk-nextjs-state
│   │   │   └── 📄 SKILL.md
│   │   ├── 📁 sk-nextjs-tdd
│   │   │   └── 📄 SKILL.md
│   │   └── 📁 sk-nextjs-ui-design
│   │       └── 📄 SKILL.md
│   └── 📁 workflows
│       ├── 📄 wf_nextjs_design.md
│       ├── 📄 wf_nextjs_feature.md
│       ├── 📄 wf_nextjs_new.md
│       └── 📄 wf_nextjs_tdd.md
├── 📁 API-docs
│   ├── 📁 user
│   │   └── 📄 api_handover.md
│   ├── 📄 api_handover.md
│   └── 📄 api_spec new.md
├── 📁 docs
│   ├── 📁 plan
│   │   ├── 📄 admin-user-todolist.md
│   │   └── 📄 finance-todolist.md
│   └── 📄 design_system.md
├── 📁 playwright-report
│   └── 📄 index.html
├── 📁 public
│   ├── 📄 file.svg
│   ├── 📄 globe.svg
│   ├── 📄 next.svg
│   ├── 📄 vercel.svg
│   └── 📄 window.svg
├── 📁 src
│   ├── 📁 app
│   │   ├── 📁 admin
│   │   │   └── 📁 users
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 dashboard
│   │   │   └── 📄 page.tsx
│   │   ├── 📁 finance
│   │   │   ├── 📁 analytics
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 budgets
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 categories
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── 📁 transactions
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📁 wallets
│   │   │       └── 📄 page.tsx
│   │   ├── 📁 login
│   │   │   └── 📄 page.tsx
│   │   ├── 📄 favicon.ico
│   │   ├── 📄 globals.css
│   │   ├── 📄 layout.tsx
│   │   └── 📄 page.tsx
│   ├── 📁 components
│   │   └── 📁 ui
│   │       ├── 📄 badge.tsx
│   │       ├── 📄 button.tsx
│   │       ├── 📄 card.tsx
│   │       ├── 📄 checkbox.tsx
│   │       ├── 📄 dialog.tsx
│   │       ├── 📄 form.tsx
│   │       ├── 📄 input.tsx
│   │       ├── 📄 label.tsx
│   │       ├── 📄 progress.tsx
│   │       ├── 📄 select.tsx
│   │       ├── 📄 skeleton.tsx
│   │       ├── 📄 sonner.tsx
│   │       ├── 📄 switch.tsx
│   │       ├── 📄 table.tsx
│   │       └── 📄 tabs.tsx
│   ├── 📁 entities
│   │   └── 📁 user
│   │       └── 📁 model
│   │           └── 📄 user.model.ts
│   ├── 📁 features
│   │   ├── 📁 admin
│   │   │   ├── 📁 api
│   │   │   │   └── 📄 adminApi.ts
│   │   │   └── 📁 ui
│   │   │       └── 📄 AdminDashboardView.tsx
│   │   ├── 📁 auth
│   │   │   ├── 📁 api
│   │   │   │   └── 📄 authApi.ts
│   │   │   ├── 📁 model
│   │   │   │   └── 📄 authStore.ts
│   │   │   ├── 📁 ui
│   │   │   │   └── 📄 LoginForm.tsx
│   │   │   └── 📄 index.ts
│   │   ├── 📁 finance
│   │   │   ├── 📁 api
│   │   │   │   └── 📄 financeApi.ts
│   │   │   ├── 📁 ui
│   │   │   │   ├── 📄 BudgetList.tsx
│   │   │   │   ├── 📄 CategoryList.tsx
│   │   │   │   ├── 📄 CreateCategoryForm.tsx
│   │   │   │   ├── 📄 CreateTransactionForm.tsx
│   │   │   │   ├── 📄 CreateWalletForm.tsx
│   │   │   │   ├── 📄 SpendingChart.tsx
│   │   │   │   ├── 📄 TransactionFilters.tsx
│   │   │   │   ├── 📄 TransactionList.tsx
│   │   │   │   └── 📄 WalletList.tsx
│   │   │   └── 📄 index.ts
│   │   └── 📁 user
│   │       ├── 📁 api
│   │       │   └── 📄 userApi.ts
│   │       ├── 📁 model
│   │       └── 📁 ui
│   │           ├── 📄 CreateUserModal.tsx
│   │           ├── 📄 EditUserModal.tsx
│   │           ├── 📄 MemberDashboardView.tsx
│   │           └── 📄 UserTable.tsx
│   ├── 📁 lib
│   │   └── 📄 utils.ts
│   ├── 📁 shared
│   │   ├── 📁 api
│   │   │   ├── 📁 contracts
│   │   │   │   ├── 📄 admin.contract.ts
│   │   │   │   ├── 📄 auth.contract.ts
│   │   │   │   ├── 📄 finance.contract.ts
│   │   │   │   └── 📄 user.contract.ts
│   │   │   └── 📄 queryKeys.ts
│   │   ├── 📁 config
│   │   │   └── 📄 env.ts
│   │   ├── 📁 hooks
│   │   ├── 📁 lib
│   │   │   ├── 📄 apiClient.ts
│   │   │   ├── 📄 logger.ts
│   │   │   ├── 📄 money.ts
│   │   │   ├── 📄 queryProvider.tsx
│   │   │   └── 📄 utils.ts
│   │   └── 📁 ui
│   ├── 📁 test
│   │   └── 📄 setup.ts
│   └── 📁 widgets
│       ├── 📁 finance-summary
│       │   ├── 📁 ui
│       │   │   └── 📄 FinanceSummary.tsx
│       │   └── 📄 index.ts
│       └── 📁 navigation
│           └── 📁 ui
│               └── 📄 Navbar.tsx
├── 📁 test-results
│   └── 📄 .last-run.json
├── 📁 tests
│   ├── 📁 e2e
│   │   ├── 📁 admin
│   │   │   ├── 📄 admin.live.spec.ts
│   │   │   └── 📄 admin.mock.spec.ts
│   │   ├── 📁 auth
│   │   │   ├── 📄 auth.live.spec.ts
│   │   │   └── 📄 auth.mock.spec.ts
│   │   └── 📁 finance
│   │       ├── 📄 finance.live.spec.ts
│   │       └── 📄 finance.mock.spec.ts
│   └── 📁 unit
│       ├── 📁 admin
│       │   └── 📄 adminApi.test.tsx
│       ├── 📁 auth
│       │   ├── 📄 authStore.test.ts
│       │   └── 📄 LoginForm.test.tsx
│       ├── 📁 finance
│       │   ├── 📄 BudgetList.test.tsx
│       │   ├── 📄 CategoryList.test.tsx
│       │   ├── 📄 CreateCategoryForm.test.tsx
│       │   ├── 📄 CreateTransactionForm.test.tsx
│       │   ├── 📄 CreateWalletForm.test.tsx
│       │   ├── 📄 finance.contract.test.ts
│       │   ├── 📄 financeApi.test.tsx
│       │   ├── 📄 SpendingChart.test.tsx
│       │   ├── 📄 TransactionFilters.test.tsx
│       │   ├── 📄 TransactionList.test.tsx
│       │   └── 📄 WalletList.test.tsx
│       ├── 📁 shared
│       │   ├── 📄 apiClient.test.ts
│       │   └── 📄 money.test.ts
│       ├── 📁 user
│       │   └── 📄 userApi.test.tsx
│       └── 📁 widgets
│           └── 📄 FinanceSummary.test.tsx
├── 📄 .env.local
├── 📄 .gitignore
├── 📄 AGENTS.md
├── 📄 CLAUDE.md
├── 📄 components.json
├── 📄 eslint.config.mjs
├── 📄 next.config.ts
├── 📄 next-env.d.ts
├── 📄 package.json
├── 📄 package-lock.json
├── 📄 playwright.config.ts
├── 📄 postcss.config.mjs
├── 📄 README.md
├── 📄 run.ps1
├── 📄 tsconfig.json
└── 📄 vitest.config.ts

``
