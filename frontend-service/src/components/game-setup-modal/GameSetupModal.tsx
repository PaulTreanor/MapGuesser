import React from 'react'
import Modal from '../Modal'
import { Paragraph } from '../typography/Typography'
import { MapGuesserHeading } from '../typography/MapGuesserHeading'
import SinglePlayerStartMenu from './SinglePlayerStartMenu'

export default function GameSetupModal({setGameState}: {setGameState: () => void}) {
	return (
		<Modal>
			<MapGuesserHeading />
			<br />
			<Paragraph>
				For each round, try to pinpoint the city on the map. Scores are based on how far your guess is from the city's real location, so lower scores are better. 
			</Paragraph>
			<br />
			<SinglePlayerStartMenu setGameState={setGameState} />
		</Modal>
	)
}