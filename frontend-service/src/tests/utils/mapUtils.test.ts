import { test, expect, describe } from 'vitest';
import { calculateKm, emojiForDistances } from '../../utils/mapUtils';
import type { Pin } from '../../components/types/Game.types';

describe('calculateKm', () => {
	test('Same coordinates distance is 0km', () => {
		const northPoleCoords: Pin = [0, 90]
		expect(calculateKm(northPoleCoords, northPoleCoords)).toBe(0)
	});

	test('Distance between two different coordinates with buffer applied', () => {
		const parisCoords: Pin = [2.3522, 48.8566]; // Paris, France
		const berlinCoords: Pin = [13.4050, 52.5200]; // Berlin, Germany
		// Distance between Paris and Berlin is approximately 878km, with 2km buffer = 876km
		expect(calculateKm(parisCoords, berlinCoords)).toBeCloseTo(876, -1);
	});

	test('Distance within the same city should apply buffer', () => {
		const eiffelTowerCoords: Pin = [2.2945, 48.8584]; // Eiffel Tower, Paris
		const louvreCoords: Pin = [2.3364, 48.8606]; // Louvre Museum, Paris
		// Distance between Eiffel Tower and Louvre is ~3.2km, with 2km buffer = 1.2km
		expect(calculateKm(eiffelTowerCoords, louvreCoords)).toBeCloseTo(1.2, -1);
	});

	test('Very close distances become 0 with buffer', () => {
		// Points that are 1.5km apart
		const point1: Pin = [0, 0];
		const point2: Pin = [0.013, 0]; // ~1.5km at equator
		// With 2km buffer, should be 0
		expect(calculateKm(point1, point2)).toBe(0);
	});

	test('Distance across continents with buffer applied', () => {
		const newYorkCoords: Pin = [-74.0060, 40.7128]; // New York, USA
		const londonCoords: Pin = [-0.1276, 51.5074]; // London, UK
		// Distance between New York and London is ~5567km, with 2km buffer = 5565km
		expect(calculateKm(newYorkCoords, londonCoords)).toBeCloseTo(5565, -2);
	});
});

describe('emojiForDistances', () => {
	test('Returns sparkles emoji for distances of 0km', () => {
		expect(emojiForDistances(0)).toBe('✨');
	});

	test('Returns bullseye emoji for distances under 10km but not 0', () => {
		expect(emojiForDistances(1)).toBe('🎯');
		expect(emojiForDistances(5)).toBe('🎯');
		expect(emojiForDistances(9.9)).toBe('🎯');
	});

	test('Returns ok hand emoji for distances between 10 and 200km', () => {
		expect(emojiForDistances(10)).toBe('👌');
		expect(emojiForDistances(100)).toBe('👌');
		expect(emojiForDistances(200)).toBe('👌');
	});

	test('Returns uneasy emoji for distances between 200 and 500km', () => {
		expect(emojiForDistances(201)).toBe('🫤');
		expect(emojiForDistances(350)).toBe('🫤');
		expect(emojiForDistances(500)).toBe('🫤');
	});

	test('Returns shocked emoji for distances over 500km', () => {
		expect(emojiForDistances(501)).toBe('😳');
		expect(emojiForDistances(1000)).toBe('😳');
		expect(emojiForDistances(5000)).toBe('😳');
	});
});
