import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import StartMultiplayerGameSetup from '../../../components/game-setup-modal/StartMultiplayerGameSetup';
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

describe('StartMultiplayerGameSetup', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		window.location.hash = '';
		localStorage.clear();
		localStorage.setItem('mapguesser_guest_id', 'guest_123');
		localStorage.setItem('mapguesser_guest_name', 'Guest Player');
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});
	});

	test('shows a loading state while the game room is being created', () => {
		render(<StartMultiplayerGameSetup />);

		expect(screen.getByText('Creating game room...')).toBeInTheDocument();
	});

	test('creates the game room immediately on mount', () => {
		render(<StartMultiplayerGameSetup />);

		expect(useFetchHook.useFetch).toHaveBeenCalled();
		const [, options] = vi.mocked(useFetchHook.useFetch).mock.calls[0];
		expect(options?.enabled).toBe(true);
		expect(options?.method).toBe('POST');
	});

	test('sets game data and navigates to the lobby on successful creation', () => {
		const mockData = {
			gameCode: 'XYZ789',
			timer: 0,
			gameOwnerId: 'guest_123'
		};

		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: mockData,
			isPending: false,
			error: null
		});

		render(<StartMultiplayerGameSetup />);

		expect(mockSetGameData).toHaveBeenCalledWith(mockData);
		expect(window.location.hash).toBe('#lobby-XYZ789');
	});

	test('notifies and returns to the mode menu when creation fails', () => {
		const notifySpy = vi.spyOn(NotificationContext, 'notify');

		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: false,
			error: 'Network error'
		});

		render(<StartMultiplayerGameSetup />);

		expect(notifySpy).toHaveBeenCalledWith({
			type: 'error',
			message: 'Failed to create game: Network error',
			duration: 5000
		});
		expect(window.location.hash).toBe('');
	});
});
