import React from 'react';
import { MENU_BAR_Z_INDEX } from '../../objects/layoutConsts';
import { numberOfRoundsInGame } from '../../objects/gameConsts';
import { useGameStore } from "../../store/gameStore"
import { useRoundStore } from "../../store/roundStore"
import MenuBarItem from './MenuBarItem';
import MenuBarButtonItem from './MenuBarButtonItem';

const MenuBar = () => {
	const { score } = useGameStore();
	const { currentRound } = useRoundStore();

	const onSettingsClick = () => {
		alert('Settings clicked');
	};

	const onAboutClick = () => {
		alert('About clicked');
	};

	const roundNumberAsDisplayed = currentRound.index + 1;

	return (
		<div className={`fixed bottom-0 left-0 right-0 bg-gray-200 backdrop-blur-sm border-t border-blue-950 ${MENU_BAR_Z_INDEX}`}>
			<div className="flex items-stretch mx-auto">
				<MenuBarButtonItem onClick={onAboutClick}>
					<span className="text-lg">ℹ️</span>
				</MenuBarButtonItem>
				
				{roundNumberAsDisplayed > 0 && (
					<MenuBarItem className="ml-auto">
						<div className="hidden sm:block">{score} points</div>
						<div className="block sm:hidden">{score} pts</div>
					</MenuBarItem>
				)}

				{roundNumberAsDisplayed > 0 && (
					<MenuBarItem>
						<div className="hidden sm:block">Round {roundNumberAsDisplayed}/{numberOfRoundsInGame}</div>
						<div className="block sm:hidden">{roundNumberAsDisplayed}/{numberOfRoundsInGame}</div>
					</MenuBarItem>
				)}
			</div>
		</div>
	);
};

export default MenuBar;