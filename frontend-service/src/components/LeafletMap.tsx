import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = () => {
  const position = [53.1424, -7.6921]; // Example position: Ireland's latitude and longitude

  const mapBoxURLItems = {
    publicAccessToken: "pk.eyJ1IjoicGF1bHRyZWFub3IiLCJhIjoiY2x1dTk2MGZ6MDd5MTJrc3RheHl6ZGE1cCJ9.i2IJpqtnJjbclBOLbaVnXw", 
    tileSet: "countries-v1" //"streets-v11"
  }
  const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/${mapBoxURLItems.tileSet}/tiles/{z}/{x}/{y}?access_token=${mapBoxURLItems.publicAccessToken}`;
  console.log(mapboxUrl)
  return (
    <MapContainer center={position} zoom={6} style={{ height: '400px', width: '50%' }}>
      <TileLayer
        url={mapboxUrl}
        attribution='Map data &copy; <a href="https://www.mapbox.com/">Mapbox</a>'
      />
      <Marker position={position}>
        {/* <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup> */}
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;