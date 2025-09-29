import { GAME_SETUP_STEPS, GameSetupStep } from '../../objects/gameSetupConsts'

type GameModeCardType = {
	id: GameSetupStep,
	title: string,
	description: string,
	enabled: boolean,
	fragment: string,
	colorClasses: {
		bg: string,
		bgHover: string,
		border: string,
		borderHover: string
	}
}

export {
    GameModeCardType
}