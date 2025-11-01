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
import type { JoinGameResponse } from '../../types/MultiplayerServiceApiResponse.types';

const Lobby = () => {
        const { gameData, players, setPlayers, setGameData } = useMultiplayerStore();
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
                                        const data = await response.json() as JoinGameResponse;
                                        setGameData({
                                                gameCode: data.roomId,
                                                timer: 0,
                                                gameOwnerId: data.gameOwnerId,
                                        });
                                } catch (error) {
                                        console.error('Failed to fetch game metadata:', error);
                                } finally {
                                        setIsFetchingMetadata(false);
                                }
                        }
                };

                fetchGameMetadata();
        }, [gameData, gameCode, isFetchingMetadata, setGameData]);

        const isGameOwner = gameData?.gameOwnerId === playerIdentityRef.current.playerId;

        const { connectionStatus, sendMessage } = useGameRoom({ gameCode, setPlayers });

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
