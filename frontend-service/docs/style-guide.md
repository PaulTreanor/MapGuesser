# MapGuesser Style Guide

This document outlines the design patterns and styling conventions used in the MapGuesser application.

## Color System

### Primary Colors
- Blue: `text-blue-800` (headings), `bg-blue-900` (primary panels)
- White/Light: `text-white`, `bg-slate-100` (modals, toast backgrounds)
- Dark: `text-slate-600`, `text-slate-950` (normal text)

### Accent Colors
- Success: `bg-green-600`, `text-green-500`
- Danger: `bg-rose-700`, `text-red-500`
- Warning: `text-orange-500`

## Typography

### Fonts
- Headings: `font-titillium` (Titillium Web)
- Body: `font-roboto` (Roboto)

### Text Sizes
- Headings: `text-4xl` (main title)
- Subheadings: `text-2xl` 
- Body text: `text-lg`
- Small text: `text-sm`

### Text Styles
- Headings: `font-bold`
- Normal text: `font-normal`
- Light text: `font-light`

## Components

### Buttons
See the [Button component documentation](./components.md#button) for detailed information about button styles and variants.

### Modals
- Container: `fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center`
- Content: `bg-slate-100 p-4 md:p-8 rounded-lg shadow-lg max-w-2xl`

### Toasts
- Base: `flex items-center w-full max-w-xs p-4 mb-4 text-slate-600 bg-slate-100 rounded-lg shadow`
- Success variant: `text-green-500 bg-green-100`
- Danger variant: `text-red-500 bg-red-100`
- Warning variant: `text-orange-500 bg-orange-100`

### Panels
- Info panels: `p-4 bg-blue-900 rounded-md shadow-slate-50 shadow-sm text-white`
- Score panel: `px-4 py-2 bg-blue-900 text-white rounded-md shadow-slate-50 shadow-sm`

## Layout

### Spacing
- Standard padding: `p-4`
- Responsive padding: `p-4 md:p-8`
- Vertical spacing between elements: `mt-4`, `mb-4`
- Horizontal spacing: `mx-4`, `mr-4`

### Responsive Design
- Mobile/small screen adaptations: `flex-col sm:flex-row`
- Breakpoint-specific positioning: `md:absolute md:bottom-0`
- Responsive visibility: `hidden md:block`

## Shadows
- Light shadow: `shadow-slate-50 shadow-sm`
- Modal shadow: `shadow-lg`

## CSS Variables

The application uses CSS variables for theming, which should be preferred over hardcoded values:

```css
/* Colors */
--background: hsl(var(--background))
--foreground: hsl(var(--foreground))
--primary: hsl(var(--primary))
--secondary: hsl(var(--secondary))
--muted: hsl(var(--muted))
--accent: hsl(var(--accent))
--destructive: hsl(var(--destructive))

/* Border Radius */
--radius: 0.5rem
```

## Best Practices

1. Use ShadCN/UI components where appropriate
2. Use utility classes in a consistent manner
3. Avoid inline styles
4. Maintain responsive design patterns
5. Use appropriate semantic HTML elements
6. Follow the component documentation for standardized patterns 