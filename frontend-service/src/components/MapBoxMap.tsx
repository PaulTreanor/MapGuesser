import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Round, Pin } from '../Types'

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