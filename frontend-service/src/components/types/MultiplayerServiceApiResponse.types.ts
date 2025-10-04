type CreateGameResponse = {
	gameCode: string;
	timer: number;
	userId: string;
};

type JoinGameResponse = {
	roomId: string;
	status: string;
	expiresAt: string;
	wsUrl: string;
	userId: string;
};

export type {
	CreateGameResponse,
	JoinGameResponse,
}