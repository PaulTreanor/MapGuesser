import React from 'react';
import Modal from './Modal';
import { Paragraph } from './typography/Typography';
import { MapGuesserHeading } from './typography/MapGuesserHeading';
import { calculateKm } from '../utils/mapUtils';
import { MAX_SCORE } from '../objects/gameConsts';
import type { Player, MultiplayerRound } from '../types/MultiplayerServiceApiResponse.types';

type FinalScoresModalProps = {
	players: Player[];
	rounds: MultiplayerRound[];
};

const FinalScoresModal = ({ players, rounds }: FinalScoresModalProps) => {
	const playerScores = players.map((player) => {
		const totalScore = rounds.reduce((sum, round) => {
			const playerGuess = round.playerGuesses.find(
				(guess) => guess.playerId === player.playerId
			);

			const distance = playerGuess?.guessCoordinates
				? calculateKm(
					playerGuess.guessCoordinates,
					round.location.coordinates
				)
				: MAX_SCORE;

			return sum + distance;
		}, 0);

		return { player, totalScore };
	}).sort((a, b) => a.totalScore - b.totalScore);

	return (
		<Modal>
			<MapGuesserHeading />
			<br />
			<Paragraph className="text-center mb-6">
				Game Complete! Here are the final scores:
			</Paragraph>
			<div className="space-y-3">
				{playerScores.map(({ player, totalScore }, index) => (
					<div
						key={player.playerId}
						className={`flex justify-between items-center p-4 rounded-md ${
							index === 0 ? 'bg-green-100 border-2 border-green-400' : 'bg-gray-100'
						}`}
					>
						<span className="font-bold">
							{index === 0 && '🏆 '}
							{player.playerName}
						</span>
						<span className="text-lg font-semibold text-green-700">
							{Math.round(totalScore)} km
						</span>
					</div>
				))}
			</div>
			<Paragraph className="mt-4 text-center text-gray-600 text-sm">
				Lower scores are better!
			</Paragraph>
		</Modal>
	);
};

export { FinalScoresModal };
