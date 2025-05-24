# XState Implementation Summary

This document summarizes the XState implementation for the MapGuesser game's state management.

## Overview

Refactored the game's state management from separate Zustand stores (`gameStore`, `roundStore`) to a unified XState state machine. This provides better state transitions, more predictable behavior, and easier reasoning about game flow.

## Files Created/Modified

### New Files
- `src/machines/gameMachine.ts` - Main state machine definition
- `src/hooks/useGameMachine.ts` - React hook wrapping the state machine
- `XSTATE_IMPLEMENTATION.md` - This documentation

### Modified Files
- `src/components/Game.tsx` - Refactored to use state machine
- `src/components/StartModal.tsx` - Updated to receive props instead of using store
- `src/hooks/useRoundTimer.ts` - Made generic to work with any state source
- `package.json` - Added XState dependencies

## State Machine Structure

```
notStarted
├── LOAD_ROUNDS → (stay in notStarted)
├── SET_TIMER_CONFIG → (stay in notStarted)  
└── START_GAME → playingRound

playingRound
├── active
│   ├── COMPLETE_ROUND → completed
│   ├── TIME_EXPIRED → completed
│   └── SET_ROUND_END_TIME → (stay in active)
├── completed
│   └── NEXT_ROUND → [check if last round]
│       ├── → finished (if last round)
│       └── → active (if more rounds)
└── RESET_GAME → notStarted

finished
└── RESET_GAME → notStarted
```

## Context (State)

```typescript
interface GameContext {
  // Game state
  doesGameHaveTimer: boolean
  status: GameStatus
  score: number
  rounds: Round[] | null
  roundTimeMs: number
  
  // Round state  
  currentRoundIndex: number
  roundCompleted: boolean
  roundEndTimeStamp: number | null
}
```

## Events

- `START_GAME` - Begin the game
- `LOAD_ROUNDS` - Load round data from API
- `COMPLETE_ROUND` - Complete current round with score
- `TIME_EXPIRED` - Handle timer expiration
- `NEXT_ROUND` - Move to next round
- `FINISH_GAME` - End the game
- `RESET_GAME` - Reset to initial state
- `SET_TIMER_CONFIG` - Configure timer settings
- `SET_ROUND_END_TIME` - Set round timer timestamp

## Benefits

1. **Unified State** - All game and round state in one place
2. **Clear Transitions** - Explicit state transitions prevent invalid states
3. **Event-Driven** - Actions are events that clearly describe what happened
4. **Multiplayer Ready** - State machines excel at coordination between multiple actors
5. **Debugging** - XState provides excellent debugging tools and visualizations
6. **Predictable** - State changes are deterministic and easy to reason about

## Backward Compatibility

The `useGameMachine` hook provides the same interface as the original stores, so existing components continue to work with minimal changes.

## Testing Notes

Some existing tests may need updates as they were written for the Zustand store pattern. The state machine introduces slightly different timing for state transitions.

## Future Multiplayer Considerations

This state machine is designed to easily extend for multiplayer:
- Add player-specific context
- Add synchronization events (PLAYER_READY, SYNC_STATE, etc.)
- Add connection management states
- Add turn-based logic states

The current single-player implementation provides a solid foundation for these multiplayer features.