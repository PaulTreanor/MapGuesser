import mapboxgl from 'mapbox-gl';
import { zoomLevels } from '../objects/zoomLevels';
import { PLAYER_COLORS } from '../objects/playerColours';
import type { Pin } from '../types/Game.types';
import type { Player, PlayerGuess } from '../types/MultiplayerServiceApiResponse.types';
import { emojiForDistances, calculateKm } from './mapUtils';

type DisplayMultiplayerResultsParams = {
	map: mapboxgl.Map;
	playerGuesses: PlayerGuess[];
	players: Player[];
	actualLocation: Pin;
	locationName: string;
};

const cursorSetup = (map: mapboxgl.Map) => {
	const canvas = map.getCanvas();
	canvas.style.cursor = 'default';

	map.on('mousedown', () => {
		canvas.style.cursor = 'grab';
	});

	map.on('mouseup', () => {
		canvas.style.cursor = 'default';
	});

	map.on('mouseleave', () => {
		canvas.style.cursor = 'default';
	});
}

const recentreAndOrZoom = (map: mapboxgl.Map, customMarker: mapboxgl.Marker, distance: number) => {
	const { recommendedZoomLevel, animationSpeed } = zoomLevels.find(level => distance <= level.maxDistance)
		|| { recommendedZoomLevel: 0.8, animationSpeed: 0.5 };

	map.flyTo({
		center: customMarker.getLngLat(),
		zoom: recommendedZoomLevel,
		speed: animationSpeed,
		essential: true
	});
};

const resetMapZoomAndCenter = (map: mapboxgl.Map) => {
	map.flyTo({
		center: [6, 54],
		zoom: 4,
		speed: 2,
		essential: true
	});
}

const addLineToMap = (map: mapboxgl.Map, lineId: string) => {
	map.addLayer({
		'id': lineId,
		'type': 'line',
		'source': lineId,
		'layout': {},
		'paint': {
			'line-width': 2,
			'line-color': '#007cbf'
		}
	});
}

const addLineSourceToMap = (map: mapboxgl.Map, lineId: string, lineCoordinates: Pin[]) => {
    map.addSource(lineId, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': lineCoordinates
            }
        }
    });
}

const createDistanceMarkerElement = (distance: number): HTMLDivElement => {
	const el = document.createElement('div');
	el.className = 'custom-text-marker';
	el.style.backgroundColor = 'white';
	el.style.padding = '5px';
	el.style.borderRadius = '5px';

	const distanceText = distance === 0
		? 'Perfect Guess!'
		: `${distance} km`;

	el.innerHTML = `<span style="font-size: 16px;"><b>${emojiForDistances(distance)} ${distanceText}</b></span>`;
	return el;
};

const createPlayerMarkerElement = (playerColor: string, playerIndex: number): HTMLDivElement => {
	const el = document.createElement('div');
	el.style.width = '28px';
	el.style.height = '28px';
	el.style.backgroundColor = playerColor;
	el.style.borderRadius = '50%';
	el.style.border = '3px solid white';
	el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
	el.style.display = 'flex';
	el.style.alignItems = 'center';
	el.style.justifyContent = 'center';
	el.style.color = 'white';
	el.style.fontWeight = 'bold';
	el.style.fontSize = '12px';
	el.textContent = (playerIndex + 1).toString();
	return el;
};

const createPlayerDistanceLabelElement = (distance: number, playerColor: string): HTMLDivElement => {
	const el = document.createElement('div');
	el.style.backgroundColor = playerColor;
	el.style.color = 'white';
	el.style.padding = '3px 8px';
	el.style.borderRadius = '4px';
	el.style.fontSize = '12px';
	el.style.fontWeight = 'bold';
	el.style.whiteSpace = 'nowrap';
	el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
	el.textContent = `${Math.round(distance)} km`;
	return el;
};

const clearMarkersAndPopups = () => {
	document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
	document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());
};

const clearPlayerLines = (map: mapboxgl.Map) => {
	const style = map.getStyle();
	if (style?.layers) {
		style.layers
			.filter(layer => layer.id.startsWith('line-player-'))
			.forEach(layer => {
				if (map.getLayer(layer.id)) map.removeLayer(layer.id);
			});
	}
	if (style?.sources) {
		Object.keys(style.sources)
			.filter(id => id.startsWith('line-player-'))
			.forEach(id => {
				if (map.getSource(id)) map.removeSource(id);
			});
	}
};

const getPlayerColor = (index: number): string => {
	return PLAYER_COLORS[index % PLAYER_COLORS.length];
};

const displayMultiplayerResults = ({
	map,
	playerGuesses,
	players,
	actualLocation,
	locationName,
}: DisplayMultiplayerResultsParams) => {
	clearMarkersAndPopups();
	clearPlayerLines(map);

	// Add actual location marker (red)
	new mapboxgl.Marker({ color: 'red' })
		.setLngLat(actualLocation)
		.setPopup(
			new mapboxgl.Popup({ offset: 25 }).setHTML(
				`<strong>${locationName}</strong><br/>Actual Location`
			)
		)
		.addTo(map);

	// Create bounds to fit all markers
	const bounds = new mapboxgl.LngLatBounds();
	bounds.extend(actualLocation);

	// Add markers and lines for each player's guess
	playerGuesses.forEach((guess) => {
		if (!guess.guessCoordinates) return;

		const playerIndex = players.findIndex((p) => p.playerId === guess.playerId);
		const player = players[playerIndex];
		const playerColor = getPlayerColor(playerIndex);
		const distance = calculateKm(guess.guessCoordinates, actualLocation);

		// Extend bounds
		bounds.extend(guess.guessCoordinates);

		const markerEl = createPlayerMarkerElement(playerColor, playerIndex);

		new mapboxgl.Marker(markerEl)
			.setLngLat(guess.guessCoordinates)
			.setPopup(
				new mapboxgl.Popup({ offset: 25 }).setHTML(
					`<strong>${player?.playerName || 'Unknown'}</strong><br/>${Math.round(distance)} km away`
				)
			)
			.addTo(map);

		// Add line from guess to actual location
		const lineId = `line-player-${guess.playerId}`;
		const lineCoordinates: Pin[] = [guess.guessCoordinates, actualLocation];

		// Only add if not already present
		if (!map.getSource(lineId)) {
			addLineSourceToMap(map, lineId, lineCoordinates);

			// Add colored dashed line
			map.addLayer({
				id: lineId,
				type: 'line',
				source: lineId,
				layout: {},
				paint: {
					'line-width': 2,
					'line-color': playerColor,
					'line-dasharray': [2, 2],
				},
			});
		}

		// Add distance label at midpoint
		const midpoint: Pin = [
			(guess.guessCoordinates[0] + actualLocation[0]) / 2,
			(guess.guessCoordinates[1] + actualLocation[1]) / 2,
		];

		const distanceEl = createPlayerDistanceLabelElement(distance, playerColor);

		new mapboxgl.Marker(distanceEl, { offset: [0, 0] })
			.setLngLat(midpoint)
			.addTo(map);
	});

	// Fit map to show all markers with padding
	map.fitBounds(bounds, { padding: 80, maxZoom: 8 });

	// Set cursor to default (not clickable)
	map.getCanvas().style.cursor = 'default';
};

export {
	cursorSetup,
	recentreAndOrZoom,
	addLineToMap,
	addLineSourceToMap,
	createDistanceMarkerElement,
	createPlayerMarkerElement,
	createPlayerDistanceLabelElement,
	clearMarkersAndPopups,
	clearPlayerLines,
	displayMultiplayerResults,
	resetMapZoomAndCenter,
};
