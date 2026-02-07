import { useState, useEffect, useRef, useCallback } from 'react';
import { getMultiplayerServiceWebsocketsUrl } from '../utils/endpointUtils';
import type { Player, GameRoomMessage, GameContext } from '../types/MultiplayerServiceApiResponse.types';
import { notify } from '../context/NotificationContext';
import { ConnectionStatus } from '../objects/connectionStatuses';
import type { ConnectionStatusValue } from '../objects/connectionStatuses';

type UseGameRoomProps = {
	gameCode: string;
	setPlayers: (playersList: any) => void;
	setGameContext?: (context: GameContext) => void;
	onGameStarting?: () => void;
};

type UseGameRoomReturn = {
	connectionStatus: ConnectionStatusValue;
	sendMessage: (message: GameRoomMessage) => void;
	disconnect: () => void;
};

/**
 * Hook to manage WebSocket connection to a game room
 */
export const useGameRoom = ({
	gameCode,
	setPlayers,
	setGameContext,
	onGameStarting,
}: UseGameRoomProps): UseGameRoomReturn => {
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusValue>(ConnectionStatus.DISCONNECTED);
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);


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
			case 'game_state':
				if (setGameContext && message.gameContext) {
					setGameContext(message.gameContext as GameContext);
				}
				break;
			case 'game_starting':
				console.log('Game is starting!');
				notify({
					type: 'success',
					message: 'Game is starting!',
					duration: 3000
				});
				onGameStarting?.();
				break;
			default:
				break;
		}
	}, []);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setConnectionStatus(ConnectionStatus.DISCONNECTED);
	}, []);

	const sendMessage = useCallback((message: GameRoomMessage) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
		} else {
			console.warn('WebSocket is not connected. Message not sent:', message);
		}
	}, []);

	const connect = useCallback(() => {
		if (!gameCode) return;

		// Prevent multiple connections
		if (wsRef.current?.readyState === WebSocket.CONNECTING ||
			wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		setConnectionStatus(ConnectionStatus.CONNECTING);

		// Determine WebSocket URL based on environment
		const wsUrl = getMultiplayerServiceWebsocketsUrl();
		const wsGameCodeUrl = `${wsUrl}${gameCode.toUpperCase()}`

		console.log('Connecting to game room:', wsGameCodeUrl);

		const ws = new WebSocket(wsGameCodeUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('WebSocket connected to game room:', gameCode);
			setConnectionStatus(ConnectionStatus.CONNECTED);
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as GameRoomMessage;
				console.log('Received message:', message);

				handleMessage(message);
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			setConnectionStatus(ConnectionStatus.ERROR);
		};

		ws.onclose = (event) => {
			console.log('WebSocket closed:', event.code, event.reason);
			setConnectionStatus(ConnectionStatus.DISCONNECTED);
			wsRef.current = null;

			// Auto-reconnect after 3 seconds if not a normal closure
			if (event.code !== 1000) {
				reconnectTimeoutRef.current = setTimeout(() => {
					console.log('Attempting to reconnect...');
					connect();
				}, 3000);
			}
		};
	}, [gameCode]);

	useEffect(() => {
		if (gameCode) {
			connect();
		}
	}, [connect]);

	return {
		connectionStatus,
		sendMessage,
		disconnect,
	};
};
