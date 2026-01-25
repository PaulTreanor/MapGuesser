import React, { useEffect, useRef, useState } from 'react';
import { Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameRoom } from '../../hooks/useGameRoom';
import { getPlayerIdentity } from '../../utils/guestIdentityUtils';
import { ConnectionStatus } from '../../objects/connectionStatuses';
import LobbyGameCode from '../lobby/LobbyGameCode';
import LobbyPlayersList from '../lobby/LobbyPlayersList';
import { MULTIPLAYER_SERVICE_API_URL } from '../../objects/endpoints';
import { notify } from '../../context/NotificationContext';
import type { JoinGameResponse } from '../../types/MultiplayerServiceApiResponse.types';

const Lobby = () => {
	const { gameData, players, gameContext, setPlayers, setGameData, setGameContext } = useMultiplayerStore();
	const hasJoinedRef = useRef(false);
	const playerIdentityRef = useRef(getPlayerIdentity());
	const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

	const hash = window.location.hash;
	const gameCode = hash.replace('#lobby-', '');

	// Fetch game metadata if we don't have it (e.g., direct URL navigation)
	useEffect(() => {
		const fetchGameMetadata = async () => {
			if (!gameData && gameCode && !isFetchingMetadata) {
				setIsFetchingMetadata(true);
				try {
					const response = await fetch(`${MULTIPLAYER_SERVICE_API_URL}/join-game/${gameCode}`);

					if (response.status === 404) {
						notify({
							type: 'error',
							message: 'Game not found. The game may have expired or the code is invalid.',
							duration: 5000
						});
						window.location.hash = '';
						return;
					}

					if (!response.ok) {
						throw new Error(`Response status: ${response.status}`);
					}

					const data = await response.json() as JoinGameResponse;
					setGameData({
						gameCode: data.roomId,
						timer: 0,
						gameOwnerId: data.gameOwnerId,
					});
				} catch (error) {
					console.error('Failed to fetch game metadata:', error);
					notify({
						type: 'error',
						message: 'Failed to load game. Please try again.',
						duration: 5000
					});
					window.location.hash = '';
				} finally {
					setIsFetchingMetadata(false);
				}
			}
		};

		fetchGameMetadata();
	}, []);

	const isGameOwner = gameData?.gameOwnerId === playerIdentityRef.current.playerId;

	const { connectionStatus, sendMessage } = useGameRoom({
		gameCode,
		setPlayers,
		setGameContext,
		onGameStarting: () => {
			// Transition to the in-game view by changing the hash
			window.location.hash = `#game-${gameCode}`;
		},
	});

	// Send player join message when connected (only once per connection)
	useEffect(() => {
		if (connectionStatus === ConnectionStatus.CONNECTED && !hasJoinedRef.current) {
			const identity = playerIdentityRef.current;

			sendMessage({
				type: 'player_join',
				...identity,
			});

			hasJoinedRef.current = true;
		} else if (connectionStatus === ConnectionStatus.DISCONNECTED) {
			// Reset when disconnected so we can rejoin if reconnecting
			hasJoinedRef.current = false;
		}
	}, [connectionStatus, sendMessage]);

	const handleStartGame = () => {
		sendMessage({
			type: 'game_start',
		});
	};

	// When game context updates and game has started, transition to game view
	useEffect(() => {
		if (gameContext && gameContext.gameStateMachinePhase === 'inRound') {
			window.location.hash = `#game-${gameCode}`;
		}
	}, [gameContext, gameCode]);

	return (
		<div>
			<LobbyGameCode gameCode={gameCode} connectionStatus={connectionStatus} />

			<Paragraph className="text-center text-gray-600 mb-6">
				Share this code with your friends to join the game!
			</Paragraph>

			<LobbyPlayersList players={players} gameOwnerId={gameData?.gameOwnerId} />

			{isGameOwner && (
				<div className="flex justify-center">
					<Button
						variant="mapguesser"
						size="xl"
						onClick={handleStartGame}
						disabled={connectionStatus !== ConnectionStatus.CONNECTED}
					>
						Start Game
					</Button>
				</div>
			)}
		</div>
	);
};

export default Lobby;
