import React from 'react'
import Modal from './Modal'
import { Button } from './ui/button'
import { Paragraph } from './typography/Typography'
import { MapGuesserHeading } from './typography/MapGuesserHeading'

export default function EndModal({ score }: { score: number }) {
	
	const handlePlayAgain = () => {
		window.location.reload();
	}

	return (
		<Modal>
			<MapGuesserHeading />
			<br />
			<Paragraph className="text-center flex items-center justify-center">
				Your final score is
				<span className="font-black text-3xl md:text-4xl lg:text-5xl pl-1 md:pl-2 lg:pl-3 text-green-700 animate-pulse">
					{"  " + score}
				</span>
			</Paragraph>
			<div className="flex justify-center mt-10 mr-2">
				<Button 
					onClick={handlePlayAgain} 
					variant="mapguesser"
					size="xl"
				>
					Play again
				</Button>
			</div>
		</Modal>
	)
}
