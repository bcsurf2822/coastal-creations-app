# Phase 4: Gallery & Utility Queries

**Goal**: Create query hooks for gallery, pictures, and utility endpoints

**Prerequisites**: Phase 3 complete

---

## Tasks

- [ ] **4.1** Create `hooks/queries/use-gallery.ts` with destination filtering
- [ ] **4.2** Create `hooks/queries/use-event-pictures.ts`
- [ ] **4.3** Create `hooks/queries/use-private-event-pictures.ts`
- [ ] **4.4** Create `hooks/queries/use-payment-config.ts`
- [ ] **4.5** Create `hooks/queries/use-payment-errors.ts` with filtering
- [ ] **4.6** Update `hooks/queries/index.ts` to export new hooks
- [ ] **4.7** Migrate `components/gallery/ImageGallery.tsx` to use useGallery
- [ ] **4.8** Migrate `components/gallery/GalleryCarousel.tsx` to use useGallery
- [ ] **4.9** Update EventsContainer.tsx to use useEventPictures (if applicable)
- [ ] **4.10** Run build and lint validation

---

## Validation

```bash
npm run lint
npm run build
npm run dev
# Test: /gallery page, homepage carousel, event pages with pictures
# Verify: Images load, DevTools shows gallery queries
```

## Files Modified
- `hooks/queries/use-gallery.ts` (create)
- `hooks/queries/use-event-pictures.ts` (create)
- `hooks/queries/use-private-event-pictures.ts` (create)
- `hooks/queries/use-payment-config.ts` (create)
- `hooks/queries/use-payment-errors.ts` (create)
- `hooks/queries/index.ts` (update)
- `components/gallery/ImageGallery.tsx` (update)
- `components/gallery/GalleryCarousel.tsx` (update)
