-- Create games registry table to track legitimately created games
CREATE TABLE games (
	game_code TEXT PRIMARY KEY,
	created_at INTEGER NOT NULL
);

-- Index on created_at for efficient cleanup queries
CREATE INDEX idx_games_created_at ON games(created_at);
