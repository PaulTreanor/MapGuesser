import React, { useEffect, useRef } from 'react';
import mapboxgl, { MapMouseEvent } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapboxMapProps } from '../types/MapBoxMap.types';
import { calculateKm } from '../utils/mapUtils';
import {
	cursorSetup,
	recentreAndOrZoom,
	addLineToMap,
	addLineSourceToMap,
	createDistanceMarkerElement,
	resetMapZoomAndCenter
} from '../utils/mapboxUtils';
import { mapBoxMapStyle } from '../objects/mapBoxConsts';
import { Pin } from '../types/Game.types'
import { useLoading } from '../context/LoadingContext';
mapboxgl.accessToken = process.env.GATSBY_MAPBOX_ACCESS_TOKEN as string;

// Colors for different players in multiplayer results
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

const MapboxMap = ({ roundDetails, handleGuess, isDisabled, multiplayerResults }: MapboxMapProps) => {
	const WRAPPER_ID = 'map-wrapper';     
	const mapContainerRef = useRef<HTMLElement | null>(null)
	const mapRef = useRef<mapboxgl.Map | null>(null)
	const currentLineIdRef = useRef<string>('');
	const { setLoading } = useLoading(); 

	const initialiseMap = () => {
		if (mapContainerRef.current === null) {
			return null;
		}

		// Start loading when map initialization begins
		setLoading('mapbox', true, 'Loading interactive map...');

		const map = new mapboxgl.Map({
			container: mapContainerRef.current,
			style: mapBoxMapStyle,
			center: [6, 54], 
			zoom: 5,
			attributionControl: false
		});

		map.on('load', () => {
			cursorSetup(map);
			map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
			setLoading('mapbox', false);
		});

		/* ResizeObserver – resync map when wrapper changes */
		const ro = new ResizeObserver(() => map.resize());
		ro.observe(mapContainerRef.current);
		
		map.on('remove', () => ro.disconnect());

		return map;
	}

	const clearMap = (map: mapboxgl.Map) => {
		// Clear existing markers and popups
		document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
		document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());

		// Remove existing line layer and source using the previous line ID
		if (currentLineIdRef.current) {
			if (map.getLayer(currentLineIdRef.current)) {
				map.removeLayer(currentLineIdRef.current);
			}
			if (map.getSource(currentLineIdRef.current)) {
				map.removeSource(currentLineIdRef.current);
			}
		}
	}

	// this method seems to add multiple markers
	const addMarkersAndLine = (map: mapboxgl.Map, e: MapMouseEvent) => {

		// Remove existing markers
		document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
		document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());

		// Create a new marker and add it to the map at the clicked location
		new mapboxgl.Marker()
			.setLngLat([e.lngLat.lng, e.lngLat.lat])
			.addTo(map);
		

		new mapboxgl.Marker({ color: "red" })
			.setLngLat(roundDetails.coordinates)
			.addTo(map);

		const lineCoordinates: Pin[] = [
			[e.lngLat.lng, e.lngLat.lat],
			roundDetails.coordinates
		];

		const lineId = `${roundDetails.location}-line`
		currentLineIdRef.current = lineId;

		// Create a GeoJSON source with a line feature
		addLineSourceToMap(map, lineId, lineCoordinates)

		// Add a new layer to visualize the line]
		addLineToMap(map, lineId)

		const distance = calculateKm([e.lngLat.lng, e.lngLat.lat], [roundDetails.coordinates[0], roundDetails.coordinates[1]])

		const distanceMakerHtmlElement = createDistanceMarkerElement(distance);

		// Add the custom distance marker to map
		const customMarker = new mapboxgl.Marker(distanceMakerHtmlElement, { offset: [0, -30] })
			// Position it between the guess and the actual location
			.setLngLat([(e.lngLat.lng + roundDetails.coordinates[0]) / 2, (e.lngLat.lat + roundDetails.coordinates[1]) / 2]) 
			.addTo(map);
		
		return {
			guessDistance: distance,
			customDistanceMarker: customMarker
		}
	};

	useEffect(() => {
		const map = initialiseMap();
		if (!map) return;
		
		mapRef.current = map;

		return () => {
			map.remove();
		};
	}, []);

	// Handle round changes (normal gameplay)
	useEffect(() => {
		if (!mapRef.current || multiplayerResults) return;
		const map = mapRef.current;

		clearMap(map)

		resetMapZoomAndCenter(map)

		if (isDisabled) {
			map.getCanvas().style.cursor = 'not-allowed';
			return;
		}


		const handleMapClick = (e: MapMouseEvent) => {
			const lineId = `${roundDetails.location}-line`;
			// Store new line ID
			currentLineIdRef.current = lineId;
			const guessCoordinates: Pin = [e.lngLat.lng, e.lngLat.lat];
			const { guessDistance, customDistanceMarker } = addMarkersAndLine(map, e);
			handleGuess(guessDistance, guessCoordinates);
			recentreAndOrZoom(map, customDistanceMarker, guessDistance);
			// Remove the click event listener
			map.off('click', handleMapClick);
		};

		// Add the click event listener
		map.on('click', handleMapClick);

		return () => {
			map.off('click', handleMapClick);
		};
	}, [roundDetails, multiplayerResults]);

	// Handle multiplayer results display
	useEffect(() => {
		if (!mapRef.current || !multiplayerResults) return;
		const map = mapRef.current;
		const { playerGuesses, players, actualLocation } = multiplayerResults;

		const displayResults = () => {
			// Clear existing markers
			document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
			document.querySelectorAll('.mapboxgl-popup').forEach(popup => popup.remove());

			// Remove any existing line layers/sources
			const style = map.getStyle();
			if (style?.layers) {
				style.layers.forEach(layer => {
					if (layer.id.startsWith('line-player-')) {
						if (map.getLayer(layer.id)) {
							map.removeLayer(layer.id);
						}
					}
				});
			}
			if (style?.sources) {
				Object.keys(style.sources).forEach(sourceId => {
					if (sourceId.startsWith('line-player-')) {
						if (map.getSource(sourceId)) {
							map.removeSource(sourceId);
						}
					}
				});
			}

			// Add actual location marker (red)
			new mapboxgl.Marker({ color: 'red' })
				.setLngLat(actualLocation)
				.setPopup(
					new mapboxgl.Popup({ offset: 25 }).setHTML(
						`<strong>${roundDetails.location}</strong><br/>Actual Location`
					)
				)
				.addTo(map);

			// Create bounds to fit all markers
			const bounds = new mapboxgl.LngLatBounds();
			bounds.extend(actualLocation);

			// Add markers and lines for each player's guess
			playerGuesses.forEach((guess) => {
				const playerIndex = players.findIndex((p) => p.playerId === guess.playerId);
				const player = players[playerIndex];
				const playerColor = getPlayerColor(playerIndex);
				const distance = calculateKm(guess.guessCoordinates, actualLocation);

				// Extend bounds
				bounds.extend(guess.guessCoordinates);

				// Create player marker element
				const markerEl = document.createElement('div');
				markerEl.style.width = '28px';
				markerEl.style.height = '28px';
				markerEl.style.backgroundColor = playerColor;
				markerEl.style.borderRadius = '50%';
				markerEl.style.border = '3px solid white';
				markerEl.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
				markerEl.style.display = 'flex';
				markerEl.style.alignItems = 'center';
				markerEl.style.justifyContent = 'center';
				markerEl.style.color = 'white';
				markerEl.style.fontWeight = 'bold';
				markerEl.style.fontSize = '12px';
				markerEl.textContent = (playerIndex + 1).toString();

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

				const distanceEl = document.createElement('div');
				distanceEl.style.backgroundColor = playerColor;
				distanceEl.style.color = 'white';
				distanceEl.style.padding = '3px 8px';
				distanceEl.style.borderRadius = '4px';
				distanceEl.style.fontSize = '12px';
				distanceEl.style.fontWeight = 'bold';
				distanceEl.style.whiteSpace = 'nowrap';
				distanceEl.style.boxShadow = '0 1px 3px rgba(0,0,0,0.3)';
				distanceEl.innerHTML = `${Math.round(distance)} km`;

				new mapboxgl.Marker(distanceEl, { offset: [0, 0] })
					.setLngLat(midpoint)
					.addTo(map);
			});

			// Fit map to show all markers with padding
			map.fitBounds(bounds, { padding: 80, maxZoom: 8 });

			// Set cursor to default (not clickable)
			map.getCanvas().style.cursor = 'default';
		};

		// Wait for map style to be loaded before adding layers
		if (map.isStyleLoaded()) {
			displayResults();
		} else {
			map.once('style.load', displayResults);
		}

		return () => {
			map.off('style.load', displayResults);
		};
	}, [multiplayerResults]);
	
	return (
		<div
			id={WRAPPER_ID}                               
			ref={mapContainerRef as unknown as React.RefObject<HTMLDivElement>}
			className={`w-full min-h-full h-full relative ${isDisabled ? 'pointer-events-none' : ''}`}
		/>
	);
};

export default MapboxMap;