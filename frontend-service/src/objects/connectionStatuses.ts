const ConnectionStatus = {
	DISCONNECTED: 'disconnected',
	CONNECTING: 'connecting',
	CONNECTED: 'connected',
	ERROR: 'error',
} as const;

type ConnectionStatusValue = typeof ConnectionStatus[keyof typeof ConnectionStatus];

export { ConnectionStatus };
export type { ConnectionStatusValue };
