# PRP: Clean Page Transitions Throughout Application

## Objective

Implement smooth, consistent fade-in/fade-out page transitions across all public-facing routes using `motion/react` (already installed, v12.9.4+) and Tailwind CSS transition utilities. Every page navigation should feel polished -- no abrupt unmounts, no layout jumps, no flash of unstyled content.

## Problem Statement

Currently, navigating between pages results in an instant hard cut. The `PageTransition` and `PageTransitionProvider` components exist in the codebase but are **never wired into the provider chain or used by any page**. The Next.js App Router unmounts the old page and mounts the new one synchronously with no animation, causing a jarring experience.

## Technical Approach: FrozenRouter Pattern

The Next.js App Router updates its internal router context during navigation, which immediately unmounts the old page before any exit animation can run. The established solution is the **FrozenRouter pattern**:

1. A `LayoutTransition` component wraps the `{children}` slot in the layout
2. It uses `AnimatePresence mode="wait"` keyed by the current route segment
3. A `FrozenRouter` child component preserves the old router context during the exit animation by caching the previous `LayoutRouterContext` value
4. This lets the exiting page render long enough for its `exit` animation to complete before Next.js tears it down

**Key APIs confirmed available:**
- `LayoutRouterContext` from `next/dist/shared/lib/app-router-context.shared-runtime` (confirmed present in Next.js 15.2.8)
- `useSelectedLayoutSegment` from `next/navigation`
- `AnimatePresence`, `motion`, `MotionConfig` from `motion/react` (v12.9.4)

## Architecture

```
app/layout.tsx
  <Providers>                         (QueryClient)
    <MotionConfig>                    (NEW - global transition defaults)
      <ConditionalLayout>             (NavBar/Footer wrapper)
        <LayoutTransition>            (NEW - AnimatePresence + FrozenRouter)
          {children}                  (page content with exit/enter animations)
        </LayoutTransition>
      </ConditionalLayout>
    </MotionConfig>
  </Providers>
```

The `LayoutTransition` component replaces the current unused `PageTransitionProvider`. The current `PageTransition` component is also unused and will be replaced.

## What Gets Animated

| Transition | Animation | Duration |
|------------|-----------|----------|
| Page exit | Fade out (opacity 1 -> 0) | 200ms |
| Page enter | Fade in + subtle rise (opacity 0 -> 1, y 8px -> 0) | 300ms |
| Mobile exit | Fade out (opacity 1 -> 0) | 150ms |
| Mobile enter | Fade in + smaller rise (opacity 0 -> 1, y 4px -> 0) | 250ms |

The animation is intentionally subtle. The goal is smoothness, not spectacle. A short fade with a slight vertical shift creates the perception of clean transitions without slowing down navigation.

## What Does NOT Get Animated

