import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameRoom } from '../../hooks/useGameRoom';
import { getPlayerIdentity } from '../../utils/guestIdentityUtils';
import { ConnectionStatus } from '../../objects/connectionStatuses';
import LobbyGameCode from '../lobby/LobbyGameCode';
import LobbyPlayersList from '../lobby/LobbyPlayersList';

const Lobby = () => {
	const { user, isSignedIn, isLoaded } = useUser();
	const { gameData, players, setPlayers } = useMultiplayerStore();
	const hasJoinedRef = useRef(false);

	const hash = window.location.hash;
	const gameCode = hash.replace('#lobby-', '');

	const isGameOwner = isSignedIn && user?.id === gameData?.gameOwnerId;

	const { connectionStatus, sendMessage } = useGameRoom({ gameCode, setPlayers });

	// Send player join message when connected (only once per connection)
	// Wait for Clerk to load before identifying the user
	useEffect(() => {
		if (connectionStatus === ConnectionStatus.CONNECTED && isLoaded && !hasJoinedRef.current) {
			const identity = getPlayerIdentity(isSignedIn ? user : undefined);

			sendMessage({
				type: 'player_join',
				...identity,
			});

			hasJoinedRef.current = true;
		} else if (connectionStatus === ConnectionStatus.DISCONNECTED) {
			// Reset when disconnected so we can rejoin if reconnecting
			hasJoinedRef.current = false;
		}
	}, [connectionStatus, isLoaded, isSignedIn, user]);

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