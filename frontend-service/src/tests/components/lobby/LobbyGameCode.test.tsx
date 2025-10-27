import React from 'react';
import { test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import LobbyGameCode from '../../../components/lobby/LobbyGameCode';

test('renders game code', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);
	expect(screen.getByText('ABC123')).toBeInTheDocument();
});

test('renders connection status text for connected', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connected" />);
	expect(screen.getByText('● Connected')).toBeInTheDocument();
});

test('renders connection status text for connecting', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="connecting" />);
	expect(screen.getByText('○ Connecting...')).toBeInTheDocument();
});

test('renders connection status text for error', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="error" />);
	expect(screen.getByText('✕ Connection Error')).toBeInTheDocument();
});

test('renders connection status text for disconnected', () => {
	render(<LobbyGameCode gameCode="ABC123" connectionStatus="disconnected" />);
	expect(screen.getByText('○ Disconnected')).toBeInTheDocument();
});
