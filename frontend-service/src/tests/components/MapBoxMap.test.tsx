import { render } from '@testing-library/react'
import React from 'react'
import MapboxMap from '../../components/MapBoxMap'
import { vi, describe, test, expect } from 'vitest'
import { LoadingProvider } from '../../context/LoadingContext'
import mapboxgl from 'mapbox-gl'

vi.mock('mapbox-gl', () => {
	const canvas = { style: {} as Record<string, string> };
	return {
		default: {
			Map: vi.fn(() => ({
				canvas,
				on: vi.fn(),
				addControl: vi.fn(),
				getCanvas: vi.fn(() => canvas),
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
	};
})

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
    
    test('does not apply disabled class when isDisabled is false', () => {
		const { container } = renderWithLoading(<MapboxMap {...mockProps} isDisabled={false} />)
		expect(container.firstChild).not.toHaveClass('pointer-events-none')
	})

	test('keeps the map interactive (pan/zoom) when isDisabled is true', () => {
		const { container } = renderWithLoading(<MapboxMap {...mockProps} isDisabled={true} />)
		expect(container.firstChild).not.toHaveClass('pointer-events-none')
	})

	test('sets a grab cursor when isDisabled is true so the map stays pannable', () => {
		renderWithLoading(<MapboxMap {...mockProps} isDisabled={true} />)

		const mockMapInstance = vi.mocked(mapboxgl.Map).mock.results[0]?.value as {
			getCanvas: () => { style: Record<string, string> };
		};

		expect(mockMapInstance.getCanvas().style.cursor).toBe('grab');
	})
})