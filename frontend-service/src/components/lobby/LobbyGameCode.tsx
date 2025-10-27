import React from 'react';
import { Subheading } from '../typography/Typography';
import { getConnectionStatusColor, getConnectionStatusText } from '../../utils/connectionStatusUtils';
import type { ConnectionStatus } from '../../types/ConnectionStatus.types';

type LobbyGameCodeProps = {
	gameCode: string;
	connectionStatus: ConnectionStatus;
};

const LobbyGameCode = ({ gameCode, connectionStatus }: LobbyGameCodeProps) => {
	return (
		<div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
			<Subheading className="text-center mb-2">
				Game Code
			</Subheading>
			<div className="text-center text-4xl font-bold tracking-widest text-blue-800">
				{gameCode}
			</div>
			<div className="flex justify-center mt-4">
				<div className={`px-3 py-1 rounded-full border text-sm font-medium ${getConnectionStatusColor(connectionStatus)}`}>
					{getConnectionStatusText(connectionStatus)}
				</div>
			</div>
		</div>
	);
};

export default LobbyGameCode;
