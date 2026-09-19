import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import MultiplayerGame from '../../components/MultiplayerGame';
import { ConnectionStatus } from '../../objects/connectionStatuses';
import type { GameContext } from '../../types/MultiplayerServiceApiResponse.types';

const mockSendMessage = vi.fn();

vi.mock('../../store/multiplayerStore', () => ({
	useMultiplayerStore: () => ({
		gameData: null,
		gameContext: mockGameContext,
		setPlayers: vi.fn(),
		setGameContext: vi.fn(),
	})
}));

let mockGameContext: GameContext | null = null;

vi.mock('../../hooks/useGameRoom', () => ({
	useGameRoom: () => ({
		connectionStatus: ConnectionStatus.CONNECTED,
		sendMessage: mockSendMessage,
		disconnect: vi.fn(),
	})
}));

vi.mock('../../utils/guestIdentityUtils', () => ({
	getPlayerIdentity: () => ({
		playerId: 'player-1',
		playerName: 'Player 1',
		isGuest: true,
	})
}));

vi.mock('../../utils/gameHashUtils', () => ({
	getGameCodeFromHash: () => 'ABC123',
}));

vi.mock('../../components/MapBoxMap', () => ({
	default: () => <div data-testid="mock-map">Map</div>,
}));

vi.mock('../../components/countDownProgressBar', () => ({
	default: ({ progressBarFullTimeStamp, isLockedIn }: { progressBarFullTimeStamp: number; isLockedIn?: boolean }) => (
		<div data-testid="countdown-bar" data-timestamp={progressBarFullTimeStamp} data-locked-in={isLockedIn ? 'true' : 'false'} />
	),
}));

const buildInRoundContext = (roundEndTimeStamp?: number, playerGuesses: { playerId: string; guessCoordinates?: [number, number] }[] = []): GameContext => ({
	gameOwnerId: 'player-1',
	timer: roundEndTimeStamp ? 60000 : undefined,
	players: [
		{ playerId: 'player-1', playerName: 'Player 1', isGuest: true },
		{ playerId: 'player-2', playerName: 'Player 2', isGuest: true },
	],
	numberOfRounds: 5,
	rounds: [
		{
			location: { location: 'Paris', coordinates: [2.3522, 48.8566] },
			playerGuesses,
			roundEndTimeStamp,
		},
	],
	gameStateMachinePhase: 'inRound',
	currentRound: 1,
});

const buildShowResultContext = (gameStateMachinePhase: GameContext['gameStateMachinePhase'] = 'showResult'): GameContext => ({
	gameOwnerId: 'player-1',
	players: [
		{ playerId: 'player-1', playerName: 'Player 1', isGuest: true },
		{ playerId: 'player-2', playerName: 'Player 2', isGuest: true },
	],
	numberOfRounds: 5,
	rounds: [
		{
			location: { location: 'Paris', coordinates: [2.3522, 48.8566] },
			playerGuesses: [
				{ playerId: 'player-1', guessCoordinates: [2.4, 48.8] },
				{ playerId: 'player-2', guessCoordinates: [2.3, 48.9] },
			],
		},
	],
	gameStateMachinePhase,
	currentRound: 5,
});

describe('MultiplayerGame', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.location.hash = '';
		mockGameContext = null;
	});

	test('renders countdown bar when current round has a roundEndTimeStamp', () => {
		const roundEndTimeStamp = Date.now() + 60000;
		mockGameContext = buildInRoundContext(roundEndTimeStamp);

		render(<MultiplayerGame />);

		const countdownBar = screen.getByTestId('countdown-bar');
		expect(countdownBar).toHaveAttribute('data-timestamp', String(roundEndTimeStamp));
		expect(countdownBar).toHaveAttribute('data-locked-in', 'false');
	});

	test('does not render countdown bar when current round has no roundEndTimeStamp', () => {
		mockGameContext = buildInRoundContext();

		render(<MultiplayerGame />);

		expect(screen.queryByTestId('countdown-bar')).not.toBeInTheDocument();
	});

	test('locks in the countdown bar when the current player has guessed', () => {
		const roundEndTimeStamp = Date.now() + 60000;
		mockGameContext = buildInRoundContext(roundEndTimeStamp, [
			{ playerId: 'player-1', guessCoordinates: [2.3, 48.8] },
		]);

		render(<MultiplayerGame />);

		const countdownBar = screen.getByTestId('countdown-bar');
		expect(countdownBar).toHaveAttribute('data-locked-in', 'true');
	});

	test('sends return_to_lobby when the game owner clicks Play Again', () => {
		mockGameContext = buildShowResultContext();

		render(<MultiplayerGame />);

		fireEvent.click(screen.getByText('Play Again'));

		expect(mockSendMessage).toHaveBeenCalledWith({ type: 'return_to_lobby' });
	});

	test('shows a waiting message instead of Play Again for non-owners', () => {
		mockGameContext = {
			...buildShowResultContext(),
			gameOwnerId: 'player-2',
		};

		render(<MultiplayerGame />);

		expect(screen.queryByText('Play Again')).not.toBeInTheDocument();
		expect(screen.getByText('Waiting for host to start a new game...')).toBeInTheDocument();
	});

	test('redirects to the lobby hash when the game phase returns to lobby', async () => {
		window.location.hash = '#game-ABC123';
		mockGameContext = buildShowResultContext('lobby');

		render(<MultiplayerGame />);

		expect(screen.getByText('Returning to lobby...')).toBeInTheDocument();
		await waitFor(() => expect(window.location.hash).toBe('#lobby-ABC123'));
	});
});