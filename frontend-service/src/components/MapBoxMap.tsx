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
    { maxDistance: 10, zoomLevel: 10, speed: 1.5 },
    { maxDistance: 25, zoomLevel: 9, speed: 1.5 },
    { maxDistance: 75, zoomLevel: 8, speed: 1 },
    { maxDistance: 150, zoomLevel: 7, speed: 0.5 },
    { maxDistance: 300, zoomLevel: 6.5, speed: 0.5 },
    { maxDistance: 1000, zoomLevel: 3, speed: 0.5 },
    { maxDistance: 1500, zoomLevel: 2.5, speed: 0.5 },
    { maxDistance: 6000, zoomLevel: 2, speed: 0.5 },
    { maxDistance: 8000, zoomLevel: 1, speed: 0.5 },
  ];

  const { zoomLevel, speed } = zoomLevels.find(level => distance <= level.maxDistance) || { zoomLevel: 2, speed: 0.5 };

  // Prevent zooming in further if the map is already zoomed in more than the desired level
  
  
  const calculateTargetZoom = (zoomLevel: number) => {
    const currentZoom = map.getZoom()
    if (zoomLevel > 6) {
      const targetZoom = currentZoom > zoomLevel
        ? currentZoom
        : zoomLevel
      return targetZoom
    }
    if ([5, 6].includes(zoomLevel)) {
      return currentZoom
    }
    if (zoomLevel < 5 ) {
      const targetZoom = currentZoom > zoomLevel
        ? currentZoom
        : zoomLevel
      return targetZoom
    }
    
  }

  const targetZoom = calculateTargetZoom(zoomLevel)
  
  

  console.log({})

  map.flyTo({
    center: customMarker.getLngLat(),
    zoom: targetZoom,
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