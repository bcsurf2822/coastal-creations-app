# Phase 8: Cleanup & Final Validation

**Goal**: Remove deprecated code, audit for remaining fetch patterns, final testing

**Prerequisites**: Phase 7 complete

---

## Tasks

- [ ] **8.1** Delete `hooks/usePageContent.ts` (deprecated in Phase 1)
- [ ] **8.2** Delete or refactor `hooks/useGalleryUpload.ts` if it exists
- [ ] **8.3** Search codebase for remaining `fetch("/api` patterns and migrate
- [ ] **8.4** Search for remaining `useEffect` + `fetch` patterns and migrate
- [ ] **8.5** Remove test page `app/test-react-query/page.tsx` (optional - can keep for reference)
- [ ] **8.6** Final build and lint validation
- [ ] **8.7** Full manual test of all migrated features

---

## Validation

```bash
# Search for remaining fetch patterns
grep -r "fetch(\"/api" --include="*.tsx" --include="*.ts" components/ app/

# Should return minimal or no results (only API routes should have fetch)

npm run lint
npm run build

# Full manual test checklist:
# - Homepage loads with events and content
# - Calendar displays events correctly
# - Reservations page works
# - Gallery displays images
# - Admin: CRUD events, reservations, private events
# - Admin: Upload images, process refunds
# - Admin: Edit page content and hours
```

## Files Modified
- `hooks/usePageContent.ts` (delete)
- `hooks/useGalleryUpload.ts` (delete if exists)
- `app/test-react-query/page.tsx` (optional delete)

## Final Checklist
- [ ] All query hooks working (14 total)
- [ ] All mutation hooks working (17 total)
- [ ] No duplicate API calls
- [ ] React Query DevTools shows all active queries
- [ ] Build passes
- [ ] Lint passes
- [ ] All features manually tested
