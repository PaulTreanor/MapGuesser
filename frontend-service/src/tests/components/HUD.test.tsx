import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HUD from '../../components/HUD';
import { gameStatus } from '../../objects/gameStatuses';
import { Pin } from '@/components/types/Game.types';
import { numberOfRoundsInGame } from '../../objects/gameConsts';
import * as NotificationContext from '../../context/NotificationContext';


describe('HUD Component', () => {
    const notifySpy = vi.fn();
    
    beforeEach(() => {
        // Mock the notify function
        vi.spyOn(NotificationContext, 'notify').mockImplementation(notifySpy);
    });
    
    afterEach(() => {
        vi.clearAllMocks();
    });
    
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
        roundEndTimeStamp: null,
        moveToNextRound: vi.fn(),
        setGameState: vi.fn(),
    }


    test('should render the current round location', () => {
        render(
            <HUD
                {...minProps}
            />
        );
        expect(screen.getByText("New York")).toBeInTheDocument();
    });
    
    test('should render the timer when roundEndTimeStamp is provided', () => {
        // Mock Date.now to return a consistent value for testing
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2023, 1, 1, 0, 0, 0));
        
        const propsWithTimer = {
            ...minProps,
            roundEndTimeStamp: Date.now() + 30000 // 30 seconds in the future
        };
        
        render(<HUD {...propsWithTimer} />);
        
        // The progress bar should be in the document
        const progressBar = document.querySelector('[role="progressbar"]');
        expect(progressBar).toBeInTheDocument();
        
        vi.useRealTimers();
    });

    test('should not render timer when roundEndTimeStamp is not provided', () => {
		const propsWithoutTimer = {
			...minProps,
			roundEndTimeStamp: null
		};
		
		render(<HUD {...propsWithoutTimer} />);
		
		const progressBar = document.querySelector('[role="progressbar"]');
		expect(progressBar).not.toBeInTheDocument();
	});

    test('should not render the next round button if the current round is not completed', () => {
		render(
			<HUD
				{...minProps}
			/>
		);
	
        // Button should not be in the document when round is not completed
        expect(screen.queryByText("Next Round")).not.toBeInTheDocument();
	});

	test('should render the next round button if the current round is completed and not the last round', () => {
		render(
			<HUD
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
			<HUD
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
            <HUD {...minProps} />
        );
        expect(screen.queryByText("Finish Game")).not.toBeInTheDocument();
    });

    test('should render the finish game button if the current round is the last round and the game is in progress', () => {
        render(
            <HUD
                {...minProps}
                currentRound={{
                    index: numberOfRoundsInGame - 1,
                    completed: true,
                }}
            />
        );
        expect(screen.getByText("Finish Game")).toBeInTheDocument();
    });

    test('should show error notification if current round is null', () => {
        render(
            <HUD
                {...minProps}
                gameState={{
                    status: gameStatus.IN_PROGRESS,
                    score: 0,
                    rounds: [],
                }}
            />
        );
        
        // Verify the loading message is shown
        expect(screen.getByText("Loading...")).toBeInTheDocument();
        
        // Verify notification was called with the correct arguments
        expect(notifySpy).toHaveBeenCalledWith({
            type: 'error',
            message: "There's been a problem, our server didn't return a location 🤕",
            duration: 10000
        });
    });
});