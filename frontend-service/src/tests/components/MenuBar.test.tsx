import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MenuBar from '../../components/menu-bar/MenuBar';
import { numberOfRoundsInGame } from '../../objects/gameConsts';
import * as gameStore from '../../store/gameStore';
import * as roundStore from '../../store/roundStore';
import * as multiplayerStore from '../../store/multiplayerStore';

// Mock the Zustand stores
vi.mock('../../store/gameStore');
vi.mock('../../store/roundStore');
vi.mock('../../store/multiplayerStore');

// Mock AboutModal
vi.mock('../../components/AboutModal', () => ({
	default: ({ onClose }: { onClose: () => void }) => (
		<div data-testid="about-modal">
			<button onClick={onClose}>Close</button>
		</div>
	)
}));

describe('MenuBar Component', () => {
	const mockUseGameStore = vi.mocked(gameStore.useGameStore);
	const mockUseRoundStore = vi.mocked(roundStore.useRoundStore);
	const mockUseMultiplayerStore = vi.mocked(multiplayerStore.useMultiplayerStore);

	beforeEach(() => {
		vi.clearAllMocks();
		// Default to single player mode (no multiplayer context)
		mockUseMultiplayerStore.mockReturnValue({ gameContext: null } as any);
	});

	describe('Single Player Mode', () => {
		test('renders Settings and About buttons', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('ℹ️')).toBeInTheDocument();
		});

		test('renders the MapGuesser logo', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('🌎 MapGuesser')).toBeInTheDocument();
		});

		test('renders score and round info starting from round 0 (displayed as round 1)', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('0 pts')).toBeInTheDocument();
			expect(screen.getByText(`1/${numberOfRoundsInGame}`)).toBeInTheDocument();
		});

		test('renders score and round info when on round 1 or higher', () => {
			mockUseGameStore.mockReturnValue({ score: 150 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 1 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('150 pts')).toBeInTheDocument();
			expect(screen.getByText(`2/${numberOfRoundsInGame}`)).toBeInTheDocument();
		});

		test('displays correct score formatting', () => {
			mockUseGameStore.mockReturnValue({ score: 2500 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 2 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('2500 pts')).toBeInTheDocument();
		});

		test('displays correct round progression', () => {
			mockUseGameStore.mockReturnValue({ score: 100 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 3 } } as any);

			render(<MenuBar />);

			expect(screen.getByText(`4/${numberOfRoundsInGame}`)).toBeInTheDocument();
		});

		test('renders score and round info on the last round', () => {
			mockUseGameStore.mockReturnValue({ score: 1000 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: numberOfRoundsInGame - 1 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('1000 pts')).toBeInTheDocument();
			expect(screen.getByText(`${numberOfRoundsInGame}/${numberOfRoundsInGame}`)).toBeInTheDocument();
		});

		test('handles zero score correctly on active rounds', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 1 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('0 pts')).toBeInTheDocument();
		});

		test('handles high scores correctly', () => {
			mockUseGameStore.mockReturnValue({ score: 99999 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 1 } } as any);

			render(<MenuBar />);

			expect(screen.getByText('99999 pts')).toBeInTheDocument();
		});
	});

	describe('Multiplayer Mode', () => {
		test('displays guessed count instead of score in multiplayer mode', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);
			mockUseMultiplayerStore.mockReturnValue({
				gameContext: {
					gameStateMachinePhase: 'inRound',
					currentRound: 1,
					numberOfRounds: 5,
					players: [{ playerId: '1' }, { playerId: '2' }, { playerId: '3' }],
					rounds: [{ playerGuesses: [{ playerId: '1' }] }],
				}
			} as any);

			render(<MenuBar />);

			// Should show "1/3 guessed" (1 player guessed out of 3)
			expect(screen.getByText('1/3')).toBeInTheDocument();
		});

		test('displays multiplayer round info from gameContext', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);
			mockUseMultiplayerStore.mockReturnValue({
				gameContext: {
					gameStateMachinePhase: 'inRound',
					currentRound: 3,
					numberOfRounds: 5,
					players: [{ playerId: '1' }],
					rounds: [
						{ playerGuesses: [] },
						{ playerGuesses: [] },
						{ playerGuesses: [] },
					],
				}
			} as any);

			render(<MenuBar />);

			expect(screen.getByText('3/5')).toBeInTheDocument();
		});

		test('shows 0 guesses when no players have guessed yet', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);
			mockUseMultiplayerStore.mockReturnValue({
				gameContext: {
					gameStateMachinePhase: 'inRound',
					currentRound: 1,
					numberOfRounds: 5,
					players: [{ playerId: '1' }, { playerId: '2' }],
					rounds: [{ playerGuesses: [] }],
				}
			} as any);

			render(<MenuBar />);

			expect(screen.getByText('0/2')).toBeInTheDocument();
		});
	});

	describe('About Modal', () => {
		test('opens About modal when info button is clicked', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

			render(<MenuBar />);

			expect(screen.queryByTestId('about-modal')).not.toBeInTheDocument();

			fireEvent.click(screen.getByText('ℹ️'));

			expect(screen.getByTestId('about-modal')).toBeInTheDocument();
		});

		test('closes About modal when close is triggered', () => {
			mockUseGameStore.mockReturnValue({ score: 0 } as any);
			mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

			render(<MenuBar />);

			// Open modal
			fireEvent.click(screen.getByText('ℹ️'));
			expect(screen.getByTestId('about-modal')).toBeInTheDocument();

			// Close modal
			fireEvent.click(screen.getByText('Close'));
			expect(screen.queryByTestId('about-modal')).not.toBeInTheDocument();
		});
	});
});
