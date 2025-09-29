import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import GameSetupModal from '../../../components/game-setup-modal/GameSetupModal'

// Mock Clerk hooks
vi.mock('@clerk/clerk-react', () => ({
	useAuth: vi.fn(() => ({ isSignedIn: false })),
	useClerk: vi.fn(() => ({ openSignIn: vi.fn() }))
}));

// Mock child components
vi.mock('../../../components/game-setup-modal/SinglePlayerStartMenu', () => ({
	default: ({ setGameState }: { setGameState: () => void }) => (
		<div data-testid="single-player-menu">
			<button onClick={setGameState}>Start Game!</button>
		</div>
	)
}));

vi.mock('../../../components/game-setup-modal/MultiplayerMode', () => ({
	default: () => <div data-testid="multiplayer-mode">Multiplayer Mode</div>
}));

describe('GameSetupModal', () => {
	const mockSetGameState = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset hash
		window.location.hash = '';
	});

	test('renders modal with heading and description', () => {
		render(<GameSetupModal setGameState={mockSetGameState} />);
		
		expect(screen.getByText(/mapguesser/i)).toBeInTheDocument();
		expect(screen.getByText(/For each round, try to pinpoint the city/)).toBeInTheDocument();
	});

	test('renders SelectGameModeMenu by default', () => {
		render(<GameSetupModal setGameState={mockSetGameState} />);
		
		expect(screen.getByText('Single Player Game')).toBeInTheDocument();
		expect(screen.getByText('Start Multiplayer Game')).toBeInTheDocument();
	});

	test('navigates to single player mode when hash changes', () => {
		render(<GameSetupModal setGameState={mockSetGameState} />);
		
		// Change hash to single-player
		window.location.hash = '#single-player';
		fireEvent(window, new Event('hashchange'));
		
		expect(screen.getByTestId('single-player-menu')).toBeInTheDocument();
		expect(screen.getByText('Start Game!')).toBeInTheDocument();
	});

	test('navigates to multiplayer mode when hash changes', () => {
		render(<GameSetupModal setGameState={mockSetGameState} />);
		
		// Change hash to start-game
		window.location.hash = '#start-game';
		fireEvent(window, new Event('hashchange'));
		
		expect(screen.getByTestId('multiplayer-mode')).toBeInTheDocument();
	});

	test('calls setGameState when single player game starts', () => {
		render(<GameSetupModal setGameState={mockSetGameState} />);
		
		// Navigate to single player
		window.location.hash = '#single-player';
		fireEvent(window, new Event('hashchange'));
		
		// Click start game
		const startButton = screen.getByText('Start Game!');
		fireEvent.click(startButton);
		
		expect(mockSetGameState).toHaveBeenCalled();
	});
})