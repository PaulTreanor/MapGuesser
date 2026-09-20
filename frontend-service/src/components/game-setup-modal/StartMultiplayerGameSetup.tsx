import React, { useEffect, useRef } from 'react';
import { Heading, Paragraph } from '../typography/Typography';
import { useFetch } from '../../hooks/useFetch';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { notify } from '../../context/NotificationContext';
import { CreateGameResponse } from '../../types/MultiplayerServiceApiResponse.types'
import { MULTIPLAYER_SERVICE_API_URL } from '../../objects/endpoints'
import { getPlayerIdentity } from '../../utils/guestIdentityUtils';


const StartMultiPlayerGameSetup = () => {
	const { setGameData } = useMultiplayerStore();
	const playerIdentityRef = useRef(getPlayerIdentity());

	const { data, error } = useFetch<CreateGameResponse>(
		`${MULTIPLAYER_SERVICE_API_URL}/create-game`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				timer: 0,
				hostId: playerIdentityRef.current.playerId,
			}),
			enabled: true,
		}
	);

	useEffect(() => {
		if (error) {
			notify({
				type: 'error',
				message: `Failed to create game: ${error}`,
				duration: 5000
			});
			window.location.hash = '';
		}
		if (data?.gameCode) {
			setGameData(data);
			window.location.hash = `#lobby-${data.gameCode}`;
		}
	}, [error, data]);

	return (
		<div className="py-6 text-center">
			<Heading>Creating game room...</Heading>
			<Paragraph className="text-gray-600 mt-2">
				Setting up your lobby
			</Paragraph>
		</div>
	);
};

export default StartMultiPlayerGameSetup;
