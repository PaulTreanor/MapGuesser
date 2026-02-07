import { useState, useEffect, useRef } from 'react';
import { useMultiplayerStore } from '../store/multiplayerStore';
import { MULTIPLAYER_SERVICE_API_URL } from '../objects/endpoints';
import { notify } from '../context/NotificationContext';
import type { JoinGameResponse } from '../types/MultiplayerServiceApiResponse.types';

type UseFetchGameMetadataReturn = {
	isFetching: boolean;
};

/**
 * Hook to fetch game metadata when joining a lobby via direct URL navigation.
 * If gameData already exists in the store, no fetch is performed.
 */
export const useFetchGameMetadata = (gameCode: string): UseFetchGameMetadataReturn => {
	const { gameData, setGameData } = useMultiplayerStore();
	const [isFetching, setIsFetching] = useState(false);
	const hasFetchedRef = useRef(false);

	useEffect(() => {
		const fetchGameMetadata = async () => {
			if (gameData || !gameCode || hasFetchedRef.current) {
				return;
			}

			hasFetchedRef.current = true;
			setIsFetching(true);

			try {
				const response = await fetch(`${MULTIPLAYER_SERVICE_API_URL}/join-game/${gameCode}`);

				if (response.status === 404) {
					notify({
						type: 'error',
						message: 'Game not found. The game may have expired or the code is invalid.',
						duration: 5000
					});
					window.location.hash = '';
					return;
				}

				if (!response.ok) {
					throw new Error(`Response status: ${response.status}`);
				}

				const data = await response.json() as JoinGameResponse;
				setGameData({
					gameCode: data.roomId,
					timer: 0,
					gameOwnerId: data.gameOwnerId,
				});
			} catch (error) {
				console.error('Failed to fetch game metadata:', error);
				notify({
					type: 'error',
					message: 'Failed to load game. Please try again.',
					duration: 5000
				});
				window.location.hash = '';
			} finally {
				setIsFetching(false);
			}
		};

		fetchGameMetadata();
	}, [gameCode, gameData, setGameData]);

	return { isFetching };
};
