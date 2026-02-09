import React, { useState } from 'react';
import { MENU_BAR_Z_INDEX } from '../../objects/layoutConsts';
import { numberOfRoundsInGame } from '../../objects/gameConsts';
import { useGameStore } from "../../store/gameStore"
import { useRoundStore } from "../../store/roundStore"
import { useMultiplayerStore } from "../../store/multiplayerStore"
import MenuBarItem from './MenuBarItem';
import MenuBarButtonItem from './MenuBarButtonItem';
import AboutModal from '../AboutModal';

const MenuBar = () => {
	const { score } = useGameStore();
	const { currentRound } = useRoundStore();
	const { gameContext } = useMultiplayerStore();
	const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

	const onAboutClick = () => {
		setIsAboutModalOpen(true);
	};

	const onAboutModalClose = () => {
		setIsAboutModalOpen(false);
	};

	// Check if multiplayer mode
	const isMultiplayer = gameContext && gameContext.gameStateMachinePhase !== 'lobby';

	// Get round info based on mode
	const roundNumberAsDisplayed = isMultiplayer
		? gameContext.currentRound
		: currentRound.index + 1;
	const totalRounds = isMultiplayer
		? gameContext.numberOfRounds
		: numberOfRoundsInGame;

	const renderScoreContent = () => {
		if (isMultiplayer) {
			const currentRoundData = gameContext.rounds[gameContext.currentRound - 1];
			const playersWhoGuessed = currentRoundData?.playerGuesses.length ?? 0;
			const totalPlayers = gameContext.players.length;

			return (
				<>
					<div className="hidden sm:block">{playersWhoGuessed}/{totalPlayers} guessed</div>
					<div className="block sm:hidden">{playersWhoGuessed}/{totalPlayers}</div>
				</>
			);
		}

		return (
			<>
				<div className="hidden sm:block">{score} points</div>
				<div className="block sm:hidden">{score} pts</div>
			</>
		);
	};

	return (
		<>
			<div className={`fixed bottom-0 left-0 right-0 bg-gray-200 backdrop-blur-sm border-t border-blue-950 ${MENU_BAR_Z_INDEX}`}>
				<div className="flex items-stretch mx-auto">
					<MenuBarButtonItem onClick={onAboutClick}>
						<span className="text-lg">ℹ️</span>
					</MenuBarButtonItem>
					<MenuBarItem>
						<p className="hidden md:block font-titillium text-blue-800 font-bold">🌎 MapGuesser</p>
					</MenuBarItem>
					<MenuBarItem className="ml-auto">
						{renderScoreContent()}
					</MenuBarItem>
					<MenuBarItem>
						<div className="hidden sm:block">Round {roundNumberAsDisplayed}/{totalRounds}</div>
						<div className="block sm:hidden">{roundNumberAsDisplayed}/{totalRounds}</div>
					</MenuBarItem>
				</div>
			</div>

			{isAboutModalOpen && (
				<AboutModal onClose={onAboutModalClose} />
			)}
		</>
	);
};

export default MenuBar;