import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../ui/button';
import { Subheading, Paragraph } from '../typography/Typography';
import RoundTimerSelectionSlider from '../roundTimerSelectionSlider';
import { useFetch } from '../../hooks/useFetch';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { CreateGameResponse } from '../types/MultiplayerServiceApiResponse.types'


const StartMultiPlayerGameSetup = () => {
	const [timer, setTimer] = useState(0);
	const [shouldFetch, setShouldFetch] = useState(false);
	const { getToken } = useAuth();
	const [authToken, setAuthToken] = useState<string | null>(null);
	const { setGameData } = useMultiplayerStore();

	const { data, isPending, error } = useFetch<CreateGameResponse>(
		'http://localhost:8788/create-game',
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
		if (data?.gameCode) {
			setGameData({
				gameCode: data.gameCode,
				timer: data.timer,
				gameOwnerId: data.userId,
			});
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

			{error && (
				<Paragraph className="text-red-600 text-center mb-4">{error}</Paragraph>
			)}

			{data && (
				<Paragraph className="text-green-600 text-center mb-4">
					{/* Will add in "no timer!" logic here eventually */}
					Game created with {data.timer}ms timer!
				</Paragraph>
			)}

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