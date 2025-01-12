import { render, screen } from '@testing-library/react'
import React from 'react'
import MapboxMap from '../../components/MapBoxMap'
import { vi, describe, test, expect } from 'vitest'

// Mock mapbox-gl
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
		const { container } = render(<MapboxMap {...mockProps} isDisabled={false} />)
		expect(container.firstChild).not.toHaveClass('pointer-events-none')
	})

	test('applies disabled class when isDisabled is true', () => {
		const { container } = render(<MapboxMap {...mockProps} isDisabled={true} />)
		expect(container.firstChild).toHaveClass('pointer-events-none')
	})
})