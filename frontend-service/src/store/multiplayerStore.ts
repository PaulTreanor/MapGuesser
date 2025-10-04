import { create } from 'zustand';

type GameData = {
	gameCode: string;
	timer: number;
	gameOwnerId: string;
};

interface MultiplayerStore {
	// State
	gameData: GameData | null;

	// Actions
	setGameData: (data: GameData) => void;
	clearGameData: () => void;
}

const useMultiplayerStore = create<MultiplayerStore>((set) => ({
	// State
	gameData: null,

	// Actions
	setGameData: (data: GameData) => set({ gameData: data }),

	clearGameData: () => set({ gameData: null }),
}));

export { useMultiplayerStore };
export type { GameData };