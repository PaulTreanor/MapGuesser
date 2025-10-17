import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Subheading } from '../typography/Typography';
import RoundTimerSelectionSlider from '../roundTimerSelectionSlider';
import { useFetch } from '../../hooks/useFetch';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { notify } from '../../context/NotificationContext';
import { CreateGameResponse } from '../types/MultiplayerServiceApiResponse.types'
import { MULTIPLAYER_SERVICE_API_URL } from '../../objects/endpoints'


const StartMultiPlayerGameSetup = () => {
	const [timer, setTimer] = useState(0);
	const [shouldFetch, setShouldFetch] = useState(false);
	const { getToken } = useAuth();
	const [authToken, setAuthToken] = useState<string | null>(null);
	const { setGameData } = useMultiplayerStore();

	const { data, isPending, error } = useFetch<CreateGameResponse>(
		`${MULTIPLAYER_SERVICE_API_URL}/create-game`,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				...(authToken && { 'Authorization': `Bearer ${authToken}` }),
			},
			body: JSON.stringify({ timer }),
			enabled: shouldFetch && authToken !== null,
		}
	);

	useEffect(() => {
		if (error) {
			notify({
				type: 'error',
				message: `Failed to create game: ${error}`,
				duration: 5000
			});
			setShouldFetch(false);
		}
	}, [error]);

	useEffect(() => {
		if (data?.gameCode) {
			setGameData(data);
			window.location.hash = `#lobby-${data.gameCode}`;
		}
	}, [data]);

	const handleTimerChange = (hasTimer: boolean, timeMs: number) => {
		setTimer(timeMs);
	};

	const handleCreateGame = async () => {
		const token = await getToken();
		setAuthToken(token);
		setShouldFetch(true);
	};

	return (
		<div>
			<Subheading>
				Do you want a timer for each round?
			</Subheading>
			<br />
			<RoundTimerSelectionSlider onChange={handleTimerChange} />
			<br />

			<div className="flex justify-end mr-2">
				<Button
					onClick={handleCreateGame}
					variant="mapguesser"
					size="xl"
					disabled={isPending}
				>
					{isPending ? 'Creating...' : 'Create Game'}
				</Button>
			</div>
		</div>
	);
};

export default StartMultiPlayerGameSetup;