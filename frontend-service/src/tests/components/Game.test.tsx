import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Game from '../../components/Game';
import { Round } from '@/components/types/Game.types';
import * as useFetchHook from '../../hooks/useFetch';
import { LoadingProvider } from '../../context/LoadingContext';

vi.mock('../../components/MapBoxMap', () => ({
	default: vi.fn(() => <div data-testid="mock-mapbox">🌎</div>)
}));

vi.mock('../../hooks/useFetch', () => ({
	useFetch: vi.fn()
}));

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
	useAuth: vi.fn(() => ({ isSignedIn: false })),
	useClerk: vi.fn(() => ({ openSignIn: vi.fn() }))
}));

// Mock LoadingOverlay to prevent rendering issues in tests
vi.mock('../../components/LoadingOverlay', () => ({
	default: ({ message }: { message: string }) => (
		<div data-testid="loading-overlay">{message}</div>
	)
}));

const mockRounds = [
	{ location: 'Test Location', coordinates: [0, 0] } as Round
];

const mockResponse = {
	data: { data: mockRounds },
	isPending: false,
	error: null
};

const renderWithLoading = (component: React.ReactElement) => {
	return render(
		<LoadingProvider>
			{component}
		</LoadingProvider>
	);
};

describe('Game Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(useFetchHook.useFetch).mockReturnValue(mockResponse);
	});

	test('should render mapbox map component', async () => {
		renderWithLoading(<Game/>);
		
		await waitFor(() => {
			expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
		});
		
		expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
	});

	test('should render start modal', async () => {
		renderWithLoading(<Game/>);
		
		await waitFor(() => {
			expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
		});

		expect(screen.getByText("For each round, try to pinpoint the city on the map. Scores are based on how far your guess is from the city's real location, so lower scores are better.")).toBeInTheDocument();
	});

	test('should start single player game with Start Game! button clicked', async () => {
		renderWithLoading(<Game />);
		
		await waitFor(() => {
			expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
		});

		const singlePlayerCardNode = screen.getByText("Single Player Game");
		fireEvent.click(singlePlayerCardNode)

		await waitFor(() => {
			const startButton = screen.getByRole('button', { name: 'Start Game!' });
			fireEvent.click(startButton);
		});
		
		expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
		expect(screen.getByText(/Where is/)).toBeInTheDocument();
		expect(screen.getByText('Test Location')).toBeInTheDocument();

		const nextRoundButton = screen.queryByRole('button', { name: 'Next Round' });
		expect(nextRoundButton).not.toBeInTheDocument();
	});

	test('should render error state if useFetch returns empty array', async () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: { data: [] },
			isPending: false,
			error: null
		});

		renderWithLoading(<Game />);
		
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

		renderWithLoading(<Game />);
		
		expect(screen.getByText("Error loading game data. Please try again later.")).toBeInTheDocument();
	});

	test('should render loading state if useFetch is pending', () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});

		renderWithLoading(<Game />);

		expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
		expect(screen.getByText('Loading game locations...')).toBeInTheDocument();
	});
});
