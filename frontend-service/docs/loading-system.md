# Loading System Documentation

## Overview

The MapGuesser loading system provides a centralized, reusable loading state management solution with contextual loading messages and smart overlay management. It's designed to scale with the application's growing complexity while providing a smooth user experience.

## Architecture

### Core Components

#### 1. LoadingContext (`src/context/LoadingContext.tsx`)
- **Purpose**: Manages global loading states using React Context
- **State Structure**:
  ```typescript
  {
    loadingStates: { [key: string]: boolean },    // e.g., { "textures": true, "profile": false }
    loadingMessages: { [key: string]: string }    // e.g., { "textures": "Loading game textures..." }
  }
  ```

#### 2. LoadingProvider Component
- **Purpose**: Wraps the application and provides loading context
- **Features**:
  - Manages loading states in React state
  - Automatically cleans up completed loading states after 1000ms delay
  - Renders LoadingOverlay when any loading is active
  - Provides context value to all child components

#### 3. LoadingOverlay Component (`src/components/LoadingOverlay.tsx`)
- **Purpose**: Visual loading interface that appears over the game
- **Features**:
  - Full-screen overlay with backdrop blur and dark background
  - Centered modal container with rounded corners
  - MapGuesser title/logo at top
  - Animated loading spinner
  - Current loading message display
  - Mobile-responsive design

#### 4. useLoading Hook
- **Purpose**: Custom hook for easy access to loading context
- **Methods**:
  - `setLoading(key: string, isLoading: boolean, message?: string)` - Set loading state for a specific operation
  - `isLoading(key: string): boolean` - Check if specific operation is loading
  - `isAnyLoading(): boolean` - Check if any operation is loading
  - `getLoadingKeys(): string[]` - Get array of currently loading operation keys

## Usage Examples

### Basic Loading Operation
```javascript
import { useLoading } from '../context/LoadingContext';

const GameComponent = () => {
  const { setLoading } = useLoading();

  const loadAssets = async () => {
    setLoading('assets', true, 'Loading game assets...');
    try {
      await loadGameAssets();
    } finally {
      setLoading('assets', false);
    }
  };

  return (
    <button onClick={loadAssets}>
      Load Game
    </button>
  );
};
```

### Multiple Concurrent Operations
```javascript
const ComplexGameSetup = () => {
  const { setLoading } = useLoading();

  const setupGame = async () => {
    // These can run simultaneously
    setLoading('textures', true, 'Loading textures...');
    setLoading('audio', true, 'Loading sounds...');
    setLoading('levels', true, 'Preparing world...');

    try {
      await Promise.all([
        loadTextures(),
        loadAudio(),
        loadLevels()
      ]);
    } finally {
      // Each completes independently
      setLoading('textures', false);
      setLoading('audio', false);
      setLoading('levels', false);
    }
  };
};
```

### Checking Loading Status
```javascript
const GameStatus = () => {
  const { isLoading, isAnyLoading, getLoadingKeys } = useLoading();

  return (
    <div>
      <p>Textures loading: {isLoading('textures')}</p>
      <p>Any loading: {isAnyLoading()}</p>
      <p>Loading operations: {getLoadingKeys().join(', ')}</p>
    </div>
  );
};
```

## Integration

The LoadingProvider is integrated at the root level in `src/pages/index.tsx`:

```jsx
<NotificationProvider>
  <LoadingProvider>
    <main className="h-full overflow-hidden">
      <Game />
      <ToastContainer />
    </main>
  </LoadingProvider>
</NotificationProvider>
```

## Implementation Details

### Message Priority
- Displays message from the first active loading operation in the order they appear in the loadingStates object
- If no message is provided, uses default format: `"Loading ${key}..."`

### State Cleanup
- After setting `isLoading: false`, automatically removes the key from loadingStates after 1000ms delay
- This prevents state bloat and memory leaks

### Styling
- Uses TailwindCSS with backdrop blur effect
- Fixed positioning with high z-index (z-50)
- Responsive design with max-width containers
- Mobile-optimized layout

### Error Handling
- useLoading hook throws error if used outside LoadingProvider
- Always use try/finally blocks to ensure loading states are properly cleaned up

## Performance Considerations

- Loading state updates are optimized to prevent unnecessary re-renders
- Completed states are automatically cleaned up to prevent memory leaks
- LoadingOverlay only renders when `isAnyLoading()` returns true

## Testing

Comprehensive tests are available in:
- `src/tests/context/LoadingContext.test.tsx` - Context functionality
- `src/tests/components/LoadingOverlay.test.tsx` - Component rendering

Test coverage includes:
- Loading state management (set/unset)
- Multiple concurrent loading operations
- Message display priority
- Overlay visibility logic
- Context error handling when used outside provider
- Component styling and responsiveness

## Future Enhancements

The system is designed to be extensible for future features such as:
- Progress indicators for specific operations
- Loading operation priorities
- Cancel loading operations
- Loading operation timeouts
- Custom loading animations per operation type

## Common Use Cases

1. **Asset Loading**: Game textures, sounds, models
2. **Level Transitions**: Between game rounds or levels
3. **Save Operations**: Saving game state or user preferences
4. **Network Requests**: API calls, data fetching
5. **Component Initialization**: Heavy component setup

## Best Practices

1. **Always use try/finally**: Ensure `setLoading(key, false)` is called even if operations fail
2. **Descriptive keys**: Use meaningful, unique keys for different operations
3. **Clear messages**: Provide context-appropriate loading messages
4. **Avoid nested providers**: LoadingProvider should be used once at the root level
5. **Error handling**: Handle async operation failures gracefully