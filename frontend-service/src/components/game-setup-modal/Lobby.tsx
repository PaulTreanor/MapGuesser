import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameRoom } from '../../hooks/useGameRoom';
import { getPlayerIdentity } from '../../utils/guestIdentityUtils';
import { notify } from '../../context/NotificationContext';
import LobbyGameCode from '../lobby/LobbyGameCode';
import LobbyPlayersList from '../lobby/LobbyPlayersList';
import type { Player, GameRoomMessage } from '../../types/MultiplayerServiceApiResponse.types';

const Lobby = () => {
	const { user, isSignedIn, isLoaded } = useUser();
	const { gameData } = useMultiplayerStore();
	const [players, setPlayers] = useState<Player[]>([]);
	const hasJoinedRef = useRef(false);

	const hash = window.location.hash;
	const gameCode = hash.replace('#lobby-', '');

	const isGameOwner = isSignedIn && user?.id === gameData?.gameOwnerId;

	const handleMessage = useCallback((message: GameRoomMessage) => {

		switch (message.type) {
			case 'connected':
				console.log('[Lobby] Connected to game room');
				break;
			case 'players_update':
				if (Array.isArray(message.players)) {
					setPlayers(message.players as Player[]);
				}
				break;
			case 'player_joined':
				console.log('Player joined:', message);
				break;
			case 'player_left':
				console.log('Player left:', message);
				break;
			case 'game_starting':
				console.log('Game is starting!');
				notify({
					type: 'success',
					message: 'Game is starting!',
					duration: 3000
				});
				// TODO: Transition to game screen
				break;
			default:
				break;
		}
	}, []);

	const { connectionStatus, sendMessage } = useGameRoom({
		gameCode,
		enabled: !!gameCode,
		onMessage: handleMessage,
	});

	// Send player join message when connected (only once per connection)
	// Wait for Clerk to load before identifying the user
	useEffect(() => {
		if (connectionStatus === 'connected' && isLoaded && !hasJoinedRef.current) {
			const identity = getPlayerIdentity(isSignedIn ? user : undefined);

			sendMessage({
				type: 'player_join',
				...identity,
			});

			hasJoinedRef.current = true;
		} else if (connectionStatus === 'disconnected') {
			// Reset when disconnected so we can rejoin if reconnecting
			hasJoinedRef.current = false;
		}
	}, [connectionStatus, isLoaded, isSignedIn, user, sendMessage]);

	const handleStartGame = () => {
		sendMessage({
			type: 'game_start',
		});
	};

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
						disabled={connectionStatus !== 'connected'}
					>
						Start Game
					</Button>
				</div>
			)}
		</div>
	);
};

export default Lobby;