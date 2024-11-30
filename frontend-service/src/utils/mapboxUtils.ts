import { zoomLevels } from '../objects/zoomLevels';
import { Pin } from '../components/types/Game.types'
import { emojiForDistances } from '../utils/mapUtils';

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

const resetMapZoomAndCenter = (map: mapboxgl.Map) => {
	map.flyTo({
		center: [6, 54],
		zoom: 5,
		speed: 1,
		essential: true
	});
}

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

const addLineSourceToMap = (map: mapboxgl.Map, lineId: string, lineCoordinates: Pin[]) => {
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
}

const createDistanceMarkerElement = (distance: number): HTMLDivElement => {
	const el = document.createElement('div');
	el.className = 'custom-text-marker';
	el.style.backgroundColor = 'white'; 
	el.style.padding = '5px';
	el.style.borderRadius = '5px';
	el.innerHTML = `<span style="font-size: 16px;"><b>${emojiForDistances(distance)} ${distance} km</b></span>`;
	return el;
};

export {
	cursorSetup,
	recentreAndOrZoom,
	addLineToMap,
	addLineSourceToMap,
	createDistanceMarkerElement,
	resetMapZoomAndCenter
};
