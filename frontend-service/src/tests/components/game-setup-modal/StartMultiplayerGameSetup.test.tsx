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

// Mock RoundTimerSelectionSlider
vi.mock('../../../components/roundTimerSelectionSlider', () => ({
	default: ({ onChange, disabled }: { onChange: (hasTimer: boolean, timeMs: number) => void; disabled?: boolean }) => (
		<div data-testid="timer-slider" data-disabled={disabled ? 'true' : 'false'}>
			<button onClick={() => onChange(true, 60000)}>Set 60s timer</button>
		</div>
	)
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
			isPending: false,
			error: null
		});
	});

	test('renders heading, timer slider, and create button', () => {
		render(<StartMultiplayerGameSetup />);

		expect(screen.getByText('Do you want a timer for each round?')).toBeInTheDocument();
		expect(screen.getByTestId('timer-slider')).toBeInTheDocument();
		expect(screen.getByText('Create Game')).toBeInTheDocument();
	});

	test('timer slider is not disabled for multiplayer', () => {
		render(<StartMultiplayerGameSetup />);

		const timerSlider = screen.getByTestId('timer-slider');
		expect(timerSlider).toHaveAttribute('data-disabled', 'false');
	});

	test('button is not disabled by default', () => {
		render(<StartMultiplayerGameSetup />);

		const button = screen.getByText('Create Game');
		expect(button).not.toBeDisabled();
	});

	test('shows "Creating..." when fetch is pending', () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});

		render(<StartMultiplayerGameSetup />);

		expect(screen.getByText('Creating...')).toBeInTheDocument();
	});

	test('button is disabled when fetch is pending', () => {
		vi.mocked(useFetchHook.useFetch).mockReturnValue({
			data: null,
			isPending: true,
			error: null
		});

		render(<StartMultiplayerGameSetup />);

		const button = screen.getByText('Creating...');
		expect(button).toBeDisabled();
	});

	test('displays error notification when fetch fails', () => {
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
	});

	test('sets game data and navigates to lobby on successful game creation', () => {
		const mockData = {
			gameCode: 'XYZ789',
			timer: 60000,
			gameOwnerId: 'user_456'
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
});
