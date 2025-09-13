# CLAUDE.md

## Core Development Philosophy

### KISS (Keep It Simple, Stupid)

Simplicity should be a key goal in design. Choose straightforward solutions over complex ones whenever possible. Simple solutions are easier to understand, maintain, and debug.

### YAGNI (You Aren't Gonna Need It)

Avoid building functionality on speculation. Implement features only when they are needed, not when you anticipate they might be useful in the future.

### Design Principles

- **Dependency Inversion**: High-level modules should not depend on low-level modules. Both should depend on abstractions.
- **Open/Closed Principle**: Software entities should be open for extension but closed for modification.
- **Vertical Slice Architecture**: Organize by features, not layers
- **Component-First**: Build with reusable, composable components with single responsibility
- **Fail Fast**: Validate inputs early, throw errors immediately

## 🤖 AI Assistant Guidelines

### Context Awareness

- When implementing features, always check existing patterns first
- Prefer composition over inheritance in all designs
- Use existing utilities before creating new ones
- Check for similar functionality in other domains/features

### Common Pitfalls to Avoid

- Creating duplicate functionality
- Overwriting existing tests
- Modifying core frameworks without explicit instruction
- Adding dependencies without checking existing alternatives

### Workflow Patterns

- Preferably create tests BEFORE implementation (TDD)
- Use "think hard" for architecture decisions
- Break complex tasks into smaller, testable units
- Validate understanding before implementation

### Search Command Requirements

**CRITICAL**: Always use `rg` (ripgrep) instead of traditional `grep` and `find` commands:

```bash
# ❌ Don't use grep
grep -r "pattern" .

# ✅ Use rg instead
rg "pattern"

# ❌ Don't use find with name
find . -name "*.tsx"

# ✅ Use rg with file filtering
rg --files | rg "\.tsx$"
# or
rg --files -g "*.tsx"
```

**Enforcement Rules:**

```
(
    r"^grep\b(?!.*\|)",
    "Use 'rg' (ripgrep) instead of 'grep' for better performance and features",
),
(
    r"^find\s+\S+\s+-name\b",
    "Use 'rg --files | rg pattern' or 'rg --files -g pattern' instead of 'find -name' for better performance",
),
```

## 🧱 Code Structure & Modularity

### File and Component Limits

- **Never create a file longer than 500 lines of code.** If approaching this limit, refactor by splitting into modules or helper files.
- **Components should be under 200 lines** for better maintainability.
- **Functions should be short and focused sub 50 lines** and have a single responsibility.
- **Organize code into clearly separated modules**, grouped by feature or responsibility.

## 🚀 Next.js 15 & React 19 Key Features

### Next.js 15 Core Features

- **Turbopack**: Fast bundler for development (stable)
- **App Router**: File-system based router with layouts and nested routing
- **Server Components**: React Server Components for performance
- **Server Actions**: Type-safe server functions
- **Parallel Routes**: Concurrent rendering of multiple pages
- **Intercepting Routes**: Modal-like experiences

### React 19 Features

- **React Compiler**: Eliminates need for `useMemo`, `useCallback`, and `React.memo`
- **Actions**: Handle async operations with built-in pending states
- **use() API**: Simplified data fetching and context consumption
- **Document Metadata**: Native support for SEO tags
- **Enhanced Suspense**: Better loading states and error boundaries

### TypeScript Integration (MANDATORY)

- **MUST use `ReactElement` instead of `JSX.Element`** for return types
- **MUST import types from 'react'** explicitly
- **NEVER use `JSX.Element` namespace** - use React types directly

```typescript
// ✅ CORRECT: Modern React 19 typing
import { ReactElement } from 'react';

function MyComponent(): ReactElement {
  return <div>Content</div>;
}

// ❌ FORBIDDEN: Legacy JSX namespace
function MyComponent(): JSX.Element {  // Cannot find namespace 'JSX'
  return <div>Content</div>;
}
```

## 🏗️ Project Structure (Feature-Based Organization)

