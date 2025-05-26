import React, { useCallback } from 'react'
import Modal from './Modal'
import { numberOfRoundsInGame } from '../objects/gameConsts'
import { Button } from './ui/button'
import { Subheading, Paragraph } from './typography/Typography'
import { MapGuesserHeading } from './typography/MapGuesserHeading'
import RoundTimerSelectionSlider from './roundTimerSelectionSlider'
import { useGameStore } from '../store/gameStore'

export default function StartModal({setGameState}: {setGameState: () => void}) {
	const { setDoesGameHaveTimer, setRoundTimeMs } = useGameStore();

	const handleTimerChange = useCallback((hasTimer: boolean, timeMs: number) => {
		setDoesGameHaveTimer(hasTimer);
		setRoundTimeMs(timeMs);
	}, [setDoesGameHaveTimer, setRoundTimeMs]);

	return (
		<Modal>
			<MapGuesserHeading />
			<br />
			<Paragraph>
				For each round, try to pinpoint the city on the map. Scores are based on how far your guess is from the city's real location, so lower scores are better. 
			</Paragraph>
			<br />
			<Paragraph>
				For more of my work checkout my <a href="http://paultreanor.com" className="text-blue-800 hover:underline">website</a>.
			</Paragraph>
			<br />
			<Subheading>
				Do you want a timer for each round?
			</Subheading>
			<br />
			<RoundTimerSelectionSlider onChange={handleTimerChange} />
			<br />
			<div className="flex justify-end mr-2">
				<Button
					onClick={setGameState}
					variant="mapguesser"
					size="xl"
				>
					Start Game!
				</Button>
			</div>
		</Modal>
	)
}