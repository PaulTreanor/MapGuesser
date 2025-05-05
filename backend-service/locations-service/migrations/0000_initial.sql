-- Migration: 0000_initial
-- Description: Initial schema

CREATE TABLE locations (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	location TEXT NOT NULL,
	latitude REAL NOT NULL,
	longitude REAL NOT NULL,
	difficulty TEXT,
	continent TEXT
);