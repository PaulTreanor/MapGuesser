import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import JoinMultiplayerGameSetup from '../../../components/game-setup-modal/JoinMultiplayerGameSetup';
import * as useFetchHook from '../../../hooks/useFetch';
import * as NotificationContext from '../../../context/NotificationContext';

// Mock useFetch hook
vi.mock('../../../hooks/useFetch', () => ({
	useFetch: vi.fn()
}));

// Mock multiplayer store
const mockSetGameData = vi.fn();
vi.mock('../../../store/multiplayerStore', () => ({
	useMultiplayerStore: () => ({
		setGameData: mockSetGameData
	})
}));

// Mock notify
vi.mock('../../../context/NotificationContext', () => ({
	notify: vi.fn()
}));

describe('JoinMultiplayerGameSetup', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.location.hash = '';
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: false,
			error: null
		});
	});

	test('renders input field and button', () => {
		render(<JoinMultiplayerGameSetup />);

		expect(screen.getByText('Enter the 6-digit game code')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('ABC123')).toBeInTheDocument();
		expect(screen.getByText('Join Game')).toBeInTheDocument();
	});

	test('input converts to uppercase and filters non-alphanumeric characters', () => {
		render(<JoinMultiplayerGameSetup />);

		const input = screen.getByPlaceholderText('ABC123') as HTMLInputElement;

		fireEvent.change(input, { target: { value: 'abc@123' } });

		expect(input.value).toBe('ABC123');
	});

	test('input limits to 6 characters', () => {
		render(<JoinMultiplayerGameSetup />);

		const input = screen.getByPlaceholderText('ABC123') as HTMLInputElement;

		fireEvent.change(input, { target: { value: 'ABCDEFGH' } });

		expect(input.value).toBe('');
	});

	test('button is disabled when code is less than 6 characters', () => {
		render(<JoinMultiplayerGameSetup />);

		const button = screen.getByText('Join Game');

		expect(button).toBeDisabled();
	});

	test('button is enabled when code is exactly 6 characters', () => {
		render(<JoinMultiplayerGameSetup />);

		const input = screen.getByPlaceholderText('ABC123');
		const button = screen.getByText('Join Game');

		fireEvent.change(input, { target: { value: 'ABC123' } });

		expect(button).not.toBeDisabled();
	});

	test('shows "Joining..." when fetch is pending', () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});

		render(<JoinMultiplayerGameSetup />);

		expect(screen.getByText('Joining...')).toBeInTheDocument();
	});

	test('button is disabled when fetch is pending', () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});

		render(<JoinMultiplayerGameSetup />);

		const button = screen.getByText('Joining...');

		expect(button).toBeDisabled();
	});

	test('displays error notification when fetch fails', () => {
		const notifySpy = vi.spyOn(NotificationContext, 'notify');

		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: false,
			error: 'Network error'
		});

		render(<JoinMultiplayerGameSetup />);

		expect(notifySpy).toHaveBeenCalledWith({
			type: 'error',
			message: 'Failed to join game: Network error',
			duration: 5000
		});
	});

	test('sets game data and navigates to lobby on successful join', () => {
		const mockData = {
			roomId: 'ABC123',
			gameOwnerId: 'user_123'
		};

		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: mockData,
			isPending: false,
			error: null
		});

		render(<JoinMultiplayerGameSetup />);

		expect(mockSetGameData).toHaveBeenCalledWith({
			gameCode: 'ABC123',
			timer: 0,
			gameOwnerId: 'user_123'
		});
		expect(window.location.hash).toBe('#lobby-ABC123');
	});

	test('pre-fills code when initialCode is provided', () => {
		render(<JoinMultiplayerGameSetup initialCode="ABC123" />);

		const input = screen.getByPlaceholderText('ABC123') as HTMLInputElement;

		expect(input.value).toBe('ABC123');
	});

	test('auto-joins when initialCode of length 6 is provided', () => {
		render(<JoinMultiplayerGameSetup initialCode="ABC123" />);

		expect(vi.mocked(useFetchHook.useFetch)).toHaveBeenCalledWith(
			expect.stringContaining('/join-game/ABC123'),
			expect.objectContaining({ enabled: true })
		);
	});

	test('does not auto-join when initialCode is not provided', () => {
		render(<JoinMultiplayerGameSetup />);

		expect(vi.mocked(useFetchHook.useFetch)).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({ enabled: false })
		);
	});
});
