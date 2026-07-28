name: "Fluid-Tailwind Implementation PRP - Smooth Responsive Scaling"
description: |

## Purpose
Implement fluid-tailwind throughout the Coastal Creations Studio project to enable smooth responsive scaling using CSS `clamp()` instead of discrete breakpoints. This creates a seamless visual experience across all viewport sizes.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Integrate fluid-tailwind into the coastal-creations-app to replace breakpoint-based responsive patterns (`text-sm md:text-base lg:text-lg`) with fluid scaling classes (`~text-sm/lg`) throughout the entire application. This enables smooth visual transitions across all viewport widths rather than jarring jumps at breakpoints.

## Why
- **Smoother UX**: Text, spacing, and sizing scale smoothly rather than jumping at breakpoints
- **Less CSS**: Single fluid class replaces multiple breakpoint classes (e.g., `~p-4/8` vs `p-4 md:p-6 lg:p-8`)
- **Consistent design**: Uniform scaling behavior across all components
- **Modern approach**: CSS `clamp()` is now well-supported and industry-standard for fluid design
- **Reduced maintenance**: Fewer classes to manage and update
- **Improved readability**: Intent is clearer with `~text-sm/lg` than `text-sm md:text-base lg:text-lg`

## What
### User-Visible Behavior
- Text and spacing scale smoothly as viewport changes
- No visual "jumps" when crossing breakpoint boundaries
- Consistent proportions maintained at all viewport widths
- Same functionality, smoother visual experience

### Technical Requirements
- Install and configure fluid-tailwind for Tailwind CSS v4
- Update postcss configuration
- Convert 31+ component files with responsive patterns
- Preserve discrete breakpoints for layout changes (grid columns, display toggles)
- Maintain WCAG accessibility compliance

### Success Criteria
- [ ] fluid-tailwind installed and configured
- [ ] Configuration works with Tailwind v4 and Next.js 15
- [ ] All text sizing patterns converted to fluid
- [ ] All spacing patterns converted to fluid
- [ ] All width/height patterns converted to fluid
- [ ] Grid column/display patterns preserved as discrete breakpoints
- [ ] Build passes without errors
- [ ] Lint passes without errors
- [ ] Visual QA across viewport widths (mobile, tablet, desktop)

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Primary source of truth
- url: https://fluid.tw/
  why: Core syntax, configuration, and examples for fluid-tailwind

- docfile: PRPs/ai_docs/fluid-tailwind-guide.md
  why: Comprehensive local documentation with Tailwind v4 configuration, syntax guide, and conversion patterns

# Codebase Reference Files
- file: app/globals.css
  why: Current Tailwind v4 configuration with @theme directive and CSS variables

- file: components/landing/MainSection.tsx
  why: High-priority conversion target with text, width, spacing patterns; example of decorative SVG sizing

- file: components/landing/Calendar.tsx
  why: High-priority conversion target with grid layout (keep columns discrete) and text/gap patterns

- file: components/classes/PageHeader.tsx
  why: Contains text, width, padding, rounded patterns for conversion

- file: components/ui/Button.tsx
  why: UI component that may have padding patterns; check for conversion opportunities

- file: components/ui/Card.tsx
  why: UI component with potential padding/spacing patterns

- file: components/layout/nav/NavBar.tsx
  why: Navigation component - may have display toggles that should NOT be converted

- file: components/layout/footer/Footer.tsx
  why: Footer with responsive patterns for conversion
