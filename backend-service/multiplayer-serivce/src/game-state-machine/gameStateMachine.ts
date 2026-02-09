import type {
	GameState,
	Event,
	GameContext,
	StateMachineDefinition
} from "../multiplayerGame.types"
import { fetchRandomLocations } from "./utils"

/**
 * State machine is stateless, so it doesn't actually know what state it's in. This is stored in the context.
 * Fatal errors immediately ends state machine from any state.
 * The durable object must be able to boot up from *any* state.
 *The durable object has a separate global deletion/tear down method for cleaning up inactive games that is totally separate from the FSM
 */
const createMachine = (stateMachineDefinition: StateMachineDefinition) => {
	const getState = (ctx: GameContext) => ctx.gameStateMachinePhase
	const setState = (ctx: GameContext, value: GameState) => {
		ctx.gameStateMachinePhase = value
	}
	return {
		async transition(event: Event, ctx: GameContext) {
			const currentState = getState(ctx)
			const currentStateDefinition = stateMachineDefinition[currentState]
			if (!currentStateDefinition) {
				throw new Error(`Unknown state: ${currentState}`)

			}

			const destinationTransition = currentStateDefinition.transitions[event]
			if (!destinationTransition) {
				console.log(`Destination state for ${event} transition not found`)
				return currentState
			}
			if (destinationTransition.guard && !destinationTransition.guard(ctx, event)) {
				console.log(
					`Transition '${event}' from '${currentState}' to '${destinationTransition.target}' rejected by guard`
				)
				return currentState
			}
			const destinationState = destinationTransition.target
			const destinationStateDefinition = stateMachineDefinition[destinationState]
			if (!destinationStateDefinition) {
				throw new Error(`Unknown target state: ${destinationTransition.target}`)
			}
			currentStateDefinition.actions.onExit(ctx, event)
			// destinationTransition.action() is technically still in currentStateDefinition
			// the transition hasn't happened yet
			await destinationTransition.action(ctx, event)
			setState(ctx, destinationState)
			destinationStateDefinition.actions.onEnter(ctx, event)
			return getState(ctx)
		}
	}
}

const isRoundComplete = (ctx: GameContext): boolean => {
	// if all players have guessed
	if (ctx.rounds[ctx.currentRound - 1]?.playerGuesses?.length === ctx.players.length) {
		return true
	}
	// if timer is set and time has expired
	const roundEndTimeStamp = ctx.rounds[ctx.currentRound - 1]?.roundEndTimeStamp;
	if (ctx.timer && roundEndTimeStamp !== undefined) {
		if (Date.now() > roundEndTimeStamp) {
			return true
		}
	}
	// if timer is not set and all players have *not* made their guesses yet
	if (!ctx.timer && ctx.rounds[ctx.currentRound - 1]?.playerGuesses?.length < ctx.players.length) {
		return false
	}

	console.log('Round complete check failed for non-obvious reason:', ctx)
	return false
}

const globalTransitions: Partial<Record<Event, { target: GameState; action: (ctx: GameContext, event: Event) => void }>> = {
  fatalError: {
    target: 'final',
    action(ctx: GameContext, event: Event) {
      console.error('Fatal error triggered', { ctx, event })
    }
  }
}
  
const machine = createMachine({
	initialState: 'lobby',
	// In this state players join the game
	lobby: {
		actions: {
			onEnter() {
				console.log('lobby: onEnter')
			},
			onExit() {
				console.log('lobby: onExit')
			},
		},
		transitions: {
			startGame: {
				target: 'inRound',
				guard: (ctx: GameContext) => ctx.players.length >= 2,
				async action(ctx: GameContext) {
					ctx.currentRound = 1;
					const locations = await fetchRandomLocations(ctx.numberOfRounds);
					ctx.rounds = locations.map((location) => ({
						location,
						playerGuesses: []
					}));
					console.log('Starting game, currentRound set to:', ctx.currentRound);
				}
			},
			fatalError: globalTransitions.fatalError,
		}

	},
	inRound: {
		// In this state players submit guesses
		// Timer is polled on backend for round to end
		// When all guesses submitted (or timer expires), roundComplete is transitioned
		actions: {
			onEnter() {
				console.log('inRound: onEnter')
			},
			onExit() {
				console.log('inRound: onExit')
			},
		},
		transitions: {
			roundComplete: {
				target: 'showRoundResult',
				guard: (ctx: GameContext) => isRoundComplete(ctx),
				action(ctx: GameContext) {
					console.log('Round complete, showing round results');
				}
			},
			fatalError: globalTransitions.fatalError,
		}

	},
	showRoundResult: {
		// Show round results with map of all guesses
		// Host clicks "Next Round" to continue to next round, or "See Final Scores" on last round
		actions: {
			onEnter() {
				console.log('showRoundResult: onEnter')
			},
			onExit() {
				console.log('showRoundResult: onExit')
			},
		},
		transitions: {
			continueToNextRound: {
				target: 'inRound',
				guard: (ctx: GameContext) => ctx.currentRound < ctx.numberOfRounds,
				action(ctx: GameContext) {
					ctx.currentRound++;
					console.log('Continuing to next round:', ctx.currentRound);
				}
			},
			finishFinalRound: {
				target: 'showResult',
				guard: (ctx: GameContext) => ctx.currentRound === ctx.numberOfRounds,
				action(ctx: GameContext) {
					console.log('Final round results viewed, moving to final scores');
				}
			},
			fatalError: globalTransitions.fatalError,
		}
	},
	showResult: {
		actions: {
			onEnter() {
				console.log('showResult: onEnter')
				// Broadcast the game state object to clients (so they can display scores)

			},
			onExit() {
				console.log('showResult: onExit')
			},
		},
		transitions: {
			fatalError: globalTransitions.fatalError,
			gameEnded: { target: 'final', action() {} }
		}
	},
	final: {
		actions: {
			onEnter() {
				console.log('final: onEnter')
				// Wipe state
				// End game
			},
			onExit() {
				console.log('final: onExit')
			}
		},
		transitions: {}
	}
})

const createGameContext = ({
	gameOwnerId,
	numberOfRounds = 5,
	timer,
}: {
	gameOwnerId: string,
	numberOfRounds: number
	timer?: number,
}):GameContext => ({
	gameOwnerId,
	timer,
	players: [],
	numberOfRounds,
	rounds: [],
	gameStateMachinePhase: 'lobby',
	currentRound: 0
});

const exportedMachine = {
	machine,
	createGameContext,
};

export { exportedMachine };
