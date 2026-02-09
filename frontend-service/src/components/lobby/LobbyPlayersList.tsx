import React, { useState } from 'react';
import { Subheading, Paragraph } from '../typography/Typography';
import type { Player } from '../../types/MultiplayerServiceApiResponse.types';

type LobbyPlayersListProps = {
	players: Player[];
	gameOwnerId?: string;
	currentPlayerId?: string;
	onNameChange?: (newName: string) => void;
};

const LobbyPlayersList = ({ players, gameOwnerId, currentPlayerId, onNameChange }: LobbyPlayersListProps) => {
	const [isEditing, setIsEditing] = useState(false);
	const [editedName, setEditedName] = useState('');

	const currentPlayer = players.find(p => p.playerId === currentPlayerId);

	const onEditClick = () => {
		setEditedName(currentPlayer?.playerName || '');
		setIsEditing(true);
	};

	const onSaveClick = () => {
		const trimmedName = editedName.trim();
		if (trimmedName && trimmedName !== currentPlayer?.playerName) {
			onNameChange?.(trimmedName);
		}
		setIsEditing(false);
	};

	const onCancelClick = () => {
		setIsEditing(false);
		setEditedName('');
	};

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			onSaveClick();
		} else if (e.key === 'Escape') {
			onCancelClick();
		}
	};

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
						{players.map((player) => {
							const isCurrentPlayer = player.playerId === currentPlayerId;
							return (
								<div
									key={player.playerId}
									className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
											{player.playerName.charAt(0).toUpperCase()}
										</div>
										{isCurrentPlayer && isEditing ? (
											<input
												type="text"
												value={editedName}
												onChange={(e) => setEditedName(e.target.value)}
												onKeyDown={onKeyDown}
												className="font-medium px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
												autoFocus
												maxLength={20}
											/>
										) : (
											<span className="font-medium">{player.playerName}</span>
										)}
									</div>
									<div className="flex items-center gap-2">
										{isCurrentPlayer && !isEditing && (
											<button
												onClick={onEditClick}
												className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
											>
												Edit
											</button>
										)}
										{isCurrentPlayer && isEditing && (
											<>
												<button
													onClick={onSaveClick}
													className="text-xs text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50"
												>
													Save
												</button>
												<button
													onClick={onCancelClick}
													className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
												>
													Cancel
												</button>
											</>
										)}
										{isCurrentPlayer && (
											<span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-medium">
												You
											</span>
										)}
										{!isCurrentPlayer && player.isGuest && (
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
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
};

export default LobbyPlayersList;
