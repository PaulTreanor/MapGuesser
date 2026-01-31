import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { calculateKm } from '../utils/mapUtils';
import {
	addLineToMap,
	addLineSourceToMap,
	createDistanceMarkerElement,
} from '../utils/mapboxUtils';
import { mapBoxMapStyle } from '../objects/mapBoxConsts';
import type { Pin } from '../types/Game.types';
import type { Player, PlayerGuess } from '../types/MultiplayerServiceApiResponse.types';

mapboxgl.accessToken = process.env.GATSBY_MAPBOX_ACCESS_TOKEN as string;

type RoundResultsMapProps = {
	actualLocation: {
		name: string;
		coordinates: Pin;
	};
	playerGuesses: PlayerGuess[];
	players: Player[];
};

// Colors for different players
const PLAYER_COLORS = [
	'#3B82F6', // blue
	'#10B981', // green
	'#F59E0B', // amber
	'#8B5CF6', // purple
	'#EC4899', // pink
	'#06B6D4', // cyan
	'#F97316', // orange
	'#6366F1', // indigo
];

const getPlayerColor = (index: number): string => {
	return PLAYER_COLORS[index % PLAYER_COLORS.length];
};

const RoundResultsMap = ({ actualLocation, playerGuesses, players }: RoundResultsMapProps) => {
	const WRAPPER_ID = 'round-results-map-wrapper';
	const mapContainerRef = useRef<HTMLElement | null>(null);
	const mapRef = useRef<mapboxgl.Map | null>(null);

	useEffect(() => {
		if (mapContainerRef.current === null) return;

		const map = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapBoxMapStyle,
			center: actualLocation.coordinates,
			zoom: 3,
			attributionControl: false,
		});

		map.on('load', () => {
			map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

			// Add actual location marker (red)
			new mapboxgl.Marker({ color: 'red' })
				.setLngLat(actualLocation.coordinates)
				.setPopup(
					new mapboxgl.Popup({ offset: 25 }).setHTML(
						`<strong>${actualLocation.name}</strong><br/>Actual Location`
					)
				)
				.addTo(map);

			// Add markers and lines for each player's guess
			playerGuesses.forEach((guess) => {
				const playerIndex = players.findIndex((p) => p.playerId === guess.playerId);
				const player = players[playerIndex];
				const playerColor = getPlayerColor(playerIndex);
				const distance = calculateKm(guess.guessCoordinates, actualLocation.coordinates);

				// Add player's guess marker
				const markerEl = document.createElement('div');
				markerEl.className = 'player-guess-marker';
				markerEl.style.width = '24px';
				markerEl.style.height = '24px';
				markerEl.style.backgroundColor = playerColor;
				markerEl.style.borderRadius = '50%';
				markerEl.style.border = '3px solid white';
				markerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

				new mapboxgl.Marker(markerEl)
					.setLngLat(guess.guessCoordinates)
					.setPopup(
						new mapboxgl.Popup({ offset: 25 }).setHTML(
							`<strong>${player?.playerName || 'Unknown'}</strong><br/>${Math.round(distance)} km away`
						)
					)
					.addTo(map);

				// Add line from guess to actual location
				const lineId = `line-${guess.playerId}`;
				const lineCoordinates: Pin[] = [guess.guessCoordinates, actualLocation.coordinates];

				addLineSourceToMap(map, lineId, lineCoordinates);

				// Add custom colored line
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

				// Add distance label at midpoint
				const midpoint: Pin = [
					(guess.guessCoordinates[0] + actualLocation.coordinates[0]) / 2,
					(guess.guessCoordinates[1] + actualLocation.coordinates[1]) / 2,
				];

				const distanceEl = document.createElement('div');
				distanceEl.style.backgroundColor = playerColor;
				distanceEl.style.color = 'white';
				distanceEl.style.padding = '2px 6px';
				distanceEl.style.borderRadius = '4px';
				distanceEl.style.fontSize = '12px';
				distanceEl.style.fontWeight = 'bold';
				distanceEl.style.whiteSpace = 'nowrap';
				distanceEl.innerHTML = `${Math.round(distance)} km`;

				new mapboxgl.Marker(distanceEl, { offset: [0, 0] })
					.setLngLat(midpoint)
					.addTo(map);
			});

			// Fit map to show all markers
			if (playerGuesses.length > 0) {
				const bounds = new mapboxgl.LngLatBounds();
				bounds.extend(actualLocation.coordinates);
				playerGuesses.forEach((guess) => {
					bounds.extend(guess.guessCoordinates);
				});
				map.fitBounds(bounds, { padding: 50, maxZoom: 10 });
			}
		});

		mapRef.current = map;

		// ResizeObserver for responsive sizing
		const ro = new ResizeObserver(() => map.resize());
		ro.observe(mapContainerRef.current);

		return () => {
			ro.disconnect();
			map.remove();
		};
	}, [actualLocation, playerGuesses, players]);

	return (
		<div
			id={WRAPPER_ID}
			ref={mapContainerRef as unknown as React.RefObject<HTMLDivElement>}
			className="w-full h-64 md:h-80 rounded-lg overflow-hidden"
		/>
	);
};

export default RoundResultsMap;
