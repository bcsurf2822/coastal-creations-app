# Testing Setup - Vitest

**Date**: December 16, 2024
**Framework**: Vitest v4.0.16
**Status**: Configured and Validated

---

## Why Vitest?

| Factor | Vitest | Jest |
|--------|--------|------|
| Speed | Faster (native ESM, Vite-based) | Slower |
| TypeScript | Native support | Requires ts-node |
| Watch mode | HMR-like instant feedback | Standard |
| API | Jest-compatible | Standard |
| Path aliases | Easy with vite-tsconfig-paths | Manual config |
| Modern stack | Excellent for Next.js 15 + React Query v5 | Good |

---

## Files Created

### Configuration

| File | Purpose |
|------|---------|
| `vitest.config.mts` | Vitest configuration with React and path alias support |
| `vitest.setup.ts` | Test setup: jest-dom matchers, fetch mock, Next.js router mock |

### Test Utilities

| File | Purpose |
|------|---------|
| `__tests__/utils/test-utils.tsx` | React Query test wrapper, custom render, fetch mocking helpers |

### Initial Test

| File | Purpose |
|------|---------|
| `__tests__/hooks/queries/use-hours.test.ts` | Test suite for useHours hook (6 tests) |

---

## Configuration Details

### vitest.config.mts

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    exclude: ["node_modules", ".next", "dist"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
```

### Key Features

- **jsdom environment**: Browser-like environment for React testing
- **globals: true**: No need to import describe, it, expect
- **setupFiles**: Auto-loads jest-dom matchers and mocks
- **tsconfigPaths**: `@/` imports work in tests
- **coverage**: v8 provider with multiple reporters

---

## Test Utilities

### createWrapper()

Creates a fresh QueryClient for each test:

```typescript
import { createWrapper } from "@/__tests__/utils/test-utils";

const { result } = renderHook(() => useMyHook(), {
  wrapper: createWrapper(),
});
```

### mockFetch()

Mocks the global fetch with a response:

```typescript
import { mockFetch } from "@/__tests__/utils/test-utils";

// Mock successful response
mockFetch({ success: true, data: mockData });

// Mock error response
mockFetch({ error: "Server error" }, false);
```

### mockFetchError()

Mocks fetch to throw a network error:

```typescript
import { mockFetchError } from "@/__tests__/utils/test-utils";

mockFetchError("Network error");
```

### renderWithClient()

Renders a component with QueryClientProvider:

```typescript
import { renderWithClient } from "@/__tests__/utils/test-utils";

const { queryClient } = renderWithClient(<MyComponent />);
```

---

## NPM Scripts

```bash
# Run tests in watch mode (development)
npm test

# Run tests once (CI)
npm run test:run

# Run tests with coverage report
npm run test:coverage
```

---

## Test Results

```
 ✓ __tests__/hooks/queries/use-hours.test.ts (6 tests) 280ms

 Test Files  1 passed (1)
      Tests  6 passed (6)
   Start at  10:42:49
   Duration  799ms
```

### useHours Test Cases

| Test | Description |
|------|-------------|
| `should fetch hours successfully` | Verifies successful data fetching |
| `should handle API error (non-ok response)` | Verifies HTTP error handling |
| `should handle API returning success: false` | Verifies API-level error handling |
| `should handle network error` | Verifies network failure handling |
| `should call fetch with correct URL` | Verifies correct API endpoint |
| `should return correct data structure` | Verifies HoursOfOperation type |

---

## Writing New Tests

### Hook Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useMyHook } from "@/hooks/queries/use-my-hook";
import { createWrapper, mockFetch } from "../../utils/test-utils";

describe("useMyHook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch data successfully", async () => {
    mockFetch({ success: true, data: mockData });

    const { result } = renderHook(() => useMyHook(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockData);
  });
});
```

### Mutation Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useMyMutation } from "@/hooks/mutations/use-my-mutation";
import { createWrapper, mockFetch } from "../../utils/test-utils";

describe("useMyMutation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should mutate data successfully", async () => {
    mockFetch({ success: true, data: mockResponse });

    const { result } = renderHook(() => useMyMutation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(inputData);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

---

## Dependencies Added

```json
{
  "devDependencies": {
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.1",
    "@vitejs/plugin-react": "^5.1.2",
    "jsdom": "^27.3.0",
    "vite-tsconfig-paths": "^6.0.1",
    "vitest": "^4.0.16"
  }
}
```

---

## Test Directory Structure

```
__tests__/
├── utils/
│   └── test-utils.tsx       # Test utilities and helpers
│
├── hooks/
│   └── queries/
│       └── use-hours.test.ts  # Hook tests
│
└── components/              # Future component tests
```

---

## Next Steps

1. Add tests for remaining query hooks
2. Add tests for mutation hooks
3. Add component integration tests
4. Set up CI pipeline with test coverage requirements
