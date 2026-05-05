---
name: sk-nextjs-ui-design
description: Propose UI layouts and component choices based on Data-Driven Design and UX Principles. Activate when user needs UI design from an API spec without existing mockups.
version: 1.0.0
---

# 🎨 Skill: UI/UX Design Architect

> **Philosophy: Data-Driven Design & Component Assembly**
> Instead of drawing pictures, you analyze the shape of the data (API) and assemble standard UX patterns using Shadcn/ui components and Tailwind CSS.

---

## When to Activate

- During the `/design` workflow, when the user provides an API spec but NO UI mockup (Option B).
- When the user explicitly asks "How should this look?" or "Design the UI for this".

---

## The 8 Golden UX Principles

When generating UI proposals, ALWAYS obey these rules (defined in `nextjs-tech-standards.md`):

1. **Don't Make Me Think:** UI must be self-explanatory. Action buttons must have explicit verbs (e.g., `Delete User` instead of `Confirm`).
2. **60-30-10 Color Ratio:** Use Tailwind semantic variables (`bg-background`, `bg-muted`/`bg-card`, `bg-primary`). Never hardcode hex colors.
3. **Max 2 Fonts:** Clear typographic hierarchy.
4. **Grid System:** Wrap layouts in `grid-cols-1 md:grid-cols-12` with `gap-4` or `gap-6`.
5. **Fitts's Law:** CTAs must be large (`size="lg"`). Mobile touch targets minimum `44px` height.
6. **Visual Depth:** Prefer soft shadows (`shadow-sm`) and `backdrop-blur` over hard borders.
7. **WCAG 2.2:** Ensure high contrast. Use `text-muted-foreground` for secondary text.
8. **NO CUSTOM CSS:** Absolutely no inline styles. Avoid arbitrary tailwind values `w-[123px]`. If standard Tailwind classes cannot solve a UI requirement, you MUST STOP and ask the User for permission to write custom CSS.

---

## STEP 1: Data-to-UI Mapping

Analyze the API fields and map them to Shadcn/ui components:

| Data Shape / Type | Recommended UI Component | Example |
|---|---|---|
| Large Array of Objects | **Data Table** (with pagination/sort) | User List, Order History |
| Small Array of Visual Items | **Grid Cards** (`grid-cols-1 md:grid-cols-3`) | Product Catalog, Blog Posts |
| Enum / Status string | **Badge** (Color-coded) | `PENDING` (yellow), `SUCCESS` (green) |
| Boolean (`true`/`false`) | **Switch** or **Checkbox** | `isPublished`, `allowNotifications` |
| Long Text | **Accordion** or **Dialog** (Read more) | Terms, Descriptions |
| Dates | **Hover Card** (relative time default, exact time on hover) | `2 hours ago` |
| Row Actions (Edit/Delete) | **Dropdown Menu** at end of row | `...` -> Edit, Delete |
| Destructive Actions | **Alert Dialog** (Requires confirmation) | Delete User |
| Complex Input | **Select**, **Command** (Combobox), **Date Picker** | User selection, category select |

---

## STEP 2: Apply Standard UX Patterns

Identify the business context and apply the appropriate layout pattern:

### Pattern A: Admin / Dashboard Layout
- **Structure:** Sidebar (left) + Header (top) + Page Header (breadcrumb/title) + Content (cards/table).
- **Best for:** Internal tools, CMS, analytics.

### Pattern B: Master-Detail
- **Structure:** List of items. Clicking an item opens a **Sheet** (side modal) or a full **Dialog** containing the details/edit form.
- **Best for:** CRUD interfaces where you want to keep the user context without navigating away.

### Pattern C: Wizard / Stepper
- **Structure:** Progress bar + chunks of form fields + Prev/Next buttons.
- **Best for:** Complex forms, checkout processes, onboarding.

### Pattern D: Landing / Feed
- **Structure:** Sticky Header + Hero Section + Masonry/Grid content.
- **Best for:** E-commerce storefronts, social feeds, public pages.

---

## STEP 3: Generate the UI Wireframe

Since you cannot draw, generate a "Markdown Wireframe" using hierarchical lists.

**Example Output:**

```markdown
## UI Proposal: Product Management

**Pattern:** Admin Layout + Master-Detail

* 🧱 **Page Header**
  * `Title:` Products
  * `Breadcrumb:` Home > Products
  * `Action:` [ + Add Product ] (Primary Button)
* 🧱 **Toolbar Widget**
  * `Input:` Search by name... (Icon: Search)
  * `Dropdown:` Filter by Category
* 🧱 **Data Table Widget (Products)**
  * `Columns:` Image, Name, Price, Status
  * `Rows:`
    * [Img] | Mechanical Keyboard | $120 | [Badge: IN_STOCK] | [Dropdown: Edit/Delete]
    * [Img] | Wireless Mouse      | $50  | [Badge: OUT_OF_STOCK] | [Dropdown: Edit/Delete]
  * `Pagination:` Prev | 1 | 2 | 3 | Next
```

---

## STEP 4: Component Bill of Materials

List the exact Shadcn/ui CLI commands needed to scaffold this UI:

```markdown
### Required Shadcn Components
Run these commands to install the necessary base components:

`npx shadcn@latest add button input table dropdown-menu badge sheet`
```

---

## ENFORCEMENT CHECKLIST

Before presenting the design to the user, the Agent MUST self-verify:
- [ ] Is Fitts's law applied? (Are the main buttons obvious and large?)
- [ ] Are we using Badges for statuses?
- [ ] Are destructive actions protected by Alert Dialog?
- [ ] **Are there any arbitrary Tailwind classes (`h-[500px]`) or Custom CSS in the plan? If yes, REMOVE THEM or ask for permission.**
