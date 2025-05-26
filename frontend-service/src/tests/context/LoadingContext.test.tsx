import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';
import { LoadingProvider, useLoading } from '../../context/LoadingContext';

// Mock the LoadingOverlay component
vi.mock('../../components/LoadingOverlay', () => ({
	default: ({ message }: { message: string }) => (
		<div data-testid="loading-overlay">{message}</div>
	)
}));

// Test component that uses the loading context
const TestComponent = () => {
	const { setLoading, isLoading, isAnyLoading, getLoadingKeys } = useLoading();
	
	return (
		<div>
			<button 
				onClick={() => setLoading('textures', true, 'Loading textures...')}
				data-testid="start-loading"
			>
				Start Loading
			</button>
			<button 
				onClick={() => setLoading('textures', false)}
				data-testid="stop-loading"
			>
				Stop Loading
			</button>
			<button 
				onClick={() => setLoading('audio', true, 'Loading audio...')}
				data-testid="start-audio"
			>
				Start Audio
			</button>
			<div data-testid="is-textures-loading">{isLoading('textures').toString()}</div>
			<div data-testid="is-any-loading">{isAnyLoading().toString()}</div>
			<div data-testid="loading-keys">{getLoadingKeys().join(',')}</div>
		</div>
	);
};

describe('LoadingContext', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	test('should provide loading context to children', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		expect(getByTestId('start-loading')).toBeInTheDocument();
	});

	test('should track loading state correctly', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		// Initially not loading
		expect(getByTestId('is-textures-loading').textContent).toBe('false');
		expect(getByTestId('is-any-loading').textContent).toBe('false');
		
		// Start loading
		act(() => {
			getByTestId('start-loading').click();
		});
		
		expect(getByTestId('is-textures-loading').textContent).toBe('true');
		expect(getByTestId('is-any-loading').textContent).toBe('true');
		expect(getByTestId('loading-keys').textContent).toBe('textures');
	});

	test('should stop loading and cleanup after delay', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		// Start loading
		act(() => {
			getByTestId('start-loading').click();
		});
		
		expect(getByTestId('is-textures-loading').textContent).toBe('true');
		
		// Stop loading
		act(() => {
			getByTestId('stop-loading').click();
		});
		
		expect(getByTestId('is-textures-loading').textContent).toBe('false');
		expect(getByTestId('is-any-loading').textContent).toBe('false');
		
		// After cleanup delay
		act(() => {
			vi.advanceTimersByTime(1500);
		});
		
		expect(getByTestId('loading-keys').textContent).toBe('');
	});

	test('should handle multiple concurrent loading operations', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		// Start multiple loading operations
		act(() => {
			getByTestId('start-loading').click();
			getByTestId('start-audio').click();
		});
		
		expect(getByTestId('is-any-loading').textContent).toBe('true');
		expect(getByTestId('loading-keys').textContent).toBe('textures,audio');
		
		// Stop one operation
		act(() => {
			getByTestId('stop-loading').click();
		});
		
		expect(getByTestId('is-any-loading').textContent).toBe('true');
		expect(getByTestId('loading-keys').textContent).toBe('audio');
	});

	test('should display loading overlay when loading', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		// No overlay initially
		expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
		
		// Start loading
		act(() => {
			getByTestId('start-loading').click();
		});
		
		// Overlay should appear with message
		expect(getByTestId('loading-overlay')).toBeInTheDocument();
		expect(getByTestId('loading-overlay').textContent).toBe('Loading textures...');
	});

	test('should display message from first loading operation', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		// Start multiple operations
		act(() => {
			getByTestId('start-loading').click();
			getByTestId('start-audio').click();
		});
		
		// Should show first message
		expect(getByTestId('loading-overlay').textContent).toBe('Loading textures...');
	});

	test('should hide overlay when no loading operations are active', () => {
		const { getByTestId } = render(
			<LoadingProvider>
				<TestComponent />
			</LoadingProvider>
		);
		
		// Start loading
		act(() => {
			getByTestId('start-loading').click();
		});
		
		expect(getByTestId('loading-overlay')).toBeInTheDocument();
		
		// Stop loading
		act(() => {
			getByTestId('stop-loading').click();
		});
		
		expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
	});

	test('should use default message when none provided', () => {
		const TestWithDefault = () => {
			const { setLoading } = useLoading();
			
			return (
				<button 
					onClick={() => setLoading('default', true)}
					data-testid="start-default"
				>
					Start Default
				</button>
			);
		};

		const { getByTestId } = render(
			<LoadingProvider>
				<TestWithDefault />
			</LoadingProvider>
		);
		
		act(() => {
			getByTestId('start-default').click();
		});
		
		expect(getByTestId('loading-overlay').textContent).toBe('Loading default...');
	});
});