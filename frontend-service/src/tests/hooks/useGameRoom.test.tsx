import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameRoom } from '../../hooks/useGameRoom';

vi.mock('../../utils/endpointUtils', () => ({
	getMultiplayerServiceWebsocketsUrl: () => 'ws://localhost:8788/ws/',
}));

vi.mock('../../context/NotificationContext', () => ({
	notify: vi.fn(),
}));

class MockWebSocket {
	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSING = 2;
	static CLOSED = 3;
	static instances: MockWebSocket[] = [];

	url: string;
	readyState = MockWebSocket.CONNECTING;
	sent: string[] = [];
	closedWith: number | undefined;
	onopen: (() => void) | null = null;
	onmessage: ((event: { data: string }) => void) | null = null;
	onerror: ((error: unknown) => void) | null = null;
	onclose: ((event: { code: number; reason: string }) => void) | null = null;

	constructor(url: string) {
		this.url = url;
		MockWebSocket.instances.push(this);
	}

	send(data: string) {
		this.sent.push(data);
	}

	close(code = 1000) {
		this.readyState = MockWebSocket.CLOSED;
		this.closedWith = code;
		this.onclose?.({ code, reason: '' });
	}
}

describe('useGameRoom', () => {
	beforeEach(() => {
		MockWebSocket.instances = [];
		vi.stubGlobal('WebSocket', MockWebSocket);
	});

	afterEach(() => {
		vi.unstubAllGlobals();
		vi.useRealTimers();
	});

	test('opens a socket for the game code and closes it on unmount', () => {
		const { unmount } = renderHook(() =>
			useGameRoom({ gameCode: 'ABC123', setPlayers: vi.fn() })
		);

		expect(MockWebSocket.instances).toHaveLength(1);
		expect(MockWebSocket.instances[0].url).toBe('ws://localhost:8788/ws/ABC123');

		unmount();

		expect(MockWebSocket.instances[0].closedWith).toBe(1000);
	});

	test('does not open a socket when there is no game code', () => {
		renderHook(() => useGameRoom({ gameCode: '', setPlayers: vi.fn() }));

		expect(MockWebSocket.instances).toHaveLength(0);
	});

	test('reconnects after an abnormal close while mounted', () => {
		vi.useFakeTimers();
		renderHook(() => useGameRoom({ gameCode: 'ABC123', setPlayers: vi.fn() }));

		const socket = MockWebSocket.instances[0];
		act(() => {
			socket.onclose?.({ code: 1006, reason: 'abnormal' });
		});

		expect(MockWebSocket.instances).toHaveLength(1);

		act(() => {
			vi.advanceTimersByTime(3000);
		});

		expect(MockWebSocket.instances).toHaveLength(2);
	});

	test('cancels a pending reconnect on unmount', () => {
		vi.useFakeTimers();
		const { unmount } = renderHook(() =>
			useGameRoom({ gameCode: 'ABC123', setPlayers: vi.fn() })
		);

		const socket = MockWebSocket.instances[0];
		act(() => {
			socket.onclose?.({ code: 1006, reason: 'abnormal' });
		});

		unmount();

		act(() => {
			vi.advanceTimersByTime(5000);
		});

		expect(MockWebSocket.instances).toHaveLength(1);
	});
});
