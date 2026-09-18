import React, { useCallback } from 'react'
import { Button } from '../ui/button'
import { Subheading } from '../typography/Typography'
import RoundTimerSelectionSlider from '../roundTimerSelectionSlider'
import { useGameStore } from '../../store/gameStore'

export default function SinglePlayerStartMenu() {
	const { setDoesGameHaveTimer, setRoundTimeMs, startGame } = useGameStore();

	const handleStartGame = () => {
		startGame();
	};

	const handleTimerChange = useCallback((hasTimer: boolean, timeMs: number) => {
		setDoesGameHaveTimer(hasTimer);
		setRoundTimeMs(timeMs);
	}, [setDoesGameHaveTimer, setRoundTimeMs]);

    return (
        <div>
			<Subheading>
				Do you want a timer for each round?
			</Subheading>
			<br />
			<RoundTimerSelectionSlider onChange={handleTimerChange} />
			<br />
			<div className="flex justify-end mr-2">
				<Button
					onClick={handleStartGame}
					variant="mapguesser"
					size="xl"
					sound="PING"
				>
					Start Game!
				</Button>
            </div>
        </div>
	)
}