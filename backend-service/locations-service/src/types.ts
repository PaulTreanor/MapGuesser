// D1 database interface
export interface D1Database {
	prepare: (query: string) => D1PreparedStatement;
	dump: () => Promise<ArrayBuffer>;
	batch: (statements: D1PreparedStatement[]) => Promise<D1Result<unknown>[]>;
	exec: (query: string) => Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
	bind: (...values: any[]) => D1PreparedStatement;
	first: <T = unknown>(colName?: string) => Promise<T>;
	run: <T = unknown>() => Promise<D1Result<T>>;
	all: <T = unknown>() => Promise<D1Result<T>>;
}

export interface D1Result<T> {
	results: T[];
	success: boolean;
	meta: object;
	error?: string;
}

export interface D1ExecResult {
	count: number;
	duration: number;
}

// Define our environment bindings
export interface Env {
	LOCATIONS_DB: D1Database;
}

// Define the location type
export interface Location {
	id: number;
	location: string;
	latitude: number;
	longitude: number;
	difficulty?: string;
	continent?: string;
} 