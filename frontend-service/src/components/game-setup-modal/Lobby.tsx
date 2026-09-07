import React, { useEffect, useRef } from 'react';
import { Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameRoom } from '../../hooks/useGameRoom';
import { useFetchGameMetadata } from '../../hooks/useFetchGameMetadata';
import { getPlayerIdentity, setGuestName } from '../../utils/guestIdentityUtils';
import { ConnectionStatus } from '../../objects/connectionStatuses';
import { getGameCodeFromHash } from '../../utils/gameHashUtils';
import LobbyGameCode from '../lobby/LobbyGameCode';
import LobbyPlayersList from '../lobby/LobbyPlayersList';

const Lobby = () => {
	const { gameData, players, gameContext, setPlayers, setGameContext } = useMultiplayerStore();
	const hasJoinedRef = useRef(false);
	const playerIdentityRef = useRef(getPlayerIdentity());

	const gameCode = getGameCodeFromHash(window.location.hash);

	useFetchGameMetadata(gameCode);

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

	const handleNameChange = (newName: string) => {
		setGuestName(newName);
		playerIdentityRef.current.playerName = newName;
		sendMessage({
			type: 'player_join',
			...playerIdentityRef.current,
		});
	};

	// When game context updates and game has started, transition to game view
	useEffect(() => {
		if (gameContext && gameContext.gameStateMachinePhase === 'inRound') {
			const targetHash = `#game-${gameCode}`;
			if (window.location.hash !== targetHash) {
				window.location.hash = targetHash;
			}
		}
	}, [gameContext, gameCode]);

	return (
		<div>
			<LobbyGameCode gameCode={gameCode} connectionStatus={connectionStatus} />

			<Paragraph className="text-center text-gray-600 mb-6">
				Share this code with your friends to join the game!
			</Paragraph>

			<LobbyPlayersList
				players={players}
				gameOwnerId={gameData?.gameOwnerId}
				currentPlayerId={playerIdentityRef.current.playerId}
				onNameChange={handleNameChange}
			/>

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
