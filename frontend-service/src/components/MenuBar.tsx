import React from 'react';
import { MENU_BAR_Z_INDEX } from '../objects/layoutConsts';
import { numberOfRoundsInGame } from '../objects/gameConsts';
import { useGameStore } from "../store/gameStore"
import { useRoundStore } from "../store/roundStore"

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
		<div className={`fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700/50 px-4 py-2 ${MENU_BAR_Z_INDEX}`}>
			<div className="flex justify-between items-center max-w-screen-xl mx-auto">
				<div className="flex space-x-4">
					<button
						onClick={onSettingsClick}
						className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
					>
						Settings
					</button>
					<button
						onClick={onAboutClick}
						className="text-white/80 hover:text-white text-sm font-medium px-3 py-1 rounded transition-colors"
					>
						About
					</button>
				</div>
				{roundNumberAsDisplayed > 0 && (
					<div className="text-white/90 text-sm font-medium">
						<span className="mr-3">{score} pts</span>
						<span>{roundNumberAsDisplayed}/{numberOfRoundsInGame}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default MenuBar;