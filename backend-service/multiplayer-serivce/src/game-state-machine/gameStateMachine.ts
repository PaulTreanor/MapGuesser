import type {
	GameState,
	Event,
	GameContext,
	StateMachineDefinition
} from "../multiplayerGame.types"
/**
 * Note: Fatal errors immediate ends state machine from any state
 * So DO must be able to boot up from *any* state - this needs to be tested
 * Durable object has separate global deletion/tear down method for cleaning up inactive games - this doesn't touch the FSM
 */

// Game state (ctx) will look sort of vaguely like this
// The state machine's state is in here. 
// const gameContextState = {
// 	gameOwnerId: "1234...",
// 	timer: 15, // seconds
// 	players: [
// 		{
// 			playerId: "1234...",
// 			playerName: "coolPlayer1",
// 			isGuest: true // this is actually totally redundant now but keeping it in and I'll refactor it out later
// 		},
// 		// ... more players
// 	],
// 	numberOfRounds: 5,
// 	rounds: [
// 		{
// 			location: {
// 				{"location": "Madrid", "coordinates": [-3.7038, 40.4168]},
// 			},
// 			playerGuesses: [
// 				{
// 					playerId: "1234...",
// 					guessCoordinates: [-3.7038, 40.4168],
// 				}
// 				// ... more player guesses - updated as they come in
// 			],
// 			roundEndTimeStamp: 1764528670,
// 		}, 
// 		// ... more rounds
// 	],
// 	gameStateMachinePhase: "inRound",
// 	currentRound: 3
// }

/**
 * State machine is stateless, so it doesn't actually know what state it's in. This is stored in the context.
 */
const createMachine = (stateMachineDefinition: StateMachineDefinition) => {
	const getState = (ctx: GameContext) => ctx["gameStateMachinePhase"]
	const setState = (ctx: GameContext, value: GameState) => {
		ctx["gameStateMachinePhase"] = value
	}
	return {
		transition(event: Event, ctx: GameContext) {
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
			destinationTransition.action(ctx, event)
			setState(ctx, destinationState)
			destinationStateDefinition.actions.onEnter(ctx, event)
			return getState(ctx)
		}
	}
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
				action(ctx: GameContext) {
					// fetch locations into game state
					// set currentRound = 1 in game state
					ctx.currentRound = 1;
					console.log('Starting game, currentRound set to:', ctx.currentRound);
				}
			},
			fatalError: globalTransitions.fatalError,
		}

	},
	inRound: {
		// In this state players submit guesses
		// Timer is polled on backend for round to end
		// When timer runs out (if timer) OR all guesses submitted, nextRound is transitioned
		// Add player scores tot total scores as they come in
		actions: {
			onEnter() {
				console.log('inRound: onEnter')
				// increment
				// Set round number location as current round in game state
				// If timer, set timer for round and add to game state
				// Broadcast the game state object to clients (players)
			},
			onExit() {
				console.log('inRound: onExit')
			},
		},
		transitions: {
			nextRound: {
				target: 'inRound',
				guard: (ctx: GameContext) => {
					// if final round, don't allow nextRound (should use finishFinalRound instead)
					if (ctx.currentRound >= ctx.numberOfRounds) {
						return false
					}
					// if all players have guessed
					if (ctx.rounds[ctx.currentRound - 1]?.playerGuesses?.length === ctx.players.length) {
						return true
					}
					// if timer is set and time has expired
					if (ctx.timer && ctx.rounds[ctx.currentRound - 1]?.roundEndTimeStamp) {
						if (Date.now() > ctx.rounds[ctx.currentRound - 1].roundEndTimeStamp) {
							return true
						}
					}
					// if timer is not set and all players have *not* made their guesses yet
					if (!ctx.timer && ctx.rounds[ctx.currentRound - 1]?.playerGuesses?.length < ctx.players.length) {
						return false
					}

					console.log('Transition guard for nextRound failed for non-obvious reason:', ctx)
					return false
				},
				action(ctx: GameContext) {
					// currentRound++ in game state
					ctx.currentRound++;
					console.log('Moving to next round:', ctx.currentRound);
				}
			},
			finishFinalRound: {
				target: 'showResult',
				guard: (ctx: GameContext) => {
					// if not final round
					if (ctx.currentRound !== ctx.numberOfRounds) {
						return false
					}
					// if all players have guessed
					if (ctx.rounds[ctx.currentRound - 1]?.playerGuesses?.length === ctx.players.length) {
						return true
					}
					// if timer is set and time has expired
					if (ctx.timer && ctx.rounds[ctx.currentRound - 1]?.roundEndTimeStamp) {
						if (Date.now() > ctx.rounds[ctx.currentRound - 1].roundEndTimeStamp) {
							return true
						}
					}
					// if timer is not set and all players have *not* made their guesses yet
					if (!ctx.timer && ctx.rounds[ctx.currentRound - 1]?.playerGuesses?.length < ctx.players.length) {
						return false
					}
					console.log('Transition guard for finishFinalRound failed for non-obvious reason:', ctx)
					return false
				},
				action(ctx: GameContext) {
					console.log('Final round completed, moving to results');
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
