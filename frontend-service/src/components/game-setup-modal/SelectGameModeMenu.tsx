import React from 'react'
import { useAuth, useClerk } from '@clerk/clerk-react'
import { GAME_SETUP_STEPS } from '../../objects/gameSetupConsts'
import GameModeCard from './GameModeCard'

const gameModeCards = [
	{
		id: GAME_SETUP_STEPS.SINGLE_PLAYER,
		title: 'Single Player Game',
		description: 'Play solo and compete against your own best scores',
		enabled: true,
		fragment: `#${GAME_SETUP_STEPS.SINGLE_PLAYER}`,
		colorClasses: {
			bg: 'bg-blue-100',
			bgHover: 'hover:bg-blue-200',
			border: 'border-blue-300',
			borderHover: 'hover:border-blue-400',
		},
	},
	{
		id: GAME_SETUP_STEPS.START_GAME,
		title: 'Start Multiplayer Game',
		description: 'Create a game room and invite friends',
		enabled: false,
		fragment: `#${GAME_SETUP_STEPS.START_GAME}`,
		colorClasses: {
			bg: 'bg-green-100',
			bgHover: 'hover:bg-green-200',
			border: 'border-green-300',
			borderHover: 'hover:border-green-400',
		},
	},
	{
		id: GAME_SETUP_STEPS.JOIN_GAME,
		title: 'Join Multiplayer Game',
		description: 'Join an existing game room',
		enabled: false,
		fragment: `#${GAME_SETUP_STEPS.JOIN_GAME}`,
		colorClasses: {
			bg: 'bg-violet-100',
			bgHover: 'hover:bg-violet-200',
			border: 'border-violet-300',
			borderHover: 'hover:border-violet-400',
		},
	},
];

export default function SelectGameModeMenu() {
	const { isSignedIn } = useAuth();
	const { openSignIn } = useClerk();

	const handleCardClick = (card: typeof gameModeCards[0]) => {
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
