import type { ZoomLevel } from "./types/zoomLevels.type";

// Provides mapping between distance of guess and recommended map zoom
// level and movement animation speed when game "hones in" on guess. 
// recommendedZoomLevel are basically a feel thing
const zoomLevels: ZoomLevel[] = [
    { maxDistance: 10, recommendedZoomLevel: 10, animationSpeed: 1.5 },
    { maxDistance: 25, recommendedZoomLevel: 9, animationSpeed: 1.5 },
    { maxDistance: 75, recommendedZoomLevel: 8, animationSpeed: 1 },
    { maxDistance: 150, recommendedZoomLevel: 7, animationSpeed: 0.5 },
    { maxDistance: 300, recommendedZoomLevel: 6.5, animationSpeed: 0.6 },
    { maxDistance: 1000, recommendedZoomLevel: 5, animationSpeed: 0.6 },
    { maxDistance: 3000, recommendedZoomLevel: 3.3, animationSpeed: 0.6 },
    { maxDistance: 4500, recommendedZoomLevel: 2.7, animationSpeed: 0.6 },
    { maxDistance: 8000, recommendedZoomLevel: 1, animationSpeed: 0.6 },
];

export { zoomLevels }