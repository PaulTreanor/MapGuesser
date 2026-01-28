import React, { useRef, useMemo } from 'react';
import MapboxMap from './MapBoxMap';
import Modal from './Modal';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useGameRoom } from '../hooks/useGameRoom';
import { getPlayerIdentity } from '../utils/guestIdentityUtils';
import { calculateKm } from '../utils/mapUtils';
import { Heading, Paragraph } from './typography/Typography';
import { MapGuesserHeading } from './typography/MapGuesserHeading';
import type { Pin } from '../types/Game.types';

const MultiplayerGame = () => {
	const { gameData, gameContext, setPlayers, setGameContext } = useMultiplayerStore();
	const playerIdentityRef = useRef(getPlayerIdentity());

	// Get gameCode from store or extract from hash as fallback
	const hash = window.location.hash;
	const gameCodeFromHash = hash.startsWith('#game-') ? hash.replace('#game-', '') : '';
	const gameCode = gameData?.gameCode || gameCodeFromHash;

	const { sendMessage } = useGameRoom({
		gameCode: gameCode || '', // Pass empty string if no gameCode, useGameRoom will handle it
		setPlayers,
		setGameContext,
	});

	// Prepare round details - must be before any returns to satisfy hooks rules
	// This might be null if gameContext is null or round doesn't exist yet
	const currentRoundIndex = gameContext ? gameContext.currentRound - 1 : 0;
	const currentRound = gameContext?.rounds[currentRoundIndex];
	const roundDetails = useMemo(() => {
		if (!currentRound) return null;
		return {
			location: currentRound.location.location,
			coordinates: currentRound.location.coordinates,
		};
	}, [currentRound?.location.location, currentRound?.location.coordinates]);

	// Check if current player has already submitted a guess for this round
	// This is derived from game state, not local state, so it's always accurate
	const currentPlayerId = playerIdentityRef.current.playerId;
	const hasSubmittedGuess = currentRound?.playerGuesses.some(
		(guess) => guess.playerId === currentPlayerId
	) ?? false;

	// Don't render game if we don't have a valid gameCode yet
	if (!gameCode) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<Heading>Loading...</Heading>
					<Paragraph className="text-gray-600 mt-2">
						Connecting to game room
					</Paragraph>
				</div>
			</div>
		);
	}

	const handleGuess = (distance: number, guessCoordinates?: Pin) => {
		if (!gameContext || hasSubmittedGuess || !guessCoordinates) return;

		sendMessage({
			type: 'submit_guess',
			playerId: playerIdentityRef.current.playerId,
			guessCoordinates,
		});
		// No need to set local state - hasSubmittedGuess is derived from gameContext
	};

	if (!gameContext) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<Heading>Loading game...</Heading>
					<Paragraph className="text-gray-600 mt-2">
						Waiting for game state
					</Paragraph>
				</div>
			</div>
		);
	}

	// Show different UI based on game phase
	if (gameContext.gameStateMachinePhase === 'lobby') {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<Heading>Waiting for game to start...</Heading>
				</div>
			</div>
		);
	}

	if (gameContext.gameStateMachinePhase === 'showResult' || gameContext.gameStateMachinePhase === 'final') {
		// Sort players by score (lowest first since lower is better)
		const playerScores = gameContext.players.map((player) => {
			const totalScore = gameContext.rounds.reduce((sum, round) => {
				const playerGuess = round.playerGuesses.find(
					(guess) => guess.playerId === player.playerId
				);

				if (!playerGuess) return sum;

				const distance = calculateKm(
					playerGuess.guessCoordinates,
					round.location.coordinates
				);

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
	}

	// In-round phase - these were already computed at the top
	if (!currentRound || !roundDetails) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<Heading>Loading round...</Heading>
				</div>
			</div>
		);
	}

	// Count how many players have submitted guesses this round
	const playersWhoGuessed = currentRound.playerGuesses.length;
	const totalPlayers = gameContext.players.length;
	const allPlayersGuessed = playersWhoGuessed === totalPlayers;

	return (
		<div className="relative h-screen">
			{/* HUD - location prompt and waiting status */}
			<nav className="border-gray-200 pointer-events-none min-h-64">
				<div className="mx-4 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between py-4 pointer-events-auto">
					<div className="p-4 bg-blue-900 rounded-md z-30 shadow-gray-50 shadow-sm">
						<h2 className="text-2xl text-white font-roboto">
							Where is <span className="font-bold">{currentRound.location.location}</span>?
						</h2>
					</div>

					{hasSubmittedGuess && !allPlayersGuessed && (
						<div className="p-4 bg-green-600 rounded-md z-30 shadow-gray-50 shadow-sm mt-4 sm:mt-0">
							<p className="text-white font-bold">
								Waiting for other players... ({totalPlayers - playersWhoGuessed} remaining)
							</p>
						</div>
					)}

					{allPlayersGuessed && (
						<div className="p-4 bg-green-600 rounded-md z-30 shadow-gray-50 shadow-sm mt-4 sm:mt-0">
							<p className="text-white font-bold">All players have guessed! Moving to next round...</p>
						</div>
					)}
				</div>
			</nav>

			{/* Map */}
			<div className="absolute top-0 left-0 right-0 bottom-0 pb-8">
				<MapboxMap
					roundDetails={roundDetails}
					handleGuess={handleGuess}
					isDisabled={hasSubmittedGuess}
				/>
			</div>
		</div>
	);
};

export default MultiplayerGame;
