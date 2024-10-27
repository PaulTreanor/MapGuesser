import type { ZoomLevel } from "./zoomLevels.type";

const zoomLevels: ZoomLevel[] = [
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

export { zoomLevels }