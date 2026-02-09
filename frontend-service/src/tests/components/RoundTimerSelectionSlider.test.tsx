import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoundTimerSelectionSlider from '../../components/roundTimerSelectionSlider';
import { TIMER_OPTIONS } from '../../objects/roundTimerSliderOptions';
import * as userPreferences from '../../services/userPreferences';

// Mock the userPreferences module
vi.mock('../../services/userPreferences', () => ({
	getTimerPreferences: vi.fn(() => ({
		roundTimerIndex: 5, // Default to "No timer"
		roundTimeMs: 0,
		hasTimer: false
	})),
	saveTimerPreferences: vi.fn(() => true)
}));

describe('RoundTimerSelectionSlider Component', () => {
	const mockGetTimerPreferences = vi.mocked(userPreferences.getTimerPreferences);

	// Mock window.innerWidth for testing responsive behavior
	const mockWindowInnerWidth = (width: number) => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: width
		});
		window.dispatchEvent(new Event('resize'));
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockGetTimerPreferences.mockReturnValue({
			roundTimerIndex: 5,
			roundTimeMs: 0,
			hasTimer: false
		});
	});

	test('renders with default "No timer" option selected', () => {
		const onChange = vi.fn();
		render(<RoundTimerSelectionSlider onChange={onChange} />);

		expect(screen.getByText('No timer')).toHaveClass('text-foreground font-medium');
	});

	test('displays desktop labels at desktop width', () => {
		mockWindowInnerWidth(1024);

		render(<RoundTimerSelectionSlider onChange={vi.fn()} />);

		TIMER_OPTIONS.forEach(option => {
			expect(screen.getByText(option.desktopLabel)).toBeInTheDocument();
		});
	});

	test('displays mobile labels at mobile width', async () => {
		mockWindowInnerWidth(500);

		render(<RoundTimerSelectionSlider onChange={vi.fn()} />);

		await vi.waitFor(() => {
			const mobileLabels = TIMER_OPTIONS
				.filter(option => option.mobileLabel !== option.desktopLabel)
				.map(option => option.mobileLabel);

			for (const label of mobileLabels) {
				expect(screen.getByText(label)).toBeInTheDocument();
			}

			const desktopOnlyLabels = TIMER_OPTIONS
				.filter(option => option.mobileLabel !== option.desktopLabel)
				.map(option => option.desktopLabel);

			for (const label of desktopOnlyLabels) {
				expect(screen.queryByText(label)).not.toBeInTheDocument();
			}
		});
	});

	test('calls onChange with saved preferences on mount', () => {
		const onChange = vi.fn();
		mockGetTimerPreferences.mockReturnValue({
			roundTimerIndex: 2,
			roundTimeMs: 20000,
			hasTimer: true
		});

		render(<RoundTimerSelectionSlider onChange={onChange} />);

		// Should be called with the saved preferences
		expect(onChange).toHaveBeenCalledWith(true, 20000);
	});

	test('calls onChange with false and 0 when no timer is selected', () => {
		const onChange = vi.fn();
		mockGetTimerPreferences.mockReturnValue({
			roundTimerIndex: 5,
			roundTimeMs: 0,
			hasTimer: false
		});

		render(<RoundTimerSelectionSlider onChange={onChange} />);

		expect(onChange).toHaveBeenCalledWith(false, 0);
	});

	test('renders with saved timer preference selected', () => {
		mockWindowInnerWidth(1024); // Ensure desktop labels are shown
		const onChange = vi.fn();
		mockGetTimerPreferences.mockReturnValue({
			roundTimerIndex: 1,
			roundTimeMs: 10000,
			hasTimer: true
		});

		render(<RoundTimerSelectionSlider onChange={onChange} />);

		// The 10 seconds option should be highlighted
		expect(screen.getByText('10 seconds')).toHaveClass('text-foreground font-medium');
	});

	test('applies disabled styling when disabled prop is true', () => {
		const onChange = vi.fn();
		render(<RoundTimerSelectionSlider onChange={onChange} disabled={true} />);

		// The container should have opacity-50 class
		const container = screen.getByText('No timer').closest('.w-full');
		expect(container).toHaveClass('opacity-50');
	});

	test('does not apply disabled styling when disabled prop is false', () => {
		const onChange = vi.fn();
		render(<RoundTimerSelectionSlider onChange={onChange} disabled={false} />);

		const container = screen.getByText('No timer').closest('.w-full');
		expect(container).not.toHaveClass('opacity-50');
	});
});
