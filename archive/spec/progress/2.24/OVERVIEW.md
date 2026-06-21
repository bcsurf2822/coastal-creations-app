# Progress Report - February 24, 2026

## Summary

Admin experience overhaul centered on a new unified Page Manager, inline image management, and PhotoCorral improvements. The separate "Upload Images" page was consolidated into per-page image sections within the Page Manager. The PhotoCorral component was rewritten to handle edge cases with few images, and added to the homepage landing page.

---

## 1. Unified Page Manager

### Problem
Content editing was split across two separate admin pages: "Page Descriptions" for text and "Upload Images" for gallery photos. This made it unclear which images belonged to which page, and required navigating between two sections to fully manage a single page.

### Solution
Rebuilt the "Page Descriptions" page into a full split-screen Page Manager with a data-driven configuration system.

**Left panel:** Page selector dropdown, editable text fields grouped by section, inline image uploads for offering cards, and a per-page gallery image section with upload/edit/delete.

**Right panel:** Interactive wireframe preview that highlights the corresponding section on hover, giving visual context for what each field controls.

### Key Design Decisions
- `PAGE_CONFIGS` array drives the entire UI -- each page defines its fields, content paths, gallery destination, and wireframe layout
- Supports 8 pages: Homepage, Adult Classes, Kid Classes, Camps, Private Events, Reservations, Gallery, About
- `SectionConfig.imagePath` enables inline image upload for any section (used by the three offering cards)
- `WireframeSectionConfig` supports nested children and grid layouts for accurate page representation

### Files Created
- `components/dashboard/page-manager/pageConfig.ts` -- Central configuration (PageConfig, SectionConfig, FieldConfig, WireframeSectionConfig)
- `components/dashboard/page-manager/PageWireframe.tsx` -- Right-panel wireframe with fake browser chrome and hover highlighting
- `components/dashboard/page-manager/PageImageSection.tsx` -- Per-page image grid with upload, edit, delete, and preview
- `components/dashboard/page-manager/OfferingImageUpload.tsx` -- Inline image upload for individual offering cards

### Files Modified
- `app/admin/dashboard/page-descriptions/page.tsx` -- Full rewrite to split-screen Page Manager
- `components/dashboard/SideBar.tsx` -- Renamed label to "Page Manager", removed "Upload Images" entry

### Files Removed
- `app/admin/dashboard/upload-images/page.tsx` -- No longer needed; all uploads happen in Page Manager

---

## 2. Inline Offering Card Image Uploads

### Problem
The three Creative Experiences cards on the homepage (Art Camps, Classes & Workshops, Private Events) needed individually customizable images, but there was no way to upload per-card images from the admin.

### Solution
Each offering card section in the Page Manager now has an inline image upload with preview, replace, and remove controls. Uploads go through a new API endpoint that stores the image in Sanity and returns a reference that gets saved to the `pageContent` document.

### Files Created
- `app/api/page-content/upload-image/route.ts` -- POST endpoint for uploading a single image to Sanity (admin-only)
- `components/dashboard/page-manager/OfferingImageUpload.tsx` -- Upload component with thumbnail preview, replace, and remove

### Schema
The Sanity `pageContent` schema was updated (and deployed) to include `image` fields on each offering card object (artCamps, classesWorkshops, privateEvents). Verified via Sanity MCP that the deployed cloud schema matches local code.

---

## 3. Gallery Image Editing

### Problem
After uploading multiple images at once (which all receive the same title), there was no way to go back and edit individual image titles or descriptions.

### Solution
Added an edit button (pencil icon) to the hover overlay on each image in the Page Manager grid. Clicking it opens an inline edit panel below the grid with:
- Larger thumbnail (96x96px) with blue highlight
- "Edit Image Details" heading with pencil icon
- Title field (required) and description field with helpful placeholder
- Save Changes / Cancel buttons
- Auto-scrolls the edit panel to center of viewport on open

The edit panel calls the existing `PUT /api/gallery` endpoint.

