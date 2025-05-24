import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RoundTimerSelectionSlider from '../../components/roundTimerSelectionSlider';
import { TIMER_OPTIONS } from '../../objects/roundTimerSliderOptions';

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
	// Mock window.innerWidth for testing responsive behavior
	const mockWindowInnerWidth = (width: number) => {
		Object.defineProperty(window, 'innerWidth', {
			writable: true,
			configurable: true,
			value: width
		});
		// Trigger the resize event
		window.dispatchEvent(new Event('resize'));
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('should render with default "No timer" option selected', () => {
		const onChange = vi.fn();
		render(<RoundTimerSelectionSlider onChange={onChange} />);

		expect(screen.getByText('No timer')).toHaveClass('text-foreground font-medium');
	});

	test('should display desktop labels at desktop width', () => {
		// Set desktop width
		mockWindowInnerWidth(1024);
		
		render(<RoundTimerSelectionSlider onChange={vi.fn()} />);
		
		TIMER_OPTIONS.forEach(option => {
			expect(screen.getByText(option.desktopLabel)).toBeInTheDocument();
		});
	});

	test('should display mobile labels at mobile width', async () => {
		// Set mobile width
		mockWindowInnerWidth(500);
		
		render(<RoundTimerSelectionSlider onChange={vi.fn()} />);

		// Wait for the resize logic to take effect
		await vi.waitFor(() => {
			// Check for mobile labels
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
});