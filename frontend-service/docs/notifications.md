# Notification System

The MapGuesser application includes a global toast-based notification system that can be used throughout the application to display messages to users.

## API

The notification system provides a simple API accessible from anywhere in the application:

```typescript
import { notify } from '../context/NotificationContext';

// Show a notification
notify({
	type: 'success',
	message: 'Location found!',
	duration: 5000 // Optional, defaults to 5000ms (5 seconds)
});
```

### Parameters

The `notify` function accepts an object with the following properties:

| Property | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `type` | string | Yes | - | Notification type: `'info'`, `'success'`, `'warning'`, or `'error'` |
| `message` | string | Yes | - | The notification message to display |
| `duration` | number | No | 5000 | Duration in milliseconds to show the notification before auto-dismissing |

### Notification Types

- `info`: General information messages
- `success`: Success messages (e.g., successful operations)
- `warning`: Warning messages (caution required)
- `error`: Error messages (operation failed)

## Components

### NotificationProvider

This provider component must wrap the application to enable the notification system. It manages the notification queue and renders the active notifications.

```tsx
// Example in pages/index.tsx
<NotificationProvider>
  <main className="h-full overflow-hidden">
    <Game />
    <ToastContainer />
  </main>
</NotificationProvider>
```

### ToastContainer

This component renders the active notifications. It should be included once inside the `NotificationProvider`.

## Usage Examples

### Display a success message

```tsx
notify({
  type: 'success',
  message: 'Game saved successfully!'
});
```

### Display an error with longer duration

```tsx
notify({
  type: 'error',
  message: 'Failed to connect to server',
  duration: 10000 // Show for 10 seconds
});
```

### Display a warning

```tsx
notify({
  type: 'warning',
  message: 'Your session will expire soon'
});
```

### Display an info message with short duration

```tsx
notify({
  type: 'info',
  message: 'Player joined the game',
  duration: 3000 // Show for 3 seconds
});
```

## Implementation Details

- Each notification receives a unique ID (using UUID)
- Notifications automatically dismiss after the specified duration
- Users can manually dismiss notifications by clicking the close button
- The system is context-based and manages a queue of active notifications
- If the `notify` function is called before the context is initialized, it will safely no-op with a console warning in development