### File Modified
- `components/dashboard/page-manager/PageImageSection.tsx` -- Added edit state, handlers, inline edit panel, scroll-to behavior, 10-image upload limit with hint text

---

## 4. Toast Notifications & Sticky Save Bar

### Problem
Inline green/red banners for success/error feedback were easy to miss. The save button scrolled off-screen on long pages.

### Solution
- Replaced all inline feedback with `react-hot-toast` notifications
- Moved the save button to a fixed bottom bar with frosted glass effect (`backdrop-blur-sm`, `bg-white/95`)
- Shows current page being edited in the bar
- Added `pb-20` padding to prevent content from hiding behind the bar

### File Modified
- `app/admin/dashboard/page-descriptions/page.tsx`

---

## 5. PhotoCorral Improvements

### Problem
The infinite-scroll PhotoCorral looked broken with few images:
- 1-3 images bunched on the left with empty space
- Repeated 2-3 images scrolling in a loop looked strange
- Container width initialized to 0, causing incorrect fill calculations

### Solution
Split `PhotoCorral` into three sub-components with two display modes:

**StaticCorral** (< 5 unique photos): Centered flex row with no animation or duplication. Clean static display.

**ScrollingCorral** (5+ unique photos): Full infinite loop with:
- ResizeObserver to measure container width
- `useMemo` to compute `filledPhotos` that repeats the set enough times to fill the viewport
- Default 2400px width before ResizeObserver fires to prevent empty initial state
- Dual track sets (A + B) for seamless looping
- Pointer drag/swipe support with momentum

### Constants
```
MIN_PHOTOS_FOR_SCROLL = 5
CARD_SLOT_WIDTH = 296 (280px card + 16px gap)
AUTO_SCROLL_SPEED = 0.5
```

### File Modified
- `components/gallery/PhotoCorral.tsx` -- Full rewrite into PhotoCard, StaticCorral, ScrollingCorral, and main PhotoCorral components

---

## 6. PhotoCorral on Homepage

### Problem
The homepage had no photo gallery section. Images uploaded to the "home-page" gallery destination had nowhere to display.

### Solution
Added `PhotoCorral` to the homepage between MainSection and the first SectionDivider, with a decorative wave SVG above it matching the existing section dividers.

### File Modified
- `app/page.tsx` -- Added `PhotoCorral` with `destination="home-page"` and wave SVG divider

---

## 7. Hero Section Removal from Page Manager

### Problem
The Hero section text was not something the admin needed to edit -- it's part of the site branding and shouldn't be easily changed.

### Solution
Removed the Hero section config and wireframe entry from `PAGE_CONFIGS`.

### File Modified
- `components/dashboard/page-manager/pageConfig.ts`

---

## 8. Upload Images Page Removal

### Problem
The standalone "Upload Images" admin page was redundant now that all image uploads happen inline within the Page Manager per page.

### Solution
Removed the sidebar navigation entry and deleted the page. The `useGalleryUpload` hook and supporting components are kept since `PageImageSection` still imports the hook.

### Files Modified
- `components/dashboard/SideBar.tsx` -- Removed "Upload Images" nav entry and icon imports

### Files Removed
- `app/admin/dashboard/upload-images/page.tsx`

---

## All Files Changed

### Created
```
components/dashboard/page-manager/pageConfig.ts
components/dashboard/page-manager/PageWireframe.tsx
components/dashboard/page-manager/PageImageSection.tsx
components/dashboard/page-manager/OfferingImageUpload.tsx
app/api/page-content/upload-image/route.ts
```

### Modified
```
app/admin/dashboard/page-descriptions/page.tsx
app/page.tsx
components/dashboard/SideBar.tsx
components/gallery/PhotoCorral.tsx
```

### Removed
```
app/admin/dashboard/upload-images/page.tsx
```

## Diagnostics

All modified files pass TypeScript diagnostics with zero new errors (only pre-existing test file issues in `__tests__/`).
