import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Subheading } from '../typography/Typography';
import { useFetch } from '../../hooks/useFetch';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { notify } from '../../context/NotificationContext';
import type { JoinGameResponse } from '../../types/MultiplayerServiceApiResponse.types'
import { MULTIPLAYER_SERVICE_API_URL } from '../../objects/endpoints'

const JoinMultiplayerGameSetup = () => {
	const [code, setCode] = useState('');
	const [shouldFetch, setShouldFetch] = useState(false);
	const { setGameData } = useMultiplayerStore();

	const { data, isPending, error } = useFetch<JoinGameResponse>(
		`${MULTIPLAYER_SERVICE_API_URL}/join-game/${code}`,
		
		{
			enabled: shouldFetch
		}
	);

	useEffect(() => {
		if (error) {
			const is404 = error.includes('404');
			notify({
				type: 'error',
				message: is404
					? 'Game not found. Please check the code and try again.'
					: `Failed to join game: ${error}`,
				duration: 5000
			});
			setShouldFetch(false);
			setCode('');
		}
	}, [error]);

	useEffect(() => {
		if (data?.roomId) {
			setGameData({
				gameCode: data.roomId,
				timer: data.timer ?? 0,
				gameOwnerId: data.gameOwnerId,
			});
			window.location.hash = `#lobby-${data.roomId}`;
		}
	}, [data]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
		if (value.length <= 6) {
			setCode(value);
			setShouldFetch(false);
		}
	};

	const handleJoinGame = () => {
		// May need to swap to more of a validator type method here in the future
		// but for now simple length check is fine
		if (code.length === 6) {
			setShouldFetch(true);
		}
	};

	return (
		<div>
			<Subheading className='text-center'>
				Enter the 6-digit game code
			</Subheading>
			<br />
			<div className="flex flex-col items-center gap-4">
				<input
					type="text"
					value={code}
					onChange={handleInputChange}
					placeholder="ABC123"
					maxLength={6}
					className="w-48 text-center text-3xl font-bold tracking-widest uppercase border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>

				<Button
					onClick={handleJoinGame}
					variant="mapguesser"
					size="xl"
					disabled={code.length !== 6 || isPending}
				>
					{isPending ? 'Joining...' : 'Join Game'}
				</Button>
			</div>
		</div>
	);
};

export default JoinMultiplayerGameSetup;