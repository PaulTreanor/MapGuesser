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

### Typography Components

The Typography components provide consistent text styling across the application.

```tsx
import { Heading, Subheading, Paragraph, MapGuesserHeading } from "@/components/typography/Typography"
```


### Game-specific Components

- **StartModal** - Initial game instructions and start button
- **EndModal** - Game results and play again option
- **HUD** - Navigation and game status bar
- **Toast** - Notification component with variants:
  - `success` - Green confirmation messages
  - `danger` - Red error messages
  - `warning` - Orange warning messages

### Layout Components

- **Modal** - Generic modal container with consistent styling and positioning
