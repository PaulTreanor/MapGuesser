import { create } from 'zustand';
import type { CreateGameResponse, GameContext } from '../types/MultiplayerServiceApiResponse.types';
import type { Player } from '../types/MultiplayerServiceApiResponse.types';

interface MultiplayerStore {
	gameData: CreateGameResponse | null;
	players: Player[];
	gameContext: GameContext | null;

	setPlayers: (players: Player[]) => void;
	setGameData: (data: CreateGameResponse) => void;
	setGameContext: (context: GameContext) => void;
	clearGameData: () => void;
}

const useMultiplayerStore = create<MultiplayerStore>((set) => ({
	// state
	gameData: null,
	players: [],
	gameContext: null,

	// actions
	setPlayers: (playersList) => set({ players: playersList}),
	setGameData: (data) => set({ gameData: data }),
	setGameContext: (context) => set({ gameContext: context }),
	clearGameData: () => set({ gameData: null, gameContext: null }),
}));

export { useMultiplayerStore };