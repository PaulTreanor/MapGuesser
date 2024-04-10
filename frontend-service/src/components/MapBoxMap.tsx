import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxMap = () => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
      mapboxgl.accessToken = "pk.eyJ1IjoicGF1bHRyZWFub3IiLCJhIjoiY2x1dTk2MGZ6MDd5MTJrc3RheHl6ZGE1cCJ9.i2IJpqtnJjbclBOLbaVnXw";

        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
          style: "mapbox://styles/paultreanor/cluuaapnv004j01pj5sv1dgx2",
          attributionControl: false
            // center: [10, 47], // Starting position [lng, lat] - not used with custom style
            // zoom: 3 // Starting zoom
        });

        map.on('load', () => {
            map.addSource('countries', {
                type: 'vector',
                url: 'mapbox://mapbox.mapbox-countries-v1'
            });
            map.addLayer({
                'id': 'countries-layer',
                'type': 'fill',
                'source': 'countries',
                'source-layer': 'country_boundaries',
                'paint': {
                    'fill-color': '#2276AC',
                    'fill-opacity': 0.5
                },
                'filter': ['==', ['get', 'disputed'], 'false']
            });
        });

        // Clean up on unmount
        return () => map.remove();
    }, []); // Empty dependency array means this effect will only run once, like componentDidMount

    return <div ref={mapContainerRef} style={{ width: '50%', height: '400px' }} />;
};

export default MapboxMap;