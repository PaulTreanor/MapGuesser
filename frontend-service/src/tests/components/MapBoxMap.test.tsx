import { render } from '@testing-library/react'
import React from 'react'
import MapboxMap from '../../components/MapBoxMap'
import { vi, describe, test, expect } from 'vitest'
import { LoadingProvider } from '../../context/LoadingContext'

vi.mock('mapbox-gl', () => ({
	default: {
		Map: vi.fn(() => ({
			on: vi.fn(),
			addControl: vi.fn(),
			getCanvas: vi.fn(() => ({ style: {} })),
            remove: vi.fn(),
            flyTo: vi.fn(),
            off: vi.fn(),
		})),
		NavigationControl: vi.fn(),
		Marker: vi.fn(() => ({
			setLngLat: vi.fn().mockReturnThis(),
			addTo: vi.fn().mockReturnThis(),
		})),
		accessToken: null,
	},
}))

// Mock LoadingOverlay to prevent rendering issues in tests
vi.mock('../../components/LoadingOverlay', () => ({
	default: ({ message }: { message: string }) => (
		<div data-testid="loading-overlay">{message}</div>
	)
}));

const renderWithLoading = (component: React.ReactElement) => {
	return render(
		<LoadingProvider>
			{component}
		</LoadingProvider>
	);
};

describe('MapboxMap', () => {
	const mockProps = {
		roundDetails: {
			location: 'Test Location',
			coordinates: [0, 0] as [number, number],
		},
		handleGuess: vi.fn(),
		isDisabled: false,
    }
    
    test('applies does not apply disabled class when isDisabled is false', () => {
		const { container } = renderWithLoading(<MapboxMap {...mockProps} isDisabled={false} />)
		expect(container.firstChild).not.toHaveClass('pointer-events-none')
	})

	test('applies disabled class when isDisabled is true', () => {
		const { container } = renderWithLoading(<MapboxMap {...mockProps} isDisabled={true} />)
		expect(container.firstChild).toHaveClass('pointer-events-none')
	})
})