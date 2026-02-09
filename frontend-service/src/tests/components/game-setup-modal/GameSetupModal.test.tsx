import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import GameSetupModal from '../../../components/game-setup-modal/GameSetupModal';

// Mock child components
vi.mock('../../../components/game-setup-modal/SinglePlayerStartMenu', () => ({
	default: () => <div data-testid="single-player-menu">Single Player Menu</div>
}));

vi.mock('../../../components/game-setup-modal/StartMultiplayerGameSetup', () => ({
	default: () => <div data-testid="start-multiplayer-menu">Start Multiplayer Menu</div>
}));

vi.mock('../../../components/game-setup-modal/JoinMultiplayerGameSetup', () => ({
	default: () => <div data-testid="join-multiplayer-menu">Join Multiplayer Menu</div>
}));

vi.mock('../../../components/game-setup-modal/Lobby', () => ({
	default: () => <div data-testid="lobby">Lobby Component</div>
}));

vi.mock('../../../components/MultiplayerGame', () => ({
	default: () => <div data-testid="multiplayer-game">Multiplayer Game Component</div>
}));

describe('GameSetupModal', () => {
	beforeEach(() => {
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

	test('navigates to single player mode when hash is #single-player', () => {
		window.location.hash = '#single-player';
		render(<GameSetupModal />);

		expect(screen.getByTestId('single-player-menu')).toBeInTheDocument();
	});

	test('navigates to start multiplayer mode when hash is #start-game', () => {
		window.location.hash = '#start-game';
		render(<GameSetupModal />);

		expect(screen.getByTestId('start-multiplayer-menu')).toBeInTheDocument();
	});

	test('navigates to join multiplayer mode when hash is #join-game', () => {
		window.location.hash = '#join-game';
		render(<GameSetupModal />);

		expect(screen.getByTestId('join-multiplayer-menu')).toBeInTheDocument();
	});

	test('navigates to lobby when hash is #lobby-GAMECODE', () => {
		window.location.hash = '#lobby-ABC123';
		render(<GameSetupModal />);

		expect(screen.getByTestId('lobby')).toBeInTheDocument();
	});

	test('renders MultiplayerGame without modal when hash is #game-GAMECODE', () => {
		window.location.hash = '#game-ABC123';
		render(<GameSetupModal />);

		expect(screen.getByTestId('multiplayer-game')).toBeInTheDocument();
		// Modal content should not be present
		expect(screen.queryByText(/For each round, try to pinpoint the city/)).not.toBeInTheDocument();
	});

	test('responds to hashchange events', () => {
		render(<GameSetupModal />);

		// Should start with select mode
		expect(screen.getByText('Single Player Game')).toBeInTheDocument();

		// Change hash
		window.location.hash = '#single-player';
		fireEvent(window, new Event('hashchange'));

		expect(screen.getByTestId('single-player-menu')).toBeInTheDocument();
		expect(screen.queryByText('Single Player Game')).not.toBeInTheDocument();
	});

	test('returns to select mode when hash is cleared', () => {
		window.location.hash = '#single-player';
		render(<GameSetupModal />);

		expect(screen.getByTestId('single-player-menu')).toBeInTheDocument();

		// Clear hash
		window.location.hash = '';
		fireEvent(window, new Event('hashchange'));

		expect(screen.getByText('Single Player Game')).toBeInTheDocument();
	});
});
