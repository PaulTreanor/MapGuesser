import { create } from 'zustand';
import type { CreateGameResponse } from '../types/MultiplayerServiceApiResponse.types';
import type { Player } from '../types/MultiplayerServiceApiResponse.types';

interface MultiplayerStore {
	gameData: CreateGameResponse | null;
	players: Player[];

	setPlayers: (players: Player[]) => void;
	setGameData: (data: CreateGameResponse) => void;
	clearGameData: () => void;
}

const useMultiplayerStore = create<MultiplayerStore>((set) => ({
	// state
	gameData: null,
	players: [],


	// actions
	setPlayers: (playersList) => set({ players: playersList}),
	setGameData: (data) => set({ gameData: data }),
	clearGameData: () => set({ gameData: null }),
}));

export { useMultiplayerStore };