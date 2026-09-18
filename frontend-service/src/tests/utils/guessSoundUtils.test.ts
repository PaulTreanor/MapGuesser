import { test, expect, describe, vi, beforeEach } from 'vitest';
import { TERRIBLE_GUESS_THRESHOLD_KM } from '../../objects/gameConsts';

const { playUiSound } = vi.hoisted(() => ({ playUiSound: vi.fn() }));

vi.mock('../../utils/soundPlayer', () => ({ playUiSound }));

import { playGuessResultSound } from '../../utils/guessSoundUtils';

describe('playGuessResultSound', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	test('plays perfect guess sound for a distance of 0km', () => {
		playGuessResultSound(0, false);
		expect(playUiSound).toHaveBeenCalledWith('PERFECT_GUESS');
	});

	test('plays terrible guess sound for distances at or above the threshold', () => {
		playGuessResultSound(TERRIBLE_GUESS_THRESHOLD_KM, false);
		expect(playUiSound).toHaveBeenCalledWith('TERRIBLE_GUESS');
	});

	test('plays nothing for moderate distances', () => {
		playGuessResultSound(1000, false);
		expect(playUiSound).not.toHaveBeenCalled();
	});

	test('plays terrible guess sound when timed out', () => {
		playGuessResultSound(null, true);
		expect(playUiSound).toHaveBeenCalledWith('TERRIBLE_GUESS');
	});
});