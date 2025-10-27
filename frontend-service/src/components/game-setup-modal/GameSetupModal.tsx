import React, { useState, useEffect } from 'react'
import Modal from '../Modal'
import { Paragraph } from '../typography/Typography'
import { MapGuesserHeading } from '../typography/MapGuesserHeading'
import SinglePlayerStartMenu from './SinglePlayerStartMenu'
import SelectGameModeMenu from './SelectGameModeMenu'
import StartMultiPlayerGameSetup from './StartMultiplayerGameSetup'
import JoinMultiplayerGameSetup from './JoinMultiplayerGameSetup'
import Lobby from './Lobby'
import { GAME_SETUP_STEPS, GameSetupStep } from '../../objects/gameSetupConsts'

/**
 * GameSetupModal is a parent component to game setup modal menus for all
 * game modes, including the lobby, etc. 
 * 
 * As the user progresses through these menus (selects mode, joins lobby, etc)
 * those child components trigger a progression to the next component via changing
 * the URL hash. Each hash change triggers the next step before gameplay begins.
 * 
 * getStepFromHash() maps the URL hash to the menu steps (these are basically stages
 * or options). Then GameSetupModal.tsx maps those steps to specific componentsOK.
 */
const getStepFromHash = (): { step: GameSetupStep; gameCode?: string } => {
	const hash = window.location.hash;

	if (hash.startsWith('#lobby-')) {
		const gameCode = hash.replace('#lobby-', '');
		return { step: GAME_SETUP_STEPS.LOBBY, gameCode };
	}

	switch (hash) {
		case '#single-player':
			return { step: GAME_SETUP_STEPS.SINGLE_PLAYER };
		case '#start-game':
			return { step: GAME_SETUP_STEPS.START_GAME };
		case '#join-game':
			return { step: GAME_SETUP_STEPS.JOIN_GAME };
		default:
			return { step: GAME_SETUP_STEPS.SELECT_MODE };
	}
};

export default function GameSetupModal() {
	const [currentStep, setCurrentStep] = useState<GameSetupStep>(GAME_SETUP_STEPS.SELECT_MODE);
	const [gameCode, setGameCode] = useState<string | undefined>(undefined);

	useEffect(() => {
		const handleHashChange = () => {
			const { step, gameCode: code } = getStepFromHash();
			setCurrentStep(step);
			setGameCode(code);
		};

		handleHashChange()
		window.addEventListener('hashchange', handleHashChange);

		return () => {
			window.removeEventListener('hashchange', handleHashChange);
		};
	}, []);

	const renderStepContent = () => {
		switch (currentStep) {
			case GAME_SETUP_STEPS.SINGLE_PLAYER:
				return <SinglePlayerStartMenu />;
			case GAME_SETUP_STEPS.START_GAME:
				return <StartMultiPlayerGameSetup />;
			case GAME_SETUP_STEPS.JOIN_GAME:
				return <JoinMultiplayerGameSetup />;
			case GAME_SETUP_STEPS.LOBBY:
				return <Lobby />;
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