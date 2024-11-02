import { zoomLevels } from '../objects/zoomLevels';

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
	const { recommendedZoomLevel, animationSpeed } = zoomLevels.find(level => distance <= level.maxDistance)
		|| { recommendedZoomLevel: 0.8, animationSpeed: 0.5 };

	map.flyTo({
		center: customMarker.getLngLat(),
		zoom: recommendedZoomLevel,
		speed: animationSpeed,
		essential: true
	});
};


const addLineToMap = (map: mapboxgl.Map, lineId: string) => {
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
}

// TODO coordinates type?
const addLineSourceToMap = (map: mapboxgl.Map, lineId: string, coordinates: number[][]) => {
    map.addSource(lineId, {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'properties': {},
            'geometry': {
                'type': 'LineString',
                'coordinates': coordinates
            }
        }
    });
}

export { cursorSetup, recentreAndOrZoom, addLineToMap, addLineSourceToMap };