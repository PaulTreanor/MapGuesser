import { ConnectionStatus } from '../objects/connectionStatuses';
import type { ConnectionStatusValue } from '../objects/connectionStatuses';

const getConnectionStatusColor = (status: ConnectionStatusValue): string => {
	switch (status) {
		case ConnectionStatus.CONNECTED:
			return 'bg-green-100 text-green-800 border-green-300';
		case ConnectionStatus.CONNECTING:
			return 'bg-yellow-100 text-yellow-800 border-yellow-300';
		case ConnectionStatus.ERROR:
			return 'bg-red-100 text-red-800 border-red-300';
		default:
			return 'bg-gray-100 text-gray-800 border-gray-300';
	}
};

const getConnectionStatusText = (status: ConnectionStatusValue): string => {
	switch (status) {
		case ConnectionStatus.CONNECTED:
			return '● Connected';
		case ConnectionStatus.CONNECTING:
			return '○ Connecting...';
		case ConnectionStatus.ERROR:
			return '✕ Connection Error';
		default:
			return '○ Disconnected';
	}
};

export { getConnectionStatusColor, getConnectionStatusText };
