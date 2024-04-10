import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap = () => {
  const mapContainerRef = useRef(null);
  const [lastClick, setLastClick] = useState({ lng: 0, lat: 0 });

    useEffect(() => {
      mapboxgl.accessToken = "pk.eyJ1IjoicGF1bHRyZWFub3IiLCJhIjoiY2x1dTk2MGZ6MDd5MTJrc3RheHl6ZGE1cCJ9.i2IJpqtnJjbclBOLbaVnXw";

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
          style: "mapbox://styles/paultreanor/cluuaapnv004j01pj5sv1dgx2",
          attributionControl: false
            // center: [10, 47], // Starting position [lng, lat] - not used with custom style
            // zoom: 3 // Starting zoom
        });
      
        const addMarker = (e) => {
          // Remove existing markers
          document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());

          // Create a new marker and add it to the map at the clicked location
          new mapboxgl.Marker()
              .setLngLat([e.lngLat.lng, e.lngLat.lat])
              .addTo(map);

          // Update state with the clicked coordinates
          setLastClick(e.lngLat);
      };

        map.on('click', addMarker);
 
       

        // Clean up on unmount
        return () => map.remove();
    }, []); // Empty dependency array means this effect will only run once, like componentDidMount

    return <div ref={mapContainerRef} style={{ width: '50%', height: '400px' }} />;
};

export default MapboxMap;