- **NavBar** -- persists across routes, never unmounts (it's in ConditionalLayout, outside the transition boundary)
- **Footer** -- persists across routes, never unmounts (same)
- **Admin routes** (`/admin/*`) -- excluded from transitions entirely; admin has its own layout with sidebar
- **Initial page load** -- `initial={false}` on AnimatePresence prevents animation on first render
- **Same-page interactions** -- only route segment changes trigger the transition

---

## Implementation Steps

### Step 1: Create `LayoutTransition` component

**File:** `components/layout/LayoutTransition.tsx` (NEW)

This is the core component. It:
1. Uses `useSelectedLayoutSegment()` to detect route changes at the current layout level
2. Wraps children in `AnimatePresence mode="wait"` keyed by the segment
3. Uses a `FrozenRouter` inner component that preserves the previous `LayoutRouterContext` during exit animations
4. Applies `motion.div` with `initial`, `animate`, and `exit` props
5. Detects mobile viewport to use subtler/faster animations
6. Includes `useReducedMotion` from `motion/react` to respect prefers-reduced-motion

```typescript
"use client";

import { useContext, useRef, useEffect, useState, type ReactNode, type ReactElement } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSelectedLayoutSegment } from "next/navigation";
import { LayoutRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

function usePreviousValue<T>(value: T): T | undefined {
  const prevValue = useRef<T>(undefined);

  useEffect(() => {
    prevValue.current = value;
    return () => {
      prevValue.current = undefined;
    };
  });

  return prevValue.current;
}

function FrozenRouter({ children }: { children: ReactNode }): ReactElement {
  const context = useContext(LayoutRouterContext);
  const prevContext = usePreviousValue(context) || null;
  const segment = useSelectedLayoutSegment();
  const prevSegment = usePreviousValue(segment);

  const changed =
    segment !== prevSegment &&
    segment !== undefined &&
    prevSegment !== undefined;

  return (
    <LayoutRouterContext.Provider value={changed ? prevContext : context}>
      {children}
    </LayoutRouterContext.Provider>
  );
}

interface LayoutTransitionProps {
  children: ReactNode;
  className?: string;
}

const LayoutTransition = ({ children, className }: LayoutTransitionProps): ReactElement => {
  const segment = useSelectedLayoutSegment();
  const shouldReduceMotion = useReducedMotion();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Respect prefers-reduced-motion
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  const enterY = isMobile ? 4 : 8;
  const exitDuration = isMobile ? 0.15 : 0.2;
  const enterDuration = isMobile ? 0.25 : 0.3;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        className={className}
        initial={{ opacity: 0, y: enterY }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: enterDuration, ease: "easeOut" },
        }}
        exit={{
          opacity: 0,
          transition: { duration: exitDuration, ease: "easeIn" },
        }}
      >
        <FrozenRouter>{children}</FrozenRouter>
      </motion.div>
    </AnimatePresence>
  );
};

export default LayoutTransition;
```

**Key design decisions:**
- `useSelectedLayoutSegment()` (not `usePathname()`) -- this means only the segment relevant to the wrapping layout triggers animations. Nested layouts could add their own `LayoutTransition` independently.
- `mode="wait"` -- the old page fully fades out before the new one fades in. No overlapping content.
- `initial={false}` -- no animation on the very first page load.
- Exit is pure opacity fade (no y movement) to feel snappy. Enter has a subtle y rise for perceived smoothness.
- `useReducedMotion()` -- if the user has `prefers-reduced-motion: reduce` in their OS settings, skip all animation entirely.

### Step 2: Integrate into ConditionalLayout

**File:** `components/layout/ConditionalLayout.tsx` (MODIFY)

Wrap the `{children}` slot (the area between NavBar and Footer) with `LayoutTransition`. The NavBar and Footer stay outside the transition boundary so they never flicker or re-animate.

Current code:
```tsx
return (
  <>
    <NavBar />
    <div className="pt-[var(--nav-offset,8rem)]">
      <div className="bg-gradient-to-r from-[#b6dce6] via-[#BEDCDC] to-[#daebeb]">
        {children}
      </div>
    </div>
    <Footer />
  </>
);
```

Updated code:
```tsx
import LayoutTransition from "@/components/layout/LayoutTransition";

return (
  <>
    <NavBar />
    <div className="pt-[var(--nav-offset,8rem)]">
      <div className="bg-gradient-to-r from-[#b6dce6] via-[#BEDCDC] to-[#daebeb]">
        <LayoutTransition>
          {children}
        </LayoutTransition>
      </div>
    </div>
    <Footer />
  </>
);
```

**Why here and not in `app/layout.tsx`?**
- `ConditionalLayout` already splits admin vs public routes. Placing the transition here means admin routes are automatically excluded.
- The NavBar and Footer are outside the `LayoutTransition`, so they persist smoothly across navigations without fading in/out.
- The gradient background div is also outside, preventing any flash-to-white during transitions.

### Step 3: Handle `loading.tsx` skeleton interplay

The existing `loading.tsx` files (17 of them) render skeleton UIs via Next.js Suspense. These skeletons appear **inside** the `LayoutTransition` boundary, meaning:

1. User clicks a link
2. Current page **fades out** (200ms exit animation)
3. `loading.tsx` skeleton **fades in** (300ms enter animation) -- appears smoothly
4. When data loads, the actual page content replaces the skeleton **without another transition** (same route segment, no key change)

This is the correct behavior. The skeleton acts as an intermediate state that itself transitions in smoothly. No changes needed to loading.tsx files.

**Important:** The skeleton-to-content swap within the same route happens via React Suspense (replacing the fallback with the resolved component). This is NOT a route change, so `LayoutTransition` does not trigger a second animation. The swap will be instant, which is expected since the skeleton already matches the layout of the real content (preventing layout shift).

### Step 4: Add `min-h-screen` to LayoutTransition wrapper

To prevent the footer from jumping up during the brief moment between exit and enter (when the motion.div has `opacity: 0` and effectively takes no visual space), ensure the transition wrapper has a minimum height.

In the `LayoutTransition` component, the `motion.div` should include `min-h-screen`:

```tsx
<motion.div
  key={segment}
  className={`min-h-screen ${className || ""}`}
  // ... animation props
>
```

This ensures the page area always occupies at least the viewport height, so the footer never "bounces" during transitions.

### Step 5: Delete unused transition components

**File:** `components/PageTransition.tsx` (DELETE)
**File:** `components/PageTransitionProvider.tsx` (DELETE)

These are the original unused transition components. They are not imported anywhere in the codebase. The new `LayoutTransition` component replaces both with a correct implementation that uses the FrozenRouter pattern.

Verify before deleting:
```bash
grep -r "PageTransition" --include="*.tsx" --include="*.ts" app/ components/
grep -r "PageTransitionProvider" --include="*.tsx" --include="*.ts" app/ components/
```

If either is imported somewhere, update those imports to use `LayoutTransition` instead.

### Step 6: Scroll restoration

When the new page fades in, the scroll position should be at the top. Next.js handles this by default with the App Router (`scrollRestoration`), but the `AnimatePresence mode="wait"` can interfere because the new page mounts after the exit completes.

Add a scroll-to-top effect inside `LayoutTransition` that fires when the segment changes:

```typescript
useEffect(() => {
  window.scrollTo(0, 0);
}, [segment]);
```

Place this inside the `LayoutTransition` component body, after the `segment` variable is defined.

---

## Files Changed Summary

### New Files (1)
| File | Purpose |
|------|---------|
| `components/layout/LayoutTransition.tsx` | FrozenRouter + AnimatePresence page transition wrapper |

### Modified Files (1)
| File | Change |
|------|--------|
| `components/layout/ConditionalLayout.tsx` | Wrap `{children}` with `<LayoutTransition>` inside the gradient div |

### Deleted Files (2)
| File | Reason |
|------|--------|
| `components/PageTransition.tsx` | Unused, replaced by LayoutTransition |
| `components/PageTransitionProvider.tsx` | Unused, replaced by LayoutTransition |

### Unchanged (no modifications needed)
- `app/layout.tsx` -- no changes needed, ConditionalLayout handles everything
- `app/providers.tsx` -- no changes needed
- All 17 `loading.tsx` files -- work correctly inside LayoutTransition as-is
- All `page.tsx` files -- no per-page wrappers needed; the layout-level transition handles everything globally
- `app/admin/**` -- excluded automatically because ConditionalLayout renders admin routes without LayoutTransition

---

## Transition Timing Rationale

| Property | Desktop | Mobile | Why |
|----------|---------|--------|-----|
| Exit opacity | 200ms | 150ms | Fast enough to not feel sluggish. The user clicked -- they want to go. |
| Exit ease | `easeIn` | `easeIn` | Accelerates out. Natural "departing" feel. |
| Enter opacity | 300ms | 250ms | Slightly slower than exit. The new content "settling in" feels premium. |
| Enter y offset | 8px | 4px | Subtle upward rise. Enough to notice subconsciously, not enough to distract. |
| Enter ease | `easeOut` | `easeOut` | Decelerates in. Natural "arriving" feel. |

Total perceived transition time: ~500ms desktop, ~400ms mobile. This is within the 200-500ms range that feels responsive without being laggy.

---

## Edge Cases

### Back/Forward browser navigation
`AnimatePresence` triggers on any key change, including popstate (back/forward). The same fade-out/fade-in applies. `useSelectedLayoutSegment` correctly reflects the new segment for browser navigation.

### Same-page navigation (e.g., anchor links)
If the segment doesn't change (same page, just different hash), `useSelectedLayoutSegment` returns the same value, so no transition fires. This is correct -- anchor scrolling should not trigger a page transition.

### Dynamic route segments (`[eventId]`, `[slug]`, etc.)
These are children of their parent layout. The `useSelectedLayoutSegment` in `ConditionalLayout` sees the top-level segment change (e.g., `events` to `gallery`), not the nested `eventId` change. This means:
- Navigating `/events/adult-classes` to `/gallery` -- transition fires (segment changes from `events` to `gallery`)
- Navigating `/events/adult-classes` to `/events/kid-classes` -- transition fires (the children within `events` change, which changes the segment value)
- Navigating `/events/adult-classes/123` to `/events/adult-classes/456` -- transition fires because the key changes via the segment tree

If any nested dynamic routes do NOT trigger transitions (because the parent segment stays the same), add a nested `LayoutTransition` in the appropriate layout.tsx. But given the current route structure where ConditionalLayout wraps all children directly, every page change should trigger a segment change.

### Admin routes
`ConditionalLayout` renders `<div>{children}</div>` for admin routes (no NavBar, Footer, or gradient). The `LayoutTransition` is only present in the non-admin branch, so admin pages are completely unaffected.

### Rapid navigation (user clicks multiple links quickly)
`AnimatePresence mode="wait"` handles this gracefully. If a new navigation happens during an exit animation, AnimatePresence cancels the current animation cycle and starts a new exit/enter for the latest target. No stale pages get stuck.

---

## Verification Checklist

1. `npm run build` -- no TypeScript or lint errors
2. Navigate Home -> Adult Classes: current page fades out, skeleton fades in, content replaces skeleton
3. Navigate Adult Classes -> Gallery: same smooth transition
4. Navigate Gallery -> Calendar: same smooth transition
5. Navigate to event detail page (`/events/adult-classes/[id]`): transition fires
6. Browser back button: transition fires in reverse
7. NavBar stays visible and stable throughout all transitions (never fades/flickers)
8. Footer stays stable (never jumps up during transition)
9. Admin pages (`/admin/dashboard/*`): no transitions, no interference
10. `prefers-reduced-motion: reduce` in OS settings: all transitions disabled, pages swap instantly
11. Mobile (375px viewport): transitions are subtler and faster
12. Rapid clicking between pages: no stale content, no stuck animations
13. Page scrolls to top on each navigation
14. Loading skeletons appear smoothly between exit and content load
