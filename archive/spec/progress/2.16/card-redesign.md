# Card Redesign - February 16, 2026

## Summary

Redesigned event cards across all `/events/*` pages for a cleaner, more readable look. Removed over-styled hover animations and simplified the overall card UI.

## What Changed

### Private Event Cards (`PrivateEventCard.tsx` - created)

- Extracted individual card into its own component from `PrivateEvents.tsx`
- Clean white card with subtle border (`#e5e7eb`) and light shadow
- Hover effect is shadow-only (no rotation, scale, gradient borders)
- Description uses `white-space: pre-line` so newlines entered in admin are respected
- Read more / Read less toggle for descriptions over 180 chars
- Price displayed as plain text `$XX/person` inline with title
- Placeholder icon (party popper) when no image exists
- Pay Deposit button uses `Button` from `@/components/ui`

### Private Events Container (`PrivateEvents.tsx` - refactored)

- Slimmed down significantly -- only handles grid layout, loading/error states, card mapping, and contact footer
- All card-specific styled components moved to `PrivateEventCard.tsx`

### Universal Event Cards (`EventCard.tsx` - restyled)

- Removed: hover rotation/scale/translate, gradient border, `::before` overlay, animated icon wiggle, animated title underline, rotated gradient price tag
- Removed: `isHovered` / `onMouseEnter` / `onMouseLeave` props
- Added: simple `CardWrapper` div matching private event card style
- Price made larger and bolder (1.1rem, 700 weight, dark slate)
- Bottom row layout: info pills (date/time) on left, Register/Sign Up button on right
- Discount tags styled with green background

### Events Container (`EventsContainer.tsx` - cleaned)

- Removed `hoveredCard` state tracking (no longer needed)
- Removed hover props from `UniversalEventCard` usage

### Button (`components/ui/Button.tsx`)

- Added `cursor-pointer` to base classes so all buttons show pointer on hover

## Files Created

| File | Purpose |
|------|---------|
| `components/classes/privateEvents/PrivateEventCard.tsx` | Individual private event card component |

## Files Modified

| File | Change |
|------|--------|
| `components/classes/privateEvents/PrivateEvents.tsx` | Extracted card internals, slimmed to grid + loading + contact |
| `components/classes/EventCard.tsx` | Restyled to clean card, removed hover animations, button on right |
| `components/classes/EventsContainer.tsx` | Removed hover state tracking |
| `components/ui/Button.tsx` | Added `cursor-pointer` to base classes |

## Files Deleted

| File | Reason |
|------|--------|
| `components/classes/privateEvents/parseDescription.ts` | Removed description parser -- too complex to communicate to studio owner, just show text as-is |

## Design Decisions

- **No description parsing**: Initially built a regex parser to extract features (duration, capacity, BYOB) into pills. Removed because the studio owner would need to understand pattern rules. Instead, descriptions render as-is with newline support.
- **Emotion styled-components**: Consistent with existing codebase patterns
- **Minimal hover effects**: Shadow deepening only -- avoids the "AI generated" look of animated cards
- **`white-space: pre-line`**: Respects `\n` characters from admin input as visible line breaks without requiring any special formatting knowledge
