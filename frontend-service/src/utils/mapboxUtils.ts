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
		if (zoomLevel < 5) {
			const targetZoom = currentZoom > zoomLevel
				? currentZoom
				: zoomLevel
			return targetZoom
		}
		
	}

	const targetZoom = calculateTargetZoom(zoomLevel)

	map.flyTo({
		center: customMarker.getLngLat(),
		zoom: targetZoom,
		speed: speed,
		essential: true
	});
};

export { cursorSetup, recentreAndOrZoom };