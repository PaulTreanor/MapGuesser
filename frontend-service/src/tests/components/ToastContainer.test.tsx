import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ToastContainer from '../../components/ToastContainer';
import { NotificationProvider, notify } from '../../context/NotificationContext';

// Mock the Toast component
vi.mock('../../components/Toast', () => ({
	default: ({ type, message, onClose }: { type: string; message: string; onClose: () => void }) => (
		<div data-testid={`toast-${type}`} className="mock-toast" onClick={onClose}>
			{message}
			<button data-testid={`close-${type}`} onClick={onClose}>Close</button>
		</div>
	)
}));

const renderToastContainer = () => {
	return render(
		<NotificationProvider>
			<ToastContainer />
			<button 
				data-testid="show-info"
				onClick={() => notify({ type: 'info', message: 'Info message', duration: 5000 })}
			>
				Show Info
			</button>
			<button 
				data-testid="show-success"
				onClick={() => notify({ type: 'success', message: 'Success message', duration: 5000 })}
			>
				Show Success
			</button>
			<button 
				data-testid="show-warning"
				onClick={() => notify({ type: 'warning', message: 'Warning message', duration: 5000 })}
			>
				Show Warning
			</button>
			<button 
				data-testid="show-error"
				onClick={() => notify({ type: 'error', message: 'Error message', duration: 5000 })}
			>
				Show Error
			</button>
		</NotificationProvider>
	);
};

describe('ToastContainer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('should render nothing when no notifications exist', () => {
		const { container } = render(
			<NotificationProvider>
				<ToastContainer />
			</NotificationProvider>
		);
		
		expect(container.firstChild).toBeNull();
	});

	it('should render an info notification when triggered', () => {
		const { getByTestId, queryByTestId } = renderToastContainer();
		
		// Initially no toasts
		expect(queryByTestId('toast-info')).not.toBeInTheDocument();
		
		// Trigger info notification
		fireEvent.click(getByTestId('show-info'));
		
		// Toast should be visible
		expect(getByTestId('toast-info')).toBeInTheDocument();
		expect(getByTestId('toast-info')).toHaveTextContent('Info message');
	});

	it('should render a success notification when triggered', () => {
		const { getByTestId } = renderToastContainer();
		
		fireEvent.click(getByTestId('show-success'));
		
		expect(getByTestId('toast-success')).toBeInTheDocument();
		expect(getByTestId('toast-success')).toHaveTextContent('Success message');
	});

	it('should render a warning notification when triggered', () => {
		const { getByTestId } = renderToastContainer();
		
		fireEvent.click(getByTestId('show-warning'));
		
		expect(getByTestId('toast-warning')).toBeInTheDocument();
		expect(getByTestId('toast-warning')).toHaveTextContent('Warning message');
	});

	it('should render an error notification when triggered', () => {
		const { getByTestId } = renderToastContainer();
		
		fireEvent.click(getByTestId('show-error'));
		
		expect(getByTestId('toast-error')).toBeInTheDocument();
		expect(getByTestId('toast-error')).toHaveTextContent('Error message');
	});

	it('should remove notification when close button is clicked', () => {
		const { getByTestId, queryByTestId } = renderToastContainer();
		
		// Show notification
		fireEvent.click(getByTestId('show-success'));
		expect(getByTestId('toast-success')).toBeInTheDocument();
		
		// Click close button
		fireEvent.click(getByTestId('close-success'));
		
		// Should be removed immediately in our mock
		expect(queryByTestId('toast-success')).not.toBeInTheDocument();
	});

	it('should register and unregister global notify on mount/unmount', () => {
		const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		
		const { unmount } = render(
			<NotificationProvider>
				<ToastContainer />
			</NotificationProvider>
		);
		
		// Should not warn when properly initialized
		act(() => {
			notify({ type: 'success', message: 'Test message' });
		});
		expect(consoleWarnSpy).not.toHaveBeenCalled();
		
		// Unmount component to test cleanup
		unmount();
		
		// Should warn after unmount
		act(() => {
			notify({ type: 'success', message: 'Test message' });
		});
		expect(consoleWarnSpy).toHaveBeenCalledWith('Notification system not available');
	});

	it('should handle multiple notifications simultaneously', () => {
		const { getByTestId, getAllByTestId } = renderToastContainer();
		
		// Show multiple notifications
		fireEvent.click(getByTestId('show-success'));
		fireEvent.click(getByTestId('show-warning'));
		fireEvent.click(getByTestId('show-error'));
		
		// Should show all three notifications
		const toasts = getAllByTestId(/^toast-/);
		expect(toasts.length).toBe(3);
	});
});