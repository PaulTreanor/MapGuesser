import type { GameModeCardType } from '../components/types/GameSetupModal.types'

// These are the names of the steps in the very simple game mode "state machine"
// in GameSetupModal.tsx and also the name of the URL fragment for the corresponding game modes
// except for select-mode, as it isn't one of the three game modes
const GAME_SETUP_STEPS = {
	SELECT_MODE: 'select-mode',
	SINGLE_PLAYER: 'single-player',
	START_GAME: 'start-game',
	JOIN_GAME: 'join-game',
	LOBBY: 'lobby',
} as const;

type GameSetupStep = typeof GAME_SETUP_STEPS[keyof typeof GAME_SETUP_STEPS];

const gameModeCards: GameModeCardType[] = [
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
		enabled: true,
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
		enabled: true,
		fragment: `#${GAME_SETUP_STEPS.JOIN_GAME}`,
		colorClasses: {
			bg: 'bg-violet-100',
			bgHover: 'hover:bg-violet-200',
			border: 'border-violet-300',
			borderHover: 'hover:border-violet-400',
		},
	},
];

export {
	GAME_SETUP_STEPS,
	GameSetupStep,
	gameModeCards,
};