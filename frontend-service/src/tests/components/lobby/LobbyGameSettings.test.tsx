import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LobbyGameSettings from '../../../components/lobby/LobbyGameSettings';

vi.mock('../../../components/roundTimerSelectionSlider', () => ({
	default: ({ onChange, valueIndex }: { onChange: (hasTimer: boolean, timeMs: number) => void; valueIndex?: number }) => (
		<button
			data-testid="timer-slider"
			data-value-index={valueIndex}
			onClick={() => onChange(true, 30000)}
		>
			timer slider
		</button>
	)
}));

describe('LobbyGameSettings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('renders the timer slider for the game owner', () => {
		render(<LobbyGameSettings timer={30000} isGameOwner={true} onTimerChange={vi.fn()} />);

		expect(screen.getByText('Round timer')).toBeInTheDocument();
		expect(screen.getByTestId('timer-slider')).toBeInTheDocument();
	});

	test('initialises the slider from the server timer', () => {
		render(<LobbyGameSettings timer={20000} isGameOwner={true} onTimerChange={vi.fn()} />);

		expect(screen.getByTestId('timer-slider')).toHaveAttribute('data-value-index', '2');
	});

	test('calls onTimerChange with the selected duration for the owner', () => {
		const onTimerChange = vi.fn();
		render(<LobbyGameSettings timer={30000} isGameOwner={true} onTimerChange={onTimerChange} />);

		fireEvent.click(screen.getByTestId('timer-slider'));

		expect(onTimerChange).toHaveBeenCalledWith(30000);
	});

	test('shows a read-only timer for non-owners', () => {
		render(<LobbyGameSettings timer={20000} isGameOwner={false} onTimerChange={vi.fn()} />);

		expect(screen.getByText(/Round timer: 20 seconds/)).toBeInTheDocument();
		expect(screen.queryByTestId('timer-slider')).not.toBeInTheDocument();
	});

	test('shows a read-only "No timer" label when no timer is set', () => {
		render(<LobbyGameSettings timer={undefined} isGameOwner={false} onTimerChange={vi.fn()} />);

		expect(screen.getByText(/Round timer: No timer/)).toBeInTheDocument();
	});
});
