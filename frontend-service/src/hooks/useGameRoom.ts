import { useState, useEffect, useRef, useCallback } from 'react';
import { MULTIPLAYER_SERVICE_API_URL } from '../objects/endpoints';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

type GameRoomMessage = {
	type: string;
	[key: string]: unknown;
};

type UseGameRoomOptions = {
	gameCode: string;
	enabled?: boolean;
	onMessage?: (message: GameRoomMessage) => void;
};

type UseGameRoomReturn = {
	connectionStatus: ConnectionStatus;
	sendMessage: (message: GameRoomMessage) => void;
	disconnect: () => void;
};

/**
 * Hook to manage WebSocket connection to a game room
 *
 * @param gameCode - The game code to connect to
 * @param enabled - Whether to automatically connect (default: true)
 * @param onMessage - Callback for incoming messages
 */
export const useGameRoom = ({
	gameCode,
	enabled = true,
	onMessage,
}: UseGameRoomOptions): UseGameRoomReturn => {
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const disconnect = useCallback(() => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current);
			reconnectTimeoutRef.current = null;
		}

		if (wsRef.current) {
			wsRef.current.close();
			wsRef.current = null;
		}

		setConnectionStatus('disconnected');
	}, []);

	const sendMessage = useCallback((message: GameRoomMessage) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(message));
		} else {
			console.warn('WebSocket is not connected. Message not sent:', message);
		}
	}, []);

	const connect = useCallback(() => {
		if (!gameCode || !enabled) return;

		// Prevent multiple connections
		if (wsRef.current?.readyState === WebSocket.CONNECTING ||
			wsRef.current?.readyState === WebSocket.OPEN) {
			return;
		}

		setConnectionStatus('connecting');

		// Determine WebSocket URL based on environment
		const wsProtocol = MULTIPLAYER_SERVICE_API_URL.startsWith('https') ? 'wss' : 'ws';
		const wsBaseUrl = MULTIPLAYER_SERVICE_API_URL.replace(/^https?:\/\//, '');
		const wsUrl = `${wsProtocol}://${wsBaseUrl}/ws/${gameCode.toUpperCase()}`;

		console.log('Connecting to game room:', wsUrl);

		const ws = new WebSocket(wsUrl);
		wsRef.current = ws;

		ws.onopen = () => {
			console.log('WebSocket connected to game room:', gameCode);
			setConnectionStatus('connected');
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data) as GameRoomMessage;
				console.log('Received message:', message);

				if (onMessage) {
					onMessage(message);
				}
			} catch (error) {
				console.error('Error parsing WebSocket message:', error);
			}
		};

		ws.onerror = (error) => {
			console.error('WebSocket error:', error);
			setConnectionStatus('error');
		};

		ws.onclose = (event) => {
			console.log('WebSocket closed:', event.code, event.reason);
			setConnectionStatus('disconnected');
			wsRef.current = null;

			// Auto-reconnect after 3 seconds if enabled and not a normal closure
			if (enabled && event.code !== 1000) {
				reconnectTimeoutRef.current = setTimeout(() => {
					console.log('Attempting to reconnect...');
					connect();
				}, 3000);
			}
		};
	}, [gameCode, enabled, onMessage]);

	// Connect when component mounts or dependencies change
	useEffect(() => {
		if (enabled && gameCode) {
			connect();
		}

		// Cleanup on unmount
		return () => {
			disconnect();
		};
	}, [gameCode, enabled, connect, disconnect]);

	return {
		connectionStatus,
		sendMessage,
		disconnect,
	};
};
