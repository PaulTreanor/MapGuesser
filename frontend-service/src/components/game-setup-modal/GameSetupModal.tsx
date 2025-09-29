import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import { Paragraph } from '../typography/Typography'
import { MapGuesserHeading } from '../typography/MapGuesserHeading'
import SinglePlayerStartMenu from './SinglePlayerStartMenu'
import SelectGameModeMenu from './SelectGameModeMenu'
import MultiplayerMode from './MultiplayerMode'
import { GAME_SETUP_STEPS, GameSetupStep } from '../../objects/gameSetupConsts'

const getStepFromHash = (): GameSetupStep => {
	const hash = window.location.hash;
	switch (hash) {
		case '#single-player':
			return GAME_SETUP_STEPS.SINGLE_PLAYER;
		case '#start-game':
			return GAME_SETUP_STEPS.START_GAME;
		case '#join-game':
			return GAME_SETUP_STEPS.JOIN_GAME;
		default:
			return GAME_SETUP_STEPS.SELECT_MODE;
	}
};

export default function GameSetupModal({setGameState}: {setGameState: () => void}) {
	const [currentStep, setCurrentStep] = useState<GameSetupStep>(GAME_SETUP_STEPS.SELECT_MODE);

	useEffect(() => {
		const handleHashChange = () => {
			setCurrentStep(getStepFromHash());
		};

		setCurrentStep(getStepFromHash());
		window.addEventListener('hashchange', handleHashChange);

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
		};
	}, []);

	const renderStepContent = () => {
		switch (currentStep) {
			case GAME_SETUP_STEPS.SINGLE_PLAYER:
				return <SinglePlayerStartMenu setGameState={setGameState} />;
			case GAME_SETUP_STEPS.START_GAME:
				return <MultiplayerMode />;
			// case GAME_SETUP_STEPS.JOIN_GAME:
			// 		return <JoinGameStartMenu setGameState={setGameState} />;
			case GAME_SETUP_STEPS.SELECT_MODE:
			default:
				return <SelectGameModeMenu />;
		}
	};

	return (
		<Modal>
			<MapGuesserHeading />
			<br />
			<Paragraph>
				For each round, try to pinpoint the city on the map. Scores are based on how far your guess is from the city's real location, so lower scores are better. 
			</Paragraph>
			<br />
			{renderStepContent()}
		</Modal>
	)
}