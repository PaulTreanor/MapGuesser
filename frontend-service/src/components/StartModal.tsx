import React from 'react'
import Modal from './Modal'
import { numberOfRoundsInGame } from '../objects/gameConsts'
import type { GameState } from './types/Game.types'
import { gameStatus } from '../objects/gameStatuses'

export default function StartModal({setGameState}: {setGameState: React.Dispatch<React.SetStateAction<GameState>>}) {
	return (
		<Modal>
			<h1
				className="font-titillium text-blue-800 text-4xl font-bold md:mb-2 flex flex-col md:flex-row items-baseline"
			>
				🌎 MapGuesser 
				<span className="text-slate-400 text-xl font-light mt-2 md:mt-0 md:ml-2">Inspired by GeoGuessr!</span>
			</h1>
			<br />
			<p className="text-lg text-slate-950">
				For each round, try to pinpoint the city on the map. The map supports panning and zooming. 
			</p>
			<br />
			<p className="text-lg text-slate-950">
			Scores are based on how far your guess is from the city's real location, so lower scores are better. 
			</p>
			<br />
			<p className="text-lg text-slate-950">
				There is {numberOfRoundsInGame} rounds per game and you want your final score as close to 0 as possible, like golf.
			</p>
			<br />
			<p className="text-lg text-slate-950">
				Please share MapGuesser with your friends if you enjoyed it!
			</p>
			<br />
			<p className="text-lg text-slate-950">
				For more of my work checkout my <a href="http://paultreanor.com" className="text-blue-800 hover:underline">website</a>.
			</p>
			<br />
			<div className="flex justify-end mr-2">
				<button
					onClick={() => setGameState((prev: GameState) => ({
						...prev,
						status: gameStatus.IN_PROGRESS
					}))}
					className="bg-blue-800 hover:bg-blue-900 text-xl text-white font-bold py-2 px-4 rounded"
				>
					Start Game!
				</button>
			</div>
		</Modal>
	)
}
