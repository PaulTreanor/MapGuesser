import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MenuBar from '../../components/MenuBar';
import { numberOfRoundsInGame } from '../../objects/gameConsts';
import * as gameStore from '../../store/gameStore';
import * as roundStore from '../../store/roundStore';

// Mock the Zustand stores
vi.mock('../../store/gameStore');
vi.mock('../../store/roundStore');

describe('MenuBar Component', () => {
	const mockUseGameStore = vi.mocked(gameStore.useGameStore);
	const mockUseRoundStore = vi.mocked(roundStore.useRoundStore);

	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('should render Settings and About buttons', () => {
		mockUseGameStore.mockReturnValue({ score: 0 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('Settings')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
	});

	test('should render score and round info starting from round 0 (displayed as round 1)', () => {
		mockUseGameStore.mockReturnValue({ score: 0 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 0 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('0 pts')).toBeInTheDocument();
		expect(screen.getByText(`1/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should render score and round info when on round 1 or higher', () => {
		mockUseGameStore.mockReturnValue({ score: 150 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 1 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('150 pts')).toBeInTheDocument();
		expect(screen.getByText(`2/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should display correct score formatting', () => {
		mockUseGameStore.mockReturnValue({ score: 2500 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 2 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('2500 pts')).toBeInTheDocument();
	});

	test('should display correct round progression', () => {
		mockUseGameStore.mockReturnValue({ score: 100 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 3 } } as any);

		render(<MenuBar />);

		expect(screen.getByText(`4/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should render score and round info on the last round', () => {
		mockUseGameStore.mockReturnValue({ score: 1000 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: numberOfRoundsInGame - 1 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('1000 pts')).toBeInTheDocument();
		expect(screen.getByText(`${numberOfRoundsInGame}/${numberOfRoundsInGame}`)).toBeInTheDocument();
	});

	test('should handle zero score correctly on active rounds', () => {
		mockUseGameStore.mockReturnValue({ score: 0 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 1 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('0 pts')).toBeInTheDocument();
	});

	test('should handle high scores correctly', () => {
		mockUseGameStore.mockReturnValue({ score: 99999 } as any);
		mockUseRoundStore.mockReturnValue({ currentRound: { index: 1 } } as any);

		render(<MenuBar />);

		expect(screen.getByText('99999 pts')).toBeInTheDocument();
	});
});