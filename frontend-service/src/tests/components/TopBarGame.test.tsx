import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopBarGame from '../../components/TopBarGame';
import { gameStatus } from '../../objects/gameStatuses';
import { GameState, Pin } from '@/components/types/Game.types';
import { numberOfRoundsInGame } from '../../objects/gameConsts'


describe('TopBarGame Component', () => {
    const sampleRounds = Array(5).fill({
        location: 'New York',
        coordinates: [40.7128, -74.0060] as Pin,
    })
    const minProps = {
        gameState: {
            status: gameStatus.IN_PROGRESS,
            score: 0,
            rounds: sampleRounds,
        },
        currentRound: {
            index: 0,
            completed: false,
        },
        moveToNextRound: vi.fn(),
        setGameState: vi.fn() as React.Dispatch<React.SetStateAction<GameState>>,
    }

    test('should render the MapGuesser icon and title', () => {
        render(
            <TopBarGame
                {...minProps}
            />
        );

        expect(screen.getByText('🌎')).toBeInTheDocument();
        expect(screen.getByText('MapGuesser')).toBeInTheDocument();
    });

    test('should render the current round number', () => {
        render(
            <TopBarGame
                {...minProps}
            />
        );
        expect(screen.getByText(`1/${numberOfRoundsInGame}`)).toBeInTheDocument();
    });

    test('should render the current round location', () => {
        render(
            <TopBarGame
                {...minProps}
            />
        );
        expect(screen.getByText("New York")).toBeInTheDocument();
    });

    test('should render the users score', () => {
        render(
            <TopBarGame
                {...minProps}
            />
        );
        expect(screen.getByText("0 points")).toBeInTheDocument();
    });

    test('should hide the next round button if the current round is not completed', () => {
		render(
			<TopBarGame
				{...minProps}
			/>
		);
	
        const button = screen.getByText("Next Round");
		expect(button).toHaveStyle({ display: 'none' });
	});

	test('should render the next round button if the current round is completed and not the last round', () => {
		render(
			<TopBarGame
				{...minProps}
				currentRound={{
					index: 0,
					completed: true,
				}}
			/>
        );
        
		const button = screen.getByText("Next Round");
		expect(button).not.toHaveStyle({ display: 'none' });
	});

	test('should not render the next round button on the last round', () => {
		render(
			<TopBarGame
				{...minProps}
				currentRound={{
					index: numberOfRoundsInGame,
					completed: true,
				}}
			/>
        );
        
		expect(screen.queryByText("Next Round")).not.toBeInTheDocument();
    });
    
    test('should not render the finish game button if the current round is the last round and the game is in progress', () => {
        render(
            <TopBarGame {...minProps} />
        );
        expect(screen.queryByText("Finish Game")).not.toBeInTheDocument();
    });

    test('should render the finish game button if the current round is the last round and the game is in progress', () => {
        render(
            <TopBarGame
                {...minProps}
                currentRound={{
                    index: numberOfRoundsInGame - 1,
                    completed: true,
                }}
            />
        );
        expect(screen.getByText("Finish Game")).toBeInTheDocument();
    });

    test('should render error message if current round is null', () => {
        render(
            <TopBarGame
                {...minProps}
                gameState={{
                    status: gameStatus.IN_PROGRESS,
                    score: 0,
                    rounds: [],
                }}
            />
        );
        expect(screen.getByText("There's been a problem, our server didn't return a location 🤕")).toBeInTheDocument();
    });
});
