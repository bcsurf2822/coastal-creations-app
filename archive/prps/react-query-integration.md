name: "React Query Integration PRP - TanStack Query v5"
description: |

## Purpose
Integrate TanStack Query (React Query) v5 into the coastal-creations-app to modernize data fetching, eliminate redundant API calls, and establish consistent state management patterns across the application.

## Core Principles
1. **Context is King**: Include ALL necessary documentation, examples, and caveats
2. **Validation Loops**: Provide executable tests/lints the AI can run and fix
3. **Information Dense**: Use keywords and patterns from the codebase
4. **Progressive Success**: Start simple, validate, then enhance
5. **Global rules**: Be sure to follow all rules in CLAUDE.md

---

## Goal
Integrate TanStack Query v5 into the coastal-creations-app to replace manual fetch/useEffect patterns with a robust, cached, and deduplicated data fetching solution. Start with a simple pilot endpoint (`/api/hours`) to validate the integration before rolling out to the entire application.

## Why
- **Eliminate duplicate API calls**: Multiple components (Calendar.tsx, Offerings.tsx, EventsContainer.tsx) fetch `/api/events` independently, causing redundant network requests
- **Replace manual cache management**: The existing `usePageContent.ts` hook implements custom caching with module-level state - React Query handles this automatically
- **Standardize data fetching patterns**: Currently inconsistent patterns across components (loading states, error handling, refetch logic)
- **Enable advanced features**: Automatic background refetching, optimistic updates, query invalidation on mutations
- **Align with modern React practices**: TanStack Query is the industry standard for server state management
- **Developer experience**: Built-in devtools for debugging cache state and query lifecycle

## What
### User-Visible Behavior
- Faster page loads due to cached data
- Smoother transitions between pages (no flash of loading state for cached data)
- More responsive UI during data updates

### Technical Requirements
- Install and configure TanStack Query v5
- Create QueryClient with appropriate defaults for Next.js App Router
- Set up QueryClientProvider in app layout
- Create reusable query hooks following established patterns
- Migrate pilot endpoint (`/api/hours`) to validate integration
- Establish patterns for future migrations

### Success Criteria
- [ ] TanStack Query v5 installed and configured
- [ ] QueryClientProvider wrapping the application
- [ ] `useHours()` query hook created and functional
- [ ] Pilot component successfully using the hook
- [ ] DevTools visible in development mode
- [ ] No regression in existing functionality
- [ ] TypeScript types properly integrated
- [ ] Build passes without errors
- [ ] Lint passes without errors

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Primary source of truth
- url: https://tanstack.com/query/v5/docs/framework/react/quick-start
  why: Core setup patterns, useQuery, useMutation basics

- url: https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr
  why: Next.js App Router specific setup, HydrationBoundary, prefetching

# Reference Implementation
- file: /Users/benjamincorbett/code/apps/cover-letter-builder/frontend/app/get-query-client.ts
  why: QueryClient singleton pattern for Next.js

- file: /Users/benjamincorbett/code/apps/cover-letter-builder/frontend/app/providers.tsx
  why: Provider setup pattern with devtools

- file: /Users/benjamincorbett/code/apps/cover-letter-builder/frontend/hooks/queries/use-letters-history.ts
  why: Simple query hook pattern

- file: /Users/benjamincorbett/code/apps/cover-letter-builder/frontend/services/api.ts
  why: API layer pattern (centralized fetch functions)

# Current Codebase Patterns
- file: hooks/usePageContent.ts
  why: Existing manual cache implementation to be replaced

- file: app/api/hours/route.ts
  why: Pilot API endpoint - simple GET with typed response

- file: types/hours.ts
  why: TypeScript types for HoursOfOperation
```

### Current Codebase Structure (Relevant Paths)
```
coastal-creations-app/
├── app/
│   ├── layout.tsx              # Root layout - needs Provider wrapper
│   ├── api/
│   │   ├── hours/route.ts      # Pilot endpoint (GET/PUT)
│   │   ├── events/route.ts     # High-value endpoint (used 3+ places)
│   │   ├── page-content/       # Replace usePageContent hook
│   │   └── gallery/            # Simple GET with filtering
│   └── ...
├── components/
│   ├── layout/
│   │   ├── Footer.tsx          # Can use hours data for display
│   │   └── ...
│   ├── landing/
│   │   ├── Calendar.tsx        # Fetches events, customers
│   │   └── Offerings.tsx       # Fetches events
│   └── providers/              # Existing providers directory
├── hooks/
│   ├── usePageContent.ts       # Manual cache - to be replaced
│   └── useDaySelection.ts      # Client-side only hook (keep as-is)
├── lib/
│   └── ...
├── types/
│   ├── hours.ts                # HoursOfOperation types
│   ├── interfaces.ts           # Shared interfaces
│   └── pageContent.ts          # PageContent types
└── package.json
```

### Desired Codebase Structure (After Implementation)
```
coastal-creations-app/
├── app/
│   ├── layout.tsx              # Wraps children with Providers
│   ├── get-query-client.ts     # NEW: QueryClient singleton factory
│   ├── providers.tsx           # NEW: QueryClientProvider + devtools
│   └── ...
├── hooks/
│   ├── queries/                # NEW: Query hooks directory
│   │   ├── index.ts            # Barrel export
│   │   ├── use-hours.ts        # NEW: Pilot query hook
│   │   ├── use-events.ts       # FUTURE: Events query
│   │   ├── use-page-content.ts # FUTURE: Replace manual cache
│   │   └── ...
│   ├── mutations/              # NEW: Mutation hooks directory
│   │   ├── index.ts            # Barrel export
│   │   └── ...                 # FUTURE: Mutation hooks
│   ├── usePageContent.ts       # DEPRECATED: Keep until migration complete
│   └── useDaySelection.ts      # Unchanged
├── services/                   # NEW: API layer (optional, can add later)
│   └── api.ts                  # Centralized fetch functions
└── package.json                # Updated with @tanstack/react-query
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Next.js App Router requires singleton pattern for QueryClient
// Server creates new client per request, browser reuses single instance
// See: https://tanstack.com/query/v5/docs/framework/react/guides/advanced-ssr

