# Phase 1: Replace usePageContent Hook

**Goal**: Replace the manual caching implementation in usePageContent.ts with React Query

**Prerequisites**: Pilot implementation complete (useHours working)

---

## Tasks

- [ ] **1.1** Create `hooks/queries/use-page-content.ts` query hook
- [ ] **1.2** Update `hooks/queries/index.ts` to export usePageContent
- [ ] **1.3** Update `components/landing/Calendar.tsx` to use new hook
- [ ] **1.4** Update `components/landing/Offerings.tsx` to use new hook
- [ ] **1.5** Update `app/reservations/page.tsx` to use new hook
- [ ] **1.6** Search for any other usePageContent usages and migrate
- [ ] **1.7** Add deprecation notice to old `hooks/usePageContent.ts`
- [ ] **1.8** Run build and lint validation

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: Navigate to homepage, reservations page
# Verify: Content loads, no console errors, DevTools shows "page-content" query
```

## Files Modified
- `hooks/queries/use-page-content.ts` (create)
- `hooks/queries/index.ts` (update)
- `components/landing/Calendar.tsx` (update)
- `components/landing/Offerings.tsx` (update)
- `app/reservations/page.tsx` (update)
- `hooks/usePageContent.ts` (deprecate)
