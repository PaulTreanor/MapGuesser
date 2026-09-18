import '@testing-library/jest-dom';
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock ResizeObserver
class ResizeObserverMock {
	observe() {}
	unobserve() {}
	disconnect() {}
}

global.ResizeObserver = ResizeObserverMock;

// Mock HTMLMediaElement playback (jsdom doesn't implement play/pause)
Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
	configurable: true,
	value: () => Promise.resolve(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
	configurable: true,
	value: () => undefined,
});

afterEach(() => {
	cleanup();
});