// CRITICAL: staleTime defaults to 0 - data immediately considered stale
// For Next.js, set staleTime > 0 to prevent immediate refetch after hydration
// Recommendation: staleTime: 60 * 1000 (1 minute) for most queries

// CRITICAL: Provider must be a Client Component ("use client")
// But can wrap Server Components in the layout

// GOTCHA: Don't use useState to initialize QueryClient without suspense
// Use the singleton pattern from get-query-client.ts instead

// GOTCHA: Query keys must be serializable arrays
// Bad:  queryKey: 'hours'
// Good: queryKey: ['hours']

// PATTERN: Use enabled option for conditional queries
// enabled: !!someCondition prevents query from running until ready

// PATTERN: Hierarchical query keys enable efficient invalidation
// queryKey: ['events', 'list'] and queryKey: ['events', eventId]
// invalidateQueries({ queryKey: ['events'] }) clears both

// EXISTING PATTERN: API responses use { success: true, data: ... }
// Must extract data from response in queryFn
```

## Implementation Blueprint

### Phase 1: Installation & Configuration

#### Task 1: Install TanStack Query
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

#### Task 2: Create QueryClient Factory
CREATE `app/get-query-client.ts`:
```typescript
import { isServer, QueryClient } from "@tanstack/react-query";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Prevent immediate refetch after hydration
        staleTime: 60 * 1000, // 1 minute
        // Garbage collection time
        gcTime: 5 * 60 * 1000, // 5 minutes
        // Retry failed requests once
        retry: 1,
        // Refetch when window regains focus
        refetchOnWindowFocus: true,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (isServer) {
    // Server: always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: reuse the same QueryClient
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient();
    }
    return browserQueryClient;
  }
}
```

#### Task 3: Create Providers Component
CREATE `app/providers.tsx`:
```typescript
"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getQueryClient } from "./get-query-client";
import type { ReactElement, ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps): ReactElement {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
    </QueryClientProvider>
  );
}
```

#### Task 4: Integrate Providers into Root Layout
MODIFY `app/layout.tsx`:
- Import Providers from "./providers"
- Wrap {children} with <Providers>{children}</Providers>
- PRESERVE all existing layout structure (html, body, Toaster, etc.)

### Phase 2: Create Pilot Query Hook

#### Task 5: Create Query Hooks Directory Structure
```bash
mkdir -p hooks/queries hooks/mutations
touch hooks/queries/index.ts hooks/mutations/index.ts
```

#### Task 6: Create useHours Query Hook
CREATE `hooks/queries/use-hours.ts`:
```typescript
"use client";

import { useQuery } from "@tanstack/react-query";
import type { HoursOfOperation } from "@/types/hours";

interface HoursResponse {
  success: boolean;
  data: HoursOfOperation;
}

async function fetchHours(): Promise<HoursOfOperation> {
  const response = await fetch("/api/hours");

  if (!response.ok) {
    throw new Error("Failed to fetch hours of operation");
  }

  const result: HoursResponse = await response.json();

  if (!result.success) {
    throw new Error("API returned unsuccessful response");
  }

  return result.data;
}

