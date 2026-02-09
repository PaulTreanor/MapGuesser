import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import Lobby from '../../../components/game-setup-modal/Lobby';

// Mock multiplayer store
const mockGameData = vi.fn();
const mockPlayers = vi.fn();
const mockGameContext = vi.fn();
const mockSetPlayers = vi.fn();
const mockSetGameContext = vi.fn();
vi.mock('../../../store/multiplayerStore', () => ({
	useMultiplayerStore: () => ({
		gameData: mockGameData(),
		players: mockPlayers(),
		gameContext: mockGameContext(),
		setPlayers: mockSetPlayers,
		setGameContext: mockSetGameContext,
	})
}));

// Mock useGameRoom hook
const mockConnectionStatus = vi.fn();
const mockSendMessage = vi.fn();
vi.mock('../../../hooks/useGameRoom', () => ({
	useGameRoom: () => ({
		connectionStatus: mockConnectionStatus(),
		sendMessage: mockSendMessage
	})
}));

// Mock useFetchGameMetadata hook
vi.mock('../../../hooks/useFetchGameMetadata', () => ({
	useFetchGameMetadata: () => ({ isFetching: false })
}));

describe('Lobby', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.location.hash = '';
		mockConnectionStatus.mockReturnValue('disconnected');
		mockPlayers.mockReturnValue([]);
		mockGameContext.mockReturnValue(null);
		localStorage.clear();
		localStorage.setItem('mapguesser_guest_id', 'guest_player');
		localStorage.setItem('mapguesser_guest_name', 'Test Player');
	});

	test('displays game code heading and instructions', () => {
		window.location.hash = '#lobby-XYZ789';
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.getByText('Game Code')).toBeInTheDocument();
		expect(screen.getByText('Share this code with your friends to join the game!')).toBeInTheDocument();
	});

	test('displays game code from URL hash', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.getByText('ABC123')).toBeInTheDocument();
	});

	test('displays waiting for players message', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.getByText('Waiting for players to join...')).toBeInTheDocument();
	});

	test('does not show Start Game button when player is not game owner', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'host_999'
		});

		render(<Lobby />);

		expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
	});

	test('shows Start Game button when player is game owner', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'guest_player'
		});

		render(<Lobby />);

		expect(screen.getByText('Start Game')).toBeInTheDocument();
	});

	test('does not show Start Game button when gameData is null', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue(null);

		render(<Lobby />);

		expect(screen.queryByText('Start Game')).not.toBeInTheDocument();
	});

	test('Start Game button is disabled when not connected', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'guest_player'
		});
		mockConnectionStatus.mockReturnValue('disconnected');

		render(<Lobby />);

		const button = screen.getByText('Start Game');
		expect(button).toBeDisabled();
	});

	test('Start Game button is enabled when connected', () => {
		window.location.hash = '#lobby-ABC123';
		mockGameData.mockReturnValue({
			gameCode: 'ABC123',
			timer: 60000,
			gameOwnerId: 'guest_player'
		});
		mockConnectionStatus.mockReturnValue('connected');

		render(<Lobby />);

		const button = screen.getByText('Start Game');
		expect(button).not.toBeDisabled();
	});
});
