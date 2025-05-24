# User Preferences System

This document describes the user preferences system in MapGuesser, which allows for persistent storage of user settings across sessions.

## Architecture

The user preferences system uses a two-layer architecture:

1. **Storage Service Layer** (`storageService.ts`)
   - Provides generic, type-safe localStorage interaction
   - Handles errors and browser compatibility
   - Offers get, set, remove, and clear operations

2. **Domain-Specific Layer** (`userPreferences.ts`)
   - Uses the storage service for persistence
   - Manages specific preference types (e.g., timer settings)
   - Applies proper namespacing to avoid collisions

## Usage Examples

### Reading User Preferences

```typescript
import { getTimerPreferences } from '../services/userPreferences';

// Get user's timer preferences with fallback defaults
const preferences = getTimerPreferences();
// Returns: { roundTimerIndex: number, roundTimeMs: number, hasTimer: boolean }

// Use the preferences
const initialTimerIndex = preferences.roundTimerIndex;
```

### Saving User Preferences

```typescript
import { saveTimerPreferences } from '../services/userPreferences';

// Save timer preferences
const success = saveTimerPreferences({
  roundTimerIndex: 2,
  roundTimeMs: 20000,
  hasTimer: true
});

// Handle success/failure if needed
if (!success) {
  console.warn('Failed to save user preferences');
}
```

### Using the Storage Service Directly

For new preference types, use the base storage service:

```typescript
import { getItem, setItem } from '../services/storageService';

// Type-safe storage access with defaults
const value = getItem<string>('mapguesser_preference_key', 'default_value');

// Store values with proper serialization
setItem('mapguesser_preference_key', { complex: 'object' });
```

## Storage Keys

All preference keys are prefixed with `mapguesser_` to avoid collisions with other applications using localStorage on the same domain.

Current preference keys:

| Key | Purpose | Type |
|-----|---------|------|
| `mapguesser_round_timer_index` | Selected timer option index | number |
| `mapguesser_round_timer_ms` | Timer duration in milliseconds | number |
| `mapguesser_has_timer` | Whether timer is enabled | boolean |

## Adding New Preference Types

When adding new user preference categories:

1. Define appropriate types and interfaces
2. Add storage keys with proper namespacing
3. Create getter/setter functions in the userPreferences module
4. Wire up components to use the preference service

## Browser Support

The storage system gracefully degrades when localStorage is not available (e.g., in private browsing mode or when disabled). Default values will be used in these cases, and errors are properly logged.