export function useHours() {
  return useQuery<HoursOfOperation, Error>({
    queryKey: ["hours"],
    queryFn: fetchHours,
    // Hours rarely change - cache for longer
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}
```

#### Task 7: Create Barrel Export
CREATE `hooks/queries/index.ts`:
```typescript
export { useHours } from "./use-hours";
```

### Phase 3: Validation - Create Test Component

#### Task 8: Create Test Page for Validation
CREATE `app/test-react-query/page.tsx`:
```typescript
"use client";

import { useHours } from "@/hooks/queries";
import type { ReactElement } from "react";

export default function TestReactQueryPage(): ReactElement {
  const { data: hours, isLoading, isError, error } = useHours();

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">React Query Test</h1>
        <p>Loading hours...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">React Query Test</h1>
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">React Query Test - SUCCESS</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-semibold mb-2">Hours of Operation:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(hours, null, 2)}
        </pre>
      </div>
      <p className="mt-4 text-green-600">
        React Query is working correctly!
      </p>
    </div>
  );
}
```

## Tasks Checklist (Ordered)

```yaml
Task 1:
  action: INSTALL
  command: npm install @tanstack/react-query @tanstack/react-query-devtools
  validation: Check package.json contains @tanstack/react-query

Task 2:
  action: CREATE
  file: app/get-query-client.ts
  pattern: Singleton QueryClient factory for Next.js App Router
  validation: npm run build (no type errors)

Task 3:
  action: CREATE
  file: app/providers.tsx
  pattern: Client component with QueryClientProvider + DevTools
  validation: npm run build (no type errors)

Task 4:
  action: MODIFY
  file: app/layout.tsx
  changes:
    - Import Providers from "./providers"
    - Wrap children with <Providers>
  preserve: All existing structure (html, body, meta, Toaster, etc.)
  validation: npm run dev (app loads without errors)

Task 5:
  action: CREATE
  directories:
    - hooks/queries/
    - hooks/mutations/
  files:
    - hooks/queries/index.ts
    - hooks/mutations/index.ts
  validation: Directories exist

Task 6:
  action: CREATE
  file: hooks/queries/use-hours.ts
  pattern: Simple useQuery hook with typed response
  validation: npm run build (no type errors)

Task 7:
  action: UPDATE
  file: hooks/queries/index.ts
  content: Export useHours
  validation: Import works from @/hooks/queries

Task 8:
  action: CREATE
  file: app/test-react-query/page.tsx
  purpose: Validation test page
  validation: Navigate to /test-react-query, see hours data displayed

Task 9 (Manual Validation):
  action: VERIFY
  steps:
    - Run npm run dev
    - Navigate to http://localhost:3000/test-react-query
    - Verify hours data displays correctly
    - Open React Query DevTools (bottom-right corner)
    - Verify "hours" query appears in DevTools
    - Refresh page, verify cached data loads instantly
    - Check Network tab, verify single API call (not duplicated)
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
# If errors: Check imports, type definitions, and file paths
```

### Level 3: Runtime Validation
```bash
npm run dev

# Navigate to: http://localhost:3000/test-react-query
# Expected:
# 1. Page loads without console errors
# 2. "Loading hours..." appears briefly
# 3. Hours data displays in JSON format
# 4. "React Query is working correctly!" message shows
# 5. React Query DevTools icon appears in bottom-right
```

### Level 4: Cache Validation
```bash
# With dev server running:
# 1. Navigate to /test-react-query
# 2. Open Chrome DevTools > Network tab
# 3. Clear network log
# 4. Refresh page
# 5. Check: Should see single /api/hours request
# 6. Navigate away and back within 1 minute
# 7. Check: Should NOT see new /api/hours request (cached)
# 8. Open React Query DevTools
# 9. Verify "hours" query shows as "fresh" or "stale" (not "fetching")
```

## Final Validation Checklist
- [ ] `npm run lint` passes with no errors
- [ ] `npm run build` completes successfully
- [ ] `npm run dev` starts without errors
- [ ] `/test-react-query` page displays hours data
- [ ] React Query DevTools visible and shows "hours" query
- [ ] Cache works (no duplicate requests on navigation)
- [ ] No regression in existing pages (spot check 2-3 pages)
- [ ] All TypeScript types properly inferred (no `any`)

---

## Anti-Patterns to Avoid
- Do not create new patterns when existing ones work
- Do not skip validation because "it should work"
- Do not ignore failing tests - fix them
- Do not use sync functions in async context
- Do not hardcode values that should be config
- Do not catch all exceptions - be specific
- Do not use `any` types - use proper TypeScript generics
- Do not initialize QueryClient with useState (use singleton pattern)
- Do not put Provider in Server Component (must be Client Component)

---

## Future Migration Plan (Out of Scope for This PRP)

After validating the pilot implementation, the following endpoints should be migrated in order of impact:

### Tier 1: High ROI (Multiple Consumers)
1. `/api/events` - Used by Calendar, Offerings, EventsContainer
2. `/api/page-content` - Replace existing usePageContent hook
3. `/api/gallery` - Used by GalleryCarousel

### Tier 2: Medium Complexity
4. `/api/customer` - Needs query key strategy for filtering
5. `/api/private-events` - Single consumer, enables future features
6. `/api/reservations` - Date-based filtering complexity

### Tier 3: Mutations
7. Create mutation hooks for POST/PUT/DELETE operations
8. Implement optimistic updates where appropriate
9. Add query invalidation patterns

This migration should be tracked in a separate PRP once the pilot is validated.
