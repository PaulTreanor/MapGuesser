import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Subheading } from '../typography/Typography';
import RoundTimerSelectionSlider from '../roundTimerSelectionSlider';
import { useFetch } from '../../hooks/useFetch';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { notify } from '../../context/NotificationContext';
import { CreateGameResponse } from '../../types/MultiplayerServiceApiResponse.types'
import { MULTIPLAYER_SERVICE_API_URL } from '../../objects/endpoints'
import { getPlayerIdentity } from '../../utils/guestIdentityUtils';


const StartMultiPlayerGameSetup = () => {
        const [timer, setTimer] = useState(0);
        const [shouldFetch, setShouldFetch] = useState(false);
        const { setGameData } = useMultiplayerStore();
        const playerIdentityRef = useRef(getPlayerIdentity());

        const { data, isPending, error } = useFetch<CreateGameResponse>(
                `${MULTIPLAYER_SERVICE_API_URL}/create-game`,
                {
                        method: 'POST',
                        headers: {
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                                timer,
                                hostId: playerIdentityRef.current.playerId,
                        }),
                        enabled: shouldFetch,
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
                if (data?.gameCode) {
                        setGameData(data);
                        window.location.hash = `#lobby-${data.gameCode}`;
                        setShouldFetch(false);
                }
        }, [error, data]);

	const handleTimerChange = (hasTimer: boolean, timeMs: number) => {
		setTimer(timeMs);
	};

        const handleCreateGame = () => {
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
