import React from 'react';
import { render, screen } from '@testing-library/react';
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

describe('MultiplayerGame', () => {
	beforeEach(() => {
		vi.clearAllMocks();
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
});