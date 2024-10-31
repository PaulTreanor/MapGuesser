import React, { useEffect, useRef } from 'react';
import mapboxgl, { MapMouseEvent } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { MapboxMapProps } from './types/MapBoxMap.types';
import { calculateKm, emojiForDistances } from '../utils/mapUtils';
import { cursorSetup, recentreAndOrZoom, addLineToMap, addLineSourceToMap } from '../utils/mapboxUtils';
import { mapBoxMapStyle } from '../objects/mapBoxConsts';
mapboxgl.accessToken = process.env.GATSBY_MAPBOX_ACCESS_TOKEN as string;

const MapboxMap = ({ roundDetails, handleGuess }: MapboxMapProps) => {
	const mapContainerRef = useRef(null);

	// this method seems to add marker and handle guess and do the recenter stuff - break it up
	const addMarker = (map: mapboxgl.Map, e: MapMouseEvent) => {

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

		const lineCoordinates = [
			[e.lngLat.lng, e.lngLat.lat], // Clicked location
			roundDetails.coordinates
		];

		const lineId = `${roundDetails.location}-line`

		// Create a GeoJSON source with a line feature
		addLineSourceToMap(map, lineId, lineCoordinates)

		// Add a new layer to visualize the line]
		addLineToMap(map, lineId)

		const distance = calculateKm([e.lngLat.lng, e.lngLat.lat], [roundDetails.coordinates[0], roundDetails.coordinates[1]])

		const el = document.createElement('div');
			el.className = 'custom-text-marker';
			el.style.backgroundColor = 'white'; 
			el.style.padding = '5px';
			el.style.borderRadius = '5px';
			el.innerHTML = `<span style="font-size: 16px;"><b>${emojiForDistances(distance)} ${distance} km</b></span>`;

		// Add the custom element as a marker to the map
		const customMarker = new mapboxgl.Marker(el, { offset: [0, -30] }) // Adjust offset as needed
			// Position it between the guess and the actual location
			.setLngLat([(e.lngLat.lng + roundDetails.coordinates[0]) / 2, (e.lngLat.lat + roundDetails.coordinates[1]) / 2]) 
			.addTo(map);

		handleGuess(distance)

		recentreAndOrZoom(map, customMarker, distance)
	};

	useEffect(() => {
			if (mapContainerRef.current === null) {
				return; // Keep TS happy
			}

			const map = new mapboxgl.Map({
				container: mapContainerRef.current,
				style: mapBoxMapStyle,
				center: [6, 54], 
				zoom: 5,
				attributionControl: false
			});
				
			const handleMapClick = (e: MapMouseEvent) => {
				addMarker(map, e);
				// Remove the event listener immediately after handling the first click
				map.off('click', handleMapClick);
		};

			map.on('load', () => {
					cursorSetup(map);
					map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
					map.on('click', handleMapClick); // Add the event listener
			});


			// Clean up on unmount
			return () => {
				map.off('click', (e: MapMouseEvent) => addMarker(map, e))
				map.remove()
			}
		}, [roundDetails]); 

	return (
		<div
			ref={mapContainerRef}
			className="w-full min-h-full h-full z-10"
		/>
	);
};

export default MapboxMap;