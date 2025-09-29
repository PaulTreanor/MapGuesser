import React from 'react'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { GAME_SETUP_STEPS, gameModeCards } from '../../objects/gameSetupConsts'
import GameModeCard from './GameModeCard'
import type { GameModeCardType } from '../types/GameSetupModal.types'

export default function SelectGameModeMenu() {
	const { isSignedIn } = useAuth();
	const { openSignIn } = useClerk();

	const handleCardClick = (card: GameModeCardType) => {
		if (!card.enabled) return;
		
		if (card.id === GAME_SETUP_STEPS.START_GAME) {
			if (!isSignedIn) {
				openSignIn();
				return;
			}
		}
		
		window.location.hash = card.fragment;
	};

	return (
		<div className="w-full">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
				{gameModeCards.map((card) => (
					<GameModeCard
						key={card.id}
						id={card.id}
						title={card.title}
						description={card.description}
						enabled={card.enabled}
						fragment={card.fragment}
						colorClasses={card.colorClasses}
						onClick={() => handleCardClick(card)}
					/>
				))}
			</div>
		</div>
	)
}
