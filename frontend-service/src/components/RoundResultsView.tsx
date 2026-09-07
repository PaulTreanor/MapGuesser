import React from 'react';
import MapboxMap from './MapBoxMap';
import { Button } from './ui/button';
import { calculateKm } from '../utils/mapUtils';
import type { Player, MultiplayerRound } from '../types/MultiplayerServiceApiResponse.types';
import type { Pin } from '../types/Game.types';

type RoundDetails = {
	location: string;
	coordinates: Pin;
};

type MultiplayerResultsData = {
	playerGuesses: { playerId: string; guessCoordinates?: Pin }[];
	players: Player[];
	actualLocation: Pin;
};

type RoundResultsViewProps = {
	players: Player[];
	currentRound: MultiplayerRound | undefined;
	currentRoundNumber: number;
	numberOfRounds: number;
	isGameOwner: boolean;
	roundDetails: RoundDetails | null;
	multiplayerResultsData: MultiplayerResultsData | undefined;
	onNextRound: () => void;
};

const RoundResultsView = ({
	players,
	currentRound,
	currentRoundNumber,
	numberOfRounds,
	isGameOwner,
	roundDetails,
	multiplayerResultsData,
	onNextRound,
}: RoundResultsViewProps) => {
	const isLastRound = currentRoundNumber === numberOfRounds;

	const roundScores = players.map((player) => {
		const playerGuess = currentRound?.playerGuesses.find(
			(guess) => guess.playerId === player.playerId
		);

		const distance = playerGuess?.guessCoordinates && currentRound
			? calculateKm(playerGuess.guessCoordinates, currentRound.location.coordinates)
			: null;

		return { player, distance, timedOut: playerGuess?.timedOut ?? false };
	}).sort((a, b) => {
		if (a.distance === null) return 1;
		if (b.distance === null) return -1;
		return a.distance - b.distance;
	});

	return (
		<div className="relative h-screen">
			{/* Full-screen map showing all guesses */}
			<div className="absolute top-0 left-0 right-0 bottom-0 pb-8">
				{roundDetails && (
					<MapboxMap
						roundDetails={roundDetails}
						handleGuess={() => {}}
						isDisabled={true}
						multiplayerResults={multiplayerResultsData}
					/>
				)}
			</div>

			{/* Overlay panel with scoreboard */}
			<div className="absolute top-4 left-4 z-40 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-sm">
				<h3 className="text-lg font-bold text-center mb-2">
					Round {currentRoundNumber} - {currentRound?.location.location}
				</h3>

				{/* Round Scoreboard */}
				<div className="space-y-2">
					{roundScores.map(({ player, distance, timedOut }, index) => (
						<div
							key={player.playerId}
							className={`flex justify-between items-center p-2 rounded-md ${
								index === 0 ? 'bg-green-100 border border-green-400' : 'bg-gray-100'
							}`}
						>
							<span className="font-medium text-sm">
								{index === 0 && '🎯 '}
								{player.playerName}
							</span>
							<span className="text-green-700 font-semibold text-sm">
								{distance !== null ? `${Math.round(distance)} km` : timedOut ? 'Timed out' : 'No guess'}
							</span>
						</div>
					))}
				</div>

				{/* Next Round / See Final Scores button (host only) */}
				{isGameOwner && (
					<div className="flex justify-center mt-4">
						<Button
							variant="mapguesser"
							size="lg"
							onClick={onNextRound}
						>
							{isLastRound ? 'See Final Scores' : 'Next Round'}
						</Button>
					</div>
				)}

				{!isGameOwner && (
					<p className="mt-3 text-center text-gray-600 text-xs">
						Waiting for host to continue...
					</p>
				)}
			</div>
		</div>
	);
};

export { RoundResultsView };
