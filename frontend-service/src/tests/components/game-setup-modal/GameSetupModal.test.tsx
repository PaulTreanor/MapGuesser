import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import GameSetupModal from '../../../components/game-setup-modal/GameSetupModal'

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
	useAuth: vi.fn(() => ({ isSignedIn: false })),
	useClerk: vi.fn(() => ({ openSignIn: vi.fn() }))
}));

// Mock game store
const mockStartGame = vi.fn();
vi.mock('../../../store/gameStore', () => ({
	useGameStore: vi.fn(() => ({
		setDoesGameHaveTimer: vi.fn(),
		setRoundTimeMs: vi.fn(),
		startGame: mockStartGame,
	}))
}));

// Mock child components
vi.mock('../../../components/game-setup-modal/SinglePlayerStartMenu', () => ({
	default: () => (
		<div data-testid="single-player-menu">
			<button onClick={mockStartGame}>Start Game!</button>
		</div>
	)
}));

vi.mock('../../../components/game-setup-modal/StartMultiPlayerGameSetup', () => ({
	default: () => <div data-testid="multiplayer-mode">Multiplayer Mode</div>
}));

describe('GameSetupModal', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// Reset hash
		window.location.hash = '';
	});

	test('renders modal with heading and description', () => {
		render(<GameSetupModal />);
		
		expect(screen.getByText(/mapguesser/i)).toBeInTheDocument();
		expect(screen.getByText(/For each round, try to pinpoint the city/)).toBeInTheDocument();
	});

	test('renders SelectGameModeMenu by default', () => {
		render(<GameSetupModal />);
		
		expect(screen.getByText('Single Player Game')).toBeInTheDocument();
		expect(screen.getByText('Start Multiplayer Game')).toBeInTheDocument();
	});

	test('navigates to single player mode when hash changes', () => {
		render(<GameSetupModal />);
		
		// Change hash to single-player
		window.location.hash = '#single-player';
		fireEvent(window, new Event('hashchange'));
		
		expect(screen.getByTestId('single-player-menu')).toBeInTheDocument();
		expect(screen.getByText('Start Game!')).toBeInTheDocument();
	});

	test('navigates to multiplayer mode when hash changes', () => {
		render(<GameSetupModal />);
		
		// Change hash to start-game
		window.location.hash = '#start-game';
		fireEvent(window, new Event('hashchange'));
		
		expect(screen.getByTestId('multiplayer-mode')).toBeInTheDocument();
	});

	test('calls startGame from store when single player game starts', () => {
		render(<GameSetupModal />);

		// Navigate to single player
		window.location.hash = '#single-player';
		fireEvent(window, new Event('hashchange'));

		// Click start game
		const startButton = screen.getByText('Start Game!');
		fireEvent.click(startButton);

		expect(mockStartGame).toHaveBeenCalled();
	});
})