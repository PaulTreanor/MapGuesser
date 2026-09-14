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

const createLabelledPinElement = (color: string, labelText: string): HTMLDivElement => {
	const el = document.createElement('div');
	el.style.position = 'relative';
	el.style.width = '28px';
	el.style.height = '28px';

	const circle = document.createElement('div');
	circle.style.width = '28px';
	circle.style.height = '28px';
	circle.style.backgroundColor = color;
	circle.style.borderRadius = '50%';
	circle.style.border = '3px solid white';
	circle.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

	const label = document.createElement('div');
	label.style.position = 'absolute';
	label.style.top = '100%';
	label.style.left = '50%';
	label.style.transform = 'translateX(-50%)';
	label.style.marginTop = '4px';
	label.style.backgroundColor = color;
	label.style.color = 'white';
	label.style.padding = '2px 8px';
	label.style.borderRadius = '4px';
	label.style.fontSize = '11px';
	label.style.fontWeight = 'bold';
	label.style.whiteSpace = 'nowrap';
	label.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
	label.textContent = labelText;

	el.appendChild(circle);
	el.appendChild(label);
	return el;
};

const createPlayerMarkerElement = (playerColor: string, playerName: string): HTMLDivElement => {
	return createLabelledPinElement(playerColor, playerName || 'Unknown');
};

const createLocationLabelElement = (locationName: string): HTMLDivElement => {
	const el = document.createElement('div');
	el.style.backgroundColor = '#EF4444';
	el.style.color = 'white';
	el.style.padding = '2px 8px';
	el.style.borderRadius = '4px';
	el.style.fontSize = '11px';
	el.style.fontWeight = 'bold';
	el.style.whiteSpace = 'nowrap';
	el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
	el.textContent = locationName || 'Actual Location';
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
	return PLAYER_COLORS[index % PLAYER_COLORS.length].color;
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

	// Add actual location marker (default red pin, tip sits exactly on the point)
	new mapboxgl.Marker({ color: 'red' })
		.setLngLat(actualLocation)
		.addTo(map);

	const locationLabelEl = createLocationLabelElement(locationName);
	new mapboxgl.Marker(locationLabelEl, { anchor: 'top', offset: [0, 4] })
		.setLngLat(actualLocation)
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

		const markerEl = createPlayerMarkerElement(playerColor, player?.playerName || 'Unknown');

		new mapboxgl.Marker(markerEl, { anchor: 'bottom' })
			.setLngLat(guess.guessCoordinates)
			.addTo(map);

		// Add distance label at midpoint
		const midpoint: Pin = [
			(guess.guessCoordinates[0] + actualLocation[0]) / 2,
			(guess.guessCoordinates[1] + actualLocation[1]) / 2,
		];

		const distanceEl = createPlayerDistanceLabelElement(distance, playerColor);

		new mapboxgl.Marker(distanceEl, { offset: [0, 0] })
			.setLngLat(midpoint)
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
	});

	// Fit map to show all markers with padding
	map.fitBounds(bounds, { padding: 160, maxZoom: 8, essential: true });

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
	createLocationLabelElement,
	createPlayerDistanceLabelElement,
	clearMarkersAndPopups,
	clearPlayerLines,
	displayMultiplayerResults,
	resetMapZoomAndCenter,
};
