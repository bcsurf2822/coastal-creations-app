# Phase 7: Gallery & Admin Mutations

**Goal**: Create mutation hooks for gallery uploads, refunds, and admin content management

**Prerequisites**: Phase 6 complete

---

## Tasks

- [ ] **7.1** Create `hooks/mutations/use-upload-gallery.ts`
- [ ] **7.2** Create `hooks/mutations/use-update-gallery.ts`
- [ ] **7.3** Create `hooks/mutations/use-delete-gallery.ts`
- [ ] **7.4** Create `hooks/mutations/use-process-refund.ts`
- [ ] **7.5** Create `hooks/mutations/use-update-page-content.ts`
- [ ] **7.6** Create `hooks/mutations/use-update-hours.ts`
- [ ] **7.7** Update `hooks/mutations/index.ts` to export new hooks
- [ ] **7.8** Migrate `components/dashboard/upload-images/GalleryUploadForm.tsx`
- [ ] **7.9** Migrate `components/dashboard/customers/Customers.tsx` refund functionality
- [ ] **7.10** Migrate admin page content editor (if exists)
- [ ] **7.11** Migrate admin hours editor (if exists)
- [ ] **7.12** Run build and lint validation

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: Admin - upload images, process refund, edit page content, edit hours
# Verify: Operations succeed, data refreshes
```

## Files Modified
- `hooks/mutations/use-upload-gallery.ts` (create)
- `hooks/mutations/use-update-gallery.ts` (create)
- `hooks/mutations/use-delete-gallery.ts` (create)
- `hooks/mutations/use-process-refund.ts` (create)
- `hooks/mutations/use-update-page-content.ts` (create)
- `hooks/mutations/use-update-hours.ts` (create)
- `hooks/mutations/index.ts` (update)
- `components/dashboard/upload-images/GalleryUploadForm.tsx` (update)
- `components/dashboard/customers/Customers.tsx` (update)
