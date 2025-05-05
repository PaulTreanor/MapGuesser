import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from '../../components/Game';
import { Round } from '@/components/types/Game.types';
import * as useFetchHook from '../../hooks/useFetch';

vi.mock('../../components/MapBoxMap', () => ({
	default: vi.fn(() => <div data-testid="mock-mapbox">🌎</div>)
}));

vi.mock('../../hooks/useFetch', () => ({
	useFetch: vi.fn()
}));

const mockRounds = [
	{ location: 'Test Location', coordinates: [0, 0] } as Round
];

const mockResponse = {
	data: { data: mockRounds },
	isPending: false,
	error: null
};

describe('Game Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useFetchHook.useFetch).mockReturnValue(mockResponse);
	});

	test('should render mapbox map component', async () => {
		render(<Game/>);
		
		await waitFor(() => {
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
		});
		
		expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
	});

	test('should render start modal', async () => {
		render(<Game/>);
		
		await waitFor(() => {
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
		});

		expect(screen.getByText('For each round, try to pinpoint the city on the map. The map supports panning and zooming.')).toBeInTheDocument();
	});

	test('should start game with Start Game! button clicked', async () => {
		render(<Game />);
		
		await waitFor(() => {
			expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
		});
		
		const startButton = screen.getByRole('button', { name: 'Start Game!' });
		fireEvent.click(startButton);

		expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
		// Game data should be rendered (round counter, score, location question)
		expect(screen.getByText('1/5')).toBeInTheDocument();
		expect(screen.getByText(/Where is/)).toBeInTheDocument();
		expect(screen.getByText('Test Location')).toBeInTheDocument();
		expect(screen.getByText('0 points')).toBeInTheDocument();

		const nextRoundButton = screen.queryByRole('button', { name: 'Next Round' });
		expect(nextRoundButton).not.toBeInTheDocument();
	});

	test('should render error state if useFetch returns empty array', async () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: { data: [] },
			isPending: false,
			error: null
		});

		render(<Game />);
		
		await waitFor(() => {
			expect(screen.getByText("Error loading game data. Please try again later.")).toBeInTheDocument();
		});
	});
	
	test('should render error state if useFetch returns error', () => {
		// Mock the hook to return isPending: false initially
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: false,
			error: "Network error"
		});

		render(<Game />);
		
		expect(screen.getByText("Error loading game data. Please try again later.")).toBeInTheDocument();
	});

	test('should render loading state if useFetch is pending', () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});

		render(<Game />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});
});
