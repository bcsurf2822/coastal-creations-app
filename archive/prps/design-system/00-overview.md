# Design System Implementation - Overview

> Implement Figma design system across all 110+ components for consistent styling

---

## Goal

Create a unified, polished UI by implementing the Figma-extracted design system throughout the entire Coastal Creations Studio application.

## Why

- **Inconsistent UI**: Varying button styles, card designs, colors, and spacing
- **Design Debt**: Multiple styling approaches create maintenance burden
- **User Experience**: Consistent design improves trust and usability
- **Developer Velocity**: Shared components reduce duplication
- **Brand Identity**: Unified coastal theme reinforces brand

## Implementation Phases

| Phase | Document | Focus | Est. Tasks |
|-------|----------|-------|------------|
| 1 | `01-foundation.md` | CSS tokens + UI component library | 10 |
| 2 | `02-public-facing.md` | Customer-facing components | 15 |
| 3 | `03-dashboard.md` | Admin dashboard components | 14 |
| 4 | `04-remaining-polish.md` | Remaining + final validation | 8 |

## Key References

```yaml
Design Spec:
  - file: spec/design/FIGMA_DESIGN_SPEC.md
    why: Source of truth for all design tokens and component specs

Design Tokens:
  - file: spec/design/tailwind/design-tokens.ts
    why: TypeScript design tokens for programmatic access

Tailwind Theme:
  - file: spec/design/tailwind/tailwind-theme.ts
    why: Tailwind configuration extension

Architecture:
  - file: AGENTS.md
    why: Project coding standards and patterns
```

## Success Criteria

- [ ] All buttons use `<Button>` component with correct variant
- [ ] All cards use `<Card>` component with correct variant
- [ ] All inputs use `<Input>` component with proper states
- [ ] All status indicators use `<Badge>` component
- [ ] No hardcoded colors outside design tokens
- [ ] Consistent spacing using 4px grid
- [ ] Build passes with no TypeScript errors
- [ ] All existing functionality preserved

## Component Library Structure

```
components/ui/
├── Button.tsx      # 5 variants, 4 sizes
├── Input.tsx       # Text input with states
├── Textarea.tsx    # Multiline input
├── Select.tsx      # Dropdown select
├── Label.tsx       # Form labels
├── Card.tsx        # 3 variants
├── Badge.tsx       # 5 status variants
├── PriceBadge.tsx  # Gradient price display
└── index.ts        # Barrel export
```

## Design Tokens Quick Reference

### Colors
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#0c4a6e` | CTAs, headings |
| Secondary | `#0369a1` | Links |
| Accent | `#fb923c` | Highlights |
| Light | `#f0f9ff` | Backgrounds |

### Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| default | 8px | Buttons, inputs |
| md | 12px | Cards |
| lg | 16px | Featured cards |
| full | 9999px | Pills, badges |

### Shadows
| Token | Usage |
|-------|-------|
| card | Standard elevation |
| event-card | Blue glow (`#42a5f5`) |
| price-badge | Blue glow (`#326c85`) |

## Validation Commands

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Production build
npm run build

# Development server
npm run dev
```

## Anti-Patterns

- ❌ Hardcoded colors - use CSS variables
- ❌ Inline styles - use Tailwind classes
- ❌ Skip forwardRef on form components
- ❌ Break existing functionality while styling
- ❌ Create component variations outside UI library
