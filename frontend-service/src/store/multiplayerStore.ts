import { create } from 'zustand';
import type { CreateGameResponse } from '../types/MultiplayerServiceApiResponse.types';

interface MultiplayerStore {
	gameData: CreateGameResponse | null;

	setGameData: (data: CreateGameResponse) => void;
	clearGameData: () => void;
}

const useMultiplayerStore = create<MultiplayerStore>((set) => ({
	gameData: null,

	setGameData: (data: CreateGameResponse) => set({ gameData: data }),
	clearGameData: () => set({ gameData: null }),
}));

export { useMultiplayerStore };