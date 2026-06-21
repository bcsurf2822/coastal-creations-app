# Fluid-Tailwind Documentation Guide

> Reference documentation for implementing fluid-tailwind in Next.js 15 with Tailwind CSS v4

## Overview

fluid-tailwind is a Tailwind CSS plugin that enables fluid responsive design using CSS `clamp()` instead of discrete breakpoints. Values smoothly scale between defined start and end points based on viewport width.

## Installation

```bash
npm install -D fluid-tailwind
```

## Configuration for Tailwind v4

### postcss.config.mjs (Tailwind v4 PostCSS approach)

```javascript
import fluid, { extract, screens, fontSize } from 'fluid-tailwind';

export default {
  content: {
    files: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
    extract
  },
  theme: {
    screens,     // rem-based screens required
    fontSize,    // rem-based font sizes required
    extend: {
      screens: {
        xs: '20rem'  // optional custom screen
      }
    }
  },
  plugins: [fluid]
};
```

### Alternative: globals.css with @plugin directive

```css
@import "tailwindcss";
@plugin "fluid-tailwind";
```

## Core Syntax

### The `~` Modifier

The tilde (`~`) prefix creates fluid values that scale smoothly:

```html
<!-- Text scales between lg and 2xl -->
<h1 class="~text-lg/2xl">Fluid Heading</h1>

<!-- Padding scales between 4 and 8 -->
<div class="~p-4/8">Fluid Padding</div>
```

### Syntax Pattern

```
~[utility]-[start]/[end]
```

Where:
- `start` = value at smallest breakpoint
- `end` = value at largest breakpoint
- Values scale linearly between these points

## Available Utilities

fluid-tailwind works with **every Tailwind utility** including:

### Text Sizing
```html
<h1 class="~text-sm/xl">Small to Extra Large</h1>
<h2 class="~text-base/4xl">Base to 4XL</h2>
<p class="~text-xs/base">Extra Small to Base</p>
```

### Spacing (Padding, Margin, Gap)
```html
<div class="~p-4/8">Fluid padding</div>
<div class="~px-2/6 ~py-4/10">Fluid axis padding</div>
<div class="~m-2/6">Fluid margin</div>
<div class="~gap-2/6">Fluid gap</div>
```

### Sizing (Width, Height)
```html
<div class="~w-20/40">Fluid width</div>
<div class="~h-32/64">Fluid height</div>
```

### Negative Values
```html
<div class="~-mt-3/5">Negative margin</div>
```

## Custom Breakpoints

### Per-Utility Breakpoints
```html
<!-- Quick scaling from md to lg -->
<h1 class="~md/lg:~text-base/4xl">Custom range</h1>

<!-- Start at md, use default end -->
<h1 class="~md:~text-base/4xl">Start at md</h1>

<!-- Use default start, end at lg -->
<h1 class="~/lg:~text-base/4xl">End at lg</h1>
```

### Arbitrary Breakpoints
```html
<div class="~min-[20rem]/lg:~text-base/4xl">Custom start</div>
```

## Default Screen Configuration

By default, fluid utilities scale between the first and last defined screens. To customize:

```javascript
// tailwind.config.js
theme: {
  fluid: ({ theme }) => ({
    defaultScreens: ['20rem', theme('screens.lg')]
  })
}
```

## Container Queries

With `@tailwindcss/container-queries` installed:

```html
<div class="@container">
  <h1 class="~@md/lg:~text-base/4xl">Container-relative scaling</h1>
</div>
```

## WCAG Accessibility Compliance

fluid-tailwind enforces WCAG Success Criterion 1.4.4 by default, ensuring text can be resized up to 200%. To disable (not recommended):

```javascript
plugins: [
  fluid({
    checkSC144: false // default: true
  })
]
```

## Integration with tailwind-merge

```bash
npm install @fluid-tailwind/tailwind-merge
```

```javascript
import { extendTailwindMerge } from 'tailwind-merge';
import { withFluid } from '@fluid-tailwind/tailwind-merge';

export const twMerge = extendTailwindMerge(withFluid);
```

## Limitations and Gotchas

### MUST Use Same Units
Start and end values must use the same unit:
```html
<!-- GOOD -->
<div class="~p-4/8">rem to rem</div>
<div class="~p-[1rem]/[2rem]">explicit rem</div>

<!-- BAD - different units -->
<div class="~p-[1rem]/[18px]">FAILS</div>
```

### No calc() Expressions
```html
<!-- BAD -->
<div class="~text-base/[calc(1.5rem-2px)]">FAILS</div>
```

### Non-Length Values Not Supported
```html
<!-- BAD - colors are not lengths -->
<div class="~text-white/red-500">FAILS</div>
```

### rem-Based Screens Required
Tailwind's default pixel-based screens must be converted to rem. The plugin provides `screens` and `fontSize` exports for this.

## Error Handling

When fluid utilities fail, an empty rule with a comment is output. Check:
- Browser DevTools inspector
- VS Code IntelliSense with Tailwind extension

## Conversion Reference

### Before (Breakpoint Classes)
```html
<main class="p-6 md:p-8 lg:p-10">
<p class="text-lg md:text-xl lg:text-2xl">
<div class="mt-4 md:mt-5 lg:mt-6">
<button class="px-4 md:px-6 py-2 md:py-3">
```

### After (Fluid Classes)
```html
<main class="~p-6/10">
<p class="~text-lg/2xl">
<div class="~mt-4/6">
<button class="~px-4/6 ~py-2/3">
```

## What NOT to Convert

These patterns require discrete breakpoints:

1. **Grid column counts**
   ```html
   <!-- Keep as-is -->
   <div class="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
   ```

2. **Display changes**
   ```html
   <!-- Keep as-is -->
   <div class="hidden md:block">
   <div class="flex md:hidden">
   ```

3. **Flex direction changes**
   ```html
   <!-- Keep as-is -->
   <div class="flex-col md:flex-row">
   ```

4. **Layout-specific positioning**
   ```html
   <!-- Keep as-is when layout changes at breakpoint -->
   <nav class="fixed md:static">
   ```

## Best Practices

1. **Start with text and spacing** - These provide the most visual impact
2. **Use IntelliSense** - The Tailwind extension provides autocomplete for fluid classes
3. **Test across viewports** - Verify smooth scaling at all sizes
4. **Keep WCAG compliance enabled** - Ensure accessibility
5. **Don't over-fluid** - Some values should remain discrete (grid columns, visibility)

## References

- Official Documentation: https://fluid.tw/
- GitHub: https://github.com/barvian/fluid-tailwind
- WCAG 1.4.4 (Resize Text): https://www.w3.org/WAI/WCAG21/Understanding/resize-text.html
