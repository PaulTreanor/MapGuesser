/**
 * generateRoundEndTimeStamp generates a time stamp for the end of a round.
 * It is ONLY FOR SINGLE PLAYER GAMES. For multiplayer games roundEndTimeStamps are calculated and provided by server.
 */
const generateRoundEndTimeStamp = (roundTimeMs: number): number => {
	return Date.now() + roundTimeMs;
}

export { generateRoundEndTimeStamp }