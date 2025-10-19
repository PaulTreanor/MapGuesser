import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Subheading, Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useGameRoom } from '../../hooks/useGameRoom';
import { getPlayerIdentity } from '../../utils/guestIdentity';

type Player = {
	playerId: string;
	playerName: string;
	isGuest: boolean;
};

type GameRoomMessage = {
	type: string;
	[key: string]: unknown;
};

const Lobby = () => {
	const { user, isSignedIn } = useUser();
	const { gameData } = useMultiplayerStore();
	const [players, setPlayers] = useState<Player[]>([]);
	const hasJoinedRef = useRef(false);

	const hash = window.location.hash;
	const gameCode = hash.replace('#lobby-', '');

	const isGameOwner = isSignedIn && user?.id === gameData?.gameOwnerId;

	const handleMessage = useCallback((message: GameRoomMessage) => {
		console.log('Lobby received message:', message);

		switch (message.type) {
			case 'connected':
				console.log('Connected to game room');
				break;
			case 'players_update':
				console.log('Players update received:', message.players);
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
	useEffect(() => {
		if (connectionStatus === 'connected' && !hasJoinedRef.current) {
			const identity = getPlayerIdentity(isSignedIn ? user : undefined);

			console.log('Sending player_join:', identity);
			sendMessage({
				type: 'player_join',
				...identity,
			});

			hasJoinedRef.current = true;
		} else if (connectionStatus === 'disconnected') {
			// Reset when disconnected so we can rejoin if reconnecting
			hasJoinedRef.current = false;
		}
	}, [connectionStatus, isSignedIn, user, sendMessage]);

	const getConnectionStatusColor = () => {
		switch (connectionStatus) {
			case 'connected':
				return 'bg-green-100 text-green-800 border-green-300';
			case 'connecting':
				return 'bg-yellow-100 text-yellow-800 border-yellow-300';
			case 'error':
				return 'bg-red-100 text-red-800 border-red-300';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-300';
		}
	};

	const getConnectionStatusText = () => {
		switch (connectionStatus) {
			case 'connected':
				return '● Connected';
			case 'connecting':
				return '○ Connecting...';
			case 'error':
				return '✕ Connection Error';
			default:
				return '○ Disconnected';
		}
	};

	return (
		<div>
			<div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
				<Subheading className="text-center mb-2">
					Game Code
				</Subheading>
				<div className="text-center text-4xl font-bold tracking-widest text-blue-800">
					{gameCode}
				</div>
				<div className="flex justify-center mt-4">
					<div className={`px-3 py-1 rounded-full border text-sm font-medium ${getConnectionStatusColor()}`}>
						{getConnectionStatusText()}
					</div>
				</div>
			</div>

			<Paragraph className="text-center text-gray-600 mb-6">
				Share this code with your friends to join the game!
			</Paragraph>

			<div className="border-t border-gray-200 pt-6 mb-6">
				<Subheading className="mb-4">
					Players in lobby: {players.length}
				</Subheading>
				<div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
					{players.length === 0 ? (
						<Paragraph className="text-gray-500 text-center">
							Waiting for players to join...
						</Paragraph>
					) : (
						<div className="space-y-2">
							{players.map((player) => (
								<div
									key={player.playerId}
									className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
											{player.playerName.charAt(0).toUpperCase()}
										</div>
										<span className="font-medium">{player.playerName}</span>
									</div>
									<div className="flex items-center gap-2">
										{player.isGuest && (
											<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
												Guest
											</span>
										)}
										{player.playerId === gameData?.gameOwnerId && (
											<span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded font-medium">
												Host
											</span>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>

			{isGameOwner && (
				<div className="flex justify-center">
					<Button
						variant="mapguesser"
						size="xl"
					>
						Start Game
					</Button>
				</div>
			)}
		</div>
	);
};

export default Lobby;