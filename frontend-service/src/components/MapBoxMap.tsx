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
  const [lastClick, setLastClick] = useState({ lng: 0, lat: 0 });

    useEffect(() => {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/paultreanor/cluuaapnv004j01pj5sv1dgx2",
        attributionControl: false
      });
    
      const addMarker = (e) => {
        // Remove existing markers
        document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

        // Create a new marker and add it to the map at the clicked location
        new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);
        

        new mapboxgl.Marker({ color: "red" })
          .setLngLat(roundDetails.coordinates)
          .addTo(map);

        // const lineCoordinates = [
        //   [e.lngLat.lng, e.lngLat.lat], // Clicked location
        //   roundDetails.coordinates
        // ];

        // Create a GeoJSON source with a line feature
        // map.addSource('line', {
        //   'type': 'geojson',
        //   'data': {
        //     'type': 'Feature',
        //     'properties': {},
        //     'geometry': {
        //       'type': 'LineString',
        //       'coordinates': lineCoordinates
        //     }
        //   }
        // });

        // Add a new layer to visualize the line
        // map.addLayer({
        //   'id': 'line',
        //   'type': 'line',
        //   'source': 'line',
        //   'layout': {},
        //   'paint': {
        //     'line-width': 2,
        //     'line-color': '#007cbf'
        //   }
        // });

        // Update state with the clicked coordinates
        setLastClick(e.lngLat);
      };
    

      map.on('click', addMarker);

      

      // Clean up on unmount
      return () => map.remove();
    }, []); // Empty dependency array means this effect will only run once, like componentDidMount

    return <div ref={mapContainerRef} style={{ width: '40%', height: '400px' }} />;
};

export default MapboxMap;