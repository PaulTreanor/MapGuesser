import mapboxgl from 'mapbox-gl';
import { zoomLevels } from '../objects/zoomLevels';
import { PLAYER_COLORS } from '../objects/playerColours';
import type { Pin } from '../types/Game.types';
import type { Player, PlayerGuess } from '../types/MultiplayerServiceApiResponse.types';
import { emojiForDistances, calculateKm } from './mapUtils';

let removeLabelOverlapListener: (() => void) | null = null;

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
	el.style.width = '28px';
	el.style.height = '28px';

	const circle = document.createElement('div');
	circle.style.width = '28px';
	circle.style.height = '28px';
	circle.style.boxSizing = 'border-box';
	circle.style.backgroundColor = color;
	circle.style.borderRadius = '50%';
	circle.style.border = '3px solid white';
	circle.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

	const label = document.createElement('div');
	label.className = 'mapguesser-player-label';
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
	el.className = 'mapguesser-location-label';
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
	el.className = 'mapguesser-distance-label';
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
	if (removeLabelOverlapListener) {
		removeLabelOverlapListener();
		removeLabelOverlapListener = null;
	}
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

type Rect = {
	left: number;
	top: number;
	right: number;
	bottom: number;
};

type LabelPlacement = 'below' | 'above' | 'right' | 'left';

const LABEL_GAP = 4;
const LABEL_PADDING = 2;

const rectsOverlap = (a: Rect, b: Rect, padding: number): boolean =>
	a.left - padding < b.right &&
	a.right + padding > b.left &&
	a.top - padding < b.bottom &&
	a.bottom + padding > b.top;

const labelRectForPlacement = (
	anchorRect: Rect,
	labelSize: { width: number; height: number },
	placement: LabelPlacement,
	gap: number,
): Rect => {
	const centerX = (anchorRect.left + anchorRect.right) / 2;
	const centerY = (anchorRect.top + anchorRect.bottom) / 2;
	const { width, height } = labelSize;

	if (placement === 'above') {
		return {
			left: centerX - width / 2,
			right: centerX + width / 2,
			top: anchorRect.top - gap - height,
			bottom: anchorRect.top - gap,
		};
	}
	if (placement === 'right') {
		return {
			left: anchorRect.right + gap,
			right: anchorRect.right + gap + width,
			top: centerY - height / 2,
			bottom: centerY + height / 2,
		};
	}
	if (placement === 'left') {
		return {
			left: anchorRect.left - gap - width,
			right: anchorRect.left - gap,
			top: centerY - height / 2,
			bottom: centerY + height / 2,
		};
	}
	return {
		left: centerX - width / 2,
		right: centerX + width / 2,
		top: anchorRect.bottom + gap,
		bottom: anchorRect.bottom + gap + height,
	};
};

const findLabelPlacement = ({
	anchorRect,
	labelSize,
	obstacles,
	padding,
}: {
	anchorRect: Rect;
	labelSize: { width: number; height: number };
	obstacles: Rect[];
	padding: number;
}): LabelPlacement | null => {
	const placements: LabelPlacement[] = ['below', 'above', 'right', 'left'];
	const placement = placements.find((candidate) => {
		const rect = labelRectForPlacement(anchorRect, labelSize, candidate, LABEL_GAP);
		return !obstacles.some((obstacle) => rectsOverlap(rect, obstacle, padding));
	});
	return placement ?? null;
};

const toLocalRect = (rect: DOMRect, origin: DOMRect): Rect => ({
	left: rect.left - origin.left,
	top: rect.top - origin.top,
	right: rect.right - origin.left,
	bottom: rect.bottom - origin.top,
});

const applyLabelPlacement = (labelEl: HTMLElement, placement: LabelPlacement) => {
	labelEl.style.top = '';
	labelEl.style.bottom = '';
	labelEl.style.left = '';
	labelEl.style.right = '';
	labelEl.style.transform = '';
	labelEl.style.marginTop = '';
	labelEl.style.marginBottom = '';
	labelEl.style.marginLeft = '';
	labelEl.style.marginRight = '';

	if (placement === 'above') {
		labelEl.style.bottom = '100%';
		labelEl.style.left = '50%';
		labelEl.style.transform = 'translateX(-50%)';
		labelEl.style.marginBottom = `${LABEL_GAP}px`;
		return;
	}
	if (placement === 'right') {
		labelEl.style.left = '100%';
		labelEl.style.top = '50%';
		labelEl.style.transform = 'translateY(-50%)';
		labelEl.style.marginLeft = `${LABEL_GAP}px`;
		return;
	}
	if (placement === 'left') {
		labelEl.style.right = '100%';
		labelEl.style.top = '50%';
		labelEl.style.transform = 'translateY(-50%)';
		labelEl.style.marginRight = `${LABEL_GAP}px`;
		return;
	}
	labelEl.style.top = '100%';
	labelEl.style.left = '50%';
	labelEl.style.transform = 'translateX(-50%)';
	labelEl.style.marginTop = `${LABEL_GAP}px`;
};