```
app/                       # Next.js App Router & API Routes
├── [slug]/                # Dynamic route for pages
├── about/                 # About page
├── actions/               # Server actions
├── admin/                 # Admin panel routes
│   └── dashboard/         # Dashboard features
│       ├── add-event/     # Add event functionality
│       ├── edit-event/    # Edit event functionality
│       └── error-logs/    # Error monitoring
├── api/                   # API endpoints
│   ├── auth/              # Authentication endpoints
│   ├── events/            # Event management APIs
│   ├── gallery/           # Gallery APIs
│   ├── payment-config/    # Payment configuration
│   └── send/              # Email sending endpoints
├── blog/                  # Blog pages
├── calendar/              # Calendar views
│   └── [eventId]/         # Event detail pages
├── classes/               # Class offerings
│   ├── birthday-parties/  # Birthday party info
│   ├── live-artist/       # Live artist sessions
│   └── summer-camps/      # Summer camp programs
├── contact-us/            # Contact page
├── gallery/               # Gallery page
├── payments/              # Payment processing
├── globals.css            # Global styles
├── layout.tsx             # Root layout
└── page.tsx               # Home page

components/                # Component modules (by feature)
├── about/                 # About page components
├── authentication/        # Auth components
├── blog/                  # Blog components
├── calendar/              # Calendar components
│   └── eventDetails/      # Event detail components
├── classes/               # Class-related components
│   ├── birthdays/         # Birthday party components
│   ├── liveEvents/        # Live event components
│   └── summer-camps/      # Summer camp components
├── contact/               # Contact form components
├── dashboard/             # Admin dashboard components
│   ├── add-event/         # Add event components
│   ├── edit-event/        # Edit event components
│   ├── errors-logs/       # Error log components
│   └── home/              # Dashboard home components
├── email-templates/       # Email template components
├── gallery/               # Gallery components
├── landing/               # Landing page components
├── layout/                # Layout components
│   ├── footer/            # Footer components
│   └── nav/               # Navigation components
├── payment/               # Payment components
└── providers/             # Context providers

lib/                       # Core utilities and configurations
├── models/                # Data models
├── utils.ts               # Utility functions
├── constants.ts           # Application constants
└── db.ts                  # Database configuration

types/                     # Shared TypeScript types
└── interfaces.ts          # Type definitions

sanity/                    # Sanity CMS configuration
└── client.ts              # Sanity client setup

spec/                      # Test specifications
auth.ts                    # NextAuth configuration
```

## 🎯 TypeScript Configuration (STRICT REQUIREMENTS)

### MUST Follow These Compiler Options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### MANDATORY Type Requirements

- **NEVER use `any` type** - use `unknown` if type is truly unknown
- **MUST have explicit return types** for all functions and components
- **MUST use proper generic constraints** for reusable components
- **NEVER use `@ts-ignore`** or `@ts-expect-error` - fix the type issue properly

## 📦 Package Management & Dependencies

### Essential Next.js 15 Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "typescript": "^5.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.0",
    "prettier": "^3.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

### Recommended Additional Dependencies

```bash
# UI and Styling
npm install @radix-ui/react-* class-variance-authority clsx tailwind-merge

# Development Tools
npm install -D @testing-library/react @testing-library/jest-dom vitest jsdom
```


## 🧪 Testing Strategy (MANDATORY REQUIREMENTS)

### MUST Meet These Testing Standards

- **MINIMUM 80% code coverage** - NO EXCEPTIONS
- **MUST co-locate tests** with components in `__tests__` folders
- **MUST use React Testing Library** for all component tests
- **MUST test user behavior** not implementation details
- **MUST mock external dependencies** appropriately

### Test Configuration (Vitest + React Testing Library)

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
```

### Test Example (WITH MANDATORY DOCUMENTATION)

```typescript
/**
 * @fileoverview Tests for UserProfile component
 * @module components/__tests__/UserProfile.test
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, userEvent } from '@testing-library/react';
import { UserProfile } from '../UserProfile';

/**
 * Test suite for UserProfile component.
 *
 * Tests user interactions, state management, and error handling.
 * Mocks external dependencies to ensure isolated unit tests.
 */
