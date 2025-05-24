import React, { useEffect } from 'react'
import type { GameState, CurrentRound } from './types/Game.types'
import { numberOfRoundsInGame } from '../objects/gameConsts'
import { gameStatus } from '../objects/gameStatuses'
import { Button } from './ui/button'
import { Heading, Paragraph } from './typography/Typography'
import { notify } from '../context/NotificationContext'
import CountDownProgressBar from './countDownProgressBar'

interface HUDProps {
	gameState: GameState;
	currentRound: CurrentRound;
	roundEndTimeStamp: number | null;
	moveToNextRound: () => void;
	setGameState: () => void;
}

export default function HUD({
	gameState,
	currentRound,
	roundEndTimeStamp,
	moveToNextRound,
	setGameState,
}: HUDProps) {

	const { status, score, rounds } = gameState

	const roundLocation = rounds?.[currentRound.index]?.location || null
	
	useEffect(() => {
		if (!roundLocation) {
			notify({ 
				type: 'error', 
				message: "There's been a problem, our server didn't return a location 🤕",
				duration: 10000 
			});
		}
	}, [roundLocation]);

	// Rounds indexed from 0 so we don't have confusing "index + 1" code everywhere
	const roundNumberAsDisplayed = currentRound.index + 1;

	return (
		roundLocation ? (
			<nav className="border-gray-200 pointer-events-none min-h-64">
				{roundEndTimeStamp && (
					<CountDownProgressBar 
						progressBarFullTimeStamp={roundEndTimeStamp}
						className="w-full fixed top-0 left-0 z-50"
						isPaused={currentRound.completed}
					/>
				)}
				<div className="mx-4 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between py-4 pointer-events-auto">
					<div className="flex flex-col sm:flex-row items-center">
						<Heading className="z-30 mr-4 hidden md:block md:absolute md:bottom-0 md:left-0 md:ml-4 md:mb-4">
							🌎
							<span className='text-shadow'> MapGuesser</span>
						</Heading>
						<div className="p-4 bg-blue-900 rounded-md z-30 shadow-slate-50 shadow-sm"> 
							<h2 className='text-2xl text-white font-roboto'>
								Where is <span className='font-bold'>{roundLocation}</span>?
							</h2>
						</div>
					</div>
					{(!currentRound.completed || roundNumberAsDisplayed == numberOfRoundsInGame) ? null : (
						<Button 
							variant="mapguesserDanger"
							onClick={moveToNextRound}
							disabled={!currentRound.completed}
							className="pointer-events-auto z-30 mt-4 sm:mt-0 sm:absolute sm:bottom-0 sm:left-1/2 sm:transform sm:-translate-x-1/2 sm:mb-4 shadow-slate-50 shadow-sm"
						>
							Next Round
						</Button>
					)}
					{roundNumberAsDisplayed === numberOfRoundsInGame && currentRound.completed && status !== gameStatus.FINISHED  && (
						<Button
							variant="mapguesserSuccess"
							onClick={setGameState}
							className="pointer-events-auto z-30 mt-4 sm:mt-0 sm:absolute sm:bottom-0 sm:right-1/2 sm:transform sm:translate-x-1/2 sm:mb-4 shadow-slate-50 shadow-sm"
						>
							Finish Game
						</Button>
					)}
					{roundNumberAsDisplayed > 0 && (
						<div className='px-4 py-2 bg-blue-900 text-white rounded-md z-30 mt-4 sm:mt-0 absolute bottom-0 right-0 mb-6 mr-4 sm:relative sm:mb-0 sm:mr-0 shadow-slate-50 shadow-sm'>
							<Paragraph className='z-30 text-white'>{score} points</Paragraph>
							<Paragraph className='z-30 text-white'>{roundNumberAsDisplayed}/{numberOfRoundsInGame}</Paragraph>
						</div>
					)}
				</div>
			</nav>
		) : (
			// Notification will be shown via notification system
			<div className="p-4">
				<Heading>Loading...</Heading>
			</div>
		)
	)
}