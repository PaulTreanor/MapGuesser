import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import DiscreteTimeSlider, { TIMER_OPTIONS } from '../../components/roundTimerSelectionSlider';

describe('DiscreteTimeSlider Component', () => {
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
		render(<DiscreteTimeSlider onChange={onChange} />);

		expect(screen.getByText('No timer')).toHaveClass('text-foreground font-medium');
		// Should call onChange with hasTimer=false and timeMs=0 (No timer)
		expect(onChange).toHaveBeenCalledWith(false, 0);
	});

	test('should display desktop labels at desktop width', () => {
		// Set desktop width
		mockWindowInnerWidth(1024);
		
		render(<DiscreteTimeSlider onChange={vi.fn()} />);
		
		TIMER_OPTIONS.forEach(option => {
			expect(screen.getByText(option.desktopLabel)).toBeInTheDocument();
		});
	});

	test('should display mobile labels at mobile width', async () => {
		// Set mobile width
		mockWindowInnerWidth(500);
		
		render(<DiscreteTimeSlider onChange={vi.fn()} />);

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