describe('UserProfile', () => {
  /**
   * Tests that user name updates correctly on form submission.
   */
  it('should update user name on form submission', async () => {
    const user = userEvent.setup();
    const onUpdate = vi.fn();

    render(<UserProfile onUpdate={onUpdate} />);

    const input = screen.getByLabelText(/name/i);
    await user.type(input, 'John Doe');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'John Doe' })
    );
  });
});
```

## 🎨 Component Guidelines (STRICT REQUIREMENTS)

### MANDATORY Component Documentation

````typescript
/**
 * Button component with multiple variants and sizes.
 *
 * Provides a reusable button with consistent styling and behavior
 * across the application. Supports keyboard navigation and screen readers.
 *
 * @component
 * @example
 * ```tsx
 * <Button
 *   variant="primary"
 *   size="medium"
 *   onClick={handleSubmit}
 * >
 *   Submit Form
 * </Button>
 * ```
 */
interface ButtonProps {
  /** Visual style variant of the button */
  variant: 'primary' | 'secondary';

  /** Size of the button @default 'medium' */
  size?: 'small' | 'medium' | 'large';

  /** Click handler for the button */
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Content to be rendered inside the button */
  children: React.ReactNode;

  /** Whether the button is disabled @default false */
  disabled?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size = 'medium', onClick, children, disabled = false }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }))}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
````

### Shadcn/UI Component Pattern (RECOMMENDED)

```typescript
"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

## 🔄 State Management (STRICT HIERARCHY)

### MUST Follow This State Hierarchy

1. **Local State**: `useState` ONLY for component-specific state
2. **Context**: For cross-component state within a single feature
3. **URL State**: MUST use search params for shareable state
4. **Server State**: MUST use TanStack Query for ALL API data
5. **Global State**: Zustand ONLY when truly needed app-wide


## 🚀 Performance Guidelines

### Next.js 15 Optimizations

- **Use Server Components** by default for data fetching
- **Client Components** only when necessary (interactivity)
- **Dynamic imports** for large client components
- **Image optimization** with next/image
- **Font optimization** with next/font

### Bundle Optimization

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {
      // Turbopack configuration
    },
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  // Bundle analyzer
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = "all";
    }
    return config;
  },
};

module.exports = nextConfig;
```

## 💅 Code Style & Quality

### ESLint Configuration (MANDATORY)

```javascript
// eslint.config.js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/explicit-function-return-type": "error",
      "no-console": ["error", { allow: ["warn", "error"] }],
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
        },
      ],
    },
  },
];

export default eslintConfig;
```

## 📋 Development Commands

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint --max-warnings 0",
    "lint:fix": "next lint --fix",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "test:coverage": "vitest --coverage",
    "test:ui": "vitest --ui",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "validate": "npm run type-check && npm run lint && npm run test:coverage"
  }
}
```

## ⚠️ CRITICAL GUIDELINES (MUST FOLLOW ALL)

1. **ENFORCE strict TypeScript** - ZERO compromises on type safety
3. **MINIMUM 80% test coverage** - NO EXCEPTIONS
4. **MUST co-locate related files** - Tests MUST be in `__tests__` folders
5. **MAXIMUM 500 lines per file** - Split if larger
6. **MAXIMUM 200 lines per component** - Refactor if larger
7. **MUST handle ALL states** - Loading, error, empty, and success
10. **NEVER use `any` type** - Use proper typing or `unknown`


### FORBIDDEN Practices

- **NEVER ignore TypeScript errors** with `@ts-ignore`
- **NEVER use `JSX.Element`** - use `ReactElement` instead
- **NEVER store sensitive data** in localStorage or client state
- **NEVER use dangerouslySetInnerHTML** without sanitization
- **NEVER exceed file/component size limits**
- **NEVER prop drill** beyond 2 levels - use context or state management
- **NEVER commit** without passing all quality checks