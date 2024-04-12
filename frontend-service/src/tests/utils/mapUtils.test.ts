// import { test, expect } from 'vitest';
// import { calculateKm } from '../../utils/mapUtils'
// import type { Pin } from '../../Types'

// test('Same coordinates distance is 0km', () => {
//   const northPoleCoords: Pin = [0, 90]
//   expect(calculateKm(northPoleCoords, northPoleCoords)).toBe(0)
// });

// test('Distance between two different coordinates', () => {
//   const parisCoords: Pin = [2.3522, 48.8566]; // Paris, France
//   const berlinCoords: Pin = [13.4050, 52.5200]; // Berlin, Germany
//   // Distance between Paris and Berlin is approximately 878km, allowing a 5km error margin
//   expect(calculateKm(parisCoords, berlinCoords)).toBeCloseTo(878, -1);
// });

// test('Distance within the same city should be minimal', () => {
//   const eiffelTowerCoords: Pin = [2.2945, 48.8584]; // Eiffel Tower, Paris
//   const louvreCoords: Pin = [2.3364, 48.8606]; // Louvre Museum, Paris
//   // Distance between Eiffel Tower and Louvre Museum is approximately 3.2km, allowing a 5km error margin
//   expect(calculateKm(eiffelTowerCoords, louvreCoords)).toBeCloseTo(3.2, -1);
// });

// test('Distance across continents', () => {
//   const newYorkCoords: Pin = [-74.0060, 40.7128]; // New York, USA
//   const londonCoords: Pin = [-0.1276, 51.5074]; // London, UK
//   // Distance between New York and London is approximately 5567km, allowing a 5km error margin
//   expect(calculateKm(newYorkCoords, londonCoords)).toBeCloseTo(5567, -2);
// });
