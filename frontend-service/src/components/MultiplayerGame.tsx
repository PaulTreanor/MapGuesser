import React, { useRef, useMemo, useEffect } from 'react';
import MapboxMap from './MapBoxMap';
import { FinalScoresModal } from './FinalScoresModal';
import { RoundResultsView } from './RoundResultsView';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { useGameRoom } from '../hooks/useGameRoom';
import { getPlayerIdentity } from '../utils/guestIdentityUtils';
import { Heading, Paragraph } from './typography/Typography';
import { ConnectionStatus } from '../objects/connectionStatuses';
import type { Pin } from '../types/Game.types';

const MultiplayerGame = () => {
	const { gameData, gameContext, setPlayers, setGameContext } = useMultiplayerStore();
	const playerIdentityRef = useRef(getPlayerIdentity());
	const hasJoinedRef = useRef(false);

	const gameCode = useMemo(() => {
		const hash = window.location.hash;
		const gameCodeFromHash = hash.startsWith('#game-') ? hash.replace('#game-', '') : '';
		return gameData?.gameCode || gameCodeFromHash;
	}, [gameData?.gameCode]);

	const { connectionStatus, sendMessage } = useGameRoom({
		gameCode: gameCode,
		setPlayers,
		setGameContext,
	});

	// Send player_join when connected to ensure WebSocket has player identity attached
	useEffect(() => {
		if (connectionStatus === ConnectionStatus.CONNECTED && !hasJoinedRef.current) {
			const identity = playerIdentityRef.current;
			sendMessage({
				type: 'player_join',
				...identity,
			});
			hasJoinedRef.current = true;
		} else if (connectionStatus === ConnectionStatus.DISCONNECTED) {
			hasJoinedRef.current = false;
		}
	}, [connectionStatus]);

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
	}, [currentRound?.location.location, currentRound?.location.coordinates?.[0], currentRound?.location.coordinates?.[1]]);

	// Memoize multiplayer results data to prevent infinite re-renders
	// Use playerGuesses.length to detect when guesses change, and primitive coords for location
	const multiplayerResultsData = useMemo(() => {
		if (!currentRound || !gameContext) return undefined;
		return {
			playerGuesses: currentRound.playerGuesses,
			players: gameContext.players,
			actualLocation: currentRound.location.coordinates,
		};
	}, [currentRound?.playerGuesses?.length, gameContext?.players?.length, currentRound?.location.coordinates?.[0], currentRound?.location.coordinates?.[1]]);

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

	// After each round
	if (gameContext.gameStateMachinePhase === 'showRoundResult') {
		const isGameOwner = gameContext.gameOwnerId === currentPlayerId;

		const handleNextRound = () => {
			sendMessage({ type: 'next_round' });
		};

		return (
			<RoundResultsView
				players={gameContext.players}
				currentRound={currentRound}
				currentRoundNumber={gameContext.currentRound}
				numberOfRounds={gameContext.numberOfRounds}
				isGameOwner={isGameOwner}
				roundDetails={roundDetails}
				multiplayerResultsData={multiplayerResultsData}
				onNextRound={handleNextRound}
			/>
		);
	}

	// End of game
	if (gameContext.gameStateMachinePhase === 'showResult' || gameContext.gameStateMachinePhase === 'final') {
		return (
			<FinalScoresModal
				players={gameContext.players}
				rounds={gameContext.rounds}
			/>
		);
	}

	const playersWhoGuessed = currentRound?.playerGuesses.length ?? 0;
	const totalPlayers = gameContext.players.length;
	const allPlayersGuessed = playersWhoGuessed === totalPlayers;

	// Actual in round to round component
	return (
		<div className="relative h-screen">
			{/* HUD - location prompt and waiting status */}
			<nav className="border-gray-200 pointer-events-none min-h-64">
				<div className="mx-4 flex flex-col sm:flex-row sm:flex-wrap items-center justify-between py-4 pointer-events-auto">
					<div className="p-4 bg-blue-900 rounded-md z-30 shadow-gray-50 shadow-sm">
						<h2 className="text-2xl text-white font-roboto">
							Where is <span className="font-bold">{currentRound?.location.location}</span>?
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
							<p className="text-white font-bold">All players have guessed! Loading results...</p>
						</div>
					)}
				</div>
			</nav>

			{/* Map */}
			<div className="absolute top-0 left-0 right-0 bottom-0 pb-8">
				{roundDetails && (
					<MapboxMap
						roundDetails={roundDetails}
						handleGuess={handleGuess}
						isDisabled={hasSubmittedGuess}
					/>
				)}
			</div>
		</div>
	);
};

export default MultiplayerGame;
