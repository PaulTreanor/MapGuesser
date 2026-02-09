import type { Location } from "../multiplayerGame.types"

const LOCATIONS_SERVICE_URL = 'https://locations-service.treanorpaul9.workers.dev';

const fetchRandomLocations = async (count: number): Promise<Location[]> => {
	const response = await fetch(`${LOCATIONS_SERVICE_URL}/locations/random?count=${count}`);
	if (!response.ok) {
		throw new Error(`Failed to fetch locations: ${response.statusText}`);
	}
	const json = await response.json() as { data: Location[] };
	return json.data;
};

export { fetchRandomLocations };
