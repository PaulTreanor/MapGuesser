import type { ConnectionStatus } from "@/types/ConnectionStatus.types";

const getConnectionStatusColor = (status: ConnectionStatus): string => {
	switch (status) {
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

const getConnectionStatusText = (status: ConnectionStatus): string => {
	switch (status) {
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

export { getConnectionStatusColor, getConnectionStatusText };
