import { afterEach, describe, expect, test, vi } from 'vitest';
import { trackGameStarted } from '../../utils/umamiUtils';

describe('trackGameStarted', () => {
	const trackMock = vi.fn();

	afterEach(() => {
		vi.restoreAllMocks();
		delete (window as { umami?: unknown }).umami;
	});

	test('calls umami.track with the game started event name and single-player mode', () => {
		window.umami = { track: trackMock };

		trackGameStarted('single-player');

		expect(trackMock).toHaveBeenCalledWith('Game Started', { mode: 'single-player' });
	});

	test('calls umami.track with the game started event name and multiplayer mode', () => {
		window.umami = { track: trackMock };

		trackGameStarted('multiplayer');

		expect(trackMock).toHaveBeenCalledWith('Game Started', { mode: 'multiplayer' });
	});

	test('does nothing when umami is not loaded', () => {
		expect(() => trackGameStarted('single-player')).not.toThrow();
		expect(trackMock).not.toHaveBeenCalled();
	});
});