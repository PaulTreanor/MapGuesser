import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Lobby from '../../../components/game-setup-modal/Lobby';

// Mock Clerk hooks
const mockUseUser = vi.fn();
vi.mock('@clerk/clerk-react', () => ({
	useUser: () => mockUseUser()
}));

// Mock multiplayer store
const mockGameData = vi.fn();
vi.mock('../../../store/multiplayerStore', () => ({
	useMultiplayerStore: () => ({
		gameData: mockGameData()
	})
}));

describe('Lobby', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.location.hash = '';
	});

	test('displays game code heading and instructions', () => {
		window.location.hash = '#lobby-XYZ789';
		mockUseUser.mockReturnValue({ user: null, isSignedIn: false });
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.getByText('Game Code')).toBeInTheDocument();
		expect(screen.getByText('Share this code with your friends to join the game!')).toBeInTheDocument();
	});

	test('displays game code from URL hash', () => {
		window.location.hash = '#lobby-ABC123';
		mockUseUser.mockReturnValue({ user: null, isSignedIn: false });
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.getByText('ABC123')).toBeInTheDocument();
	});

	test('displays waiting for players message', () => {
		window.location.hash = '#lobby-ABC123';
		mockUseUser.mockReturnValue({ user: null, isSignedIn: false });
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.getByText('Players in lobby:')).toBeInTheDocument();
		expect(screen.getByText('Waiting for players to join...')).toBeInTheDocument();
	});

	test('does not show Start Game button when user is not game owner', () => {
		window.location.hash = '#lobby-ABC123';
		mockUseUser.mockReturnValue({
			user: { id: 'user_999' },
			isSignedIn: true
		});
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'user_123'
		});

		render(<Lobby />);

		expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
	});

	test('shows Start Game button when user is game owner', () => {
		window.location.hash = '#lobby-ABC123';
		mockUseUser.mockReturnValue({
			user: { id: 'user_123' },
			isSignedIn: true
		});
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'user_123'
		});

		render(<Lobby />);

		expect(screen.getByText('Start Game')).toBeInTheDocument();
	});

	test('does not show Start Game button when user is not signed in', () => {
		window.location.hash = '#lobby-ABC123';
		mockUseUser.mockReturnValue({
			user: null,
			isSignedIn: false
		});
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'user_123'
		});

		render(<Lobby />);

		expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
	});

	test('does not show Start Game button when gameData is null', () => {
		window.location.hash = '#lobby-ABC123';
		mockUseUser.mockReturnValue({
			user: { id: 'user_123' },
			isSignedIn: true
		});
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
	});
});
