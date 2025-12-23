# Coastal Creations Studio - Design System

> A comprehensive design system for consistent, accessible, and beautiful UI across the application.

---

## 1. Brand Foundations

### Voice & Tone

| Context | Voice | Tone |
|---------|-------|------|
| Marketing/Landing | Warm, welcoming, creative | Inviting, friendly, inspiring |
| Event Details | Informative, clear | Helpful, enthusiastic |
| Booking/Payment | Professional, reassuring | Clear, confident, trustworthy |
| Admin Dashboard | Efficient, straightforward | Neutral, professional |
| Errors/Warnings | Honest, solution-oriented | Calm, helpful |

### Design Principles

1. **Coastal Calm** - Blues and soft warm tones evoke the Ocean City shore
2. **Creative & Approachable** - Art studio feel that welcomes all skill levels
3. **Clear Hierarchy** - Important actions and information stand out
4. **Consistent Patterns** - Same components behave the same way everywhere
5. **Responsive First** - Mobile experience is as polished as desktop

---

## 2. Color System

### Primary Palette

| Token | Hex | RGB | Usage |
|-------|-----|-----|-------|
| `--primary` | `#0c4a6e` | `12, 74, 110` | Primary actions, headings, brand color |
| `--primary-dark` | `#073a58` | `7, 58, 88` | Hover states on primary elements |
| `--secondary` | `#0369a1` | `3, 105, 161` | Secondary actions, links |
| `--accent` | `#fb923c` | `251, 146, 60` | Highlights, notifications, special attention |

### Neutral Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--background` | `#ffffff` | Page backgrounds |
| `--foreground` | `#171717` | Primary text |
| `--light` | `#f0f9ff` | Light backgrounds, subtle fills |
| `--dark` | `#0f172a` | Dark text, footer backgrounds |

### Semantic Colors

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Success | Green | `#4ade80` / `#16a34a` | Confirmations, completed states |
| Error | Red | `#ef4444` / `#dc2626` | Errors, destructive actions |
| Warning | Yellow | `#fbbf24` | Warnings, caution states |
| Info | Blue | `#3b82f6` | Informational messages |

### Extended Blues (Tailwind)

```
blue-50:  #eff6ff  - Subtle backgrounds
blue-100: #dbeafe  - Light backgrounds, badges
blue-200: #bfdbfe  - Borders, dividers
blue-500: #3b82f6  - Interactive elements
blue-600: #2563eb  - Primary buttons
blue-700: #1d4ed8  - Hover states
```

### Gradient Definitions

```css
/* Primary gradient - for cards, borders, CTAs */
--gradient-primary: linear-gradient(135deg, #326C85, #42A5F5, #64B5F6);

/* Subtle overlay gradient - for card hovers */
--gradient-overlay: linear-gradient(135deg, rgba(50,108,133,0.03), rgba(66,165,245,0.03));

/* Button gradient */
--gradient-button: linear-gradient(135deg, #326C85, #4A90A4);

/* Success gradient - for badges */
--gradient-success: linear-gradient(135deg, #4caf50, #66bb6a);

/* Footer warm gradient */
--gradient-footer: linear-gradient(to right, #f5cca6, #ffd7b5);

/* Sold out/Error gradient */
--gradient-error: linear-gradient(135deg, #d32f2f, #f44336);
```

### Color Usage Rules

