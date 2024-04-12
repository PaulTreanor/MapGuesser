import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Round, Pin } from '../Types'
import { calculateKm } from '../utils/mapUtils';

mapboxgl.accessToken = "pk.eyJ1IjoicGF1bHRyZWFub3IiLCJhIjoiY2x1dTk2MGZ6MDd5MTJrc3RheHl6ZGE1cCJ9.i2IJpqtnJjbclBOLbaVnXw";
interface MapboxMapProps {
  roundDetails: Round;
  handleGuess: () => void; // Leaving this blank for now 
}

const MapboxMap = ({roundDetails, handleGuess}: MapboxMapProps) => {
  const mapContainerRef = useRef(null);
  const [lastClick, setLastClick] = useState<mapboxgl.LngLat | null>(null);

    useEffect(() => {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/paultreanor/cluuaapnv004j01pj5sv1dgx2",
        attributionControl: false
      });
    
      const addMarker = (e: mapboxgl.MapboxEvent) => {
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
          el.innerHTML = `<span style="font-size: 16px;"><b>${distance} km</b></span>`;

        // Add the custom element as a marker to the map
        new mapboxgl.Marker(el, { offset: [0, -30] }) // Adjust offset as needed
          .setLngLat([(e.lngLat.lng + roundDetails.coordinates[0]) / 2, (e.lngLat.lat + roundDetails.coordinates[1]) / 2]) // Position it between the guess and the actual location
          .addTo(map);
        
        // Update state with the clicked coordinates
        setLastClick(e.lngLat);

        handleGuess()
      };
    
      map.on('click', addMarker)

      

      // Clean up on unmount
      return () => {
        map.off('click', addMarker)
        map.remove()
      }
    }, [roundDetails]); 

    return <div ref={mapContainerRef} style={{ width: '60%', height: '600px' }} />;
};

export default MapboxMap;