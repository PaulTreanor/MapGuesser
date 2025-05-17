import React from 'react'
import Modal from './Modal'
import { numberOfRoundsInGame } from '../objects/gameConsts'
import { Button } from './ui/button'
import { Paragraph } from './typography/Typography'
import { MapGuesserHeading } from './typography/MapGuesserHeading'

export default function StartModal({setGameState}: {setGameState: () => void}) {
	return (
		<Modal>
			<MapGuesserHeading />
			<br />
			<Paragraph>
				For each round, try to pinpoint the city on the map. The map supports panning and zooming. 
			</Paragraph>
			<br />
			<Paragraph>
			Scores are based on how far your guess is from the city's real location, so lower scores are better. 
			</Paragraph>
			<br />
			<Paragraph>
				There is {numberOfRoundsInGame} rounds per game and you want your final score as close to 0 as possible, like golf.
			</Paragraph>
			<br />
			<Paragraph>
				Please share MapGuesser with your friends if you enjoyed it!
			</Paragraph>
			<br />
			<Paragraph>
				For more of my work checkout my <a href="http://paultreanor.com" className="text-blue-800 hover:underline">website</a>.
			</Paragraph>
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