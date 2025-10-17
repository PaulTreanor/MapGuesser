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

export type {
	CreateGameResponse,
	JoinGameResponse,
}