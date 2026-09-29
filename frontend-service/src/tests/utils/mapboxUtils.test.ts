import { test, expect, describe } from 'vitest';
import { rectsOverlap, labelRectForPlacement, findLabelPlacement } from '../../utils/mapboxUtils';

const anchorRect = { left: 0, top: 0, right: 28, bottom: 28 };
const labelSize = { width: 100, height: 20 };

describe('rectsOverlap', () => {
	test('returns true for intersecting rectangles', () => {
		const a = { left: 0, top: 0, right: 20, bottom: 20 };
		const b = { left: 10, top: 10, right: 30, bottom: 30 };
		expect(rectsOverlap(a, b, 0)).toBe(true);
	});

	test('returns false for disjoint rectangles', () => {
		const a = { left: 0, top: 0, right: 20, bottom: 20 };
		const b = { left: 40, top: 40, right: 60, bottom: 60 };
		expect(rectsOverlap(a, b, 0)).toBe(false);
	});

	test('padding causes near-touching rectangles to overlap', () => {
		const a = { left: 0, top: 0, right: 20, bottom: 20 };
		const b = { left: 22, top: 0, right: 42, bottom: 20 };
		expect(rectsOverlap(a, b, 0)).toBe(false);
		expect(rectsOverlap(a, b, 4)).toBe(true);
	});
});

describe('labelRectForPlacement', () => {
	test('below centres the label under the anchor', () => {
		expect(labelRectForPlacement(anchorRect, labelSize, 'below', 4)).toEqual({
			left: -36,
			top: 32,
			right: 64,
			bottom: 52,
		});
	});

	test('above centres the label over the anchor', () => {
		expect(labelRectForPlacement(anchorRect, labelSize, 'above', 4)).toEqual({
			left: -36,
			top: -24,
			right: 64,
			bottom: -4,
		});
	});

	test('right places the label to the right of the anchor', () => {
		expect(labelRectForPlacement(anchorRect, labelSize, 'right', 4)).toEqual({
			left: 32,
			top: 4,
			right: 132,
			bottom: 24,
		});
	});

	test('left places the label to the left of the anchor', () => {
		expect(labelRectForPlacement(anchorRect, labelSize, 'left', 4)).toEqual({
			left: -104,
			top: 4,
			right: -4,
			bottom: 24,
		});
	});
});

describe('findLabelPlacement', () => {
	const belowObstacle = { left: -50, top: 30, right: 70, bottom: 60 };
	const aboveObstacle = { left: -50, top: -30, right: 70, bottom: 0 };
	const rightObstacle = { left: 30, top: 0, right: 140, bottom: 30 };
	const leftObstacle = { left: -110, top: 0, right: 0, bottom: 30 };

	test('prefers below when nothing is in the way', () => {
		const placement = findLabelPlacement({ anchorRect, labelSize, obstacles: [], padding: 0 });
		expect(placement).toBe('below');
	});

	test('falls back to above when below is blocked', () => {
		const placement = findLabelPlacement({ anchorRect, labelSize, obstacles: [belowObstacle], padding: 0 });
		expect(placement).toBe('above');
	});

	test('falls back to right when below and above are blocked', () => {
		const placement = findLabelPlacement({
			anchorRect,
			labelSize,
			obstacles: [belowObstacle, aboveObstacle],
			padding: 0,
		});
		expect(placement).toBe('right');
	});

	test('falls back to left when below, above and right are blocked', () => {
		const placement = findLabelPlacement({
			anchorRect,
			labelSize,
			obstacles: [belowObstacle, aboveObstacle, rightObstacle],
			padding: 0,
		});
		expect(placement).toBe('left');
	});

	test('returns null when every placement is blocked', () => {
		const placement = findLabelPlacement({
			anchorRect,
			labelSize,
			obstacles: [belowObstacle, aboveObstacle, rightObstacle, leftObstacle],
			padding: 0,
		});
		expect(placement).toBeNull();
	});
});
