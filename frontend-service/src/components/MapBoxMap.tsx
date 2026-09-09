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
	clearMarkersAndPopups,
	displayMultiplayerResults,
	resetMapZoomAndCenter,
} from '../utils/mapboxUtils';
import { mapBoxMapStyle } from '../objects/mapBoxConsts';
import type { Pin } from '../types/Game.types';
import { useLoading } from '../context/LoadingContext';
mapboxgl.accessToken = process.env.GATSBY_MAPBOX_ACCESS_TOKEN as string;

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
			zoom: 1,
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
		clearMarkersAndPopups();

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
		clearMarkersAndPopups();

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
			displayMultiplayerResults({
				map,
				playerGuesses,
				players,
				actualLocation,
				locationName: roundDetails.location,
			});
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