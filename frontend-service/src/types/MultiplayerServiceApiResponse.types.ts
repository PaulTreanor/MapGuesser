type CreateGameResponse = {
	gameCode: string;
	timer: number;
	gameOwnerId: string;
};

type JoinGameResponse = {
	roomId: string;
	status: string;
	expiresAt: string;
	wsUrl: string;
	gameOwnerId: string;
};

type Player = {
	playerId: string;
	playerName: string;
	isGuest: boolean;
};

type GameRoomMessage = {
	type: string;
	[key: string]: unknown;
};

export type {
	CreateGameResponse,
	JoinGameResponse,
	Player,
	GameRoomMessage,
}