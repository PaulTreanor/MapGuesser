import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Heading, Subheading, Paragraph } from '../typography/Typography';
import { Button } from '../ui/button';
import { useMultiplayerStore } from '../../store/multiplayerStore';

const Lobby = () => {
	const { user, isSignedIn } = useUser();
	const { gameData } = useMultiplayerStore();

	const hash = window.location.hash;
	const gameCode = hash.replace('#lobby-', '');

	const isGameOwner = isSignedIn && user?.id === gameData?.gameOwnerId;

	return (
		<div>
			<div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
				<Subheading className="text-center mb-2">
					Game Code
				</Subheading>
				<div className="text-center text-4xl font-bold tracking-widest text-blue-800">
					{gameCode}
				</div>
			</div>

			<Paragraph className="text-center text-gray-600 mb-6">
				Share this code with your friends to join the game!
			</Paragraph>

			<div className="border-t border-gray-200 pt-6 mb-6">
				<Subheading className="mb-4">
					Players in lobby:
				</Subheading>
				<div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
					<Paragraph className="text-gray-500 text-center">
						Waiting for players to join...
					</Paragraph>
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