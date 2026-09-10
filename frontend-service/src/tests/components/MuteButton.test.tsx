import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MuteButton from '../../components/MuteButton';
import { useSoundStore } from '../../store/soundStore';
import * as userPreferences from '../../services/userPreferences';

vi.mock('../../services/userPreferences', () => ({
	getSoundPreferences: vi.fn(() => ({
		soundEnabled: true,
		soundVolume: 0.7
	})),
	saveSoundPreferences: vi.fn(() => true)
}));

describe('MuteButton', () => {
	const clickMuteButton = () => {
		fireEvent.click(screen.getByText('Mute sounds').closest('button') as HTMLElement);
	};

	beforeEach(() => {
		vi.clearAllMocks();
		useSoundStore.setState({
			soundEnabled: true,
			soundVolume: 0.7
		});
	});

	test('shows volume icon when sound is enabled', () => {
		render(<MuteButton />);
		expect(screen.getByText('Mute sounds')).toBeInTheDocument();
	});

	test('toggles sound off and persists when clicked', () => {
		render(<MuteButton />);

		clickMuteButton();

		expect(screen.getByText('Unmute sounds')).toBeInTheDocument();
		expect(userPreferences.saveSoundPreferences).toHaveBeenCalledWith({
			soundEnabled: false,
			soundVolume: 0.7
		});
	});

	test('toggles sound back on when clicked again', () => {
		render(<MuteButton />);

		clickMuteButton();
		fireEvent.click(screen.getByText('Unmute sounds').closest('button') as HTMLElement);

		expect(screen.getByText('Mute sounds')).toBeInTheDocument();
		expect(userPreferences.saveSoundPreferences).toHaveBeenLastCalledWith({
			soundEnabled: true,
			soundVolume: 0.7
		});
	});
});