type LabelAntiOverlapParams = {
	map: mapboxgl.Map;
	nameLabels: { markerEl: HTMLElement; labelEl: HTMLElement }[];
	distanceLabels: HTMLElement[];
	locationObstacles: HTMLElement[];
};

const runLabelAntiOverlap = ({
	map,
	nameLabels,
	distanceLabels,
	locationObstacles,
}: LabelAntiOverlapParams) => {
	if (!map.getContainer()) return;

	const origin = map.getContainer().getBoundingClientRect();
	const toLocal = (el: HTMLElement) => toLocalRect(el.getBoundingClientRect(), origin);

	nameLabels.forEach(({ labelEl }) => {
		labelEl.style.visibility = '';
		applyLabelPlacement(labelEl, 'below');
	});
	distanceLabels.forEach((labelEl) => {
		labelEl.style.visibility = '';
	});

	const circleObstacles = nameLabels.map(({ markerEl }) => ({ markerEl, rect: toLocal(markerEl) }));
	const staticObstacles = locationObstacles.map(toLocal);
	const placedLabels: Rect[] = [];

	const sortedNameLabels = [...nameLabels].sort(
		(a, b) => toLocal(a.markerEl).top - toLocal(b.markerEl).top,
	);

	sortedNameLabels.forEach(({ markerEl, labelEl }) => {
		const anchorRect = toLocal(markerEl);
		const labelSize = { width: labelEl.offsetWidth, height: labelEl.offsetHeight };
		const otherCircles = circleObstacles
			.filter((circle) => circle.markerEl !== markerEl)
			.map((circle) => circle.rect);
		const obstacles = [...otherCircles, ...staticObstacles, ...placedLabels];

		const placement = findLabelPlacement({ anchorRect, labelSize, obstacles, padding: LABEL_PADDING });
		if (!placement) {
			labelEl.style.visibility = 'hidden';
			return;
		}
		applyLabelPlacement(labelEl, placement);
		placedLabels.push(labelRectForPlacement(anchorRect, labelSize, placement, LABEL_GAP));
	});

	const allObstacles = [...circleObstacles.map((circle) => circle.rect), ...staticObstacles, ...placedLabels];
	distanceLabels.forEach((labelEl) => {
		const rect = toLocal(labelEl);
		const overlaps = allObstacles.some((obstacle) => rectsOverlap(rect, obstacle, LABEL_PADDING));
		if (overlaps) {
			labelEl.style.visibility = 'hidden';
		}
	});
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
	const actualLocationMarker = new mapboxgl.Marker({ color: 'red' })
		.setLngLat(actualLocation)
		.addTo(map);

	const locationLabelEl = createLocationLabelElement(locationName);
	new mapboxgl.Marker(locationLabelEl, { anchor: 'top', offset: [0, 4] })
		.setLngLat(actualLocation)
		.addTo(map);

	const locationObstacles = [actualLocationMarker.getElement(), locationLabelEl];
	const nameLabels: { markerEl: HTMLElement; labelEl: HTMLElement }[] = [];
	const distanceLabels: HTMLElement[] = [];

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

		new mapboxgl.Marker(markerEl, { anchor: 'center' })
			.setLngLat(guess.guessCoordinates)
			.addTo(map);

		const nameLabelEl = markerEl.querySelector<HTMLElement>('.mapguesser-player-label');
		if (nameLabelEl) {
			nameLabels.push({ markerEl, labelEl: nameLabelEl });
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

		distanceLabels.push(distanceEl);

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

	const runAntiOverlap = () => runLabelAntiOverlap({ map, nameLabels, distanceLabels, locationObstacles });
	if (removeLabelOverlapListener) {
		removeLabelOverlapListener();
	}
	map.on('moveend', runAntiOverlap);
	removeLabelOverlapListener = () => map.off('moveend', runAntiOverlap);
	runAntiOverlap();

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
	rectsOverlap,
	labelRectForPlacement,
	findLabelPlacement,
};
