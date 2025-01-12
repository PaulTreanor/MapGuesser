import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Game from '../../components/Game';
import * as gameUtils from '../../utils/gameUtils';
import { Round } from '@/components/types/Game.types';

vi.mock('../../components/MapBoxMap', () => ({
	default: vi.fn(() => <div data-testid="mock-mapbox">🌎</div>)
}));

vi.mock('../../utils/gameUtils');


const mockRounds = [
	{ location: 'Test Location', coordinates: [0, 0] } as Round
];


describe('Game Component', () => {

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(gameUtils.fetchRounds).mockReturnValue(mockRounds);

    });

    test('should render mapbox map component', () => {
        render(<Game/>);

		expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
    });

    test('should render start modal', () => {
        render(<Game/>);

		expect(screen.getByText('For each round, try to pinpoint the city on the map. The map supports panning and zooming.')).toBeInTheDocument();
    });

    test('should start game with Start Game! button clicked', () => {
        render(<Game />);
        
        const startButton = screen.getByRole('button', { name: 'Start Game!' });
        fireEvent.click(startButton);

        expect(screen.getByTestId('mock-mapbox')).toBeInTheDocument();
        // Game data should be rendered (round counter, score, location question)
        expect(screen.getByText('1/5')).toBeInTheDocument();
        expect(screen.getByText(/Where is/)).toBeInTheDocument();
        expect(screen.getByText('Test Location')).toBeInTheDocument();
        expect(screen.getByText('0 points')).toBeInTheDocument();

        const nextRoundButton = screen.queryByRole('button', { name: 'Next Round' });
        expect(nextRoundButton).not.toBeInTheDocument();
    });

    test('should render empty state if fetchRounds returns []', () => {
        vi.mocked(gameUtils.fetchRounds).mockReturnValue([]);

        render(<Game />);
        
        const startButton = screen.getByRole('button', { name: 'Start Game!' });
        fireEvent.click(startButton);

		expect(screen.getByText("There's been a problem, our server didn't return a location 🤕")).toBeInTheDocument();
    });

    test('should render loading state if fetchRounds is pending', () => {
        vi.mocked(gameUtils.fetchRounds).mockReturnValue(null as unknown as Round[]);

        render(<Game />);

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
});
