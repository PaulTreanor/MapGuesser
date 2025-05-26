import React from 'react';
import { render } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';
import LoadingOverlay from '../../components/LoadingOverlay';

// Mock the MapGuesserHeading component
vi.mock('../../components/typography/MapGuesserHeading', () => ({
	MapGuesserHeading: () => <div data-testid="mapguesser-heading">MapGuesser</div>
}));

describe('LoadingOverlay', () => {
	test('should render with provided message', () => {
		const message = 'Loading game assets...';
		const { getByText, getByTestId } = render(
			<LoadingOverlay message={message} />
		);
		
		expect(getByText(message)).toBeInTheDocument();
		expect(getByTestId('mapguesser-heading')).toBeInTheDocument();
	});

	test('should have spinning loader animation', () => {
		const { container } = render(
			<LoadingOverlay message="Loading..." />
		);
		
		const spinner = container.querySelector('.animate-spin');
		expect(spinner).toBeInTheDocument();
	});
});