import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import SinglePlayerStartMenu from '../../../components/game-setup-modal/SinglePlayerStartMenu';

// Mock game store
const mockSetDoesGameHaveTimer = vi.fn();
const mockSetRoundTimeMs = vi.fn();
const mockStartGame = vi.fn();
vi.mock('../../../store/gameStore', () => ({
	useGameStore: () => ({
		setDoesGameHaveTimer: mockSetDoesGameHaveTimer,
		setRoundTimeMs: mockSetRoundTimeMs,
		startGame: mockStartGame
	})
}));

// Mock RoundTimerSelectionSlider
vi.mock('../../../components/roundTimerSelectionSlider', () => ({
	default: ({ onChange, disabled }: { onChange: (hasTimer: boolean, timeMs: number) => void; disabled?: boolean }) => (
		<div data-testid="timer-slider" data-disabled={disabled ? 'true' : 'false'}>
			<button onClick={() => onChange(true, 60000)}>Set 60s timer</button>
		</div>
	)
}));

describe('SinglePlayerStartMenu', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders heading, timer slider, and start button', () => {
		render(<SinglePlayerStartMenu />);

		expect(screen.getByText('Do you want a timer for each round?')).toBeInTheDocument();
		expect(screen.getByTestId('timer-slider')).toBeInTheDocument();
		expect(screen.getByText('Start Game!')).toBeInTheDocument();
	});

	test('timer slider is not disabled for single player', () => {
		render(<SinglePlayerStartMenu />);

		const timerSlider = screen.getByTestId('timer-slider');
		expect(timerSlider).toHaveAttribute('data-disabled', 'false');
	});
});
