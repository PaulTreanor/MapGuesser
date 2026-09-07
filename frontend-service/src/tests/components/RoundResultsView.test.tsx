import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoundResultsView } from '../../components/RoundResultsView';
import type { Player, MultiplayerRound } from '../../types/MultiplayerServiceApiResponse.types';
import type { Pin } from '../../types/Game.types';

// Mock the MapboxMap component
vi.mock('../../components/MapBoxMap', () => ({
	default: () => <div data-testid="mapbox-map">MapboxMap</div>,
}));

describe('RoundResultsView Component', () => {
	const createPlayer = (id: string, name: string): Player => ({
		playerId: id,
		playerName: name,
		isGuest: false,
	});

	const players: Player[] = [
		createPlayer('p1', 'Alice'),
		createPlayer('p2', 'Bob'),
	];

	const currentRound: MultiplayerRound = {
		location: {
			location: 'Paris',
			coordinates: [48.8566, 2.3522] as Pin,
		},
		playerGuesses: [
			{ playerId: 'p1', guessCoordinates: [48.8, 2.3] as Pin },
			{ playerId: 'p2', guessCoordinates: [49.0, 3.0] as Pin },
		],
	};

	const roundDetails = {
		location: 'Paris',
		coordinates: [48.8566, 2.3522] as Pin,
	};

	const multiplayerResultsData = {
		playerGuesses: currentRound.playerGuesses,
		players: players,
		actualLocation: [48.8566, 2.3522] as Pin,
	};

	const defaultProps = {
		players,
		currentRound,
		currentRoundNumber: 1,
		numberOfRounds: 3,
		isGameOwner: false,
		roundDetails,
		multiplayerResultsData,
		onNextRound: vi.fn(),
	};

	test('renders the round heading with location', () => {
		render(<RoundResultsView {...defaultProps} />);

		expect(screen.getByText('Round 1 - Paris')).toBeInTheDocument();
	});

	test('renders all player names in the scoreboard', () => {
		render(<RoundResultsView {...defaultProps} />);

		expect(screen.getByText(/Alice/)).toBeInTheDocument();
		expect(screen.getByText(/Bob/)).toBeInTheDocument();
	});

	test('displays distances in km for players', () => {
		render(<RoundResultsView {...defaultProps} />);

		const kmElements = screen.getAllByText(/\d+ km$/);
		expect(kmElements.length).toBe(2);
	});

	test('displays target emoji for the round winner', () => {
		render(<RoundResultsView {...defaultProps} />);

		expect(screen.getByText(/🎯/)).toBeInTheDocument();
	});

	test('shows "Next Round" button for game owner when not last round', () => {
		render(<RoundResultsView {...defaultProps} isGameOwner={true} />);

		expect(screen.getByRole('button', { name: 'Next Round' })).toBeInTheDocument();
	});

	test('shows "See Final Scores" button for game owner on last round', () => {
		render(
			<RoundResultsView
				{...defaultProps}
				isGameOwner={true}
				currentRoundNumber={3}
				numberOfRounds={3}
			/>
		);

		expect(screen.getByRole('button', { name: 'See Final Scores' })).toBeInTheDocument();
	});

	test('calls onNextRound when button is clicked', () => {
		const onNextRound = vi.fn();
		render(
			<RoundResultsView
				{...defaultProps}
				isGameOwner={true}
				onNextRound={onNextRound}
			/>
		);

		fireEvent.click(screen.getByRole('button', { name: 'Next Round' }));

		expect(onNextRound).toHaveBeenCalledTimes(1);
	});

	test('shows waiting message for non-game owner', () => {
		render(<RoundResultsView {...defaultProps} isGameOwner={false} />);

		expect(screen.getByText('Waiting for host to continue...')).toBeInTheDocument();
	});

	test('does not show button for non-game owner', () => {
		render(<RoundResultsView {...defaultProps} isGameOwner={false} />);

		expect(screen.queryByRole('button', { name: 'Next Round' })).not.toBeInTheDocument();
		expect(screen.queryByRole('button', { name: 'See Final Scores' })).not.toBeInTheDocument();
	});

	test('handles player with no guess', () => {
		const roundWithMissingGuess: MultiplayerRound = {
			...currentRound,
			playerGuesses: [
				{ playerId: 'p1', guessCoordinates: [48.8, 2.3] as Pin },
				// p2 (Bob) has no guess
			],
		};

		render(
			<RoundResultsView
				{...defaultProps}
				currentRound={roundWithMissingGuess}
			/>
		);

		expect(screen.getByText('No guess')).toBeInTheDocument();
	});

	test('shows "Timed out" for a player whose guess timed out', () => {
		const roundWithTimedOutGuess: MultiplayerRound = {
			...currentRound,
			playerGuesses: [
				{ playerId: 'p1', guessCoordinates: [48.8, 2.3] as Pin },
				{ playerId: 'p2', timedOut: true },
			],
		};

		render(
			<RoundResultsView
				{...defaultProps}
				currentRound={roundWithTimedOutGuess}
			/>
		);

		expect(screen.getByText('Timed out')).toBeInTheDocument();
	});

	test('renders the MapboxMap component', () => {
		render(<RoundResultsView {...defaultProps} />);

		expect(screen.getByTestId('mapbox-map')).toBeInTheDocument();
	});
});