```

### Current Codebase Structure (Relevant Paths)
```
coastal-creations-app/
├── app/
│   ├── globals.css                    # Tailwind v4 config with @theme
│   ├── layout.tsx                     # Root layout
│   ├── page.tsx                       # Homepage
│   ├── [slug]/page.tsx               # CMS pages
│   ├── gallery/page.tsx              # Gallery page
│   ├── reservations/page.tsx         # Reservations page
│   └── admin/dashboard/              # Admin pages (35+ files)
│
├── components/
│   ├── ui/                           # 7 UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Label.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── PriceBadge.tsx
│   │   └── index.ts
│   │
│   ├── landing/                      # 9 landing components
│   │   ├── Hero.tsx
│   │   ├── MainSection.tsx
│   │   ├── Calendar.tsx
│   │   ├── Offerings.tsx
│   │   ├── GiftCardBanner.tsx
│   │   ├── SeaCreatures.tsx
│   │   └── ...
│   │
│   ├── layout/                       # 3 layout components
│   │   ├── nav/NavBar.tsx
│   │   └── footer/Footer.tsx
│   │
│   ├── classes/                      # Event display components
│   │   └── PageHeader.tsx
│   │
│   ├── reservations/                 # Reservation flow
│   │   ├── CalendarSelection.tsx
│   │   ├── PaymentForm.tsx
│   │   └── BookingSummary.tsx
│   │
│   ├── payment/                      # Payment components
│   │   ├── Payment.tsx
│   │   └── RegistrationHeader.tsx
│   │
│   ├── gallery/                      # Gallery components
│   │   ├── ImageGallery.tsx
│   │   └── GalleryCarousel.tsx
│   │
│   ├── gift-cards/                   # Gift card components
│   │   └── GiftCardPurchase.tsx
│   │
│   ├── about/About.tsx
│   ├── blog/Blog.tsx
│   ├── contact/ContactContainer.tsx
│   │
│   └── dashboard/                    # 35+ admin components
│       ├── home/EventContainer.tsx
│       ├── event-form/EditEventForm.tsx
│       ├── private-event-form/EditPrivateEventForm.tsx
│       ├── reservation-form/EditReservationForm.tsx
│       └── ...
│
├── postcss.config.mjs                # PostCSS configuration
├── tailwind.config.ts                # May need update
└── package.json
```

### Files to Modify Count by Phase
```yaml
Phase 1 - Foundation: 2 files (postcss.config.mjs, globals.css)
Phase 2 - UI Components: 7 files (components/ui/*)
Phase 3 - Layout: 3 files (NavBar, Footer, related)
Phase 4 - Landing: 9 files (Hero, MainSection, Calendar, etc.)
Phase 5 - Feature Components: 25+ files (gallery, reservations, payment, etc.)
Phase 6 - Dashboard: 35+ files (admin components)
Phase 7 - App Pages: 6+ page files
Phase 8 - Polish: Edge cases and refinements

Total: ~87 files to review, ~60 files with conversion opportunities
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Tailwind v4 uses different config approach
// Use @plugin directive in CSS or PostCSS plugin configuration
// See PRPs/ai_docs/fluid-tailwind-guide.md for exact setup

// CRITICAL: rem-based screens and fontSize REQUIRED
// Import { screens, fontSize } from 'fluid-tailwind' and apply to theme

// CRITICAL: Start/end values must use SAME UNIT
// GOOD: ~p-4/8 (both rem-based)
// BAD: ~p-[1rem]/[18px] (mixed units)

// CRITICAL: Don't convert these patterns - they need discrete breakpoints:
// - grid-cols-1 md:grid-cols-2 (column count changes)
// - hidden md:block (visibility toggles)
// - flex-col md:flex-row (layout direction)

// PATTERN: Extract to component when same fluid class used 5+ times
// Example: ~text-4xl/5xl appears in many headings

// PATTERN: Keep arbitrary values when necessary
// Example: ~w-[20rem]/[30rem] for custom sizing

// GOTCHA: Some components use ebGaramond.className with text sizing
// Must convert the text utility portion: `${ebGaramond.className} ~text-4xl/5xl`

// EXISTING: Design tokens in globals.css use CSS variables
// Fluid utilities work alongside CSS variables
```

## Implementation Blueprint

### Phase 1: Foundation Setup

#### Task 1: Install fluid-tailwind
```bash
npm install -D fluid-tailwind
```

#### Task 2: Update PostCSS Configuration
MODIFY `postcss.config.mjs`:
```javascript
import fluid, { extract, screens, fontSize } from 'fluid-tailwind';

export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
  // Add fluid-tailwind extractor for proper class detection
};
```

**Alternative for Tailwind v4**: Add to `app/globals.css` after @import:
```css
@import "tailwindcss";
@plugin "fluid-tailwind";
```

VALIDATION: `npm run build` should complete without errors

#### Task 3: Create Test Component for Validation
CREATE `app/test-fluid/page.tsx`:
```typescript
"use client";

import type { ReactElement } from "react";

export default function TestFluidPage(): ReactElement {
  return (
    <div className="~p-4/12">
      <h1 className="~text-2xl/5xl font-bold">Fluid Typography Test</h1>
      <p className="~text-sm/lg ~mt-2/6">
        This text should scale smoothly as you resize the viewport.
      </p>
      <div className="~mt-4/8 ~p-4/8 bg-primary/10 rounded-lg">
        <p className="~text-base/xl">Nested content with fluid padding</p>
      </div>
    </div>
  );
}
```

VALIDATION:
- Run `npm run dev`
- Navigate to `/test-fluid`
- Resize browser window and observe smooth scaling
- No jumps at breakpoints

### Phase 2: UI Components (7 files)

#### Task 4: Convert Button.tsx
MODIFY `components/ui/Button.tsx`:
- FIND: padding patterns like `px-4 md:px-6` or `py-2 md:py-3`
- CONVERT to: `~px-4/6 ~py-2/3`
- FIND: text sizing patterns like `text-sm md:text-base`
- CONVERT to: `~text-sm/base`
- PRESERVE: variant logic, color classes, disabled states

#### Task 5: Convert Card.tsx
MODIFY `components/ui/Card.tsx`:
- FIND: padding patterns
- CONVERT to fluid equivalents
- PRESERVE: variant styling (standard, featured, event)

#### Task 6: Convert Other UI Components
MODIFY `components/ui/Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Label.tsx`, `Badge.tsx`, `PriceBadge.tsx`:
- FIND: responsive padding/text patterns
- CONVERT to fluid equivalents
- PRESERVE: error states, focus states

VALIDATION: `npm run lint && npm run build`

### Phase 3: Layout Components (3 files)

#### Task 7: Convert Footer.tsx
MODIFY `components/layout/footer/Footer.tsx`:
- FIND: responsive text sizing
- FIND: responsive padding/spacing
- CONVERT to fluid equivalents
- PRESERVE: link colors, grid layouts

#### Task 8: Review NavBar.tsx (Selective Conversion)
MODIFY `components/layout/nav/NavBar.tsx`:
- FIND: padding patterns - CONVERT to fluid
- PRESERVE: `hidden md:block` and `flex md:hidden` patterns
- PRESERVE: mobile menu toggle logic
- CONVERT: text sizing if present

VALIDATION: Test navigation at mobile and desktop sizes

### Phase 4: Landing Components (9 files)

#### Task 9: Convert Hero.tsx
MODIFY `components/landing/Hero.tsx`:
- FIND: `text-5xl md:text-6xl` patterns
- CONVERT to: `~text-5xl/6xl`
- FIND: padding patterns
- CONVERT to fluid equivalents

#### Task 10: Convert MainSection.tsx
MODIFY `components/landing/MainSection.tsx`:
- FIND: `text-4xl md:text-5xl` (line ~178)
- CONVERT to: `~text-4xl/5xl`
- FIND: `text-lg` (line ~186)
- CONVERT to: `~text-base/lg` if responsive
- FIND: `py-20 md:py-28` (line ~26)
- CONVERT to: `~py-20/28`
- FIND: `px-6 md:px-12` (line ~150)
- CONVERT to: `~px-6/12`
- FIND: SVG sizing patterns like `w-44 md:w-52 lg:w-60`
- CONVERT to: `~w-44/60`
- PRESERVE: z-index values, rotation classes, opacity

#### Task 11: Convert Calendar.tsx
MODIFY `components/landing/Calendar.tsx`:
- FIND: `text-4xl md:text-5xl` (title)
- CONVERT to: `~text-4xl/5xl`
- FIND: `gap-4 lg:gap-6`
- CONVERT to: `~gap-4/6`
- PRESERVE: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7` (discrete)
- PRESERVE: conditional styling for isToday

#### Task 12: Convert Remaining Landing Components
MODIFY `Offerings.tsx`, `GiftCardBanner.tsx`, `SeaCreatures.tsx`, etc.:
- Apply same pattern: convert text/spacing, preserve grid columns

#### Task 13: Convert PageHeader.tsx
MODIFY `components/classes/PageHeader.tsx`:
- FIND: `text-2xl md:text-3xl lg:text-4xl`
- CONVERT to: `~text-2xl/4xl`
- FIND: `w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40`
- CONVERT to: `~w-20/40 ~h-20/40`
- FIND: `px-8 py-8 md:px-12 md:py-10`
- CONVERT to: `~px-8/12 ~py-8/10`
- FIND: `rounded-2xl md:rounded-3xl`
- CONVERT to: `~rounded-2xl/3xl`

VALIDATION: `npm run build && npm run dev`
Visual check: All landing page sections scale smoothly

### Phase 5: Feature Components (25+ files)

#### Task 14: Convert Gallery Components
MODIFY `components/gallery/ImageGallery.tsx`, `GalleryCarousel.tsx`:
- FIND: gap patterns
- CONVERT to fluid
- PRESERVE: grid column changes

#### Task 15: Convert Reservation Components
MODIFY `components/reservations/CalendarSelection.tsx`, `PaymentForm.tsx`, `BookingSummary.tsx`:
- FIND: text/padding patterns
- CONVERT to fluid
- PRESERVE: form field layouts

#### Task 16: Convert Payment Components
MODIFY `components/payment/Payment.tsx`, `RegistrationHeader.tsx`:
- FIND: responsive patterns
- CONVERT to fluid
- PRESERVE: payment form structure

#### Task 17: Convert Gift Card, About, Blog, Contact Components
MODIFY remaining feature components:
- Apply same conversion pattern

VALIDATION: Navigate through each feature area, test responsiveness

### Phase 6: Dashboard Components (35+ files)

#### Task 18: Convert Dashboard Event Forms
MODIFY `components/dashboard/event-form/EditEventForm.tsx` and similar:
- FIND: `p-4 sm:p-6 lg:p-8`
- CONVERT to: `~p-4/8`
- PRESERVE: form grid layouts

#### Task 19: Convert Dashboard Home Components
MODIFY `components/dashboard/home/EventContainer.tsx` and related:
- Apply fluid conversions

#### Task 20: Convert Remaining Dashboard Components
Batch convert remaining dashboard components following established patterns.

VALIDATION: `npm run lint && npm run build`
Test dashboard at various viewport widths

### Phase 7: App Pages (6+ files)

#### Task 21: Convert Page Files
MODIFY page files in `app/`:
- `[slug]/page.tsx`
- `gallery/page.tsx`
- `reservations/page.tsx`
- `admin/dashboard/layout.tsx`
- Other page files with responsive patterns

VALIDATION: Full build and visual QA

### Phase 8: Polish and Cleanup

#### Task 22: Remove Test Page
DELETE `app/test-fluid/page.tsx` after validation complete

#### Task 23: Final Audit
- Search for remaining breakpoint patterns that could be converted
- Ensure all grid-cols patterns remain discrete
- Verify display toggle patterns remain discrete

## Conversion Reference Quick Guide

### Text Sizing
```tsx
// BEFORE                           // AFTER
text-sm md:text-base               → ~text-sm/base
text-lg md:text-xl                 → ~text-lg/xl
text-2xl md:text-3xl lg:text-4xl   → ~text-2xl/4xl
text-4xl md:text-5xl               → ~text-4xl/5xl
text-5xl md:text-6xl               → ~text-5xl/6xl
```

### Spacing (Padding, Margin, Gap)
```tsx
// BEFORE                           // AFTER
p-4 md:p-6 lg:p-8                  → ~p-4/8
px-6 md:px-12                      → ~px-6/12
py-20 md:py-28                     → ~py-20/28
gap-4 md:gap-6                     → ~gap-4/6
gap-4 lg:gap-6                     → ~gap-4/6
m-2 md:m-4                         → ~m-2/4
mt-4 md:mt-6                       → ~mt-4/6
```

### Sizing (Width, Height)
```tsx
// BEFORE                           // AFTER
w-20 md:w-32 lg:w-40               → ~w-20/40
w-44 md:w-52 lg:w-60               → ~w-44/60
h-[400px] md:h-[500px]             → ~h-[400px]/[500px]
w-[40rem] md:w-[50rem] lg:w-[60rem] → ~w-[40rem]/[60rem]
```

### Border Radius
```tsx
// BEFORE                           // AFTER
rounded-2xl md:rounded-3xl         → ~rounded-2xl/3xl
```

### DO NOT CONVERT (Keep Discrete Breakpoints)
```tsx
// Grid columns - KEEP AS-IS
grid-cols-1 md:grid-cols-2 lg:grid-cols-3

// Display changes - KEEP AS-IS
hidden md:block
flex md:hidden
block md:inline-block

// Layout direction - KEEP AS-IS
flex-col md:flex-row
flex-col lg:flex-row

// Position changes that depend on layout - KEEP AS-IS (case-by-case)
```

## Tasks Checklist (Ordered)

```yaml
Task 1:
  action: INSTALL
  command: npm install -D fluid-tailwind
  validation: Check package.json contains fluid-tailwind

Task 2:
  action: MODIFY
  file: postcss.config.mjs OR app/globals.css
  changes: Add fluid-tailwind plugin configuration
  validation: npm run build (no errors)

Task 3:
  action: CREATE
  file: app/test-fluid/page.tsx
  purpose: Validation test page
  validation: Navigate to /test-fluid, see smooth scaling

Task 4-6:
  action: MODIFY
  files: components/ui/*.tsx (7 files)
  pattern: Convert responsive patterns to fluid
  validation: npm run build

Task 7-8:
  action: MODIFY
  files: components/layout/**/*.tsx (3 files)
  pattern: Convert spacing/text, preserve display toggles
  validation: Test nav at mobile/desktop

Task 9-13:
  action: MODIFY
  files: components/landing/*.tsx, components/classes/PageHeader.tsx (10 files)
  pattern: Convert all text/spacing/sizing patterns
  validation: Visual QA of landing page

Task 14-17:
  action: MODIFY
  files: Feature components (25+ files)
  pattern: Apply established conversion patterns
  validation: Feature area visual QA

Task 18-20:
  action: MODIFY
  files: Dashboard components (35+ files)
  pattern: Convert responsive patterns
  validation: Dashboard visual QA

Task 21:
  action: MODIFY
  files: app/**/*.tsx page files
  pattern: Convert responsive patterns
  validation: Full site visual QA

Task 22:
  action: DELETE
  file: app/test-fluid/page.tsx
  when: After all validation complete

Task 23:
  action: AUDIT
  search: Remaining unconverted patterns
  validation: All appropriate patterns converted
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
npm run lint                    # ESLint check
npx tsc --noEmit               # Type checking without build

# Expected: No errors. If errors, READ the error and fix.
```

### Level 2: Build Validation
```bash
npm run build

# Expected: Build completes successfully
# If errors: Check class syntax, ensure proper ~ usage
```

### Level 3: Runtime Validation
```bash
npm run dev

# Navigate to: http://localhost:3000/test-fluid
# Expected:
# 1. Text scales smoothly when resizing
# 2. Padding scales smoothly when resizing
# 3. No visual jumps at breakpoint boundaries
# 4. Console shows no errors
```

### Level 4: Visual QA Checklist
```bash
# Test each major section at these viewport widths:
# - 375px (mobile)
# - 768px (tablet)
# - 1024px (small desktop)
# - 1440px (desktop)
# - 1920px (large desktop)

# Check:
# 1. Landing page sections scale smoothly
# 2. Navigation works at all sizes
# 3. Forms remain usable and readable
# 4. Grid layouts maintain proper columns
# 5. Text remains readable at all sizes
```

## Final Validation Checklist
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] `/test-fluid` page shows smooth scaling
- [ ] Landing page sections scale smoothly
- [ ] Navigation functions correctly at all sizes
- [ ] Dashboard forms scale properly
- [ ] Grid columns remain discrete at breakpoints
- [ ] Display toggles (hidden/block) remain functional
- [ ] No visual jumps at common breakpoint widths
- [ ] All TypeScript types compile without errors
- [ ] WCAG compliance maintained (default checkSC144 enabled)

---

## Anti-Patterns to Avoid
- Do not convert grid-cols patterns - they need discrete breakpoints
- Do not convert display toggles (hidden/block) - they need discrete breakpoints
- Do not convert flex direction changes - they need discrete breakpoints
- Do not mix units in fluid values (rem with px)
- Do not use calc() in fluid values
- Do not skip visual QA - automated tests can't catch visual regressions
- Do not remove all breakpoint classes - some patterns must remain discrete
- Do not ignore build errors - fluid-tailwind outputs comments for failures

---

## Rollback Plan

If issues arise:
1. Revert postcss.config.mjs changes
2. Remove `@plugin "fluid-tailwind"` from globals.css if added
3. Run `npm uninstall fluid-tailwind`
4. Revert component changes via git

The conversion is additive - original breakpoint patterns still work if fluid classes fail.
