import { describe, test, expect } from 'vitest';
import { TIMER_OPTIONS, getTimerIndexFromMs } from '../../objects/roundTimerSliderOptions';

const NO_TIMER_INDEX = TIMER_OPTIONS.findIndex((option) => option.timeMs === 0);

describe('getTimerIndexFromMs', () => {
	test('maps a known duration to its matching option index', () => {
		expect(getTimerIndexFromMs(30000)).toBe(3);
	});

	test('maps the shortest known duration to index 0', () => {
		expect(getTimerIndexFromMs(5000)).toBe(0);
	});

	test('maps 0 to the no-timer index', () => {
		expect(getTimerIndexFromMs(0)).toBe(NO_TIMER_INDEX);
	});

	test('maps undefined to the no-timer index', () => {
		expect(getTimerIndexFromMs(undefined)).toBe(NO_TIMER_INDEX);
	});

	test('maps an unknown duration to the no-timer index', () => {
		expect(getTimerIndexFromMs(12345)).toBe(NO_TIMER_INDEX);
	});
});
