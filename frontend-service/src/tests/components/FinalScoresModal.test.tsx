import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinalScoresModal } from '../../components/FinalScoresModal';
import type { Player, MultiplayerRound } from '../../types/MultiplayerServiceApiResponse.types';
import type { Pin } from '../../types/Game.types';

// Mock the Modal component to simplify testing
vi.mock('../../components/Modal', () => ({
	default: ({ children }: { children: React.ReactNode }) => <div data-testid="modal">{children}</div>,
}));

describe('FinalScoresModal Component', () => {
	const createPlayer = (id: string, name: string): Player => ({
		playerId: id,
		playerName: name,
		isGuest: false,
	});

	const createRound = (
		location: string,
		coordinates: Pin,
		guesses: { playerId: string; guessCoordinates: Pin }[]
	): MultiplayerRound => ({
		location: { location, coordinates },
		playerGuesses: guesses,
	});

	const players: Player[] = [
		createPlayer('p1', 'Alice'),
		createPlayer('p2', 'Bob'),
		createPlayer('p3', 'Charlie'),
	];

	// Rounds where Bob wins (closest total distance)
	const rounds: MultiplayerRound[] = [
		createRound('Paris', [48.8566, 2.3522], [
			{ playerId: 'p1', guessCoordinates: [48.8, 2.3] },      // Alice - close
			{ playerId: 'p2', guessCoordinates: [48.85, 2.35] },    // Bob - very close
			{ playerId: 'p3', guessCoordinates: [50.0, 4.0] },      // Charlie - far
		]),
		createRound('London', [51.5074, -0.1278], [
			{ playerId: 'p1', guessCoordinates: [51.0, 0.0] },      // Alice - medium
			{ playerId: 'p2', guessCoordinates: [51.5, -0.1] },     // Bob - very close
			{ playerId: 'p3', guessCoordinates: [52.0, 1.0] },      // Charlie - far
		]),
	];

	test('renders the modal with game complete message', () => {
		render(<FinalScoresModal players={players} rounds={rounds} />);

		expect(screen.getByText('Game Complete! Here are the final scores:')).toBeInTheDocument();
	});

	test('renders all player names', () => {
		render(<FinalScoresModal players={players} rounds={rounds} />);

		expect(screen.getByText(/Alice/)).toBeInTheDocument();
		expect(screen.getByText(/Bob/)).toBeInTheDocument();
		expect(screen.getByText(/Charlie/)).toBeInTheDocument();
	});

	test('displays scores in km for each player', () => {
		render(<FinalScoresModal players={players} rounds={rounds} />);

		const kmElements = screen.getAllByText(/km$/);
		expect(kmElements.length).toBe(3);
	});

	test('displays trophy emoji for the winner (lowest score)', () => {
		render(<FinalScoresModal players={players} rounds={rounds} />);

		// Bob should be the winner with the trophy emoji since he has the lowest total distance
		const winnerElement = screen.getByText(/🏆/);
		expect(winnerElement).toBeInTheDocument();
	});

	test('displays lower scores are better message', () => {
		render(<FinalScoresModal players={players} rounds={rounds} />);

		expect(screen.getByText('Lower scores are better!')).toBeInTheDocument();
	});

	test('handles player with no guesses in some rounds', () => {
		const roundsWithMissingGuess: MultiplayerRound[] = [
			createRound('Paris', [48.8566, 2.3522], [
				{ playerId: 'p1', guessCoordinates: [48.8, 2.3] },
				{ playerId: 'p2', guessCoordinates: [48.85, 2.35] },
				// p3 (Charlie) has no guess
			]),
		];

		render(<FinalScoresModal players={players} rounds={roundsWithMissingGuess} />);

		// Should still render all players
		expect(screen.getByText(/Alice/)).toBeInTheDocument();
		expect(screen.getByText(/Bob/)).toBeInTheDocument();
		expect(screen.getByText(/Charlie/)).toBeInTheDocument();
	});

	test('handles empty rounds array', () => {
		render(<FinalScoresModal players={players} rounds={[]} />);

		// All players should show 0 km since there are no rounds
		const zeroScores = screen.getAllByText('0 km');
		expect(zeroScores.length).toBe(3);
	});
});
