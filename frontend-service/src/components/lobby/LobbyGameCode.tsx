import React, { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Subheading } from '../typography/Typography';
import { Button } from '../ui/button';
import { getConnectionStatusColor, getConnectionStatusText } from '../../utils/connectionStatusUtils';
import { notify } from '../../context/NotificationContext';
import type { ConnectionStatusValue } from '../../objects/connectionStatuses';

type LobbyGameCodeProps = {
	gameCode: string;
	connectionStatus: ConnectionStatusValue;
};

const buildInviteLink = (gameCode: string): string => {
	return `${window.location.origin}${window.location.pathname}#join-game-${gameCode}`;
};

const LobbyGameCode = ({ gameCode, connectionStatus }: LobbyGameCodeProps) => {
	const [isCopied, setIsCopied] = useState(false);

	const onCopyLinkClick = async () => {
		try {
			await navigator.clipboard.writeText(buildInviteLink(gameCode));
			setIsCopied(true);
			notify({
				type: 'success',
				message: 'Invite link copied to clipboard!',
				duration: 3000,
			});
			setTimeout(() => setIsCopied(false), 3000);
		} catch {
			notify({
				type: 'error',
				message: 'Failed to copy invite link.',
				duration: 5000,
			});
		}
	};

	return (
		<div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
			<Subheading className="text-center mb-2">
				Game Code
			</Subheading>
			<div className="text-center text-4xl font-bold tracking-widest text-blue-800">
				{gameCode}
			</div>
			<div className="flex justify-center mt-4">
				<Button
					variant="mapguesser"
					size="lg"
					onClick={onCopyLinkClick}
				>
					<Link2 />
					{isCopied ? 'Invite Link Copied!' : 'Copy Invite Link'}
				</Button>
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
