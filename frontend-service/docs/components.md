# MapGuesser Component Documentation

This documentation provides an overview of the components and styling conventions used in the MapGuesser application.

## Style Guide

See the [Style Guide](./style-guide.md) for complete details on colors, typography, spacing, and design patterns.

## UI Components

### Button

The Button component extends ShadCN/UI Button with MapGuesser-specific variants.

#### Import

```tsx
import { Button } from "@/components/ui/button"
```

#### MapGuesser Custom Variants

- `mapguesser` - Blue primary button (bg-blue-800)
- `mapguesserDanger` - Rose/red danger button (bg-rose-700)
- `mapguesserSuccess` - Green success button (bg-green-600)
- `mapguesserClose` - White close button for toasts

#### Custom Sizes

- `xl` - Extra large text size (text-xl)

#### Usage Example

```tsx
<Button variant="mapguesser" size="xl">
  Start Game!
</Button>
```

#### Design Notes

These variants consolidate previously ad-hoc button styling across the application:

1. Primary actions (blue): Start Game, Play Again, Go Home
2. Danger actions (rose/red): Next Round
3. Success actions (green): Finish Game
4. Close buttons (white): Toast close button

### Typography Components

The Typography components provide consistent text styling across the application.

#### Import

```tsx
import { Heading, Subheading, Paragraph } from "@/components/typography/Typography"
```

#### Components

- **Heading** - Top level heading (h1) with consistent styling
  - Default styles: `font-titillium text-blue-800 text-4xl font-bold md:mb-2`
  
- **Subheading** - Second level heading (h2) with consistent styling
  - Default styles: `font-titillium text-2xl text-slate-800 font-bold`
  
- **Paragraph** - Standard paragraph text with consistent styling
  - Default styles: `text-lg text-slate-950`

#### Usage Example

```tsx
<Heading>Main Page Title</Heading>
<Subheading>Section Title</Subheading>
<Paragraph>
  Lorem ipsum dolor sit amet, consectetur adipiscing elit.
</Paragraph>
```

- **MapGuesserHeading** - Special heading for the application logo

### Game-specific Components

- **StartModal** - Initial game instructions and start button
- **EndModal** - Game results and play again option
- **TopBarGame** - Navigation and game status bar
- **Toast** - Notification component with variants:
  - `success` - Green confirmation messages
  - `danger` - Red error messages
  - `warning` - Orange warning messages

### Layout Components

- **Modal** - Generic modal container with consistent styling and positioning

## Future Documentation

Additional component documentation will be added as components are refactored and standardized. 