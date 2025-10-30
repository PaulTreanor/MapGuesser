import React, { useEffect, useRef } from 'react';
import { Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameRoom } from '../../hooks/useGameRoom';
import { getPlayerIdentity } from '../../utils/guestIdentityUtils';
import { ConnectionStatus } from '../../objects/connectionStatuses';
import LobbyGameCode from '../lobby/LobbyGameCode';
import LobbyPlayersList from '../lobby/LobbyPlayersList';

const Lobby = () => {
        const { gameData, players, setPlayers } = useMultiplayerStore();
        const hasJoinedRef = useRef(false);
        const playerIdentityRef = useRef(getPlayerIdentity());

        const hash = window.location.hash;
        const gameCode = hash.replace('#lobby-', '');

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
