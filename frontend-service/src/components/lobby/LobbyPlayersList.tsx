import React from 'react';
import { Subheading, Paragraph } from '../typography/Typography';
import type { Player } from '../../types/MultiplayerServiceApiResponse.types';

type LobbyPlayersListProps = {
	players: Player[];
	gameOwnerId?: string;
};

const LobbyPlayersList = ({ players, gameOwnerId }: LobbyPlayersListProps) => {
	return (
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
									{player.playerId === gameOwnerId && (
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
	);
};

export default LobbyPlayersList;
