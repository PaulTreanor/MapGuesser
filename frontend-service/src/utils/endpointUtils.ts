import {
    LOCATIONS_SERVICE_API_URL,
    MULTIPLAYER_SERVICE_API_URL,
} from '../objects/endpoints'

const getMultiplayerServiceWebsocketsUrl = (): string => {
	const wsProtocol = MULTIPLAYER_SERVICE_API_URL.startsWith('https') ? 'wss' : 'ws';
	const wsBaseUrl = MULTIPLAYER_SERVICE_API_URL.replace(/^https?:\/\//, '');
	const wsApiUrl = `${wsProtocol}://${wsBaseUrl}/ws/`;
	return wsApiUrl
}

const buildLocationsApiEndpoint = (count: number): string => {
	return `${LOCATIONS_SERVICE_API_URL}/locations/random?count=${count}`
}

export {
    getMultiplayerServiceWebsocketsUrl,
    buildLocationsApiEndpoint,
}