1. **Text on light backgrounds**: Use `--foreground` (#171717) for body, `--primary` for headings
2. **Text on dark backgrounds**: Use white or `--light`
3. **Interactive text**: Use `--secondary` for links, `--primary` on hover
4. **Never**: Use pure black (#000000) for text - always use `--foreground` or gray-900
5. **Contrast**: Maintain WCAG AA (4.5:1 for normal text, 3:1 for large text)

---

## 3. Typography

### Font Stack

| Token | Font Family | Usage |
|-------|-------------|-------|
| `--font-eb-garamond` | EB Garamond | Primary body text, headings, forms |
| `--font-montserrat` | Montserrat | Clean UI elements, buttons, badges |
| `--font-geist-sans` | Geist Sans | System UI, fallback |
| `--font-geist-mono` | Geist Mono | Code, technical text |
| `--font-anton` | Anton | Display headlines (limited use) |
| `--font-abril-fatface` | Abril Fatface | Decorative accents (limited use) |

### Type Scale

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `display-1` | 60px (text-6xl) | 1.1 | Hero headlines |
| `display-2` | 48px (text-5xl) | 1.1 | Major section headers |
| `heading-1` | 36px (text-4xl) | 1.2 | Page titles |
| `heading-2` | 30px (text-3xl) | 1.2 | Section headers |
| `heading-3` | 24px (text-2xl) | 1.3 | Subsection headers |
| `heading-4` | 20px (text-xl) | 1.4 | Card titles |
| `body-lg` | 18px (text-lg) | 1.6 | Large body text |
| `body` | 16px (text-base) | 1.6 | Default body text |
| `body-sm` | 14px (text-sm) | 1.5 | Secondary text, labels |
| `caption` | 12px (text-xs) | 1.4 | Captions, badges |

### Font Weight Scale

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text |
| `font-medium` | 500 | Emphasis, labels |
| `font-semibold` | 600 | Subheadings, buttons |
| `font-bold` | 700 | Headings, strong emphasis |

### Text Styling

```css
/* Tracking (Letter Spacing) */
tracking-wide     /* 0.025em - Buttons, labels */
tracking-wider    /* 0.05em - Badges */
tracking-widest   /* 0.1em - Uppercase labels */

/* Leading (Line Height) */
leading-tight     /* 1.25 - Headings */
leading-normal    /* 1.5 - Default */
leading-relaxed   /* 1.625 - Long form text */
```

---

## 4. Spacing, Layout & Grid

### Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight spacing, icon gaps |
| `space-2` | 8px | Small gaps, compact UI |
| `space-3` | 12px | Standard small spacing |
| `space-4` | 16px | Default component spacing |
| `space-6` | 24px | Section spacing |
| `space-8` | 32px | Large section gaps |
| `space-12` | 48px | Major section dividers |
| `space-16` | 64px | Page section padding |
| `space-20` | 80px | Hero/landing sections |

### Container Widths

```css
/* Standard containers */
max-w-xs:  320px  /* Small cards, tooltips */
max-w-sm:  384px  /* Small forms */
max-w-md:  448px  /* Medium forms, modals */
max-w-lg:  512px  /* Large forms */
max-w-xl:  576px  /* Wide forms */
max-w-2xl: 672px  /* Content containers */
max-w-4xl: 896px  /* Wide content */
max-w-6xl: 1152px /* Full page width */
```

### Breakpoints

| Token | Width | Target |
|-------|-------|--------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded` | 4px | Small elements |
| `rounded-md` | 6px | Inputs, small buttons |
| `rounded-lg` | 8px | Buttons, cards |
| `rounded-xl` | 12px | Large cards, modals |
| `rounded-2xl` | 16px | Feature cards |
| `rounded-3xl` | 24px | Hero sections, banners |
| `rounded-full` | 9999px | Pills, circular buttons |

### Grid Patterns

```css
/* Responsive 3-column grid */
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6

/* 2-column layout */
grid grid-cols-1 md:grid-cols-2 gap-8

/* Sidebar layout */
grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6
```

---

## 5. Iconography

### Icon Library

**Primary**: React Icons
- Font Awesome (`react-icons/fa`): FaCalendarAlt, FaClock, FaUsers, FaInstagram, FaFacebook
- Remix Icons (`react-icons/ri`): RiAddLine
- Phosphor Icons (`react-icons/pi`): PiSquareLogoFill

**Secondary**: Material-UI Icons (`@mui/icons-material`)
- Description, Settings, etc.

### Icon Sizing

| Size | Dimension | Usage |
|------|-----------|-------|
| `sm` | 16px (w-4 h-4) | Inline, buttons |
| `md` | 20px (w-5 h-5) | Default, navigation |
| `lg` | 24px (w-6 h-6) | Feature icons |
| `xl` | 32px (w-8 h-8) | Large features |
| `2xl` | 40px (w-10 h-10) | Hero sections |

### Icon Stroke

- Default stroke width: 1.5px
- Bold icons: 2px
- Light icons: 1px

### Icon Colors

```css
/* Default */
color: currentColor;

/* Primary */
color: var(--primary);

/* Secondary */
color: #42A5F5;

/* Muted */
color: #6b7280; /* gray-500 */

/* Social - Instagram */
color: #E1306C;
```

---

## 6. Motion & Animation

### Timing Functions

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `ease-in-out` | General transitions |
| `ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Enter animations |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Exit animations |
| `spring` | `type: "spring", stiffness: 100, damping: 20` | Framer Motion springs |

### Duration Scale

| Token | Duration | Usage |
|-------|----------|-------|
| `fast` | 150ms | Micro-interactions, focus |
| `normal` | 200ms | Hovers, state changes |
| `moderate` | 300ms | Transitions, transforms |
| `slow` | 500ms | Page transitions, complex animations |

### Standard Transitions

```css
/* Default */
transition-all duration-300 ease-in-out

/* Colors only */
transition-colors duration-200

/* Transform only */
transition-transform duration-300

/* Multiple properties */
transition-[transform,box-shadow] duration-300
```

### Keyframe Animations

```css
/* Slide in from bottom */
@keyframes slideInFromBottom {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* Slide in from right */
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Pulse (Tailwind) */
animate-pulse

/* Spin (for loaders) */
animate-spin

/* Ping (for notifications) */
animate-ping
```

### Hover Effects

```css
/* Scale up */
hover:scale-105

/* Lift with shadow */
hover:-translate-y-1 hover:shadow-lg

/* Color transition */
hover:bg-primary hover:text-white
```

---

## 7. Components

### Buttons

#### Primary Button
```tsx
className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
```

#### Secondary Button
```tsx
className="bg-white text-primary font-semibold px-6 py-3 rounded-lg border-2 border-primary hover:bg-primary hover:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-300"
```

#### Ghost Button
```tsx
className="bg-transparent text-primary font-medium px-4 py-2 hover:bg-primary/10 rounded-lg transition-colors duration-200"
```

#### Pill Button (Hero CTAs)
```tsx
className="bg-white hover:bg-primary hover:text-white border-2 border-primary/40 hover:border-primary text-primary font-semibold px-8 py-3 rounded-full transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg tracking-wide"
```

#### Icon Button
```tsx
className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
```

#### Destructive Button
```tsx
className="bg-red-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
```

#### Button Sizes

| Size | Padding | Font Size |
|------|---------|-----------|
| `sm` | `px-3 py-1.5` | `text-sm` |
| `md` | `px-4 py-2` | `text-base` |
| `lg` | `px-6 py-3` | `text-base` |
| `xl` | `px-8 py-4` | `text-lg` |

### Form Inputs

#### Text Input
```tsx
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-gray-900"
```

#### Select
```tsx
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none bg-white"
```

#### Textarea
```tsx
className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
```

#### Input Label
```tsx
className="block text-sm font-medium text-gray-700 mb-2"
```

#### Input Error State
```tsx
className="border-red-500 focus:ring-red-500"
// Error message
className="text-sm text-red-600 mt-1"
```

### Cards

#### Standard Card
```tsx
className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden"
```

#### Feature Card
```tsx
className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100"
```

#### Event Card (with gradient border)
```tsx
style={{
  borderRadius: "20px",
  border: "2px solid transparent",
  background: "linear-gradient(white, white) padding-box, linear-gradient(135deg, #326C85, #42A5F5, #64B5F6) border-box",
  boxShadow: "0 8px 24px rgba(66, 165, 245, 0.15)",
  transition: "all 0.4s ease"
}}
```

### Badges & Tags

#### Status Badge
```tsx
// Active/Success
className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"

// Pending/Warning
className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"

// Inactive/Error
className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
```

#### Price Tag
```tsx
style={{
  background: "linear-gradient(135deg, #326C85, #4A90A4)",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "20px",
  fontWeight: "bold",
  transform: "rotate(-2deg)"
}}
```

### Alerts

#### Success Alert
```tsx
className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
```

#### Error Alert
```tsx
className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
```

#### Warning Alert
```tsx
className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg"
```

#### Info Alert
```tsx
className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg"
```

### Navigation

#### NavBar
```tsx
className="fixed top-0 left-0 w-full bg-white/90 backdrop-blur-sm border-b border-gray-100 z-50"
```

#### Nav Link
```tsx
className="text-gray-700 hover:text-primary font-medium transition-colors duration-200"
```

#### Nav Link Active
```tsx
className="text-primary font-semibold border-b-2 border-primary"
```

### Modals

#### Overlay
```tsx
className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
```

#### Modal Container
```tsx
className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden"
```

### Loading States

#### Spinner
```tsx
className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
```

#### Skeleton
```tsx
className="animate-pulse bg-gray-200 rounded-lg"
```

---

## 8. Shadows

### Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1)` | Default |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Dropdowns, modals |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1)` | Major elevation |
| `shadow-2xl` | `0 25px 50px rgba(0,0,0,0.25)` | High emphasis |

### Custom Shadows

```css
/* Card shadow */
box-shadow: 0 8px 24px rgba(66, 165, 245, 0.15);

/* Card hover shadow */
box-shadow: 0 20px 40px rgba(50, 108, 133, 0.25);

/* Button shadow */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

/* Price tag shadow */
box-shadow: 0 4px 15px rgba(50, 108, 133, 0.3);
```

---

## 9. UX Patterns

### Page Structure

1. **Landing Pages**: Hero + Content sections (py-16 md:py-20)
2. **List Pages**: Header + Filters + Grid
3. **Detail Pages**: Back nav + Hero image + Content
4. **Forms**: Title + Field groups + Actions
5. **Admin Pages**: Sidebar + Header + Content area

### Navigation Patterns

- **Primary Nav**: Fixed header with logo, links, mobile menu
- **Breadcrumbs**: For nested pages (admin dashboard)
- **Back Links**: On detail pages
- **Footer Nav**: Secondary links, social, contact

### Form Patterns

- **Progressive Disclosure**: Show fields as needed
- **Inline Validation**: Real-time feedback
- **Clear Labels**: Above inputs
- **Helpful Placeholders**: Example text
- **Error States**: Red border + error message below

### Loading Patterns

- **Skeleton Screens**: For initial page loads
- **Spinners**: For button actions
- **Progress Indicators**: For multi-step processes

### Feedback Patterns

- **Toast Notifications**: react-hot-toast, top-right position
- **Inline Messages**: Success/error states near forms
- **Empty States**: Helpful messages when no data

---

## 10. Accessibility Checklist

### Color & Contrast

- [ ] Text contrast ratio meets WCAG AA (4.5:1 normal, 3:1 large)
- [ ] Don't rely solely on color to convey information
- [ ] Focus states are clearly visible
- [ ] Links are distinguishable from regular text

### Keyboard Navigation

- [ ] All interactive elements are keyboard accessible
- [ ] Focus order follows logical reading order
- [ ] Focus trap in modals
- [ ] Skip links for main content

### Screen Readers

- [ ] Images have descriptive alt text
- [ ] Form inputs have associated labels
- [ ] Buttons have accessible names
- [ ] Landmarks are properly used (nav, main, aside)
- [ ] Heading hierarchy is logical (h1 -> h2 -> h3)

### ARIA Roles

```tsx
// Buttons that look like links
<button role="link">

// Navigation
<nav aria-label="Main navigation">

// Modal
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">

// Loading
<div aria-live="polite" aria-busy="true">
```

### Motion

- [ ] Respect prefers-reduced-motion
- [ ] Animations can be paused
- [ ] No flashing content

### Touch Targets

- [ ] Minimum 44x44px touch targets on mobile
- [ ] Adequate spacing between interactive elements

---

## 11. File Reference

| Purpose | File |
|---------|------|
| CSS Variables | `app/globals.css` |
| Font Setup | `app/layout.tsx` |
| Button Example | `components/dashboard/shared/AddButton.tsx` |
| Card Example | `components/classes/EventCard.tsx` |
| Form Example | `components/contact/ContactForm.tsx` |
| Hero Example | `components/landing/Hero.tsx` |
| Nav Example | `components/layout/nav/NavBar.tsx` |
| Footer Example | `components/layout/footer/Footer.tsx` |
| Payment Form | `components/payment/PaymentProcessor.tsx` |

---

## 12. Quick Reference - Tailwind Classes

### Common Button
```
bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors
```

### Common Input
```
w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent
```

### Common Card
```
bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6
```

### Common Section
```
py-16 md:py-20 px-6 md:px-12
```

### Common Heading
```
text-3xl md:text-4xl font-bold text-primary mb-6
```

### Common Body Text
```
text-base text-gray-700 leading-relaxed
```
