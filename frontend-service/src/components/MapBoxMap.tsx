import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { MapMouseEvent } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Round, Pin } from '../Types'
import { calculateKm, emojiForDistances } from '../utils/mapUtils';

mapboxgl.accessToken = "pk.eyJ1IjoicGF1bHRyZWFub3IiLCJhIjoiY2x1dTk2MGZ6MDd5MTJrc3RheHl6ZGE1cCJ9.i2IJpqtnJjbclBOLbaVnXw";

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
  const zoomLevels = [
    { maxDistance: 25, zoomChange: 4, speed: 1.5 },
    { maxDistance: 75, zoomChange: 3, speed: 1 },
    { maxDistance: 150, zoomChange: 2, speed: 0.5 },
    { maxDistance: 300, zoomChange: 1, speed: 0.5 },
    { maxDistance: 6000, zoomChange: 0, speed: 0.5 },
    { maxDistance: 8000, zoomChange: -1, speed: 0.5 },
  ];

  const { zoomChange, speed } = zoomLevels.find(level => distance <= level.maxDistance) || { zoomChange: -2, speed: 0.5 };

  map.flyTo({
    center: customMarker.getLngLat(),
    zoom: map.getZoom() + zoomChange,
    speed: speed,
    essential: true
  });
};

interface MapboxMapProps {
  roundDetails: Round;
  handleGuess: (distance: number) => void;
}

const MapboxMap = ({roundDetails, handleGuess}: MapboxMapProps) => {
  const mapContainerRef = useRef(null);
  const [lastClick, setLastClick] = useState<mapboxgl.LngLat | null>(null);

  const addMarker = (map: mapboxgl.Map, e: MapMouseEvent) => {
    // Immediately remove the event listener to prevent further clicks from being registered
    map.off(`click`, addMarker)

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

    // Add a new layer to visualize the line
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
    
    // Update state with the clicked coordinates
    setLastClick(e.lngLat);

    handleGuess(distance)


    recentreAndOrZoom(map, customMarker, distance)
    
  };

  useEffect(() => {
      if (mapContainerRef.current === null) {
        return; // Keep TS happy
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/paultreanor/cluuaapnv004j01pj5sv1dgx2",
        attributionControl: false
      });

      map.on('load', () => {
        cursorSetup(map)
      });

      map.on('click', (e: MapMouseEvent) => addMarker(map, e))

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