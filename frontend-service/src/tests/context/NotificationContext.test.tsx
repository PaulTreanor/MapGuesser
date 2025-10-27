import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationProvider, useNotification, notify, setGlobalNotify } from '../../context/NotificationContext';

// Test component that uses the notification context
const TestComponent = ({ notificationType = 'info', message = 'Test message' }) => {
	const { notify } = useNotification();
	
	return (
		<div>
			<button 
				onClick={() => notify({ type: notificationType, message, duration: 1000 })}
				data-testid="trigger-notification"
			>
				Show Notification
			</button>
		</div>
	);
};

// Mock toast component to verify notifications are shown
vi.mock('../../components/Toast', () => ({
	default: ({ type, message, onClose }) => (
		<div data-testid={`toast-${type}`} onClick={onClose}>
			{message}
		</div>
	)
}));

describe('NotificationContext', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('should provide notification context to children', () => {
		const { getByTestId } = render(
			<NotificationProvider>
				<TestComponent />
			</NotificationProvider>
		);
		
		expect(getByTestId('trigger-notification')).toBeInTheDocument();
	});

	it('should add notification when notify is called', async () => {
		const TestConsumer = () => {
			const { notifications, notify } = useNotification();
			
			return (
				<div>
					<button
						onClick={() => notify({ type: 'success', message: 'Success message' })}
						data-testid="add-notification"
					>
						Add
					</button>
					<div data-testid="notification-count">{notifications.length}</div>
				</div>
			);
		};
		
		const { getByTestId } = render(
			<NotificationProvider>
				<TestConsumer />
			</NotificationProvider>
		);
		
		expect(getByTestId('notification-count').textContent).toBe('0');
		
		// Click to add a notification
		act(() => {
			getByTestId('add-notification').click();
		});
		
		expect(getByTestId('notification-count').textContent).toBe('1');
	});

	it('should remove notification after duration', async () => {
		const TestConsumer = () => {
			const { notifications, notify } = useNotification();
			
			return (
				<div>
					<button
						onClick={() => notify({ type: 'info', message: 'Test', duration: 1000 })}
						data-testid="add-notification"
					>
						Add
					</button>
					<div data-testid="notification-count">{notifications.length}</div>
				</div>
			);
		};
		
		const { getByTestId } = render(
			<NotificationProvider>
				<TestConsumer />
			</NotificationProvider>
		);
		
		// Add notification
		act(() => {
			getByTestId('add-notification').click();
		});
		
		expect(getByTestId('notification-count').textContent).toBe('1');
		
		// Fast-forward timer to trigger auto-dismiss
		act(() => {
			vi.advanceTimersByTime(1500);
		});
		
		expect(getByTestId('notification-count').textContent).toBe('0');
	});

	it('should provide a fallback when used outside provider', () => {
		// Using the hook outside of provider should not throw
		const TestWithoutProvider = () => {
			const { notify } = useNotification();
			
			return (
				<button
					onClick={() => notify({ type: 'error', message: 'Error' })}
					data-testid="notify-button"
				>
					Notify
				</button>
			);
		};
		
		const { getByTestId } = render(<TestWithoutProvider />);
		
		act(() => {
			getByTestId('notify-button').click();
		});
		
		// Expect console warning
		expect(console.warn).toHaveBeenCalledWith('useNotification must be used within a NotificationProvider');
	});

	it('should register global notify function', () => {
		const consoleWarnSpy = vi.spyOn(console, 'warn');

		// Global notify should show warning before initialization
		notify({ type: 'info', message: 'Before init' });
		expect(consoleWarnSpy).toHaveBeenCalledWith('Notification system not initialized yet');

		// Test Component that sets up the global notify
		const GlobalNotifyTest = () => {
			const { notify } = useNotification();

			React.useEffect(() => {
				setGlobalNotify(notify);
				return () => {
					setGlobalNotify(() => {
						console.warn('Notification system not available');
						return '';
					});
				};
			}, [notify]);

			return <div data-testid="global-test">Global Notify Test</div>;
		};

		const { unmount } = render(
			<NotificationProvider>
				<GlobalNotifyTest />
			</NotificationProvider>
		);

		// After rendering, global notify should be initialized
		consoleWarnSpy.mockClear();
		act(() => {
			notify({ type: 'success', message: 'After init' });
		});
		expect(consoleWarnSpy).not.toHaveBeenCalled();

		// Unmount to test cleanup
		unmount();

		// After unmount, global notify should warn again
		notify({ type: 'error', message: 'After unmount' });
		expect(consoleWarnSpy).toHaveBeenCalledWith('Notification system not available');
	});
});